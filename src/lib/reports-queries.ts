"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { revalidatePath } from "next/cache"

/**
 * Obtiene estadísticas generales de reportes para una agencia
 */
export const getReportStats = async (agencyId: string, dateRange = "month") => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Calcular fechas
    const now = new Date()
    const startDate = new Date()
    const previousStartDate = new Date()

    switch (dateRange) {
        case "week":
            startDate.setDate(now.getDate() - 7)
            previousStartDate.setDate(now.getDate() - 14)
            break
        case "month":
            startDate.setMonth(now.getMonth() - 1)
            previousStartDate.setMonth(now.getMonth() - 2)
            break
        case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            previousStartDate.setMonth(now.getMonth() - 6)
            break
        case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            previousStartDate.setFullYear(now.getFullYear() - 2)
            break
        default:
            startDate.setMonth(now.getMonth() - 1)
            previousStartDate.setMonth(now.getMonth() - 2)
    }

    // Obtener datos del período actual
    const [currentSales, currentProducts, currentMovements] = await Promise.all([
        db.sale.findMany({
            where: {
                agencyId,
                createdAt: { gte: startDate, lte: now },
            },
        }),
        db.product.findMany({
            where: { agencyId },
        }),
        db.movement.findMany({
            where: {
                agencyId,
                createdAt: { gte: startDate, lte: now },
            },
        }),
    ])

    // Obtener datos del período anterior para comparación
    const [previousSales] = await Promise.all([
        db.sale.findMany({
            where: {
                agencyId,
                createdAt: { gte: previousStartDate, lte: startDate },
            },
        }),
    ])

    // Calcular estadísticas
    const totalRecords = currentSales.length
    const totalValue = currentSales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const average = totalRecords > 0 ? totalValue / totalRecords : 0

    const previousTotalRecords = previousSales.length
    const previousTotalValue = previousSales.reduce((sum, sale) => sum + Number(sale.total), 0)

    const growth =
        previousTotalRecords > 0 ? Math.round(((totalRecords - previousTotalRecords) / previousTotalRecords) * 100) : 0

    const valueGrowth =
        previousTotalValue > 0 ? Math.round(((totalValue - previousTotalValue) / previousTotalValue) * 100) : 0

    const trend = growth > 5 ? 1 : growth < -5 ? -1 : 0

    return {
        totalRecords,
        totalValue,
        average,
        growth,
        valueGrowth,
        trend,
        productsCount: currentProducts.length,
        movementsCount: currentMovements.length,
    }
}

/**
 * Obtiene datos financieros para reportes
 */
