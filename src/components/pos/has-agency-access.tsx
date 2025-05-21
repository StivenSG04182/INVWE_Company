import { type NextRequest, NextResponse } from "next/server"
import { getAuthUserDetails } from "@/lib/queries"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Función para generar un número de venta único
const generateSaleNumber = async () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    // Obtener el último número de venta para generar uno nuevo
    const lastSale = await prisma.sale.findFirst({
        orderBy: {
            createdAt: "desc",
        },
    })

    let sequence = 1
    if (lastSale && lastSale.saleNumber) {
        const lastSequence = Number.parseInt(lastSale.saleNumber.split("-")[1] || "0")
        sequence = lastSequence + 1
    }

    return `V${year}${month}${day}-${sequence.toString().padStart(4, "0")}`
}

// Función para generar un número de factura único
const generateInvoiceNumber = async () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    // Obtener la última factura para generar un nuevo número
    const lastInvoice = await prisma.invoice.findFirst({
        orderBy: {
            createdAt: "desc",
        },
    })

    let sequence = 1
    if (lastInvoice && lastInvoice.invoiceNumber) {
        const lastSequence = Number.parseInt(lastInvoice.invoiceNumber.split("-")[1] || "0")
        sequence = lastSequence + 1
    }

    return `F${year}${month}${day}-${sequence.toString().padStart(4, "0")}`
}

// Función para verificar si el usuario tiene acceso a la agencia
async function hasAgencyAccess(agencyId: string) {
    const user = await getAuthUserDetails()
    if (!user) return false

    // Verificar si el usuario tiene acceso a esta agencia
    return user.Agency?.id === agencyId || user.Agency?.some((agency: any) => agency.id === agencyId)
}

// GET: Obtener datos para el POS (productos con stock)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const agencyId = searchParams.get("agencyId")
        const subAccountId = searchParams.get("subAccountId")
        const areaId = searchParams.get("areaId")
        const categoryId = searchParams.get("categoryId")
        const search = searchParams.get("search")

        if (!agencyId) {
            return NextResponse.json({ success: false, error: "ID de agencia requerido" }, { status: 400 })
        }

        // Construir la consulta base para productos
        const productsQuery: any = {
            where: {
                agencyId: agencyId,
                active: true,
                ...(subAccountId && { subAccountId }),
            },
            include: {
                Category: true,
                Stocks: areaId
                    ? {
                        where: {
                            areaId: areaId,
                        },
                    }
                    : true,
            },
        }

        // Filtrar por categoría si se proporciona
        if (categoryId && categoryId !== "Todos") {
            productsQuery.where.categoryId = categoryId
        }

        // Filtrar por término de búsqueda si se proporciona
        if (search) {
            productsQuery.where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }

        // Obtener productos
        const products = await prisma.product.findMany(productsQuery)

        // Transformar los datos para incluir el stock disponible
        const productsWithStock = products.map((product) => {
            // Calcular stock disponible para el área seleccionada
            let stock = 0
            if (areaId) {
                const stockEntry = product.Stocks.find((s) => s.areaId === areaId)
                stock = stockEntry ? stockEntry.quantity : 0
            } else {
                // Si no hay área seleccionada, sumar todo el stock disponible
                stock = product.Stocks.reduce((sum, s) => sum + s.quantity, 0)
            }

            return {
                id: product.id,
                name: product.name,
                price: product.price.toString(),
                sku: product.sku,
                description: product.description,
                stock: stock,
                categoryId: product.categoryId,
                categoryName: product.Category?.name,
                images: product.images,
                productImage: product.productImage,
            }
        })

        return NextResponse.json({ success: true, data: productsWithStock })
    } catch (error: any) {
        console.error("Error al obtener productos:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST: Procesar una venta
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const data = await req.json()
        const { agencyId, subAccountId, areaId, products, client, paymentMethod, total } = data

        if (!agencyId || !areaId || !products || products.length === 0) {
            return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
        }

        // Verificar stock disponible antes de procesar
        for (const product of products) {
            const stockEntry = await prisma.stock.findUnique({
                where: {
                    productId_areaId: {
                        productId: product.id,
                        areaId: areaId,
                    },
                },
            })

            if (!stockEntry || stockEntry.quantity < product.quantity) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Stock insuficiente para el producto ${product.name}`,
                    },
                    { status: 400 },
                )
            }
        }

        // Generar número de venta único
        const saleNumber = await generateSaleNumber()

        // Calcular subtotal e IVA
        const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
        const tax = subtotal * 0.19 // 19% de IVA

        // Crear la venta en la base de datos usando una transacción
        const result = await prisma.$transaction(async (tx) => {
            // 1. Crear la venta
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    subtotal: subtotal,
                    tax: tax,
                    total: subtotal + tax,
                    paymentMethod: paymentMethod || "CASH",
                    status: "COMPLETED",
                    saleDate: new Date(),
                    customerId: client.id || null,
                    cashierId: session.user?.id || null,
                    areaId,
                    agencyId,
                    ...(subAccountId && { subAccountId }),
                    Items: {
                        create: products.map((p) => ({
                            quantity: p.quantity,
                            unitPrice: p.price,
                            subtotal: p.price * p.quantity,
                            description: p.name,
                            productId: p.id,
                        })),
                    },
                },
                include: {
                    Items: true,
                },
            })

            // 2. Actualizar el stock de cada producto
            for (const product of products) {
                await tx.stock.update({
                    where: {
                        productId_areaId: {
                            productId: product.id,
                            areaId: areaId,
                        },
                    },
                    data: {
                        quantity: {
                            decrement: product.quantity,
                        },
                    },
                })

                // 3. Registrar el movimiento de salida
                await tx.movement.create({
                    data: {
                        type: "SALIDA",
                        quantity: product.quantity,
                        notes: `Venta POS #${saleNumber}`,
                        productId: product.id,
                        areaId: areaId,
                        agencyId: agencyId,
                        ...(subAccountId && { subAccountId }),
                    },
                })
            }

            // 4. Generar factura si hay un cliente seleccionado
            let invoice = null
            if (client.id) {
                const invoiceNumber = await generateInvoiceNumber()

                invoice = await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        status: "PAID",
                        subtotal: subtotal,
                        tax: tax,
                        total: subtotal + tax,
                        issuedDate: new Date(),
                        notes: `Venta POS #${saleNumber}`,
                        customerId: client.id,
                        agencyId,
                        ...(subAccountId && { subAccountId }),
                        Items: {
                            create: products.map((p) => ({
                                quantity: p.quantity,
                                unitPrice: p.price,
                                total: p.price * p.quantity,
                                description: p.name,
                                productId: p.id,
                            })),
                        },
                    },
                })

                // 5. Actualizar la venta con el ID de la factura
                await tx.sale.update({
                    where: { id: sale.id },
                    data: { invoiceId: invoice.id },
                })

                // 6. Registrar el pago de la factura
                await tx.payment.create({
                    data: {
                        amount: subtotal + tax,
                        method: paymentMethod || "CASH",
                        status: "COMPLETED",
                        reference: `Pago POS #${saleNumber}`,
                        invoiceId: invoice.id,
                        agencyId,
                        ...(subAccountId && { subAccountId }),
                    },
                })
            }

            return { sale, invoice }
        })

        return NextResponse.json({
            success: true,
            data: result,
            message: "Venta procesada correctamente",
        })
    } catch (error: any) {
        console.error("Error al procesar la venta:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
