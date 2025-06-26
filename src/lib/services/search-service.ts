import { prisma } from "@/lib/prisma"

export interface SearchFilter {
    query?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    hasDiscount?: boolean
    isExpiring?: boolean
    tags?: string[]
    sortBy?: "name" | "price" | "stock" | "createdAt"
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
}

export class SearchService {
    // Búsqueda avanzada de productos
    static async searchProducts(agencyId: string, filter: SearchFilter) {
        // Construir la consulta base
        const where: any = { agencyId }

        // Aplicar filtro de texto
        if (filter.query) {
            where.OR = [
                { name: { contains: filter.query, mode: "insensitive" } },
                { sku: { contains: filter.query, mode: "insensitive" } },
                { description: { contains: filter.query, mode: "insensitive" } },
                { barcode: { contains: filter.query, mode: "insensitive" } },
            ]
        }

        // Filtrar por categoría
        if (filter.categoryId) {
            where.categoryId = filter.categoryId
        }

        // Filtrar por rango de precios
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            where.price = {}
            if (filter.minPrice !== undefined) where.price.gte = filter.minPrice
            if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice
        }

        // Filtrar productos con descuento
        if (filter.hasDiscount) {
            const now = new Date()
            where.discount = { gt: 0 }
            where.OR = [{ discountStartDate: null }, { discountStartDate: { lte: now } }]
            where.AND = [{ OR: [{ discountEndDate: null }, { discountEndDate: { gte: now } }] }]
        }

        // Filtrar productos por vencer
        if (filter.isExpiring) {
            const today = new Date()
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(today.getDate() + 30)

            where.expirationDate = {
                gte: today,
                lte: thirtyDaysFromNow,
            }
        }

        // Filtrar por etiquetas
        if (filter.tags && filter.tags.length > 0) {
            where.tags = {
                hasSome: filter.tags,
            }
        }

        // Configurar ordenamiento
        const orderBy: any = {}
        if (filter.sortBy) {
            orderBy[filter.sortBy] = filter.sortOrder || "asc"
        } else {
            orderBy.name = "asc" // Ordenamiento por defecto
        }

        // Ejecutar la consulta
        const products = await prisma.product.findMany({
            where,
            include: {
                Category: true,
            },
            orderBy,
            skip: filter.offset || 0,
            take: filter.limit || 50,
        })

        // Obtener el total de resultados para paginación
        const total = await prisma.product.count({ where })

        // Procesar resultados para incluir información adicional
        const results = products
            .map((product) => {
                // Calcular stock total
                const totalStock = product.quantity ?? 0

                // Verificar si tiene stock
                const hasStock = totalStock > 0

                // Si se filtró por productos en stock y no tiene stock, no incluirlo
                if (filter.inStock && !hasStock) {
                    return null
                }

                // Verificar si está por vencer
                const isExpiring = product.expirationDate ? isProductExpiring(product.expirationDate) : false

                // Verificar si tiene descuento activo
                const hasActiveDiscount = hasDiscount(product)

                return {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    description: product.description,
                    price: Number(product.price),
                    categoryId: product.categoryId,
                    categoryName: product.Category?.name || "Sin categoría",
                    stock: totalStock,
                    hasStock,
                    minStock: product.minStock || 0,
                    isLowStock: product.minStock ? totalStock <= product.minStock : false,
                    images: product.images || [],
                    barcode: product.barcode,
                    tags: product.tags || [],
                    isExpiring,
                    expirationDate: product.expirationDate,
                    discount: product.discount ? Number(product.discount) : 0,
                    hasActiveDiscount,
                    createdAt: product.createdAt,
                }
            })
            .filter(Boolean) // Eliminar productos nulos (los que no cumplen con el filtro inStock)

        return {
            results,
            total,
            page: Math.floor((filter.offset || 0) / (filter.limit || 50)) + 1,
            limit: filter.limit || 50,
            totalPages: Math.ceil(total / (filter.limit || 50)),
        }
    }

    // Búsqueda de productos por código de barras
    static async searchByBarcode(agencyId: string, barcode: string) {
        const product = await prisma.product.findFirst({
            where: {
                agencyId,
                barcode,
            },
            include: {
                Category: true,
            },
        })

        if (!product) return null

        // Calcular stock total
        const totalStock = product.quantity ?? 0

        return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: Number(product.price),
            categoryId: product.categoryId,
            categoryName: product.Category?.name || "Sin categoría",
            stock: totalStock,
            hasStock: totalStock > 0,
            minStock: product.minStock || 0,
            isLowStock: product.minStock ? totalStock <= product.minStock : false,
            images: product.images || [],
            barcode: product.barcode,
            tags: product.tags || [],
            isExpiring: product.expirationDate ? isProductExpiring(product.expirationDate) : false,
            expirationDate: product.expirationDate,
            discount: product.discount ? Number(product.discount) : 0,
            hasActiveDiscount: hasDiscount(product),
        }
    }

    // Búsqueda de productos por etiquetas
    static async searchByTags(agencyId: string, tags: string[]) {
        if (!tags || tags.length === 0) return []

        return this.searchProducts(agencyId, { tags })
    }

    // Sugerir términos de búsqueda basados en productos existentes
    static async suggestSearchTerms(agencyId: string, query: string, limit = 5) {
        if (!query || query.length < 2) return []

        // Buscar productos que coincidan con la consulta
        const products = await prisma.product.findMany({
            where: {
                agencyId,
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { sku: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                name: true,
                sku: true,
                tags: true,
            },
            take: limit * 2, // Obtener más resultados para tener variedad
        })

        // Extraer términos de búsqueda de los productos
        const terms = new Set<string>()

        products.forEach((product) => {
            // Añadir nombre del producto
            if (product.name.toLowerCase().includes(query.toLowerCase())) {
                terms.add(product.name)
            }

            // Añadir SKU
            if (product.sku && product.sku.toLowerCase().includes(query.toLowerCase())) {
                terms.add(product.sku)
            }

            // Añadir etiquetas relevantes
            if (product.tags && product.tags.length > 0) {
                product.tags.forEach((tag) => {
                    if (tag.toLowerCase().includes(query.toLowerCase())) {
                        terms.add(tag)
                    }
                })
            }
        })

        // Convertir a array y limitar resultados
        return Array.from(terms).slice(0, limit)
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
function hasDiscount(product: any): boolean {
    if (!product.discount || Number(product.discount) <= 0) {
        return false
    }

    const now = new Date()
    return (
        (!product.discountStartDate || product.discountStartDate <= now) &&
        (!product.discountEndDate || product.discountEndDate >= now)
    )
}