export const getFinancialReportsData = async (agencyId: string, dateRange = "month") => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Calcular fechas basadas en el rango
    const now = new Date()
    const startDate = new Date()
    const endDate = new Date()

    switch (dateRange) {
        case "week":
            startDate.setDate(now.getDate() - 7)
            break
        case "month":
            startDate.setMonth(now.getMonth() - 1)
            break
        case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            break
        case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        default:
            startDate.setMonth(now.getMonth() - 1)
    }

    // Obtener datos de ventas
    const sales = await db.sale.findMany({
        where: {
            agencyId,
            createdAt: {
                gte: startDate,
                lte: endDate,
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

    // Obtener datos de gastos (movimientos de tipo salida)
    const expenses = await db.movement.findMany({
        where: {
            agencyId,
            type: "SALIDA",
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            Product: true,
        },
    })

    // Calcular métricas
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.quantity) * 100, 0) // Estimación
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0

    // Agrupar datos por mes
    const monthlyData = new Map()
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    // Inicializar meses
    for (let i = 0; i < 12; i++) {
        monthlyData.set(months[i], { month: months[i], revenue: 0, expenses: 0 })
    }

    // Procesar ventas por mes
    sales.forEach((sale) => {
        const month = months[new Date(sale.createdAt).getMonth()]
        const current = monthlyData.get(month)
        current.revenue += Number(sale.total)
    })

    // Procesar gastos por mes
    expenses.forEach((expense) => {
        const month = months[new Date(expense.createdAt).getMonth()]
        const current = monthlyData.get(month)
        current.expenses += Number(expense.quantity) * 100 // Estimación
    })

    // Categorías de gastos (simulado por ahora)
    const expenseCategories = [
        { name: "Personal", amount: totalExpenses * 0.5, percentage: 50 },
        { name: "Operaciones", amount: totalExpenses * 0.2, percentage: 20 },
        { name: "Marketing", amount: totalExpenses * 0.15, percentage: 15 },
        { name: "Tecnología", amount: totalExpenses * 0.1, percentage: 10 },
        { name: "Otros", amount: totalExpenses * 0.05, percentage: 5 },
    ]

    // Transacciones recientes
    const recentTransactions = [
        ...sales.slice(-5).map((sale) => ({
            id: sale.id,
            description: `Venta #${sale.saleNumber}`,
            type: "ingreso",
            amount: Number(sale.total),
            date: sale.createdAt.toISOString().split("T")[0],
        })),
        ...expenses.slice(-5).map((expense) => ({
            id: expense.id,
            description: `Gasto - ${expense.notes || "Sin descripción"}`,
            type: "gasto",
            amount: Number(expense.quantity) * 100,
            date: expense.createdAt.toISOString().split("T")[0],
        })),
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

    const availableReports = [
        {
            id: "income-statement",
            title: "Estado de Resultados",
            description: "Reporte detallado de ingresos y gastos del período.",
        },
        {
            id: "balance-sheet",
            title: "Balance General",
            description: "Estado financiero que muestra activos, pasivos y patrimonio.",
        },
        {
            id: "cash-flow",
            title: "Flujo de Efectivo",
            description: "Análisis de entradas y salidas de efectivo.",
        },
        {
            id: "tax-report",
            title: "Reporte de Impuestos",
            description: "Resumen de impuestos pagados y por pagar.",
        },
    ]

    return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: Number(profitMargin),
        monthlyFinancials: Array.from(monthlyData.values()),
        expenseCategories,
        recentTransactions,
        availableReports,
    }
}

/**
 * Obtiene datos de inventario para reportes
 */
export const getInventoryReportsData = async (
    agencyId: string,
    dateRange = "month",
    page = 1,
    pageSize = 10,
    category = "all",
    sortBy = "name",
    sortOrder = "asc",
    search = "",
) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Calcular fechas
    const now = new Date()
    const startDate = new Date()

    switch (dateRange) {
        case "week":
            startDate.setDate(now.getDate() - 7)
            break
        case "month":
            startDate.setMonth(now.getMonth() - 1)
            break
        case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            break
        case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
    }

    // Construir filtros
    const whereClause: any = {
        agencyId,
    }

    if (category !== "all") {
        whereClause.categoryId = category
    }

    if (search) {
        whereClause.name = {
            contains: search,
            mode: "insensitive",
        }
    }

    // Obtener productos con paginación
    const [products, totalProducts, categories, movements] = await Promise.all([
        db.product.findMany({
            where: whereClause,
            include: {
                Category: true,
                Movements: {
                    where: {
                        createdAt: { gte: startDate, lte: now },
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder as "asc" | "desc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        db.product.count({ where: whereClause }),
        db.productCategory.findMany({
            where: { agencyId },
        }),
        db.movement.findMany({
            where: {
                agencyId,
                createdAt: { gte: startDate, lte: now },
            },
            include: {
                Product: true,
            },
        }),
    ])

    // Calcular métricas
    const totalValue = products.reduce((sum, product) => sum + Number(product.price) * (product.quantity || 0), 0)
    const lowStockProducts = products.filter((product) => (product.quantity || 0) <= (product.minStock || 0))

    // Agrupar movimientos por fecha para el gráfico
    const movementsByDate = movements.reduce((acc: any, movement) => {
        const date = movement.createdAt.toISOString().split("T")[0]
        if (!acc[date]) {
            acc[date] = { date, entries: 0, exits: 0 }
        }

        if (movement.type === "ENTRADA") {
            acc[date].entries += movement.quantity
        } else {
            acc[date].exits += movement.quantity
        }

        return acc
    }, {})

    // Niveles de stock por categoría
    const stockLevels = categories.map((category) => {
        const categoryProducts = products.filter((p) => p.categoryId === category.id)
        return {
            category: category.name,
            currentStock: categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
            minStock: categoryProducts.reduce((sum, p) => sum + (p.minStock || 0), 0),
        }
    })

    // Distribución de valor por categoría
    const valueDistribution = categories.map((category) => {
        const categoryProducts = products.filter((p) => p.categoryId === category.id)
        const value = categoryProducts.reduce((sum, p) => sum + Number(p.price) * (p.quantity || 0), 0)
        return {
            category: category.name,
            value,
        }
    })

    // Calcular rotación promedio (simulada)
    const turnoverRate = 2.5

    return {
        // Métricas principales
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts.length,
        turnoverRate,
        productsGrowth: 5,
        valueGrowth: 8,

        // Datos para gráficos
        stockLevels,
        movements: Object.values(movementsByDate),
        valueDistribution,

        // Productos con stock bajo
        lowStockProducts: lowStockProducts.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.Category?.name || "Sin categoría",
            currentStock: product.quantity || 0,
            minStock: product.minStock || 0,
        })),

        // Lista de productos paginada
        products: products.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.Category?.name || "Sin categoría",
            currentStock: product.quantity || 0,
            minStock: product.minStock || 0,
            price: Number(product.price),
        })),

        // Metadatos de paginación
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: page,
        pageSize,

        // Categorías para filtros
        categories: categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
        })),
    }
}

