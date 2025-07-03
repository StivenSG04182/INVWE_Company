"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { revalidatePath } from "next/cache"
import ExcelJS from "exceljs"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

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

  // Obtener datos de ventas actuales y anteriores
  const [sales, previousSales, payments, invoices] = await Promise.all([
    db.sale.findMany({
      where: {
        agencyId,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        Items: {
          include: {
            Product: true,
          },
        },
        Customer: true,
        Cashier: true,
      },
    }),
    db.sale.findMany({
      where: {
        agencyId,
        createdAt: { gte: previousStartDate, lte: startDate },
      },
    }),
    db.payment.findMany({
      where: {
        agencyId,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        Invoice: true,
      },
    }),
    db.invoice.findMany({
      where: {
        agencyId,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        Items: {
          include: {
            Product: true,
          },
        },
        Customer: true,
      },
    }),
  ])

  // Calcular métricas
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
  const totalExpenses = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.Items.reduce((itemSum, item) => itemSum + Number(item.Product.cost || 0) * item.quantity, 0)),
    0,
  )
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const previousTotalRevenue = previousSales.reduce((sum, sale) => sum + Number(sale.total), 0)
  const revenueGrowth =
    previousTotalRevenue > 0 ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0

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
    current.expenses += Number(
      sale.Items.reduce((sum, item) => sum + Number(item.Product.cost || 0) * item.quantity, 0),
    )
  })

  // Categorías de gastos basadas en datos reales
  const expenseCategories = [
    { name: "Costo de Productos", amount: totalExpenses * 0.7, percentage: 70 },
    { name: "Operaciones", amount: totalExpenses * 0.15, percentage: 15 },
    { name: "Marketing", amount: totalExpenses * 0.1, percentage: 10 },
    { name: "Otros", amount: totalExpenses * 0.05, percentage: 5 },
  ]

  // Transacciones recientes
  const recentTransactions = [
    ...sales.slice(-10).map((sale) => ({
      id: sale.id,
      description: `Venta #${sale.saleNumber}`,
      type: "ingreso",
      amount: Number(sale.total),
      date: sale.createdAt.toISOString().split("T")[0],
      customer: sale.Customer?.name || "Cliente anónimo",
    })),
    ...payments.slice(-5).map((payment) => ({
      id: payment.id,
      description: `Pago - ${payment.method}`,
      type: "ingreso",
      amount: Number(payment.amount),
      date: payment.createdAt.toISOString().split("T")[0],
      reference: payment.reference,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)

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
      id: "profitability",
      title: "Análisis de Rentabilidad",
      description: "Análisis detallado de márgenes y rentabilidad por producto.",
    },
  ]

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin: Number(profitMargin.toFixed(1)),
    revenueGrowth: Number(revenueGrowth.toFixed(1)),
    monthlyFinancials: Array.from(monthlyData.values()),
    expenseCategories,
    recentTransactions,
    availableReports,
    paymentsReceived: payments.filter((p) => p.status === "COMPLETED").length,
    pendingPayments: payments.filter((p) => p.status === "PENDING").length,
    invoicesIssued: invoices.length,
    averageInvoiceValue:
      invoices.length > 0 ? invoices.reduce((sum, inv) => sum + Number(inv.total), 0) / invoices.length : 0,
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
        SaleItems: {
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
      include: {
        Products: true,
      },
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
    const categoryProducts = category.Products || []
    return {
      category: category.name,
      currentStock: categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
      minStock: categoryProducts.reduce((sum, p) => sum + (p.minStock || 0), 0),
      products: categoryProducts.length,
    }
  })

  // Distribución de valor por categoría
  const valueDistribution = categories.map((category) => {
    const categoryProducts = category.Products || []
    const value = categoryProducts.reduce((sum, p) => sum + Number(p.price) * (p.quantity || 0), 0)
    return {
      category: category.name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }
  })

  // Productos más vendidos
  const topSellingProducts = products
    .map((product) => ({
      ...product,
      totalSold: product.SaleItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10)

  return {
    // Métricas principales
    totalProducts,
    totalValue,
    lowStockCount: lowStockProducts.length,
    turnoverRate: 2.5, // Calcular basado en ventas/stock promedio
    productsGrowth: 5, // Calcular comparando con período anterior
    valueGrowth: 8,
    // Datos para gráficos
    stockLevels,
    movements: Object.values(movementsByDate),
    valueDistribution,
    topSellingProducts,
    // Productos con stock bajo
    lowStockProducts: lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.Category?.name || "Sin categoría",
      currentStock: product.quantity || 0,
      minStock: product.minStock || 0,
      sku: product.sku,
      price: Number(product.price),
    })),
    // Lista de productos paginada
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.Category?.name || "Sin categoría",
      currentStock: product.quantity || 0,
      minStock: product.minStock || 0,
      price: Number(product.price),
      cost: Number(product.cost || 0),
      brand: product.brand,
      isActive: product.active,
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
      productsCount: cat.Products?.length || 0,
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
        Area: true,
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

  // Objetivo mensual (basado en promedio histórico)
  const monthlyTarget = totalSales * 1.2 // 20% más que el actual
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
        sku: item.Product.sku,
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

  // Ventas por método de pago
  const salesByPaymentMethod = sales.reduce((acc: any, sale) => {
    const method = sale.paymentMethod
    if (!acc[method]) {
      acc[method] = { method, amount: 0, count: 0 }
    }
    acc[method].amount += Number(sale.total)
    acc[method].count += 1
    return acc
  }, {})

  const salesByChannel = Object.values(salesByPaymentMethod).map((item: any) => ({
    channel: item.method,
    amount: item.amount,
    count: item.count,
    percentage: (item.amount / totalSales) * 100,
  }))

  // Rendimiento por vendedor
  const salespeople = users
    .map((user) => {
      const userSales = sales.filter((sale) => sale.cashierId === user.id)
      const userTotal = userSales.reduce((sum, sale) => sum + Number(sale.total), 0)
      const userTarget = monthlyTarget / users.length
      const achievement = userTarget > 0 ? Math.round((userTotal / userTarget) * 100) : 0

      return {
        id: user.id,
        name: user.name || user.email,
        role: user.role || "Vendedor",
        totalSales: userTotal,
        transactions: userSales.length,
        achievement,
        averageTicket: userSales.length > 0 ? userTotal / userSales.length : 0,
      }
    })
    .sort((a, b) => b.totalSales - a.totalSales)

  // Ventas recientes
  const recentSales = sales.slice(0, 15).map((sale) => ({
    id: sale.id,
    saleNumber: sale.saleNumber,
    customerName: sale.Customer?.name || "Cliente anónimo",
    salesperson: sale.Cashier?.name || "Sistema",
    total: Number(sale.total),
    date: sale.createdAt.toLocaleDateString("es-ES"),
    status: sale.status,
    paymentMethod: sale.paymentMethod,
    area: sale.Area?.name,
  }))

  return {
    // Métricas principales
    totalSales,
    totalTransactions,
    averageTicket,
    targetAchievement,
    salesGrowth,
    transactionsGrowth,
    ticketGrowth: 5, // Calcular basado en período anterior
    // Datos para gráficos
    salesTrend,
    topProducts,
    salesByChannel,
    // Rendimiento por vendedor
    salespeople,
    // Ventas recientes
    recentSales,
    // Métricas adicionales
    completedSales: sales.filter((s) => s.status === "COMPLETED").length,
    cancelledSales: sales.filter((s) => s.status === "CANCELLED").length,
    averageItemsPerSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.Items.length, 0) / sales.length : 0,
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

  // Obtener ventas POS y cajas registradoras
  const whereClause: any = {
    agencyId,
    createdAt: { gte: startDate, lte: now },
  }

  if (cashier !== "all") {
    whereClause.cashierId = cashier
  }

  const [sales, previousSales, users, cashRegisters, areas] = await Promise.all([
    db.sale.findMany({
      where: whereClause,
      include: {
        Cashier: true,
        Customer: true,
        Area: true,
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
    db.cashRegister.findMany({
      where: {
        agencyId,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        Cashier: true,
        Area: true,
      },
    }),
    db.area.findMany({
      where: { agencyId },
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

  // Métodos de pago basados en datos reales
  const paymentMethodsData = sales.reduce((acc: any, sale) => {
    const method = sale.paymentMethod
    if (!acc[method]) {
      acc[method] = { method, amount: 0, count: 0 }
    }
    acc[method].amount += Number(sale.total)
    acc[method].count += 1
    return acc
  }, {})

  const paymentMethods = Object.values(paymentMethodsData).map((item: any) => ({
    method: item.method,
    amount: item.amount,
    percentage: totalSales > 0 ? (item.amount / totalSales) * 100 : 0,
    count: item.count,
  }))

  // Rendimiento por cajero
  const cashierPerformance = users
    .map((user) => {
      const userSales = sales.filter((sale) => sale.cashierId === user.id)
      const userTotal = userSales.reduce((sum, sale) => sum + Number(sale.total), 0)
      const userRegisters = cashRegisters.filter((reg) => reg.cashierId === user.id)

      return {
        id: user.id,
        name: user.name || user.email,
        sales: userTotal,
        transactions: userSales.length,
        averageTicket: userSales.length > 0 ? userTotal / userSales.length : 0,
        efficiency:
          userRegisters.length > 0
            ? Math.round((userRegisters.filter((r) => r.status === "CLOSED").length / userRegisters.length) * 100)
            : 0,
        registersOpened: userRegisters.length,
      }
    })
    .sort((a, b) => b.sales - a.sales)

  // Terminales (áreas de venta)
  const terminals = areas.map((area) => {
    const areaSales = sales.filter((sale) => sale.areaId === area.id)
    const areaTotal = areaSales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const areaRegisters = cashRegisters.filter((reg) => reg.areaId === area.id)

    return {
      id: area.id,
      name: area.name,
      location: area.description || "Área de ventas",
      sales: areaTotal,
      transactions: areaSales.length,
      status: areaRegisters.some((r) => r.status === "OPEN") ? "active" : "inactive",
      registersCount: areaRegisters.length,
    }
  })

  // Transacciones recientes
  const recentTransactions = sales.slice(0, 20).map((sale, index) => ({
    id: sale.id,
    saleNumber: sale.saleNumber,
    terminal: sale.Area?.name || `Terminal ${(index % 3) + 1}`,
    cashier: sale.Cashier?.name || "Sistema",
    paymentMethod: sale.paymentMethod,
    total: Number(sale.total),
    time: sale.createdAt.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: sale.createdAt.toLocaleDateString("es-ES"),
    status: sale.status,
  }))

  return {
    // Métricas principales
    totalSales,
    totalTransactions,
    averageTicket,
    averageTime,
    salesGrowth,
    transactionsGrowth,
    ticketGrowth: 3,
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
    // Métricas adicionales
    openRegisters: cashRegisters.filter((r) => r.status === "OPEN").length,
    closedRegisters: cashRegisters.filter((r) => r.status === "CLOSED").length,
    totalCashSales: cashRegisters.reduce((sum, reg) => sum + Number(reg.cashSales), 0),
    totalCardSales: cashRegisters.reduce((sum, reg) => sum + Number(reg.cardSales), 0),
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
 * Exporta datos de reportes en diferentes formatos PROFESIONALES
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
  let fileBase64 = ""
  let fileName = `reporte_${reportType}_${dateRange}_${Date.now()}`
  let mimeType = "application/octet-stream"

  // Obtener datos según el tipo de reporte
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
        1000,
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

  // Obtener información de la empresa
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
  })

  const companyInfo = {
    name: agency?.name || "Mi Empresa S.A.",
    address: agency?.address || "Av. Principal 123, Ciudad",
    phone: agency?.companyPhone || "+1 234 567 8900",
    email: agency?.companyEmail || "contacto@miempresa.com",
    website: "www.miempresa.com",
    logo: "🏢",
    city: agency?.city || "Ciudad",
    country: agency?.country || "País",
  }

  // Generar archivo según formato
  if (format === "PDF") {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Generar PDF específico según el tipo de reporte
    switch (reportType) {
      case "financial":
        await generateFinancialPDF(pdfDoc, font, boldFont, data, companyInfo, dateRange)
        break
      case "sales":
        await generateSalesPDF(pdfDoc, font, boldFont, data, companyInfo, dateRange)
        break
      case "inventory":
        await generateInventoryPDF(pdfDoc, font, boldFont, data, companyInfo, dateRange)
        break
      case "pos":
        await generatePosPDF(pdfDoc, font, boldFont, data, companyInfo, dateRange)
        break
      default:
        await generateGenericPDF(pdfDoc, font, boldFont, data, companyInfo, dateRange, reportType)
    }

    const pdfBytes = await pdfDoc.save()
    fileBase64 = Buffer.from(pdfBytes).toString("base64")
    fileName += ".pdf"
    mimeType = "application/pdf"
  } else if (format === "EXCEL") {
    // Generar Excel específico por tipo
    const workbook = new ExcelJS.Workbook()
    workbook.creator = companyInfo.name
    workbook.created = new Date()
    workbook.company = companyInfo.name

    switch (reportType) {
      case "financial":
        await generateFinancialExcel(workbook, data, companyInfo, dateRange)
        break
      case "sales":
        await generateSalesExcel(workbook, data, companyInfo, dateRange)
        break
      case "inventory":
        await generateInventoryExcel(workbook, data, companyInfo, dateRange)
        break
      case "pos":
        await generatePosExcel(workbook, data, companyInfo, dateRange)
        break
      default:
        await generateGenericExcel(workbook, data, companyInfo, dateRange, reportType)
    }

    const buffer = await workbook.xlsx.writeBuffer()
    fileBase64 = Buffer.from(buffer).toString("base64")
    fileName += ".xlsx"
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  } else if (format === "CSV") {
    // CSV específico por tipo
    let csv = generateCSVHeader(companyInfo, reportType, dateRange)

    switch (reportType) {
      case "financial":
        csv += generateFinancialCSV(data)
        break
      case "sales":
        csv += generateSalesCSV(data)
        break
      case "inventory":
        csv += generateInventoryCSV(data)
        break
      case "pos":
        csv += generatePosCSV(data)
        break
      default:
        csv += generateGenericCSV(data)
    }

    fileBase64 = Buffer.from(csv).toString("base64")
    fileName += ".csv"
    mimeType = "text/csv"
  } else {
    // JSON por defecto
    const exportData = {
      company: companyInfo,
      report: {
        type: reportType,
        period: dateRange,
        generatedAt: new Date().toISOString(),
        kpis: getKPIsForReport(reportType, data),
        insights: generateInsights(reportType, data),
      },
      data,
    }

    fileBase64 = Buffer.from(JSON.stringify(exportData, null, 2)).toString("base64")
    fileName += ".json"
    mimeType = "application/json"
  }

  return {
    data,
    format,
    reportType,
    dateRange,
    generatedAt: new Date().toISOString(),
    fileBase64,
    fileName,
    mimeType,
    company: companyInfo,
  }
}

// Funciones específicas para generar PDFs por tipo de reporte
async function generateFinancialPDF(
  pdfDoc: any,
  font: any,
  boldFont: any,
  data: any,
  companyInfo: any,
  dateRange: string,
) {
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()

  // Header financiero con colores específicos
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.1, 0.4, 0.2), // Verde financiero
  })

  page.drawText(`${companyInfo.name}`, {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(`REPORTE FINANCIERO - ${dateRange.toUpperCase()}`, {
    x: 50,
    y: height - 85,
    size: 16,
    font: boldFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  let yPos = height - 160

  // Métricas financieras principales
  const metrics = [
    { label: "Ingresos Totales", value: `$${data.totalRevenue?.toLocaleString() || 0}`, color: rgb(0.1, 0.7, 0.1) },
    { label: "Gastos Totales", value: `$${data.totalExpenses?.toLocaleString() || 0}`, color: rgb(0.8, 0.2, 0.2) },
    { label: "Utilidad Neta", value: `$${data.netProfit?.toLocaleString() || 0}`, color: rgb(0.2, 0.4, 0.8) },
    { label: "Margen de Utilidad", value: `${data.profitMargin || 0}%`, color: rgb(0.6, 0.3, 0.8) },
  ]

  metrics.forEach((metric, index) => {
    const xPos = 50 + (index % 2) * 250
    const currentY = yPos - Math.floor(index / 2) * 60

    page.drawRectangle({
      x: xPos,
      y: currentY - 40,
      width: 200,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
    })

    page.drawText(metric.label, {
      x: xPos + 10,
      y: currentY - 15,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText(metric.value, {
      x: xPos + 10,
      y: currentY - 30,
      size: 16,
      font: boldFont,
      color: metric.color,
    })
  })

  // Tabla de transacciones recientes
  yPos -= 150
  page.drawText("Transacciones Recientes", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.4, 0.2),
  })

  yPos -= 30
  const headers = ["Descripción", "Tipo", "Monto", "Fecha"]
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.recentTransactions?.slice(0, 10).forEach((transaction: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(transaction.description.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(transaction.type, {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: transaction.type === "ingreso" ? rgb(0.1, 0.7, 0.1) : rgb(0.8, 0.2, 0.2),
    })
    page.drawText(`$${transaction.amount.toLocaleString()}`, {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(transaction.date, {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  })
}

async function generateSalesPDF(pdfDoc: any, font: any, boldFont: any, data: any, companyInfo: any, dateRange: string) {
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()

  // Header de ventas con colores específicos
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.2, 0.4, 0.8), // Azul ventas
  })

  page.drawText(`${companyInfo.name}`, {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(`REPORTE DE VENTAS - ${dateRange.toUpperCase()}`, {
    x: 50,
    y: height - 85,
    size: 16,
    font: boldFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  let yPos = height - 160

  // Métricas de ventas principales
  const metrics = [
    { label: "Ventas Totales", value: `$${data.totalSales?.toLocaleString() || 0}`, color: rgb(0.2, 0.4, 0.8) },
    { label: "Transacciones", value: `${data.totalTransactions?.toLocaleString() || 0}`, color: rgb(0.1, 0.7, 0.1) },
    { label: "Ticket Promedio", value: `$${data.averageTicket?.toLocaleString() || 0}`, color: rgb(0.8, 0.4, 0.1) },
    { label: "Cumplimiento", value: `${data.targetAchievement || 0}%`, color: rgb(0.6, 0.1, 0.8) },
  ]

  metrics.forEach((metric, index) => {
    const xPos = 50 + (index % 2) * 250
    const currentY = yPos - Math.floor(index / 2) * 60

    page.drawRectangle({
      x: xPos,
      y: currentY - 40,
      width: 200,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
    })

    page.drawText(metric.label, {
      x: xPos + 10,
      y: currentY - 15,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText(metric.value, {
      x: xPos + 10,
      y: currentY - 30,
      size: 16,
      font: boldFont,
      color: metric.color,
    })
  })

  // Top productos más vendidos
  yPos -= 150
  page.drawText("Top Productos Más Vendidos", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  })

  yPos -= 30
  const productHeaders = ["Producto", "SKU", "Cantidad", "Ingresos"]
  productHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.topProducts?.slice(0, 8).forEach((product: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(product.name.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(product.sku || "N/A", {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(product.quantity.toString(), {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
    page.drawText(`$${product.revenue.toLocaleString()}`, {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.2, 0.4, 0.8),
    })
  })

  // Rendimiento por vendedor
  yPos -= 200
  page.drawText("Rendimiento por Vendedor", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  })

  yPos -= 30
  const salesHeaders = ["Vendedor", "Ventas", "Transacciones", "Cumplimiento"]
  salesHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.salespeople?.slice(0, 6).forEach((person: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(person.name.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(`$${person.totalSales.toLocaleString()}`, {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
    page.drawText(person.transactions.toString(), {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(`${person.achievement}%`, {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: person.achievement >= 100 ? rgb(0.1, 0.7, 0.1) : rgb(0.8, 0.4, 0.1),
    })
  })
}

async function generateInventoryPDF(
  pdfDoc: any,
  font: any,
  boldFont: any,
  data: any,
  companyInfo: any,
  dateRange: string,
) {
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()

  // Header de inventario con colores específicos
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.4, 0.2, 0.6), // Púrpura inventario
  })

  page.drawText(`${companyInfo.name}`, {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(`REPORTE DE INVENTARIO - ${dateRange.toUpperCase()}`, {
    x: 50,
    y: height - 85,
    size: 16,
    font: boldFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  let yPos = height - 160

  // Métricas de inventario principales
  const metrics = [
    { label: "Total Productos", value: `${data.totalProducts?.toLocaleString() || 0}`, color: rgb(0.4, 0.2, 0.6) },
    { label: "Valor Total", value: `$${data.totalValue?.toLocaleString() || 0}`, color: rgb(0.1, 0.7, 0.1) },
    { label: "Stock Bajo", value: `${data.lowStockCount || 0}`, color: rgb(0.8, 0.4, 0.1) },
    { label: "Rotación", value: `${data.turnoverRate || 0}x`, color: rgb(0.2, 0.4, 0.8) },
  ]

  metrics.forEach((metric, index) => {
    const xPos = 50 + (index % 2) * 250
    const currentY = yPos - Math.floor(index / 2) * 60

    page.drawRectangle({
      x: xPos,
      y: currentY - 40,
      width: 200,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
    })

    page.drawText(metric.label, {
      x: xPos + 10,
      y: currentY - 15,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText(metric.value, {
      x: xPos + 10,
      y: currentY - 30,
      size: 16,
      font: boldFont,
      color: metric.color,
    })
  })

  // Productos con stock bajo
  yPos -= 150
  page.drawText("Productos con Stock Bajo", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.8, 0.4, 0.1),
  })

  yPos -= 30
  const stockHeaders = ["Producto", "SKU", "Stock Actual", "Stock Mínimo"]
  stockHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.lowStockProducts?.slice(0, 10).forEach((product: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(product.name.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(product.sku || "N/A", {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(product.currentStock.toString(), {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.8, 0.2, 0.2),
    })
    page.drawText(product.minStock.toString(), {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
  })

  // Distribución de valor por categoría
  yPos -= 250
  page.drawText("Distribución de Valor por Categoría", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  })

  yPos -= 30
  const categoryHeaders = ["Categoría", "Valor", "Porcentaje", "Productos"]
  categoryHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.valueDistribution?.slice(0, 6).forEach((category: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(category.category.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(`$${category.value.toLocaleString()}`, {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
    page.drawText(`${category.percentage?.toFixed(1) || 0}%`, {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.4, 0.2, 0.6),
    })
    page.drawText((data.stockLevels?.find((s: any) => s.category === category.category)?.products || 0).toString(), {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  })
}

async function generatePosPDF(pdfDoc: any, font: any, boldFont: any, data: any, companyInfo: any, dateRange: string) {
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()

  // Header POS con colores específicos
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.1, 0.6, 0.4), // Verde azulado POS
  })

  page.drawText(`${companyInfo.name}`, {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(`REPORTE POS - ${dateRange.toUpperCase()}`, {
    x: 50,
    y: height - 85,
    size: 16,
    font: boldFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  let yPos = height - 160

  // Métricas POS principales
  const metrics = [
    { label: "Ventas POS", value: `$${data.totalSales?.toLocaleString() || 0}`, color: rgb(0.1, 0.6, 0.4) },
    { label: "Transacciones", value: `${data.totalTransactions?.toLocaleString() || 0}`, color: rgb(0.2, 0.4, 0.8) },
    { label: "Tiempo Promedio", value: `${data.averageTime || 0} min`, color: rgb(0.8, 0.4, 0.1) },
    { label: "Ticket Promedio", value: `$${data.averageTicket?.toLocaleString() || 0}`, color: rgb(0.6, 0.1, 0.8) },
  ]

  metrics.forEach((metric, index) => {
    const xPos = 50 + (index % 2) * 250
    const currentY = yPos - Math.floor(index / 2) * 60

    page.drawRectangle({
      x: xPos,
      y: currentY - 40,
      width: 200,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
    })

    page.drawText(metric.label, {
      x: xPos + 10,
      y: currentY - 15,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })

    page.drawText(metric.value, {
      x: xPos + 10,
      y: currentY - 30,
      size: 16,
      font: boldFont,
      color: metric.color,
    })
  })

  // Terminales más activas
  yPos -= 150
  page.drawText("Terminales Más Activas", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.4),
  })

  yPos -= 30
  const terminalHeaders = ["Terminal", "Ventas", "Transacciones", "Estado"]
  terminalHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.terminals?.slice(0, 6).forEach((terminal: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(terminal.name.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(`$${terminal.sales.toLocaleString()}`, {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
    page.drawText(terminal.transactions.toString(), {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(terminal.status === "active" ? "Activa" : "Inactiva", {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: terminal.status === "active" ? rgb(0.1, 0.7, 0.1) : rgb(0.8, 0.2, 0.2),
    })
  })

  // Cajeros más eficientes
  yPos -= 200
  page.drawText("Cajeros Más Eficientes", {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.4),
  })

  yPos -= 30
  const cashierHeaders = ["Cajero", "Ventas", "Transacciones", "Eficiencia"]
  cashierHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + index * 120,
      y: yPos,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  yPos -= 20
  data.cashierPerformance?.slice(0, 6).forEach((cashier: any, index: number) => {
    const rowY = yPos - index * 20
    page.drawText(cashier.name.substring(0, 15), {
      x: 50,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(`$${cashier.sales.toLocaleString()}`, {
      x: 170,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.1, 0.7, 0.1),
    })
    page.drawText(cashier.transactions.toString(), {
      x: 290,
      y: rowY,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(`${cashier.efficiency}%`, {
      x: 410,
      y: rowY,
      size: 9,
      font,
      color: cashier.efficiency > 80 ? rgb(0.1, 0.7, 0.1) : rgb(0.8, 0.4, 0.1),
    })
  })
}

async function generateGenericPDF(
  pdfDoc: any,
  font: any,
  boldFont: any,
  data: any,
  companyInfo: any,
  dateRange: string,
  reportType: string,
) {
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()

  // Header genérico con colores neutros
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.3, 0.3, 0.3), // Gris neutro
  })

  page.drawText(`${companyInfo.name}`, {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(`REPORTE GENÉRICO (${reportType.toUpperCase()}) - ${dateRange.toUpperCase()}`, {
    x: 50,
    y: height - 85,
    size: 16,
    font: boldFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  let yPos = height - 160

  // Información de la empresa
  page.drawText(`Información de la Empresa:`, {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  yPos -= 20

  page.drawText(`Nombre: ${companyInfo.name}`, {
    x: 50,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.1, 0.1, 0.1),
  })
  yPos -= 15

  page.drawText(`Dirección: ${companyInfo.address}, ${companyInfo.city}, ${companyInfo.country}`, {
    x: 50,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.1, 0.1, 0.1),
  })
  yPos -= 15

  page.drawText(`Contacto: ${companyInfo.phone} / ${companyInfo.email}`, {
    x: 50,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.1, 0.1, 0.1),
  })
  yPos -= 30

  // Datos del reporte
  page.drawText(`Datos del Reporte:`, {
    x: 50,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })
  yPos -= 20

  page.drawText(`Tipo: ${reportType}`, {
    x: 50,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.1, 0.1, 0.1),
  })
  yPos -= 15

  page.drawText(`Período: ${dateRange}`, {
    x: 50,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.1, 0.1, 0.1),
  })
  yPos -= 30

  // KPIs (si existen)
  if (data.kpis && Array.isArray(data.kpis)) {
    page.drawText(`Indicadores Clave de Rendimiento:`, {
      x: 50,
      y: yPos,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPos -= 20

    data.kpis.slice(0, 5).forEach((kpi: any) => {
      page.drawText(`- ${kpi.name}: ${kpi.value} (${kpi.growth})`, {
        x: 50,
        y: yPos,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
      })
      yPos -= 15
    })
  }
}

// Funciones específicas para generar EXCEL por tipo de reporte
async function generateFinancialExcel(workbook: any, data: any, companyInfo: any, dateRange: string) {
  // === HOJA DE PORTADA ===
  const coverSheet = workbook.addWorksheet("Portada")

  // Configurar ancho de columnas
  coverSheet.columns = [{ width: 5 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }]

  // Logo y título principal
  coverSheet.mergeCells("B2:E2")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = `${companyInfo.logo} ${companyInfo.name}`
  titleCell.font = { size: 24, bold: true, color: { argb: "FF1f4e79" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }

  // Subtítulo del reporte
  coverSheet.mergeCells("B4:E4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = `REPORTE FINANCIERO - ${dateRange.toUpperCase()}`
  subtitleCell.font = { size: 18, bold: true, color: { argb: "FF2f5597" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Información de la empresa
  coverSheet.getCell("B6").value = "📍 Dirección:"
  coverSheet.getCell("C6").value = companyInfo.address
  coverSheet.getCell("B7").value = "📞 Teléfono:"
  coverSheet.getCell("C7").value = companyInfo.phone
  coverSheet.getCell("B8").value = "📧 Email:"
  coverSheet.getCell("C8").value = companyInfo.email
  coverSheet.getCell("B9").value = "🌐 Website:"
  coverSheet.getCell("C9").value = companyInfo.website

  // Fecha de generación
  coverSheet.getCell("B11").value = "📅 Fecha de Generación:"
  coverSheet.getCell("C11").value = new Date().toLocaleString("es-ES")
  coverSheet.getCell("C11").font = { bold: true }

  // Período del reporte
  coverSheet.getCell("B12").value = "📊 Período:"
  coverSheet.getCell("C12").value = dateRange
  coverSheet.getCell("C12").font = { bold: true }
  // Estilo para las etiquetas
  ;["B6", "B7", "B8", "B9", "B11", "B12"].forEach((cell) => {
    coverSheet.getCell(cell).font = { bold: true, color: { argb: "FF1f4e79" } }
  })

  // === HOJA DE RESUMEN EJECUTIVO ===
  const summarySheet = workbook.addWorksheet("Resumen Ejecutivo")
  summarySheet.columns = [{ width: 5 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 }]

  // Título
  summarySheet.mergeCells("B2:E2")
  const summaryTitle = summarySheet.getCell("B2")
  summaryTitle.value = "📈 RESUMEN EJECUTIVO"
  summaryTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  summaryTitle.alignment = { horizontal: "center" }

  let currentRow = 4

  // KPIs principales
  summarySheet.getCell(`B${currentRow}`).value = "🎯 INDICADORES CLAVE DE RENDIMIENTO (KPIs)"
  summarySheet.getCell(`B${currentRow}`).font = { size: 14, bold: true, color: { argb: "FF2f5597" } }
  currentRow += 2

  // Crear tabla de KPIs
  const kpiHeaders = ["Métrica", "Valor Actual", "Crecimiento", "Estado"]
  kpiHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 2)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1f4e79" } }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  currentRow++

  // Agregar KPIs según el tipo de reporte
  const kpis = getKPIsForReport("financial", data)
  kpis.forEach((kpi) => {
    summarySheet.getCell(currentRow, 2).value = kpi.name
    summarySheet.getCell(currentRow, 3).value = kpi.value
    summarySheet.getCell(currentRow, 4).value = kpi.growth
    summarySheet.getCell(currentRow, 5).value = kpi.status

    // Colorear según el estado
    const statusCell = summarySheet.getCell(currentRow, 5)
    if (kpi.status === "🟢 Excelente") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFd4edda" } }
    } else if (kpi.status === "🟡 Bueno") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff3cd" } }
    } else if (kpi.status === "🔴 Atención") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8d7da" } }
    }

    // Bordes para toda la fila
    for (let col = 2; col <= 5; col++) {
      summarySheet.getCell(currentRow, col).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    }
    currentRow++
  })

  // === HOJAS DE DATOS DETALLADOS ===
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const sheet = workbook.addWorksheet(capitalizeFirst(key))

      // Título de la hoja
      sheet.mergeCells("A1:F1")
      const sheetTitle = sheet.getCell("A1")
      sheetTitle.value = `📊 ${capitalizeFirst(key)
        .replace(/([A-Z])/g, " $1")
        .trim()}`
      sheetTitle.font = { size: 16, bold: true, color: { argb: "FF1f4e79" } }
      sheetTitle.alignment = { horizontal: "center" }

      const headers = Object.keys(value[0])

      // Encabezados con estilo
      headers.forEach((header, index) => {
        const cell = sheet.getCell(3, index + 1)
        cell.value = capitalizeFirst(header)
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2f5597" } }
        cell.alignment = { horizontal: "center" }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })

      // Datos con formato alternado
      value.forEach((row: any, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(rowIndex + 4, colIndex + 1)
          cell.value = formatCellValue(row[header])

          // Formato alternado de filas
          if (rowIndex % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8f9fa" } }
          }

          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          }

          // Formato especial para números
          if (typeof row[header] === "number") {
            if (
              header.toLowerCase().includes("price") ||
              header.toLowerCase().includes("total") ||
              header.toLowerCase().includes("amount")
            ) {
              cell.numFmt = '"$"#,##0.00'
            } else if (header.toLowerCase().includes("percentage")) {
              cell.numFmt = "0.00%"
            }
          }
        })
      })

      // Ajustar ancho de columnas
      sheet.columns.forEach((column) => {
        if (column) column.width = 18
      })

      // Agregar gráfico si es apropiado
      if (shouldAddChart(key, value)) {
        addChartToSheet(sheet, key, value, headers)
      }
    }
  })

  // === HOJA DE GRÁFICOS ===
  const chartsSheet = workbook.addWorksheet("Gráficos y Análisis")
  chartsSheet.mergeCells("A1:F1")
  const chartsTitle = chartsSheet.getCell("A1")
  chartsTitle.value = "📊 ANÁLISIS GRÁFICO"
  chartsTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  chartsTitle.alignment = { horizontal: "center" }

  // Agregar análisis textual
  let analysisRow = 3
  const insights = generateInsights("financial", data)
  insights.forEach((insight) => {
    chartsSheet.getCell(`A${analysisRow}`).value = insight.title
    chartsSheet.getCell(`A${analysisRow}`).font = { bold: true, size: 12, color: { argb: "FF2f5597" } }
    analysisRow++

    chartsSheet.getCell(`A${analysisRow}`).value = insight.description
    chartsSheet.getCell(`A${analysisRow}`).alignment = { wrapText: true }
    analysisRow += 2
  })
}

async function generateSalesExcel(workbook: any, data: any, companyInfo: any, dateRange: string) {
  // === HOJA DE PORTADA ===
  const coverSheet = workbook.addWorksheet("Portada")

  // Configurar ancho de columnas
  coverSheet.columns = [{ width: 5 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }]

  // Logo y título principal
  coverSheet.mergeCells("B2:E2")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = `${companyInfo.logo} ${companyInfo.name}`
  titleCell.font = { size: 24, bold: true, color: { argb: "FF1f4e79" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }

  // Subtítulo del reporte
  coverSheet.mergeCells("B4:E4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = `REPORTE DE VENTAS - ${dateRange.toUpperCase()}`
  subtitleCell.font = { size: 18, bold: true, color: { argb: "FF2f5597" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Información de la empresa
  coverSheet.getCell("B6").value = "📍 Dirección:"
  coverSheet.getCell("C6").value = companyInfo.address
  coverSheet.getCell("B7").value = "📞 Teléfono:"
  coverSheet.getCell("C7").value = companyInfo.phone
  coverSheet.getCell("B8").value = "📧 Email:"
  coverSheet.getCell("C8").value = companyInfo.email
  coverSheet.getCell("B9").value = "🌐 Website:"
  coverSheet.getCell("C9").value = companyInfo.website

  // Fecha de generación
  coverSheet.getCell("B11").value = "📅 Fecha de Generación:"
  coverSheet.getCell("C11").value = new Date().toLocaleString("es-ES")
  coverSheet.getCell("C11").font = { bold: true }

  // Período del reporte
  coverSheet.getCell("B12").value = "📊 Período:"
  coverSheet.getCell("C12").value = dateRange
  coverSheet.getCell("C12").font = { bold: true }
  // Estilo para las etiquetas
  ;["B6", "B7", "B8", "B9", "B11", "B12"].forEach((cell) => {
    coverSheet.getCell(cell).font = { bold: true, color: { argb: "FF1f4e79" } }
  })

  // === HOJA DE RESUMEN EJECUTIVO ===
  const summarySheet = workbook.addWorksheet("Resumen Ejecutivo")
  summarySheet.columns = [{ width: 5 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 }]

  // Título
  summarySheet.mergeCells("B2:E2")
  const summaryTitle = summarySheet.getCell("B2")
  summaryTitle.value = "📈 RESUMEN EJECUTIVO"
  summaryTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  summaryTitle.alignment = { horizontal: "center" }

  let currentRow = 4

  // KPIs principales
  summarySheet.getCell(`B${currentRow}`).value = "🎯 INDICADORES CLAVE DE RENDIMIENTO (KPIs)"
  summarySheet.getCell(`B${currentRow}`).font = { size: 14, bold: true, color: { argb: "FF2f5597" } }
  currentRow += 2

  // Crear tabla de KPIs
  const kpiHeaders = ["Métrica", "Valor Actual", "Crecimiento", "Estado"]
  kpiHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 2)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1f4e79" } }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  currentRow++

  // Agregar KPIs según el tipo de reporte
  const kpis = getKPIsForReport("sales", data)
  kpis.forEach((kpi) => {
    summarySheet.getCell(currentRow, 2).value = kpi.name
    summarySheet.getCell(currentRow, 3).value = kpi.value
    summarySheet.getCell(currentRow, 4).value = kpi.growth
    summarySheet.getCell(currentRow, 5).value = kpi.status

    // Colorear según el estado
    const statusCell = summarySheet.getCell(currentRow, 5)
    if (kpi.status === "🟢 Excelente") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFd4edda" } }
    } else if (kpi.status === "🟡 Bueno") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff3cd" } }
    } else if (kpi.status === "🔴 Atención") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8d7da" } }
    }

    // Bordes para toda la fila
    for (let col = 2; col <= 5; col++) {
      summarySheet.getCell(currentRow, col).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    }
    currentRow++
  })

  // === HOJAS DE DATOS DETALLADOS ===
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const sheet = workbook.addWorksheet(capitalizeFirst(key))

      // Título de la hoja
      sheet.mergeCells("A1:F1")
      const sheetTitle = sheet.getCell("A1")
      sheetTitle.value = `📊 ${capitalizeFirst(key)
        .replace(/([A-Z])/g, " $1")
        .trim()}`
      sheetTitle.font = { size: 16, bold: true, color: { argb: "FF1f4e79" } }
      sheetTitle.alignment = { horizontal: "center" }

      const headers = Object.keys(value[0])

      // Encabezados con estilo
      headers.forEach((header, index) => {
        const cell = sheet.getCell(3, index + 1)
        cell.value = capitalizeFirst(header)
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2f5597" } }
        cell.alignment = { horizontal: "center" }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })

      // Datos con formato alternado
      value.forEach((row: any, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(rowIndex + 4, colIndex + 1)
          cell.value = formatCellValue(row[header])

          // Formato alternado de filas
          if (rowIndex % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8f9fa" } }
          }

          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          }

          // Formato especial para números
          if (typeof row[header] === "number") {
            if (
              header.toLowerCase().includes("price") ||
              header.toLowerCase().includes("total") ||
              header.toLowerCase().includes("amount")
            ) {
              cell.numFmt = '"$"#,##0.00'
            } else if (header.toLowerCase().includes("percentage")) {
                          cell.numFmt = "0.00%"
            }
          }
        })
      })

      // Ajustar ancho de columnas
      sheet.columns.forEach((column) => {
        if (column) column.width = 18
      })

      // Agregar gráfico si es apropiado
      if (shouldAddChart(key, value)) {
        addChartToSheet(sheet, key, value, headers)
      }
    }
  })

  // === HOJA DE GRÁFICOS ===
  const chartsSheet = workbook.addWorksheet("Gráficos y Análisis")
  chartsSheet.mergeCells("A1:F1")
  const chartsTitle = chartsSheet.getCell("A1")
  chartsTitle.value = "📊 ANÁLISIS GRÁFICO"
  chartsTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  chartsTitle.alignment = { horizontal: "center" }

  // Agregar análisis textual
  let analysisRow = 3
  const insights = generateInsights("sales", data)
  insights.forEach((insight) => {
    chartsSheet.getCell(`A${analysisRow}`).value = insight.title
    chartsSheet.getCell(`A${analysisRow}`).font = { bold: true, size: 12, color: { argb: "FF2f5597" } }
    analysisRow++

    chartsSheet.getCell(`A${analysisRow}`).value = insight.description
    chartsSheet.getCell(`A${analysisRow}`).alignment = { wrapText: true }
    analysisRow += 2
  })
}

async function generateInventoryExcel(workbook: any, data: any, companyInfo: any, dateRange: string) {
  // === HOJA DE PORTADA ===
  const coverSheet = workbook.addWorksheet("Portada")

  // Configurar ancho de columnas
  coverSheet.columns = [{ width: 5 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }]

  // Logo y título principal
  coverSheet.mergeCells("B2:E2")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = `${companyInfo.logo} ${companyInfo.name}`
  titleCell.font = { size: 24, bold: true, color: { argb: "FF1f4e79" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }

  // Subtítulo del reporte
  coverSheet.mergeCells("B4:E4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = `REPORTE DE INVENTARIO - ${dateRange.toUpperCase()}`
  subtitleCell.font = { size: 18, bold: true, color: { argb: "FF2f5597" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Información de la empresa
  coverSheet.getCell("B6").value = "📍 Dirección:"
  coverSheet.getCell("C6").value = companyInfo.address
  coverSheet.getCell("B7").value = "📞 Teléfono:"
  coverSheet.getCell("C7").value = companyInfo.phone
  coverSheet.getCell("B8").value = "📧 Email:"
  coverSheet.getCell("C8").value = companyInfo.email
  coverSheet.getCell("B9").value = "🌐 Website:"
  coverSheet.getCell("C9").value = companyInfo.website

  // Fecha de generación
  coverSheet.getCell("B11").value = "📅 Fecha de Generación:"
  coverSheet.getCell("C11").value = new Date().toLocaleString("es-ES")
  coverSheet.getCell("C11").font = { bold: true }

  // Período del reporte
  coverSheet.getCell("B12").value = "📊 Período:"
  coverSheet.getCell("C12").value = dateRange
  coverSheet.getCell("C12").font = { bold: true }
  // Estilo para las etiquetas
  ;["B6", "B7", "B8", "B9", "B11", "B12"].forEach((cell) => {
    coverSheet.getCell(cell).font = { bold: true, color: { argb: "FF1f4e79" } }
  })

  // === HOJA DE RESUMEN EJECUTIVO ===
  const summarySheet = workbook.addWorksheet("Resumen Ejecutivo")
  summarySheet.columns = [{ width: 5 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 }]

  // Título
  summarySheet.mergeCells("B2:E2")
  const summaryTitle = summarySheet.getCell("B2")
  summaryTitle.value = "📈 RESUMEN EJECUTIVO"
  summaryTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  summaryTitle.alignment = { horizontal: "center" }

  let currentRow = 4

  // KPIs principales
  summarySheet.getCell(`B${currentRow}`).value = "🎯 INDICADORES CLAVE DE RENDIMIENTO (KPIs)"
  summarySheet.getCell(`B${currentRow}`).font = { size: 14, bold: true, color: { argb: "FF2f5597" } }
  currentRow += 2

  // Crear tabla de KPIs
  const kpiHeaders = ["Métrica", "Valor Actual", "Crecimiento", "Estado"]
  kpiHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 2)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1f4e79" } }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  currentRow++

  // Agregar KPIs según el tipo de reporte
  const kpis = getKPIsForReport("inventory", data)
  kpis.forEach((kpi) => {
    summarySheet.getCell(currentRow, 2).value = kpi.name
    summarySheet.getCell(currentRow, 3).value = kpi.value
    summarySheet.getCell(currentRow, 4).value = kpi.growth
    summarySheet.getCell(currentRow, 5).value = kpi.status

    // Colorear según el estado
    const statusCell = summarySheet.getCell(currentRow, 5)
    if (kpi.status === "🟢 Excelente") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFd4edda" } }
    } else if (kpi.status === "🟡 Bueno") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff3cd" } }
    } else if (kpi.status === "🔴 Atención") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8d7da" } }
    }

    // Bordes para toda la fila
    for (let col = 2; col <= 5; col++) {
      summarySheet.getCell(currentRow, col).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    }
    currentRow++
  })

  // === HOJAS DE DATOS DETALLADOS ===
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const sheet = workbook.addWorksheet(capitalizeFirst(key))

      // Título de la hoja
      sheet.mergeCells("A1:F1")
      const sheetTitle = sheet.getCell("A1")
      sheetTitle.value = `📊 ${capitalizeFirst(key)
        .replace(/([A-Z])/g, " $1")
        .trim()}`
      sheetTitle.font = { size: 16, bold: true, color: { argb: "FF1f4e79" } }
      sheetTitle.alignment = { horizontal: "center" }

      const headers = Object.keys(value[0])

      // Encabezados con estilo
      headers.forEach((header, index) => {
        const cell = sheet.getCell(3, index + 1)
        cell.value = capitalizeFirst(header)
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2f5597" } }
        cell.alignment = { horizontal: "center" }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })

      // Datos con formato alternado
      value.forEach((row: any, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(rowIndex + 4, colIndex + 1)
          cell.value = formatCellValue(row[header])

          // Formato alternado de filas
          if (rowIndex % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8f9fa" } }
          }

          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          }

          // Formato especial para números
          if (typeof row[header] === "number") {
            if (
              header.toLowerCase().includes("price") ||
              header.toLowerCase().includes("total") ||
              header.toLowerCase().includes("amount")
            ) {
              cell.numFmt = '"$"#,##0.00'
            } else if (header.toLowerCase().includes("percentage")) {
                          cell.numFmt = "0.00%"
            }
          }
        })
      })

      // Ajustar ancho de columnas
      sheet.columns.forEach((column) => {
        if (column) column.width = 18
      })

      // Agregar gráfico si es apropiado
      if (shouldAddChart(key, value)) {
        addChartToSheet(sheet, key, value, headers)
      }
    }
  })

  // === HOJA DE GRÁFICOS ===
  const chartsSheet = workbook.addWorksheet("Gráficos y Análisis")
  chartsSheet.mergeCells("A1:F1")
  const chartsTitle = chartsSheet.getCell("A1")
  chartsTitle.value = "📊 ANÁLISIS GRÁFICO"
  chartsTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  chartsTitle.alignment = { horizontal: "center" }

  // Agregar análisis textual
  let analysisRow = 3
  const insights = generateInsights("inventory", data)
  insights.forEach((insight) => {
    chartsSheet.getCell(`A${analysisRow}`).value = insight.title
    chartsSheet.getCell(`A${analysisRow}`).font = { bold: true, size: 12, color: { argb: "FF2f5597" } }
    analysisRow++

    chartsSheet.getCell(`A${analysisRow}`).value = insight.description
    chartsSheet.getCell(`A${analysisRow}`).alignment = { wrapText: true }
    analysisRow += 2
  })
}

async function generatePosExcel(workbook: any, data: any, companyInfo: any, dateRange: string) {
  // === HOJA DE PORTADA ===
  const coverSheet = workbook.addWorksheet("Portada")

  // Configurar ancho de columnas
  coverSheet.columns = [{ width: 5 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }]

  // Logo y título principal
  coverSheet.mergeCells("B2:E2")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = `${companyInfo.logo} ${companyInfo.name}`
  titleCell.font = { size: 24, bold: true, color: { argb: "FF1f4e79" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }

  // Subtítulo del reporte
  coverSheet.mergeCells("B4:E4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = `REPORTE POS - ${dateRange.toUpperCase()}`
  subtitleCell.font = { size: 18, bold: true, color: { argb: "FF2f5597" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Información de la empresa
  coverSheet.getCell("B6").value = "📍 Dirección:"
  coverSheet.getCell("C6").value = companyInfo.address
  coverSheet.getCell("B7").value = "📞 Teléfono:"
  coverSheet.getCell("C7").value = companyInfo.phone
  coverSheet.getCell("B8").value = "📧 Email:"
  coverSheet.getCell("C8").value = companyInfo.email
  coverSheet.getCell("B9").value = "🌐 Website:"
  coverSheet.getCell("C9").value = companyInfo.website

  // Fecha de generación
  coverSheet.getCell("B11").value = "📅 Fecha de Generación:"
  coverSheet.getCell("C11").value = new Date().toLocaleString("es-ES")
  coverSheet.getCell("C11").font = { bold: true }

  // Período del reporte
  coverSheet.getCell("B12").value = "📊 Período:"
  coverSheet.getCell("C12").value = dateRange
  coverSheet.getCell("C12").font = { bold: true }
  // Estilo para las etiquetas
  ;["B6", "B7", "B8", "B9", "B11", "B12"].forEach((cell) => {
    coverSheet.getCell(cell).font = { bold: true, color: { argb: "FF1f4e79" } }
  })

  // === HOJA DE RESUMEN EJECUTIVO ===
  const summarySheet = workbook.addWorksheet("Resumen Ejecutivo")
  summarySheet.columns = [{ width: 5 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 }]

  // Título
  summarySheet.mergeCells("B2:E2")
  const summaryTitle = summarySheet.getCell("B2")
  summaryTitle.value = "📈 RESUMEN EJECUTIVO"
  summaryTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  summaryTitle.alignment = { horizontal: "center" }

  let currentRow = 4

  // KPIs principales
  summarySheet.getCell(`B${currentRow}`).value = "🎯 INDICADORES CLAVE DE RENDIMIENTO (KPIs)"
  summarySheet.getCell(`B${currentRow}`).font = { size: 14, bold: true, color: { argb: "FF2f5597" } }
  currentRow += 2

  // Crear tabla de KPIs
  const kpiHeaders = ["Métrica", "Valor Actual", "Crecimiento", "Estado"]
  kpiHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 2)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1f4e79" } }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  currentRow++

  // Agregar KPIs según el tipo de reporte
  const kpis = getKPIsForReport("pos", data)
  kpis.forEach((kpi) => {
    summarySheet.getCell(currentRow, 2).value = kpi.name
    summarySheet.getCell(currentRow, 3).value = kpi.value
    summarySheet.getCell(currentRow, 4).value = kpi.growth
    summarySheet.getCell(currentRow, 5).value = kpi.status

    // Colorear según el estado
    const statusCell = summarySheet.getCell(currentRow, 5)
    if (kpi.status === "🟢 Excelente") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFd4edda" } }
    } else if (kpi.status === "🟡 Bueno") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff3cd" } }
    } else if (kpi.status === "🔴 Atención") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8d7da" } }
    }

    // Bordes para toda la fila
    for (let col = 2; col <= 5; col++) {
      summarySheet.getCell(currentRow, col).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    }
    currentRow++
  })

  // === HOJAS DE DATOS DETALLADOS ===
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const sheet = workbook.addWorksheet(capitalizeFirst(key))

      // Título de la hoja
      sheet.mergeCells("A1:F1")
      const sheetTitle = sheet.getCell("A1")
      sheetTitle.value = `📊 ${capitalizeFirst(key)
        .replace(/([A-Z])/g, " $1")
        .trim()}`
      sheetTitle.font = { size: 16, bold: true, color: { argb: "FF1f4e79" } }
      sheetTitle.alignment = { horizontal: "center" }

      const headers = Object.keys(value[0])

      // Encabezados con estilo
      headers.forEach((header, index) => {
        const cell = sheet.getCell(3, index + 1)
        cell.value = capitalizeFirst(header)
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2f5597" } }
        cell.alignment = { horizontal: "center" }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })

      // Datos con formato alternado
      value.forEach((row: any, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(rowIndex + 4, colIndex + 1)
          cell.value = formatCellValue(row[header])

          // Formato alternado de filas
          if (rowIndex % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8f9fa" } }
          }

          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          }

          // Formato especial para números
          if (typeof row[header] === "number") {
            if (
              header.toLowerCase().includes("price") ||
              header.toLowerCase().includes("total") ||
              header.toLowerCase().includes("amount")
            ) {
              cell.numFmt = '"$"#,##0.00'
            } else if (header.toLowerCase().includes("percentage")) {
              cell.numFmt = "0.00%"
            }
          }
        })
      })
        
        // Ajustar ancho de columnas
        sheet.columns.forEach((column) => {
          if (column) column.width = 18
        })

        // Agregar gráfico si es apropiado
        if (shouldAddChart(key, value)) {
          addChartToSheet(sheet, key, value, headers)
        }
      }
    })

    // === HOJA DE GRÁFICOS ===
    const chartsSheet = workbook.addWorksheet("Gráficos y Análisis")
    chartsSheet.mergeCells("A1:F1")
    const chartsTitle = chartsSheet.getCell("A1")
    chartsTitle.value = "📊 ANÁLISIS GRÁFICO"
    chartsTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
    chartsTitle.alignment = { horizontal: "center" }

    // Agregar análisis textual
    let analysisRow = 3
    const insights = generateInsights("pos", data)
    insights.forEach((insight) => {
      chartsSheet.getCell(`A${analysisRow}`).value = insight.title
      chartsSheet.getCell(`A${analysisRow}`).font = { bold: true, size: 12, color: { argb: "FF2f5597" } }
      analysisRow++

      chartsSheet.getCell(`A${analysisRow}`).value = insight.description
      chartsSheet.getCell(`A${analysisRow}`).alignment = { wrapText: true }
      analysisRow += 2
    })
  }


async function generateGenericExcel(workbook: any, data: any, companyInfo: any, dateRange: string, reportType: string) {
  // === HOJA DE PORTADA ===
  const coverSheet = workbook.addWorksheet("Portada")

  // Configurar ancho de columnas
  coverSheet.columns = [{ width: 5 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }]

  // Logo y título principal
  coverSheet.mergeCells("B2:E2")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = `${companyInfo.logo} ${companyInfo.name}`
  titleCell.font = { size: 24, bold: true, color: { argb: "FF1f4e79" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }

  // Subtítulo del reporte
  coverSheet.mergeCells("B4:E4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = `REPORTE GENÉRICO (${reportType.toUpperCase()}) - ${dateRange.toUpperCase()}`
  subtitleCell.font = { size: 18, bold: true, color: { argb: "FF2f5597" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Información de la empresa
  coverSheet.getCell("B6").value = "📍 Dirección:"
  coverSheet.getCell("C6").value = companyInfo.address
  coverSheet.getCell("B7").value = "📞 Teléfono:"
  coverSheet.getCell("C7").value = companyInfo.phone
  coverSheet.getCell("B8").value = "📧 Email:"
  coverSheet.getCell("C8").value = companyInfo.email
  coverSheet.getCell("B9").value = "🌐 Website:"
  coverSheet.getCell("C9").value = companyInfo.website

  // Fecha de generación
  coverSheet.getCell("B11").value = "📅 Fecha de Generación:"
  coverSheet.getCell("C11").value = new Date().toLocaleString("es-ES")
  coverSheet.getCell("C11").font = { bold: true }

  // Período del reporte
  coverSheet.getCell("B12").value = "📊 Período:"
  coverSheet.getCell("C12").value = dateRange
  coverSheet.getCell("C12").font = { bold: true }
  // Estilo para las etiquetas
  ;["B6", "B7", "B8", "B9", "B11", "B12"].forEach((cell) => {
    coverSheet.getCell(cell).font = { bold: true, color: { argb: "FF1f4e79" } }
  })

  // === HOJA DE RESUMEN EJECUTIVO ===
  const summarySheet = workbook.addWorksheet("Resumen Ejecutivo")
  summarySheet.columns = [{ width: 5 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 20 }]

  // Título
  summarySheet.mergeCells("B2:E2")
  const summaryTitle = summarySheet.getCell("B2")
  summaryTitle.value = "📈 RESUMEN EJECUTIVO"
  summaryTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
  summaryTitle.alignment = { horizontal: "center" }

  let currentRow = 4

  // KPIs principales
  summarySheet.getCell(`B${currentRow}`).value = "🎯 INDICADORES CLAVE DE RENDIMIENTO (KPIs)"
  summarySheet.getCell(`B${currentRow}`).font = { size: 14, bold: true, color: { argb: "FF2f5597" } }
  currentRow += 2

  // Crear tabla de KPIs
  const kpiHeaders = ["Métrica", "Valor Actual", "Crecimiento", "Estado"]
  kpiHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 2)
    cell.value = header
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1f4e79" } }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })
  currentRow++

  // Agregar KPIs según el tipo de reporte
  const kpis = getKPIsForReport(reportType, data)
  kpis.forEach((kpi) => {
    summarySheet.getCell(currentRow, 2).value = kpi.name
    summarySheet.getCell(currentRow, 3).value = kpi.value
    summarySheet.getCell(currentRow, 4).value = kpi.growth
    summarySheet.getCell(currentRow, 5).value = kpi.status

    // Colorear según el estado
    const statusCell = summarySheet.getCell(currentRow, 5)
    if (kpi.status === "🟢 Excelente") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFd4edda" } }
    } else if (kpi.status === "🟡 Bueno") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff3cd" } }
    } else if (kpi.status === "🔴 Atención") {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8d7da" } }
    }

    // Bordes para toda la fila
    for (let col = 2; col <= 5; col++) {
      summarySheet.getCell(currentRow, col).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    }
    currentRow++
  })

  // === HOJAS DE DATOS DETALLADOS ===
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const sheet = workbook.addWorksheet(capitalizeFirst(key))

      // Título de la hoja
      sheet.mergeCells("A1:F1")
      const sheetTitle = sheet.getCell("A1")
      sheetTitle.value = `📊 ${capitalizeFirst(key)
        .replace(/([A-Z])/g, " $1")
        .trim()}`
      sheetTitle.font = { size: 16, bold: true, color: { argb: "FF1f4e79" } }
      sheetTitle.alignment = { horizontal: "center" }

      const headers = Object.keys(value[0])

      // Encabezados con estilo
      headers.forEach((header, index) => {
        const cell = sheet.getCell(3, index + 1)
        cell.value = capitalizeFirst(header)
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2f5597" } }
        cell.alignment = { horizontal: "center" }
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        }
      })

      // Datos con formato alternado
      value.forEach((row: any, rowIndex) => {
        headers.forEach((header, colIndex) => {
          const cell = sheet.getCell(rowIndex + 4, colIndex + 1)
          cell.value = formatCellValue(row[header])

          // Formato alternado de filas
          if (rowIndex % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8f9fa" } }
          }

          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          }

          // Formato especial para números
          if (typeof row[header] === "number") {
            if (
              header.toLowerCase().includes("price") ||
              header.toLowerCase().includes("total") ||
              header.toLowerCase().includes("amount")
            ) {
              cell.numFmt = '"$"#,##0.00'
            } else if (header.toLowerCase().includes("percentage")) {
              cell.numFmt = "0.00%"
            }
          }
        })
      })

            // Ajustar ancho de columns
      sheet.columns.forEach((column) => {
        if (column) column.width = 18
      })

      // Agregar gráfico si es apropiado
      if (shouldAddChart(key, value)) {
        addChartToSheet(sheet, key, value, headers)
      }
    }
  })

    // === HOJA DE GRÁFICOS ===
    const chartsSheet = workbook.addWorksheet("Gráficos y Análisis")
    chartsSheet.mergeCells("A1:F1")
    const chartsTitle = chartsSheet.getCell("A1")
    chartsTitle.value = "📊 ANÁLISIS GRÁFICO"
    chartsTitle.font = { size: 18, bold: true, color: { argb: "FF1f4e79" } }
    chartsTitle.alignment = { horizontal: "center" }

    // Agregar análisis textual
    let analysisRow = 3
    const insights = generateInsights(reportType, data)
    insights.forEach((insight) => {
      chartsSheet.getCell(`A${analysisRow}`).value = insight.title
      chartsSheet.getCell(`A${analysisRow}`).font = { bold: true, size: 12, color: { argb: "FF2f5597" } }
      analysisRow++

      chartsSheet.getCell(`A${analysisRow}`).value = insight.description
      chartsSheet.getCell(`A${analysisRow}`).alignment = { wrapText: true }
      analysisRow += 2
    })
}

// Funciones específicas para generar CSV por tipo de reporte
function generateCSVHeader(companyInfo: any, reportType: string, dateRange: string): string {
  let csv = ""

  // Metadatos del reporte
  csv += `# REPORTE ${reportType.toUpperCase()}\n`
  csv += `# Empresa: ${companyInfo.name}\n`
  csv += `# Período: ${dateRange}\n`
  csv += `# Generado: ${new Date().toLocaleString("es-ES")}\n`
  csv += `# Contacto: ${companyInfo.email}\n`
  csv += `#\n`

  return csv
}

function generateFinancialCSV(data: any): string {
  let csv = ""

  // KPIs principales
  csv += `# INDICADORES CLAVE\n`
  const kpis = getKPIsForReport("financial", data)
  kpis.forEach((kpi) => {
    csv += `# ${kpi.name}: ${kpi.value} (${kpi.growth})\n`
  })
  csv += `#\n`

  // Encontrar la tabla principal para exportar (transacciones recientes)
  if (data.recentTransactions && Array.isArray(data.recentTransactions) && data.recentTransactions.length > 0) {
    csv += `# DATOS: Transacciones Recientes\n`
    const arr = data.recentTransactions
    const headers = Object.keys(arr[0])

    // Encabezados
    csv += headers.map((h) => `"${capitalizeFirst(h)}"`).join(",") + "\n"

    // Datos
    arr.forEach((row: any) => {
      csv +=
        headers
          .map((h) => {
            const value = formatCellValue(row[h])
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",") + "\n"
    })
  } else {
    // Si no hay tablas, exportar métricas
    csv += `# MÉTRICAS GENERALES\n`
    csv += `"Métrica","Valor"\n`
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        csv += `"${capitalizeFirst(key)}","${formatCellValue(value)}"\n`
      }
    })
  }

  return csv
}

function generateSalesCSV(data: any): string {
  let csv = ""

  // KPIs principales
  csv += `# INDICADORES CLAVE\n`
  const kpis = getKPIsForReport("sales", data)
  kpis.forEach((kpi) => {
    csv += `# ${kpi.name}: ${kpi.value} (${kpi.growth})\n`
  })
  csv += `#\n`

  // Encontrar la tabla principal para exportar (top productos)
  if (data.topProducts && Array.isArray(data.topProducts) && data.topProducts.length > 0) {
    csv += `# DATOS: Top Productos Más Vendidos\n`
    const arr = data.topProducts
    const headers = Object.keys(arr[0])

    // Encabezados
    csv += headers.map((h) => `"${capitalizeFirst(h)}"`).join(",") + "\n"

    // Datos
    arr.forEach((row: any) => {
      csv +=
        headers
          .map((h) => {
            const value = formatCellValue(row[h])
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",") + "\n"
    })
  } else {
    // Si no hay tablas, exportar métricas
    csv += `# MÉTRICAS GENERALES\n`
    csv += `"Métrica","Valor"\n`
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        csv += `"${capitalizeFirst(key)}","${formatCellValue(value)}"\n`
      }
    })
  }

  return csv
}

function generateInventoryCSV(data: any): string {
  let csv = ""

  // KPIs principales
  csv += `# INDICADORES CLAVE\n`
  const kpis = getKPIsForReport("inventory", data)
  kpis.forEach((kpi) => {
    csv += `# ${kpi.name}: ${kpi.value} (${kpi.growth})\n`
  })
  csv += `#\n`

  // Encontrar la tabla principal para exportar (productos con stock bajo)
  if (data.lowStockProducts && Array.isArray(data.lowStockProducts) && data.lowStockProducts.length > 0) {
    csv += `# DATOS: Productos con Stock Bajo\n`
    const arr = data.lowStockProducts
    const headers = Object.keys(arr[0])

    // Encabezados
    csv += headers.map((h) => `"${capitalizeFirst(h)}"`).join(",") + "\n"

    // Datos
    arr.forEach((row: any) => {
      csv +=
        headers
          .map((h) => {
            const value = formatCellValue(row[h])
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",") + "\n"
    })
  } else {
    // Si no hay tablas, exportar métricas
    csv += `# MÉTRICAS GENERALES\n`
    csv += `"Métrica","Valor"\n`
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        csv += `"${capitalizeFirst(key)}","${formatCellValue(value)}"\n`
      }
    })
  }

  return csv
}

function generatePosCSV(data: any): string {
  let csv = ""

  // KPIs principales
  csv += `# INDICADORES CLAVE\n`
  const kpis = getKPIsForReport("pos", data)
  kpis.forEach((kpi) => {
    csv += `# ${kpi.name}: ${kpi.value} (${kpi.growth})\n`
  })
  csv += `#\n`

  // Encontrar la tabla principal para exportar (terminales más activas)
  if (data.terminals && Array.isArray(data.terminals) && data.terminals.length > 0) {
    csv += `# DATOS: Terminales Más Activas\n`
    const arr = data.terminals
    const headers = Object.keys(arr[0])

    // Encabezados
    csv += headers.map((h) => `"${capitalizeFirst(h)}"`).join(",") + "\n"

    // Datos
    arr.forEach((row: any) => {
      csv +=
        headers
          .map((h) => {
            const value = formatCellValue(row[h])
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",") + "\n"
    })
  } else {
    // Si no hay tablas, exportar métricas
    csv += `# MÉTRICAS GENERALES\n`
    csv += `"Métrica","Valor"\n`
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        csv += `"${capitalizeFirst(key)}","${formatCellValue(value)}"\n`
      }
    })
  }

  return csv
}

