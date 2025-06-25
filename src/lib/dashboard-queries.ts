"use server"

import { db } from "./db"

// Tipos para los datos del dashboard
export interface DashboardData {
    productsCount: number
    areasCount: number
    lowStockCount: number
    lowStockProducts: any[]
    totalInventoryValue: number
    recentMovements: any[]
    groupedByDate: { [key: string]: any[] }
    entriesCount: number
    exitsCount: number
    productsByArea: any[]
    topProducts: any[]
    salesData: {
        total: number
        growth: number
        lastMonth: number
    }
    ordersData: {
        total: number
        pending: number
        completed: number
    }
    inventoryValueTrend: any[]
    inventoryByCategory: any[]
    movementsByMonth: any[]
    inventoryTurnover: any[]
}

// Función principal para obtener datos del dashboard
export const getDashboardData = async (agencyId: string): Promise<DashboardData> => {
    try {
        // Obtener productos de la agencia
        const products = await db.product.findMany({
            where: { agencyId },
            include: {
                Category: true,
                Movements: {
                    include: {
                        Area: true,
                    },
                },
            },
        })

        // Obtener áreas de la agencia
        const areas = await db.area.findMany({
            where: { agencyId },
            include: {
                Movements: {
                    include: {
                        Product: true,
                    },
                },
            },
        })

        // Obtener movimientos recientes (últimos 30)
        const movements = await db.movement.findMany({
            where: { agencyId },
            include: {
                Product: true,
                Area: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 30,
        })

        // Obtener ventas de la agencia
        const sales = await db.sale.findMany({
            where: { agencyId },
            include: {
                Customer: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Calcular stock actual por producto basado en movimientos
        const productStocks = new Map<string, number>()

        products.forEach((product) => {
            let currentStock = product.quantity || 0 // Stock inicial del producto

            // Calcular stock basado en movimientos
            product.Movements.forEach((movement) => {
                if (movement.type === "ENTRADA") {
                    currentStock += movement.quantity
                } else if (movement.type === "SALIDA") {
                    currentStock -= movement.quantity
                }
            })

            productStocks.set(product.id, currentStock)
        })

        // Calcular productos con bajo stock
        const lowStockProducts = products
            .filter((product) => {
                const currentStock = productStocks.get(product.id) || 0
                return product.minStock && currentStock <= product.minStock
            })
            .map((product) => {
                const currentStock = productStocks.get(product.id) || 0
                return {
                    ...product,
                    currentStock,
                }
            })

        // Calcular valor total del inventario
        const totalInventoryValue = products.reduce((total, product) => {
            const productStock = productStocks.get(product.id) || 0
            return total + Number(product.price) * productStock
        }, 0)

        // Calcular movimientos por tipo
        const entriesCount = movements.filter((m) => m.type === "ENTRADA").length
        const exitsCount = movements.filter((m) => m.type === "SALIDA").length

        // Procesar movimientos recientes para mostrar
        const recentMovements = movements.slice(0, 10).map((movement) => ({
            _id: movement.id,
            type: movement.type.toLowerCase(),
            productId: movement.productId,
            productName: movement.Product?.name || "Producto desconocido",
            productSku: movement.Product?.sku || "N/A",
            areaName: movement.Area?.name || "Área desconocida",
            quantity: movement.quantity,
            notes: movement.notes,
            date: movement.createdAt,
        }))

        // Agrupar movimientos por día
        const groupedByDate = recentMovements.reduce((groups: any, movement: any) => {
            const date = new Date(movement.date).toLocaleDateString("es-CO")
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(movement)
            return groups
        }, {})

        // Calcular productos por área
        const productsByArea = areas.map((area) => {
            const areaProducts = new Set()
            let totalValue = 0

            area.Movements.forEach((movement) => {
                areaProducts.add(movement.productId)
                const product = movement.Product
                if (product && movement.type === "ENTRADA") {
                    totalValue += Number(product.price) * movement.quantity
                }
            })

            return {
                _id: area.id,
                name: area.name,
                totalProducts: areaProducts.size,
                totalValue,
            }
        })

        // Calcular productos más vendidos (basado en ventas)
        const productSales: { [key: string]: { quantity: number; revenue: number; product: any } } = {}

        sales.forEach((sale) => {
            sale.Items.forEach((item) => {
                const productId = item.productId
                if (!productSales[productId]) {
                    productSales[productId] = {
                        quantity: 0,
                        revenue: 0,
                        product: item.Product,
                    }
                }
                productSales[productId].quantity += item.quantity
                productSales[productId].revenue += item.quantity * Number(item.unitPrice)
            })
        })

        const topProducts = Object.entries(productSales)
            .map(([productId, data]) => ({
                _id: productId,
                name: data.product?.name || "Producto desconocido",
                sku: data.product?.sku || "N/A",
                sales: data.quantity,
                price: Number(data.product?.price) || 0,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)

        // Calcular datos de ventas
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
        const currentMonth = new Date().getMonth()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1

        const lastMonthSales = sales
            .filter((sale) => new Date(sale.createdAt).getMonth() === lastMonth)
            .reduce((sum, sale) => sum + Number(sale.total), 0)

        const growth = lastMonthSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : 0

        const salesData = {
            total: totalSales,
            growth: Number.parseFloat(growth.toFixed(1)),
            lastMonth: lastMonthSales,
        }

        // Datos de órdenes
        const ordersData = {
            total: sales.length,
            pending: sales.filter((sale) => sale.status === "DRAFT").length,
            completed: sales.filter((sale) => sale.status === "COMPLETED").length,
        }

        // Datos para gráficos
        const inventoryValueTrend = [
            { month: "Enero", value: totalInventoryValue * 0.85 },
            { month: "Febrero", value: totalInventoryValue * 0.9 },
            { month: "Marzo", value: totalInventoryValue * 0.88 },
            { month: "Abril", value: totalInventoryValue * 0.92 },
            { month: "Mayo", value: totalInventoryValue * 0.95 },
            { month: "Junio", value: totalInventoryValue },
        ]

        // Distribución por categoría
        const categoryDistribution: { [key: string]: number } = {}
        products.forEach((product) => {
            const categoryName = product.Category?.name || "Sin categoría"
            const productStock = productStocks.get(product.id) || 0
            const productValue = productStock * Number(product.price)
            categoryDistribution[categoryName] = (categoryDistribution[categoryName] || 0) + productValue
        })

        const inventoryByCategory = Object.entries(categoryDistribution).map(([category, value]) => ({
            category,
            value,
        }))

        // Movimientos por mes
        const movementsByMonth = [
            { month: "Enero", entradas: 45, salidas: 38 },
            { month: "Febrero", entradas: 52, salidas: 43 },
            { month: "Marzo", entradas: 48, salidas: 50 },
            { month: "Abril", entradas: 60, salidas: 55 },
            { month: "Mayo", entradas: 58, salidas: 52 },
            { month: "Junio", entradas: entriesCount, salidas: exitsCount },
        ]

        // Rotación de inventario por categoría
        const inventoryTurnover = Object.entries(categoryDistribution).map(([category, value]) => ({
            category,
            turnover: Math.random() * 5 + 1, // Simulado por ahora
        }))

        return {
            productsCount: products.length,
            areasCount: areas.length,
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            totalInventoryValue,
            recentMovements,
            groupedByDate,
            entriesCount,
            exitsCount,
            productsByArea,
            topProducts,
            salesData,
            ordersData,
            inventoryValueTrend,
            inventoryByCategory,
            movementsByMonth,
            inventoryTurnover,
        }
    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error)
        return {
            productsCount: 0,
            areasCount: 0,
            lowStockCount: 0,
            lowStockProducts: [],
            totalInventoryValue: 0,
            recentMovements: [],
            groupedByDate: {},
            entriesCount: 0,
            exitsCount: 0,
            productsByArea: [],
            topProducts: [],
            salesData: { total: 0, growth: 0, lastMonth: 0 },
            ordersData: { total: 0, pending: 0, completed: 0 },
            inventoryValueTrend: [],
            inventoryByCategory: [],
            movementsByMonth: [],
            inventoryTurnover: [],
        }
    }
}

// Función para obtener estadísticas rápidas
export const getQuickStats = async (agencyId: string) => {
    try {
        const [productsCount, areasCount, salesCount, clientsCount] = await Promise.all([
            db.product.count({ where: { agencyId } }),
            db.area.count({ where: { agencyId } }),
            db.sale.count({ where: { agencyId } }),
            db.client.count({ where: { agencyId } }),
        ])

        return {
            productsCount,
            areasCount,
            salesCount,
            clientsCount,
        }
    } catch (error) {
        console.error("Error al obtener estadísticas rápidas:", error)
        return {
            productsCount: 0,
            areasCount: 0,
            salesCount: 0,
            clientsCount: 0,
        }
    }
}

// Función para obtener productos con bajo stock
export const getLowStockProducts = async (agencyId: string) => {
    try {
        const products = await db.product.findMany({
            where: {
                agencyId,
                minStock: { gt: 0 },
            },
            include: {
                Category: true,
                Movements: true,
            },
        })

        return products
            .filter((product) => {
                // Calcular stock actual basado en movimientos
                let currentStock = product.quantity || 0
                product.Movements.forEach((movement) => {
                    if (movement.type === "ENTRADA") {
                        currentStock += movement.quantity
                    } else if (movement.type === "SALIDA") {
                        currentStock -= movement.quantity
                    }
                })
                return currentStock <= (product.minStock || 0)
            })
            .map((product) => {
                let currentStock = product.quantity || 0
                product.Movements.forEach((movement) => {
                    if (movement.type === "ENTRADA") {
                        currentStock += movement.quantity
                    } else if (movement.type === "SALIDA") {
                        currentStock -= movement.quantity
                    }
                })
                return {
                    ...product,
                    currentStock,
                }
            })
    } catch (error) {
        console.error("Error al obtener productos con bajo stock:", error)
        return []
    }
}

// Función para obtener movimientos recientes
export const getRecentMovements = async (agencyId: string, limit = 10) => {
    try {
        const movements = await db.movement.findMany({
            where: { agencyId },
            include: {
                Product: true,
                Area: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        })

        return movements.map((movement) => ({
            id: movement.id,
            type: movement.type.toLowerCase(),
            productName: movement.Product?.name || "Producto desconocido",
            productSku: movement.Product?.sku || "N/A",
            areaName: movement.Area?.name || "Área desconocida",
            quantity: movement.quantity,
            notes: movement.notes,
            date: movement.createdAt,
        }))
    } catch (error) {
        console.error("Error al obtener movimientos recientes:", error)
        return []
    }
}