/**
 * Obtiene datos de ventas para reportes
 */
export const getSalesReportsData = async (agencyId: string, dateRange = "month", salesperson = "all") => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Calcular fechas
    const now = new Date()
    const startDate = new Date()
    const previousStartDate = new Date()

    switch (dateRange) {
        case "week":
            startDate.setDate(now.getDate() - 7)
            previousStartDate.setDate(now.getDate() - 14)
            break
        case "month":
            startDate.setMonth(now.getMonth() - 1)
            previousStartDate.setMonth(now.getMonth() - 2)
            break
        case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            previousStartDate.setMonth(now.getMonth() - 6)
            break
        case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            previousStartDate.setFullYear(now.getFullYear() - 2)
            break
    }

    // Construir filtros
    const whereClause: any = {
        agencyId,
        createdAt: { gte: startDate, lte: now },
    }

    if (salesperson !== "all") {
        whereClause.cashierId = salesperson
    }

    // Obtener datos de ventas
    const [sales, previousSales, users] = await Promise.all([
        db.sale.findMany({
            where: whereClause,
            include: {
                Items: {
                    include: {
                        Product: true,
                    },
                },
                Customer: true,
                Cashier: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        db.sale.findMany({
            where: {
                ...whereClause,
                createdAt: { gte: previousStartDate, lte: startDate },
            },
        }),
        db.user.findMany({
            where: {
                agencyId: agencyId,
            },
        }),
    ])

    // Calcular métricas principales
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalTransactions = sales.length
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const previousTotalSales = previousSales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const previousTransactions = previousSales.length

    const salesGrowth =
        previousTotalSales > 0 ? Math.round(((totalSales - previousTotalSales) / previousTotalSales) * 100) : 0

    const transactionsGrowth =
        previousTransactions > 0 ? Math.round(((totalTransactions - previousTransactions) / previousTransactions) * 100) : 0

    const ticketGrowth = 5

    // Objetivo mensual (simulado)
    const monthlyTarget = 100000
    const targetAchievement = Math.round((totalSales / monthlyTarget) * 100)

    // Tendencia de ventas (últimos 30 días)
    const salesTrend: { period: string; sales: number; target: number }[] = []
    for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))

        const daySales = sales.filter((sale) => sale.createdAt >= dayStart && sale.createdAt <= dayEnd)
        const dailyTotal = daySales.reduce((sum, sale) => sum + Number(sale.total), 0)
        const dailyTarget = monthlyTarget / 30

        salesTrend.push({
            period: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
            sales: dailyTotal,
            target: dailyTarget,
        })
    }

    // Top productos más vendidos
    const productSales = new Map()
    sales.forEach((sale) => {
        sale.Items.forEach((item) => {
            const productId = item.productId
            const current = productSales.get(productId) || {
                name: item.Product.name,
                quantity: 0,
                revenue: 0,
            }
            current.quantity += item.quantity
            current.revenue += Number(item.unitPrice) * item.quantity
            productSales.set(productId, current)
        })
    })

    const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

    // Ventas por canal (simulado)
    const salesByChannel = [
        { channel: "Tienda Física", amount: totalSales * 0.6 },
        { channel: "Online", amount: totalSales * 0.25 },
        { channel: "Teléfono", amount: totalSales * 0.1 },
        { channel: "WhatsApp", amount: totalSales * 0.05 },
    ]

    // Rendimiento por vendedor
    const salespeople = users
        .map((user) => {
            const userSales = sales.filter((sale) => sale.cashierId === user.id)
            const userTotal = userSales.reduce((sum, sale) => sum + Number(sale.total), 0)
            const userTarget = monthlyTarget / users.length
            const achievement = Math.round((userTotal / userTarget) * 100)

            return {
                id: user.id,
                name: user.name || user.email,
                role: user.role || "Vendedor",
                totalSales: userTotal,
                transactions: userSales.length,
                achievement,
            }
        })
        .sort((a, b) => b.totalSales - a.totalSales)

    // Ventas recientes
    const recentSales = sales.slice(0, 10).map((sale) => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        customerName: sale.Customer?.name,
        salesperson: sale.Cashier?.name || "Sistema",
        total: Number(sale.total),
        date: sale.createdAt.toLocaleDateString(),
        status: "completed",
    }))

    return {
        // Métricas principales
        totalSales,
        totalTransactions,
        averageTicket,
        targetAchievement,
        salesGrowth,
        transactionsGrowth,
        ticketGrowth,

        // Datos para gráficos
        salesTrend,
        topProducts,
        salesByChannel,

        // Rendimiento por vendedor
        salespeople,

        // Ventas recientes
        recentSales,
    }
}