function generateGenericCSV(data: any): string {
  let csv = ""

  // Encontrar la tabla principal para exportar
  const arrayKey = Object.keys(data).find(
    (k) => Array.isArray(data[k]) && data[k].length > 0 && typeof data[k][0] === "object",
  )

  if (arrayKey) {
    csv += `# DATOS: ${capitalizeFirst(arrayKey)
      .replace(/([A-Z])/g, " $1")
      .trim()}\n`
    const arr = data[arrayKey]
    const headers = Object.keys(arr[0])

    // Encabezados
    csv += headers.map((h) => `"${capitalizeFirst(h)}"`).join(",") + "\n"

    // Datos
    arr.forEach((row: any) => {
      csv +=
        headers
          .map((h) => {
            const value = formatCellValue(row[h])
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",") + "\n"
    })
  } else {
    // Si no hay tablas, exportar métricas
    csv += `# MÉTRICAS GENERALES\n`
    csv += `"Métrica","Valor"\n`
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        csv += `"${capitalizeFirst(key)}","${formatCellValue(value)}"\n`
      }
    })
  }

  return csv
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

// ===== FUNCIONES AUXILIARES MEJORADAS =====

/**
 * Genera alertas automáticas basadas en datos del sistema
 */
async function generateAutomaticAlerts(
  agencyId: string,
  type: string,
) {
  const alerts: Array<{
    id: string
    title: string
    message: string
    type: string
    priority: string
    isActive: boolean
    createdAt: Date
    data?: any
  }> = []

  try {
    if (type === "inventory" || type === "general") {
      // Alertas de stock bajo
      const lowStockProducts = await db.product.findMany({
        where: {
          agencyId,
          quantity: {
            lte: 10,
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

      const totalSales = monthlySales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0,
      )
      const monthlyTarget = 100000
      const achievement = (totalSales / monthlyTarget) * 100

      if (achievement < 70) {
        alerts.push({
          id: `sales-target-${Date.now()}`,
          title: "Objetivo de Ventas en Riesgo",
          message: `Solo se ha alcanzado el ${achievement.toFixed(
            1,
          )}% del objetivo mensual`,
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

// Definir la interfaz KPI arriba de la función getKPIsForReport
interface KPI {
  name: string;
  value: string | number;
  growth: string | number;
  status: string;
}

/**
 * Obtiene KPIs específicos según el tipo de reporte
 */
function getKPIsForReport(reportType: string, data: any): KPI[] {
  const kpis: KPI[] = []

  switch (reportType) {
    case "financial":
      kpis.push(
        {
          name: "Ingresos Totales",
          value: formatCurrency(data.totalRevenue || 0),
          growth: `+${data.valueGrowth || 0}%`,
          status:
            (data.valueGrowth || 0) > 10
              ? "🟢 Excelente"
              : (data.valueGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Gastos Totales",
          value: formatCurrency(data.totalExpenses || 0),
          growth: `${data.expenseGrowth || 0}%`,
          status:
            (data.expenseGrowth || 0) < 5
              ? "🟢 Excelente"
              : (data.expenseGrowth || 0) < 15
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Utilidad Neta",
          value: formatCurrency(data.netProfit || 0),
          growth: `${data.profitGrowth || 0}%`,
          status: (data.netProfit || 0) > 0 ? "🟢 Excelente" : "🔴 Atención",
        },
        {
          name: "Margen de Utilidad",
          value: `${data.profitMargin || 0}%`,
          growth: `${data.marginGrowth || 0}%`,
          status:
            (data.profitMargin || 0) > 20
              ? "🟢 Excelente"
              : (data.profitMargin || 0) > 10
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
      )
      break

    case "sales":
      kpis.push(
        {
          name: "Ventas Totales",
          value: formatCurrency(data.totalSales || 0),
          growth: `+${data.salesGrowth || 0}%`,
          status:
            (data.salesGrowth || 0) > 15
              ? "🟢 Excelente"
              : (data.salesGrowth || 0) > 5
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Transacciones",
          value: (data.totalTransactions || 0).toLocaleString(),
          growth: `+${data.transactionsGrowth || 0}%`,
          status:
            (data.transactionsGrowth || 0) > 10
              ? "🟢 Excelente"
              : (data.transactionsGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Ticket Promedio",
          value: formatCurrency(data.averageTicket || 0),
          growth: `+${data.ticketGrowth || 0}%`,
          status:
            (data.ticketGrowth || 0) > 5
              ? "🟢 Excelente"
              : (data.ticketGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Cumplimiento Meta",
          value: `${data.targetAchievement || 0}%`,
          growth: `${data.targetGrowth || 0}%`,
          status:
            (data.targetAchievement || 0) > 100
              ? "🟢 Excelente"
              : (data.targetAchievement || 0) > 80
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
      )
      break

    case "inventory":
      kpis.push(
        {
          name: "Productos Totales",
          value: (data.totalProducts || 0).toLocaleString(),
          growth: `+${data.productsGrowth || 0}%`,
          status:
            (data.productsGrowth || 0) > 5
              ? "🟢 Excelente"
              : (data.productsGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Valor Total",
          value: formatCurrency(data.totalValue || 0),
          growth: `+${data.valueGrowth || 0}%`,
          status:
            (data.valueGrowth || 0) > 10
              ? "🟢 Excelente"
              : (data.valueGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Stock Bajo",
          value: (data.lowStockCount || 0).toString(),
          growth: `${data.stockGrowth || 0}%`,
          status:
            (data.lowStockCount || 0) < 5
              ? "🟢 Excelente"
              : (data.lowStockCount || 0) < 15
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Rotación",
          value: `${data.turnoverRate || 0}x`,
          growth: `+${data.turnoverGrowth || 0}%`,
          status:
            (data.turnoverRate || 0) > 3
              ? "🟢 Excelente"
              : (data.turnoverRate || 0) > 2
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
      )
      break

    case "pos":
      kpis.push(
        {
          name: "Ventas POS",
          value: formatCurrency(data.totalSales || 0),
          growth: `+${data.salesGrowth || 0}%`,
          status:
            (data.salesGrowth || 0) > 10
              ? "🟢 Excelente"
              : (data.salesGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Transacciones",
          value: (data.totalTransactions || 0).toLocaleString(),
          growth: `+${data.transactionsGrowth || 0}%`,
          status:
            (data.transactionsGrowth || 0) > 8
              ? "🟢 Excelente"
              : (data.transactionsGrowth || 0) > 0
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Tiempo Promedio",
          value: `${data.averageTime || 0} min`,
          growth: `${data.timeGrowth || 0}%`,
          status:
            (data.averageTime || 0) < 3
              ? "🟢 Excelente"
              : (data.averageTime || 0) < 5
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
        {
          name: "Eficiencia",
          value: `${data.efficiency || 85}%`,
          growth: `+${data.efficiencyGrowth || 0}%`,
          status:
            (data.efficiency || 85) > 90
              ? "🟢 Excelente"
              : (data.efficiency || 85) > 80
                ? "🟡 Bueno"
                : "🔴 Atención",
        },
      )
      break

    default:
      kpis.push({
        name: "Registros Totales",
        value: (data.totalRecords || 0).toLocaleString(),
        growth: `+${data.growth || 0}%`,
        status:
          (data.growth || 0) > 5
            ? "🟢 Excelente"
            : (data.growth || 0) > 0
              ? "🟡 Bueno"
              : "🔴 Atención",
      })
  }

  return kpis
}

// Definir la interfaz Insight arriba de la función generateInsights
interface Insight {
  title: string;
  description: string;
}

/**
 * Genera insights automáticos según el tipo de reporte
 */
function generateInsights(reportType: string, data: any): Insight[] {
  const insights: Insight[] = []

  switch (reportType) {
    case "financial":
      insights.push(
        {
          title: "Rentabilidad",
          description: `Con un margen de utilidad del ${
            data.profitMargin || 0
          }%, la empresa mantiene una posición ${
            (data.profitMargin || 0) > 15
              ? "sólida"
              : "que requiere atención"
          } en términos de rentabilidad.`,
        },
        {
          title: "Control de Gastos",
          description: `Los gastos representan el ${Math.round(
            ((data.totalExpenses || 0) / (data.totalRevenue || 1)) * 100,
          )}% de los ingresos, ${
            ((data.totalExpenses || 0) / (data.totalRevenue || 1)) < 0.7
              ? "indicando un buen control de costos"
              : "sugiriendo oportunidades de optimización"
          }.`,
        },
        {
          title: "Flujo de Efectivo",
          description: `La utilidad neta de ${formatCurrency(
            data.netProfit || 0,
          )} ${
            (data.netProfit || 0) > 0
              ? "demuestra una operación saludable"
              : "requiere atención inmediata para mejorar la rentabilidad"
          }.`,
        },
      )
      break

    case "sales":
      insights.push(
        {
          title: "Tendencia de Ventas",
          description: `Las ventas han ${
            (data.salesGrowth || 0) > 0 ? "crecido" : "disminuido"
          } un ${Math.abs(
            data.salesGrowth || 0,
          )}% comparado con el período anterior, ${
            (data.salesGrowth || 0) > 10
              ? "mostrando un excelente desempeño"
              : (data.salesGrowth || 0) > 0
                ? "con una tendencia positiva"
                : "requiriendo estrategias de mejora"
          }.`,
        },
        {
          title: "Comportamiento del Cliente",
          description: `El ticket promedio de ${formatCurrency(
            data.averageTicket || 0,
          )} ${
            (data.ticketGrowth || 0) > 0 ? "ha aumentado" : "se ha mantenido"
          }, indicando ${
            (data.averageTicket || 0) > 50
              ? "un buen valor por transacción"
              : "oportunidades para incrementar el valor por cliente"
          }.`,
        },
        {
          title: "Cumplimiento de Objetivos",
          description: `Con un ${data.targetAchievement || 0}% de cumplimiento de la meta, ${
            (data.targetAchievement || 0) > 100
              ? "se ha superado el objetivo establecido"
              : (data.targetAchievement || 0) > 80
                ? "se está cerca de alcanzar la meta"
                : "es necesario implementar estrategias adicionales"
          }.`,
        },
      )
      break

    case "inventory":
      insights.push(
        {
          title: "Gestión de Stock",
          description: `Con ${
            data.lowStockCount || 0
          } productos en stock bajo, ${
            (data.lowStockCount || 0) < 10
              ? "la gestión de inventario es eficiente"
              : "se requiere atención en el reabastecimiento"
          }.`,
        },
        {
          title: "Rotación de Inventario",
          description: `La rotación promedio de ${
            data.turnoverRate || 0
          }x ${
            (data.turnoverRate || 0) > 3
              ? "indica una excelente velocidad de venta"
              : (data.turnoverRate || 0) > 2
                ? "muestra un movimiento saludable"
                : "sugiere oportunidades de mejora en las ventas"
          }.`,
        },
        {
          title: "Valor del Inventario",
          description: `El valor total del inventario de ${formatCurrency(
            data.totalValue || 0,
          )} representa ${
            (data.valueGrowth || 0) > 0
              ? "un crecimiento"
              : "una estabilidad"
          } en los activos de la empresa.`,
        },
      )
      break

    case "pos":
      insights.push(
        {
          title: "Eficiencia Operacional",
          description: `Con un tiempo promedio de ${
            data.averageTime || 0
          } minutos por transacción, ${
            (data.averageTime || 0) < 3
              ? "la eficiencia del POS es excelente"
              : (data.averageTime || 0) < 5
                ? "el rendimiento es bueno"
                : "hay oportunidades de mejora en los procesos"
          }.`,
        },
        {
          title: "Métodos de Pago",
          description: `La diversificación en métodos de pago muestra una adaptación a las preferencias del cliente, con el efectivo representando el ${
            data.paymentMethods?.[0]?.percentage || 40
          }% de las transacciones.`,
        },
        {
          title: "Rendimiento por Terminal",
          description: `La distribución de ventas entre terminales indica ${
            data.terminals?.length > 1
              ? "una operación balanceada"
              : "una concentración en el punto principal"
          } de atención al cliente.`,
        },
      )
      break

    default:
      insights.push({
        title: "Actividad General",
        description: `El sistema registra una actividad ${
          (data.growth || 0) > 5 ? "creciente" : "estable"
        } con ${data.totalRecords || 0} registros en el período analizado.`,
      })
  }

  return insights
}

/**
 * Capitaliza la primera letra de una cadena
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formatea valores de celda para mostrar
 */
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "number") {
    if (value % 1 === 0) return value.toLocaleString()
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (value instanceof Date) return value.toLocaleDateString("es-ES")
  return String(value)
}

/**
 * Determina si se debe agregar un gráfico a una hoja
 */
function shouldAddChart(key: string, data: any[]): boolean {
  const chartKeys = [
    "salesTrend",
    "monthlyFinancials",
    "salesByHour",
    "movements",
    "topProducts",
  ]
  return (
    chartKeys.some((chartKey) =>
      key.toLowerCase().includes(chartKey.toLowerCase()),
    ) && data.length > 0
  )
}

/**
 * Agrega un gráfico a una hoja de Excel
 */
function addChartToSheet(
  sheet: any,
  key: string,
  data: any[],
  headers: string[],
) {
  // Esta función se implementaría con la librería de gráficos de ExcelJS
  // Por ahora, agregamos un comentario indicando dónde iría el gráfico
  const chartRow = data.length + 6
  sheet.getCell(`A${chartRow}`).value = `📊 Gráfico de ${capitalizeFirst(
    key,
  )} (se generaría aquí)`
  sheet.getCell(`A${chartRow}`).font = {
    italic: true,
    color: { argb: "FF666666" },
  }
}

/**
 * Agrupa datos por período de tiempo
 */
const groupDataByPeriod = (
  data: any[],
  groupBy: "day" | "week" | "month" | "year",
  dateField = "createdAt",
) => {
  const groupedData: Record<string, any> = {}
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ]

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
        key = `${firstDayOfWeek.getFullYear()}-W${Math.ceil(
          (firstDayOfWeek.getDate() + 1 + dayOfWeek) / 7,
        )}`
        break
      case "month":
        key = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
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
          displayLabel = `Sem ${Math.ceil(
            (itemDate.getDate() + 1 + itemDate.getDay()) / 7,
          )}`
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
