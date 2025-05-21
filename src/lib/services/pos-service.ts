import { prisma } from "@/lib/prisma"
import { EventEmitter, POSEvents } from "@/lib/event-emitter"
import { StockService } from "./inventory-service"

// Servicio para el sistema POS
export class POSService {
    // Procesar una venta
    static async processSale(saleData: {
        items: Array<{
            productId: string
            quantity: number
            price: number
            discount?: number
        }>
        areaId: string
        agencyId: string
        subAccountId?: string
        customerId?: string
        cashierId?: string
        paymentMethod: string
        notes?: string
    }) {
        // Calcular totales
        let subtotal = 0
        let tax = 0
        let discount = 0

        // Validar stock disponible para todos los productos
        for (const item of saleData.items) {
            const stock = await prisma.stock.findFirst({
                where: {
                    productId: item.productId,
                    areaId: saleData.areaId,
                },
                include: { Product: true },
            })

            if (!stock || stock.quantity < item.quantity) {
                throw new Error(`Stock insuficiente para el producto ${stock?.Product.name || item.productId}`)
            }

            // Calcular subtotal
            subtotal += item.price * item.quantity

            // Aplicar descuento si existe
            if (item.discount) {
                const itemDiscount = (item.price * item.quantity * item.discount) / 100
                discount += itemDiscount
            }

            // Calcular impuestos si el producto tiene tasa de impuesto
            if (stock.Product.taxRate) {
                tax += (item.price * item.quantity * Number.parseFloat(stock.Product.taxRate.toString())) / 100
            }
        }

        // Calcular total
        const total = subtotal + tax - discount

        // Generar número de venta único
        const saleNumber = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // Crear la venta en la base de datos
        const sale = await prisma.sale.create({
            data: {
                saleNumber,
                subtotal,
                tax,
                discount,
                total,
                paymentMethod: saleData.paymentMethod as any,
                status: "COMPLETED",
                notes: saleData.notes,
                customerId: saleData.customerId,
                cashierId: saleData.cashierId,
                areaId: saleData.areaId,
                agencyId: saleData.agencyId,
                subAccountId: saleData.subAccountId,
                Items: {
                    create: saleData.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        discount: item.discount || 0,
                        tax: 0, // Se calculará después
                        subtotal: item.price * item.quantity,
                    })),
                },
            },
            include: {
                Items: {
                    include: {
                        Product: true,
                    },
                },
            },
        })

        // Actualizar el stock para cada producto vendido
        for (const item of sale.Items) {
            await StockService.updateStockFromSale({
                productId: item.productId,
                areaId: saleData.areaId,
                quantity: item.quantity,
                agencyId: saleData.agencyId,
            })
        }

        // Emitir evento de venta completada
        EventEmitter.emit(POSEvents.SALE_COMPLETED, sale)

        return sale
    }

    // Obtener precio con descuento para un producto
    static async getProductPriceWithDiscount(productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        })

        if (!product) {
            throw new Error(`Producto no encontrado: ${productId}`)
        }

        // Verificar si el producto tiene un descuento activo
        const now = new Date()
        let discountedPrice = Number.parseFloat(product.price.toString())
        let discountApplied = false
        let discountPercentage = 0

        if (
            product.discount &&
            Number.parseFloat(product.discount.toString()) > 0 &&
            (!product.discountStartDate || product.discountStartDate <= now) &&
            (!product.discountEndDate || product.discountEndDate >= now)
        ) {
            // Calcular precio con descuento
            discountPercentage = Number.parseFloat(product.discount.toString())
            const discountAmount = (discountedPrice * discountPercentage) / 100
            discountedPrice -= discountAmount
            discountApplied = true

            // Aplicar precio mínimo si está configurado
            if (
                product.discountMinimumPrice &&
                discountedPrice < Number.parseFloat(product.discountMinimumPrice.toString())
            ) {
                discountedPrice = Number.parseFloat(product.discountMinimumPrice.toString())
            }

            // Emitir evento de descuento aplicado
            if (discountApplied) {
                EventEmitter.emit(POSEvents.DISCOUNT_APPLIED, {
                    productId,
                    productName: product.name,
                    originalPrice: Number.parseFloat(product.price.toString()),
                    discountedPrice,
                    discountPercentage,
                })
            }
        }

        return {
            originalPrice: Number.parseFloat(product.price.toString()),
            discountedPrice,
            discount: discountPercentage,
            hasActiveDiscount: discountApplied,
        }
    }

    // Verificar productos por vencer en el POS
    static async checkExpiringProductsInPOS(agencyId: string, daysThreshold = 30) {
        const today = new Date()
        const thresholdDate = new Date()
        thresholdDate.setDate(today.getDate() + daysThreshold)

        return prisma.product.findMany({
            where: {
                agencyId,
                expirationDate: {
                    gte: today,
                    lte: thresholdDate,
                },
                isActive: true,
            },
            include: {
                Stocks: true,
                Category: true,
            },
        })
    }

    // Guardar estado del carrito para recuperarlo después
    static async saveCartState(data: {
        agencyId: string
        subAccountId?: string
        areaId: string
        products: Array<{
            id: string
            name: string
            price: number
            quantity: number
        }>
        client?: {
            id?: string
            name: string
        }
        notes?: string
    }) {
        // Generar un ID único para la venta guardada
        const savedSaleId = `SAVED-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // Guardar el estado del carrito
        const savedSale = await prisma.savedSale.create({
            data: {
                id: savedSaleId,
                agencyId: data.agencyId,
                subAccountId: data.subAccountId,
                areaId: data.areaId,
                clientId: data.client?.id,
                clientName: data.client?.name || "Cliente General",
                notes: data.notes,
                products: data.products,
                createdAt: new Date(),
            },
        })

        // Emitir evento de carrito actualizado
        EventEmitter.emit(POSEvents.CART_UPDATED, savedSale)

        return savedSale
    }

    // Obtener ventas guardadas
    static async getSavedSales(agencyId: string, options?: { areaId?: string; subAccountId?: string }) {
        const where: any = { agencyId }

        if (options?.areaId) {
            where.areaId = options.areaId
        }

        if (options?.subAccountId) {
            where.subAccountId = options.subAccountId
        }

        return prisma.savedSale.findMany({
            where,
            orderBy: { createdAt: "desc" },
        })
    }

    // Eliminar una venta guardada
    static async deleteSavedSale(id: string) {
        return prisma.savedSale.delete({
            where: { id },
        })
    }

    // Obtener productos con stock disponible para el POS
    static async getProductsWithStock(
        agencyId: string,
        options?: {
            areaId?: string
            subAccountId?: string
            categoryId?: string
            search?: string
        },
    ) {
        const where: any = {
            agencyId,
            isActive: true,
        }

        if (options?.subAccountId) {
            where.subAccountId = options.subAccountId
        }

        if (options?.categoryId && options.categoryId !== "Todos") {
            where.categoryId = options.categoryId
        }

        if (options?.search) {
            where.OR = [
                { name: { contains: options.search, mode: "insensitive" } },
                { sku: { contains: options.search, mode: "insensitive" } },
                { description: { contains: options.search, mode: "insensitive" } },
            ]
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                Category: true,
                Movements: options?.areaId
                    ? {
                        where: {
                            areaId: options.areaId,
                        },
                    }
                    : true,
            },
        })

        // Transformar los datos para incluir el stock disponible
        return products.map((product) => {
            // Calcular stock disponible basado en movimientos para el área seleccionada
            let stock = 0
            if (options?.areaId) {
                // Filtrar movimientos por área y calcular stock
                const areaMovements = product.Movements.filter((m) => m.areaId === options.areaId)
                stock = areaMovements.reduce((sum, movement) => {
                    if (movement.type === 'ENTRADA') return sum + movement.quantity
                    if (movement.type === 'SALIDA') return sum - movement.quantity
                    return sum
                }, 0)
            } else {
                // Si no hay área seleccionada, calcular stock basado en todos los movimientos
                stock = product.Movements.reduce((sum, movement) => {
                    if (movement.type === 'ENTRADA') return sum + movement.quantity
                    if (movement.type === 'SALIDA') return sum - movement.quantity
                    return sum
                }, 0)
            }

            // Verificar si el producto está por vencer
            const isExpiring = product.expirationDate ? isProductExpiring(product.expirationDate) : false

            // Verificar si el stock está bajo
            const isLowStock = product.minStock ? stock <= product.minStock : false

            return {
                id: product.id,
                name: product.name,
                price: product.price.toString(),
                sku: product.sku,
                description: product.description,
                stock,
                minStock: product.minStock,
                isLowStock,
                isExpiring,
                expirationDate: product.expirationDate,
                categoryId: product.categoryId,
                categoryName: product.Category?.name,
                images: product.images,
                productImage: product.productImage,
                discount: product.discount,
                discountStartDate: product.discountStartDate,
                discountEndDate: product.discountEndDate,
                hasActiveDiscount: hasActiveDiscount(product),
            }
        })
    }
}

// Función auxiliar para verificar si un producto está por vencer
function isProductExpiring(expirationDate: Date): boolean {
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return expirationDate > today && expirationDate <= thirtyDaysFromNow
}

// Función auxiliar para verificar si un producto tiene un descuento activo
function hasActiveDiscount(product: any): boolean {
    if (!product.discount || Number.parseFloat(product.discount.toString()) <= 0) {
        return false
    }

    const now = new Date()
    return (
        (!product.discountStartDate || product.discountStartDate <= now) &&
        (!product.discountEndDate || product.discountEndDate >= now)
    )
}