/**
 * Obtiene datos POS para reportes
 */
export const getPosReportsData = async (agencyId: string, dateRange = "month", terminal = "all", cashier = "all") => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Calcular fechas
    const now = new Date()
    const startDate = new Date()
    const previousStartDate = new Date()

    switch (dateRange) {
        case "week":
            startDate.setDate(now.getDate() - 7)
            previousStartDate.setDate(now.getDate() - 14)
            break
        case "month":
            startDate.setMonth(now.getMonth() - 1)
            previousStartDate.setMonth(now.getMonth() - 2)
            break
        case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            previousStartDate.setMonth(now.getMonth() - 6)
            break
        case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            previousStartDate.setFullYear(now.getFullYear() - 2)
            break
    }

    // Obtener ventas POS
    const whereClause: any = {
        agencyId,
        createdAt: { gte: startDate, lte: now },
    }

    if (cashier !== "all") {
        whereClause.cashierId = cashier
    }

    const [sales, previousSales, users] = await Promise.all([
        db.sale.findMany({
            where: whereClause,
            include: {
                Cashier: true,
                Customer: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        db.sale.findMany({
            where: {
                ...whereClause,
                createdAt: { gte: previousStartDate, lte: startDate },
            },
        }),
        db.user.findMany({
            where: {
                agencyId: agencyId,
            },
        }),
    ])

    // Calcular métricas principales
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalTransactions = sales.length
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0
    const averageTime = 3.5 // Tiempo promedio por transacción en minutos (simulado)

    const previousTotalSales = previousSales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const previousTransactions = previousSales.length

    const salesGrowth =
        previousTotalSales > 0 ? Math.round(((totalSales - previousTotalSales) / previousTotalSales) * 100) : 0

    const transactionsGrowth =
        previousTransactions > 0 ? Math.round(((totalTransactions - previousTransactions) / previousTransactions) * 100) : 0

    const ticketGrowth = 3

    // Ventas por hora del día
    const salesByHour = Array.from({ length: 24 }, (_, hour) => {
        const hourSales = sales.filter((sale) => sale.createdAt.getHours() === hour)
        const hourTotal = hourSales.reduce((sum, sale) => sum + Number(sale.total), 0)

        return {
            hour: `${hour.toString().padStart(2, "0")}:00`,
            amount: hourTotal,
            transactions: hourSales.length,
        }
    })

    // Métodos de pago (simulado basado en ventas)
    const paymentMethods = [
        { method: "Efectivo", amount: totalSales * 0.4, percentage: 40 },
        { method: "Tarjeta Débito", amount: totalSales * 0.3, percentage: 30 },
        { method: "Tarjeta Crédito", amount: totalSales * 0.25, percentage: 25 },
        { method: "Transferencia", amount: totalSales * 0.05, percentage: 5 },
    ]

    // Rendimiento por cajero
    const cashierPerformance = users
        .map((user) => {
            const userSales = sales.filter((sale) => sale.cashierId === user.id)
            const userTotal = userSales.reduce((sum, sale) => sum + Number(sale.total), 0)

            return {
                id: user.id,
                name: user.name || user.email,
                sales: userTotal,
                transactions: userSales.length,
                averageTicket: userSales.length > 0 ? userTotal / userSales.length : 0,
                efficiency: Math.round(Math.random() * 20 + 80), // Simulado
            }
        })
        .sort((a, b) => b.sales - a.sales)

    // Terminales (simulado)
    const terminals = [
        {
            id: "terminal-1",
            name: "Terminal 1",
            location: "Caja Principal",
            sales: totalSales * 0.4,
            transactions: Math.round(totalTransactions * 0.4),
            status: "active",
        },
        {
            id: "terminal-2",
            name: "Terminal 2",
            location: "Caja Express",
            sales: totalSales * 0.35,
            transactions: Math.round(totalTransactions * 0.35),
            status: "active",
        },
        {
            id: "terminal-3",
            name: "Terminal 3",
            location: "Autoservicio",
            sales: totalSales * 0.25,
            transactions: Math.round(totalTransactions * 0.25),
            status: "active",
        },
    ]

    // Transacciones recientes
    const recentTransactions = sales.slice(0, 15).map((sale, index) => ({
        id: sale.id,
        terminal: `Terminal ${(index % 3) + 1}`,
        cashier: sale.Cashier?.name || "Sistema",
        paymentMethod: paymentMethods[index % paymentMethods.length].method,
        total: Number(sale.total),
        time: sale.createdAt.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    }))

    return {
        // Métricas principales
        totalSales,
        totalTransactions,
        averageTicket,
        averageTime,
        salesGrowth,
        transactionsGrowth,
        ticketGrowth,

        // Datos para gráficos
        salesByHour,
        paymentMethods,
        cashierPerformance,

        // Terminales y cajeros
        terminals,
        cashiers: users.map((user) => ({
            id: user.id,
            name: user.name || user.email,
        })),

        // Transacciones recientes
        recentTransactions,
    }
}

/**
 * Obtiene alertas activas para una agencia
 */
export const getActiveAlerts = async (agencyId: string, type = "general") => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Generar alertas automáticas basadas en datos
    const alerts = await generateAutomaticAlerts(agencyId, type)
    return { alerts }
}

/**
 * Obtiene configuración de alertas para una agencia
 */
export const getAlertConfig = async (agencyId: string) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Configuración por defecto si no existe
    const defaultConfig = {
        stockAlerts: true,
        salesAlerts: true,
        systemAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        whatsappNotifications: false,
        stockThreshold: 20,
        salesThreshold: 80,
    }

    return defaultConfig
}

