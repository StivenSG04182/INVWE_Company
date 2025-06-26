import { prisma } from "@/lib/prisma"
import { format, subDays, startOfDay, endOfDay, startOfMonth, startOfYear } from "date-fns"
import { es } from "date-fns/locale"

// Tipos para los reportes
export type DateRange = "today" | "week" | "month" | "year" | "custom"
export type ReportFormat = "json" | "csv" | "pdf" | "excel"

export interface ReportFilter {
    dateRange: DateRange
    startDate?: Date
    endDate?: Date
    categoryId?: string
    productId?: string
    areaId?: string
    supplierId?: string
    paymentMethod?: string
    cashierId?: string
    customerId?: string
}

export interface SalesReportItem {
    date: string
    totalSales: number
    totalRevenue: number
    averageTicket: number
    itemsSold: number
}

export interface InventoryReportItem {
    productId: string
    productName: string
    sku: string
    categoryName: string
    initialStock: number
    currentStock: number
    entries: number
    exits: number
    transfers: number
    minStock: number
    isLowStock: boolean
    cost: number
    price: number
    totalValue: number
}

export interface ProductPerformanceItem {
    productId: string
    productName: string
    sku: string
    categoryName: string
    quantitySold: number
    revenue: number
    profit: number
    returnRate: number
    stockTurnover: number
}

// Servicio para generación de reportes
export class ReportService {
    // Obtener fechas para el rango seleccionado
    static getDateRangeFilter(filter: ReportFilter): { startDate: Date; endDate: Date } {
        const now = new Date()
        let startDate: Date
        let endDate: Date = endOfDay(now)

        switch (filter.dateRange) {
            case "today":
                startDate = startOfDay(now)
                break
            case "week":
                startDate = startOfDay(subDays(now, 7))
                break
            case "month":
                startDate = startOfMonth(now)
                break
            case "year":
                startDate = startOfYear(now)
                break
            case "custom":
                if (filter.startDate && filter.endDate) {
                    startDate = startOfDay(filter.startDate)
                    endDate = endOfDay(filter.endDate)
                } else {
                    // Si no se proporcionan fechas personalizadas, usar el mes actual
                    startDate = startOfMonth(now)
                }
                break
            default:
                startDate = startOfMonth(now)
        }

        return { startDate, endDate }
    }