/**
 * Actualiza configuración de alertas
 */
export const updateAlertConfig = async (agencyId: string, configData: any) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Aquí se implementaría la lógica para guardar la configuración
    // Por ahora retornamos la configuración actualizada
    const config = {
        agencyId,
        ...configData,
        updatedAt: new Date(),
    }

    revalidatePath(`/agency/${agencyId}/reports`)
    return config
}

/**
 * Descarta una alerta específica
 */
export const dismissAlert = async (agencyId: string, alertId: string) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    // Aquí se implementaría la lógica para descartar la alerta
    const alert = {
        id: alertId,
        agencyId,
        isActive: false,
        dismissedAt: new Date(),
        dismissedBy: user.id,
    }

    revalidatePath(`/agency/${agencyId}/reports`)
    return alert
}

/**
 * Crea una nueva alerta
 */
export const createAlert = async (
    agencyId: string,
    title: string,
    message: string,
    type = "general",
    priority = "medium",
) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    const alert = {
        id: `alert-${Date.now()}`,
        agencyId,
        title,
        message,
        type,
        priority,
        isActive: true,
        createdBy: user.id,
        createdAt: new Date(),
    }

    revalidatePath(`/agency/${agencyId}/reports`)
    return alert
}

/**
 * Exporta datos de reportes en diferentes formatos
 */
export const exportReportData = async (
    agencyId: string,
    reportType: string,
    format: string,
    dateRange: string,
    filters: any = {},
) => {
    const user = await currentUser()
    if (!user) throw new Error("No autorizado")

    let data: any = {}

    switch (reportType) {
        case "financial":
            data = await getFinancialReportsData(agencyId, dateRange)
            break
        case "sales":
            data = await getSalesReportsData(agencyId, dateRange, filters.salesperson)
            break
        case "inventory":
            data = await getInventoryReportsData(
                agencyId,
                dateRange,
                1,
                1000, // Obtener todos los productos para exportación
                filters.category,
                "name",
                "asc",
                filters.search,
            )
            break
        case "pos":
            data = await getPosReportsData(agencyId, dateRange, filters.terminal, filters.cashier)
            break
        default:
            throw new Error("Tipo de reporte no válido")
    }

    // Aquí se procesarían los datos según el formato solicitado
    // Por ahora retornamos los datos tal como están
    return {
        data,
        format,
        reportType,
        dateRange,
        generatedAt: new Date().toISOString(),
    }
}

/**
 * Guarda un registro de actividad relacionado con reportes
 */
export const saveReportActivityLog = async ({
    agencyId,
    description,
    subAccountId,
}: {
    agencyId?: string
    description: string
    subAccountId?: string
}) => {
    const authUser = await currentUser()
    if (!authUser) return

    const userData = await db.user.findUnique({
        where: { email: authUser.emailAddresses[0].emailAddress },
    })

    if (!userData) return

    let foundAgencyId = agencyId
    if (!foundAgencyId && subAccountId) {
        const subAccount = await db.subAccount.findUnique({
            where: { id: subAccountId },
        })
        if (subAccount) foundAgencyId = subAccount.agencyId
    }

    if (!foundAgencyId) return

    if (subAccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                userId: userData.id,
                agencyId: foundAgencyId,
                subAccountId: subAccountId,
            },
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                userId: userData.id,
                agencyId: foundAgencyId,
            },
        })
    }
}

// Funciones auxiliares

/**
 * Genera alertas automáticas basadas en datos del sistema
 */