    // Generar reporte de ventas
    static async generateSalesReport(agencyId: string, filter: ReportFilter): Promise<SalesReportItem[]> {
        const { startDate, endDate } = this.getDateRangeFilter(filter)

        // Construir la consulta base
        const whereClause: Record<string, any> = {
            agencyId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: "COMPLETED",
        }

        // Aplicar filtros adicionales
        if (filter.areaId) whereClause.areaId = filter.areaId
        if (filter.cashierId) whereClause.cashierId = filter.cashierId
        if (filter.customerId) whereClause.customerId = filter.customerId
        if (filter.paymentMethod) whereClause.paymentMethod = filter.paymentMethod

        // Obtener todas las ventas en el período
        const sales = await prisma.sale.findMany({
            where: whereClause,
            include: {
                Items: {
                    include: {
                        Product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        // Agrupar ventas por fecha
        type SalesByDate = Record<string, {
            date: string
            totalSales: number
            totalRevenue: number
            itemsSold: number
        }>
        const salesByDate: SalesByDate = sales.reduce((acc, sale) => {
            const dateKey = format(sale.createdAt, "yyyy-MM-dd")

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    totalSales: 0,
                    totalRevenue: 0,
                    itemsSold: 0,
                }
            }

            acc[dateKey].totalSales += 1
            acc[dateKey].totalRevenue += Number(sale.total)
            acc[dateKey].itemsSold += Array.isArray(sale.Items) ? sale.Items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0

            return acc
        }, {} as SalesByDate)

        // Convertir a array y calcular ticket promedio
        const report: SalesReportItem[] = Object.values(salesByDate).map((item) => ({
            ...item,
            date: format(new Date(item.date), "dd MMM yyyy", { locale: es }),
            totalRevenue: Number(item.totalRevenue.toFixed(2)),
            averageTicket: Number((item.totalRevenue / item.totalSales).toFixed(2)),
        }))

        return report
    }

    // Generar reporte de inventario
    static async generateInventoryReport(agencyId: string, filter: ReportFilter): Promise<InventoryReportItem[]> {
        const { startDate, endDate } = this.getDateRangeFilter(filter)

        // Obtener productos con su categoría
        const products = await prisma.product.findMany({
            where: {
                agencyId,
                ...(filter.categoryId && { categoryId: filter.categoryId }),
                ...(filter.productId && { id: filter.productId }),
            },
            include: {
                Category: true,
            },
        })

        // Obtener movimientos en el período
        const movements = await prisma.movement.findMany({
            where: {
                agencyId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(filter.areaId && { areaId: filter.areaId }),
                ...(filter.supplierId && { providerId: filter.supplierId }),
                ...(filter.productId && { productId: filter.productId }),
            },
        })

        // Agrupar movimientos por producto
        type MovementsByProduct = Record<string, { entries: number; exits: number; transfers: number }>
        const movementsByProduct: MovementsByProduct = movements.reduce((acc, movement) => {
            if (!movement.productId) return acc
            if (!acc[movement.productId]) {
                acc[movement.productId] = {
                    entries: 0,
                    exits: 0,
                    transfers: 0,
                }
            }

            if (movement.type === "ENTRADA") {
                acc[movement.productId].entries += movement.quantity || 0
            } else if (movement.type === "SALIDA") {
                acc[movement.productId].exits += movement.quantity || 0
            } else if (movement.type === "TRANSFERENCIA") {
                acc[movement.productId].transfers += movement.quantity || 0
            }

            return acc
        }, {} as MovementsByProduct)

        // Construir el reporte
        const report: InventoryReportItem[] = products.map((product) => {
            // Si el producto tiene la propiedad quantity, úsala como stock actual, si no, calcula con movimientos
            let currentStock = typeof product.quantity === "number" ? product.quantity : 0
            if (currentStock === 0 && movementsByProduct[product.id]) {
                // Si no hay quantity, calcula stock como entradas - salidas
                currentStock = movementsByProduct[product.id].entries - movementsByProduct[product.id].exits
            }
            const movements = movementsByProduct[product.id] || { entries: 0, exits: 0, transfers: 0 }
            const initialStock = currentStock - movements.entries + movements.exits
            const isLowStock = typeof product.minStock === "number" ? currentStock <= product.minStock : false
            const totalValue = currentStock * Number(product.price)

            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku || "",
                categoryName: product.Category?.name || "Sin categoría",
                initialStock,
                currentStock,
                entries: movements.entries,
                exits: movements.exits,
                transfers: movements.transfers,
                minStock: product.minStock || 0,
                isLowStock,
                cost: Number(product.cost) || 0,
                price: Number(product.price),
                totalValue: Number(totalValue.toFixed(2)),
            }
        })

        return report
    }

    // Generar reporte de rendimiento de productos
    static async generateProductPerformanceReport(
        agencyId: string,
        filter: ReportFilter,
    ): Promise<ProductPerformanceItem[]> {
        const { startDate, endDate } = this.getDateRangeFilter(filter)

        // Obtener ventas en el período
        const sales = await prisma.sale.findMany({
            where: {
                agencyId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "COMPLETED",
                ...(filter.areaId && { areaId: filter.areaId }),
            },
            include: {
                Items: {
                    include: {
                        Product: {
                            include: {
                                Category: true,
                            },
                        },
                    },
                },
            },
        })

        // Agrupar ventas por producto
        type ProductPerformanceMap = Record<string, ProductPerformanceItem>
        const productPerformance: ProductPerformanceMap = {}

        sales.forEach((sale) => {
            if (!Array.isArray(sale.Items)) return
            sale.Items.forEach((item) => {
                if (!item.productId || !item.Product) return
                const productId = item.productId

                if (!productPerformance[productId]) {
                    productPerformance[productId] = {
                        productId,
                        productName: item.Product.name,
                        sku: item.Product.sku || "",
                        categoryName: item.Product.Category?.name || "Sin categoría",
                        quantitySold: 0,
                        revenue: 0,
                        profit: 0,
                        returnRate: 0, // Se calculará después si hay datos de devoluciones
                        stockTurnover: 0, // Se calculará después con datos de inventario
                    }
                }

                const unitCost = Number(item.Product.cost) || 0
                const unitPrice = Number(item.unitPrice)
                const quantity = item.quantity || 0
                const revenue = unitPrice * quantity
                const profit = (unitPrice - unitCost) * quantity

                productPerformance[productId].quantitySold += quantity
                productPerformance[productId].revenue += revenue
                productPerformance[productId].profit += profit
            })
        })

        // Obtener datos de inventario para calcular rotación de stock
        const products = await prisma.product.findMany({
            where: {
                agencyId,
                id: { in: Object.keys(productPerformance) },
            },
        })

        // Calcular rotación de stock
        products.forEach((product) => {
            if (productPerformance[product.id]) {
                // Si el producto tiene la propiedad quantity, úsala como stock actual
                const currentStock = typeof product.quantity === "number" ? product.quantity : 0
                const quantitySold = productPerformance[product.id].quantitySold

                // Fórmula de rotación: Cantidad vendida / Stock promedio
                // Usamos stock actual como aproximación al stock promedio
                const stockTurnover = currentStock > 0 ? quantitySold / currentStock : 0

                productPerformance[product.id].stockTurnover = Number(stockTurnover.toFixed(2))
            }
        })

        // Convertir a array y formatear valores numéricos
        const report: ProductPerformanceItem[] = Object.values(productPerformance).map((item) => ({
            ...item,
            revenue: Number(item.revenue.toFixed(2)),
            profit: Number(item.profit.toFixed(2)),
        }))

        return report
    }

    // Exportar reporte a CSV
    static exportToCSV(data: object[], filename: string): string {
        if (!data || data.length === 0) return ""

        // Obtener encabezados
        const headers = Object.keys(data[0])

        // Crear contenido CSV
        const csvRows: string[] = []

        // Añadir encabezados
        csvRows.push(headers.join(","))

        // Añadir filas
        for (const row of data) {
            const values = headers.map((header) => {
                const value = (row as Record<string, any>)[header]
                // Escapar comillas y formatear valores
                return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
            })
            csvRows.push(values.join(","))
        }

        return csvRows.join("\n")
    }
}