async function generateAutomaticAlerts(agencyId: string, type: string) {
    const alerts: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        priority: string;
        isActive: boolean;
        createdAt: Date;
        data?: any;
    }> = []

    try {
        if (type === "inventory" || type === "general") {
            // Alertas de stock bajo
            const lowStockProducts = await db.product.findMany({
                where: {
                    agencyId,
                    quantity: {
                        lte: 10, // Productos con stock menor o igual a 10
                    },
                },
                include: {
                    Category: true,
                },
            })

            if (lowStockProducts.length > 0) {
                alerts.push({
                    id: `low-stock-${Date.now()}`,
                    title: "Stock Bajo Detectado",
                    message: `${lowStockProducts.length} productos tienen stock por debajo del mínimo`,
                    type: "inventory",
                    priority: "high",
                    isActive: true,
                    createdAt: new Date(),
                    data: lowStockProducts,
                })
            }
        }

        if (type === "sales" || type === "general") {
            // Alertas de objetivos de ventas
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            const monthlySales = await db.sale.findMany({
                where: {
                    agencyId,
                    createdAt: { gte: startOfMonth, lte: now },
                },
            })

            const totalSales = monthlySales.reduce((sum, sale) => sum + Number(sale.total), 0)
            const monthlyTarget = 100000 // Esto debería venir de configuración
            const achievement = (totalSales / monthlyTarget) * 100

            if (achievement < 70) {
                alerts.push({
                    id: `sales-target-${Date.now()}`,
                    title: "Objetivo de Ventas en Riesgo",
                    message: `Solo se ha alcanzado el ${achievement.toFixed(1)}% del objetivo mensual`,
                    type: "sales",
                    priority: achievement < 50 ? "critical" : "medium",
                    isActive: true,
                    createdAt: new Date(),
                    data: { achievement, target: monthlyTarget, current: totalSales },
                })
            }
        }
    } catch (error) {
        console.error("Error generating automatic alerts:", error)
    }

    return alerts
}

/**
 * Agrupa datos por período de tiempo
 */
const groupDataByPeriod = (data: any[], groupBy: "day" | "week" | "month" | "year", dateField = "createdAt") => {
    const groupedData: Record<string, any> = {}
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    data.forEach((item) => {
        const itemDate = new Date(item[dateField])
        let key = ""

        switch (groupBy) {
            case "day":
                key = itemDate.toISOString().split("T")[0]
                break
            case "week":
                const firstDayOfWeek = new Date(itemDate)
                const dayOfWeek = itemDate.getDay()
                firstDayOfWeek.setDate(itemDate.getDate() - dayOfWeek)
                key = `${firstDayOfWeek.getFullYear()}-W${Math.ceil((firstDayOfWeek.getDate() + 1 + dayOfWeek) / 7)}`
                break
            case "month":
                key = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, "0")}`
                break
            case "year":
                key = itemDate.getFullYear().toString()
                break
        }

        if (!groupedData[key]) {
            let displayLabel = ""

            switch (groupBy) {
                case "day":
                    displayLabel = `${itemDate.getDate()} ${months[itemDate.getMonth()]}`
                    break
                case "week":
                    displayLabel = `Sem ${Math.ceil((itemDate.getDate() + 1 + itemDate.getDay()) / 7)}`
                    break
                case "month":
                    displayLabel = months[itemDate.getMonth()]
                    break
                case "year":
                    displayLabel = itemDate.getFullYear().toString()
                    break
            }

            groupedData[key] = {
                period: key,
                displayLabel,
                items: [],
                count: 0,
                total: 0,
            }
        }

        groupedData[key].items.push(item)
        groupedData[key].count += 1

        // Si el item tiene un campo 'total', sumarlo
        if (item.total) {
            groupedData[key].total += Number(item.total)
        }
    })

    return Object.values(groupedData).sort((a: any, b: any) => {
        return a.period.localeCompare(b.period)
    })
}

/**
 * Calcula métricas de crecimiento entre dos períodos
 */
const calculateGrowthMetrics = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}

/**
 * Formatea números para mostrar en reportes
 */
const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency,
    }).format(amount)
}

/**
 * Formatea porcentajes
 */
const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
}
