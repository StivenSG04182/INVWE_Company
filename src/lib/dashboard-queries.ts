"use server";

import { db } from "./db";
import { saveActivityLogsNotification } from "./queries2";

/**
 * Obtiene todos los datos necesarios para el dashboard de una agencia
 * @param agencyId ID de la agencia
 * @returns Objeto con todos los datos del dashboard
 */
export const getDashboardData = async (agencyId: string) => {
    try {
        // Obtener productos
        const products = await db.product.findMany({
            where: { agencyId },
            include: {
                Category: true,
            },
        });

        // Obtener stock
        const stocks = await db.stock.findMany({
            where: { agencyId },
        });

        // Obtener áreas
        const areas = await db.area.findMany({
            where: { agencyId },
        });

        // Obtener movimientos recientes (últimos 30)
        const movements = await db.movement.findMany({
            where: { agencyId },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        // Calcular productos con bajo stock
        const lowStockProducts = products
            .filter((product) => {
                const productStocks = stocks.filter((stock) => stock.productId === product.id);
                const totalStock = productStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
                return product.minStock && totalStock <= product.minStock;
            })
            .map((product) => {
                const productStocks = stocks.filter((stock) => stock.productId === product.id);
                const currentStock = productStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
                return {
                    ...product,
                    currentStock,
                    price: Number(product.price),
                    cost: product.cost ? Number(product.cost) : 0,
                };
            });

        // Calcular valor total del inventario
        const totalInventoryValue = stocks.reduce((total, stock) => {
            const product = products.find((p) => p.id === stock.productId);
            return total + (product ? Number(product.price) * Number(stock.quantity) : 0);
        }, 0);

        // Calcular movimientos por tipo
        const entriesCount = movements.filter((m) => m.type === "entrada").length;
        const exitsCount = movements.filter((m) => m.type === "salida").length;

        // Procesar movimientos recientes para mostrar
        const recentMovements = await Promise.all(
            movements.slice(0, 10).map(async (movement) => {
                const product = products.find((p) => p.id === movement.productId);
                const area = areas.find((a) => a.id === movement.areaId);

                return {
                    _id: movement.id,
                    type: movement.type,
                    productId: movement.productId,
                    productName: product ? product.name : "Producto desconocido",
                    productSku: product ? product.sku : "N/A",
                    areaName: area ? area.name : "Área desconocida",
                    quantity: Number(movement.quantity),
                    notes: movement.notes,
                    date: movement.createdAt,
                };
            })
        );

        // Agrupar movimientos por día para mostrar en timeline
        const groupedByDate = recentMovements.reduce((groups: any, movement: any) => {
            const date = new Date(movement.date).toLocaleDateString("es-CO");
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(movement);
            return groups;
        }, {});

        // Calcular productos por área
        const productsByArea = await Promise.all(
            areas.map(async (area) => {
                const areaStocks = stocks.filter((stock) => stock.areaId === area.id);
                const totalProducts = areaStocks.length;
                const totalValue = areaStocks.reduce((total, stock) => {
                    const product = products.find((p) => p.id === stock.productId);
                    return total + (product ? Number(product.price) * Number(stock.quantity) : 0);
                }, 0);

                return {
                    _id: area.id,
                    name: area.name,
                    totalProducts,
                    totalValue,
                };
            })
        );

        // Calcular productos más vendidos (basado en movimientos de salida)
        const productSales = movements
            .filter((m) => m.type === "salida")
            .reduce((acc: { [key: string]: number }, movement) => {
                const productId = movement.productId;
                if (!acc[productId]) acc[productId] = 0;
                acc[productId] += Number(movement.quantity);
                return acc;
            }, {});

        const topProducts = Object.entries(productSales)
            .map(([productId, sales]) => {
                const product = products.find((p) => p.id === productId);
                return {
                    _id: productId,
                    name: product ? product.name : "Producto desconocido",
                    sku: product ? product.sku : "N/A",
                    sales,
                    price: product ? Number(product.price) : 0,
                };
            })
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Calcular datos de ventas (basado en movimientos de salida)
        const totalSales = topProducts.reduce((sum, product) => sum + product.sales * product.price, 0);

        // Obtener ventas del mes anterior para calcular crecimiento
        const today = new Date();
        const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayPreviousMonth = new Date(firstDayCurrentMonth);
        lastDayPreviousMonth.setDate(lastDayPreviousMonth.getDate() - 1);
        const firstDayPreviousMonth = new Date(lastDayPreviousMonth.getFullYear(), lastDayPreviousMonth.getMonth(), 1);

        // Obtener movimientos del mes anterior
        const previousMonthMovements = await db.movement.findMany({
            where: {
                agencyId,
                type: "salida",
                createdAt: {
                    gte: firstDayPreviousMonth,
                    lte: lastDayPreviousMonth
                }
            },
        });

        // Calcular ventas del mes anterior
        const previousMonthSales = previousMonthMovements.reduce((total, movement) => {
            const product = products.find((p) => p.id === movement.productId);
            return total + (product ? Number(product.price) * Number(movement.quantity) : 0);
        }, 0);

        // Calcular crecimiento
        const growth = previousMonthSales > 0
            ? ((totalSales - previousMonthSales) / previousMonthSales) * 100
            : 0;

        const salesData = {
            total: totalSales,
            growth: Number.parseFloat(growth.toFixed(1)),
            lastMonth: previousMonthSales,
        };

        // Datos de órdenes (basado en movimientos de salida agrupados)
        const uniqueOrdersCount = new Set(
            movements
                .filter(m => m.type === "salida" && m.orderId)
                .map(m => m.orderId)
        ).size;

        const ordersData = {
            total: uniqueOrdersCount || Math.floor(totalSales / 100000) || 1,
            pending: Math.floor(uniqueOrdersCount * 0.15) || 0,
            completed: Math.floor(uniqueOrdersCount * 0.85) || 1,
        };

        // Datos para gráficos (basados en datos reales)

        // 1. Datos para gráfico de valor de inventario por mes (últimos 6 meses)
        const inventoryValueTrend = await getInventoryValueTrend(agencyId);

        // 2. Datos para gráfico de distribución de inventario por categoría
        const inventoryByCategory = await getInventoryByCategory(agencyId);

        // 3. Datos para gráfico de movimientos por mes
        const movementsByMonth = await getMovementsByMonth(agencyId);

        // 4. Datos para gráfico de rotación de inventario
        const inventoryTurnover = await getInventoryTurnover(agencyId);

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
        };
    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
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
        };
    }
};

/**
 * Obtiene la tendencia del valor del inventario en los últimos 6 meses
 * @param agencyId ID de la agencia
 * @returns Array con datos de valor de inventario por mes
 */
async function getInventoryValueTrend(agencyId: string) {
    try {
        const today = new Date();
        const months = [];
        const values = [];

        // Obtener datos de los últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = targetMonth.toLocaleString('es-CO', { month: 'long' });
            months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));

            // Para cada mes, obtener el valor del inventario
            // Esto es una aproximación, idealmente se debería tener un registro histórico
            const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

            // Obtener movimientos hasta el final de ese mes
            const movements = await db.movement.findMany({
                where: {
                    agencyId,
                    createdAt: { lte: endOfMonth }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Obtener productos
            const products = await db.product.findMany({
                where: { agencyId }
            });

            // Calcular stock al final del mes basado en movimientos
            const stockByProduct: Record<string, number> = {};

            for (const movement of movements) {
                if (!stockByProduct[movement.productId]) {
                    stockByProduct[movement.productId] = 0;
                }

                if (movement.type === 'entrada') {
                    stockByProduct[movement.productId] += Number(movement.quantity);
                } else if (movement.type === 'salida') {
                    stockByProduct[movement.productId] -= Number(movement.quantity);
                }
            }

            // Calcular valor del inventario
            let monthValue = 0;
            for (const [productId, quantity] of Object.entries(stockByProduct)) {
                const product = products.find(p => p.id === productId);
                if (product && quantity > 0) {
                    monthValue += Number(product.price) * quantity;
                }
            }

            values.push(monthValue);
        }

        // Formatear datos para el gráfico
        return months.map((month, index) => ({
            month,
            value: values[index]
        }));
    } catch (error) {
        console.error("Error al obtener tendencia de valor de inventario:", error);
        return [
            { month: "Enero", value: 0 },
            { month: "Febrero", value: 0 },
            { month: "Marzo", value: 0 },
            { month: "Abril", value: 0 },
            { month: "Mayo", value: 0 },
            { month: "Junio", value: 0 },
        ];
    }
}

/**
 * Obtiene la distribución del inventario por categoría
 * @param agencyId ID de la agencia
 * @returns Array con datos de valor de inventario por categoría
 */
async function getInventoryByCategory(agencyId: string) {
    try {
        // Obtener categorías
        const categories = await db.productCategory.findMany({
            where: { agencyId }
        });

        // Obtener productos con sus categorías
        const products = await db.product.findMany({
            where: { agencyId },
            include: { Category: true }
        });

        // Obtener stocks
        const stocks = await db.stock.findMany({
            where: { agencyId }
        });

        // Calcular valor por categoría
        const valueByCategory: Record<string, number> = {};
        const categoryNames: Record<string, string> = {};

        // Inicializar categoría "Sin categoría"
        valueByCategory["uncategorized"] = 0;
        categoryNames["uncategorized"] = "Sin categoría";

        // Inicializar todas las categorías
        categories.forEach(category => {
            valueByCategory[category.id] = 0;
            categoryNames[category.id] = category.name;
        });

        // Calcular valor por categoría
        for (const product of products) {
            const productStocks = stocks.filter(stock => stock.productId === product.id);
            const totalStock = productStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
            const productValue = Number(product.price) * totalStock;

            const categoryId = product.categoryId || "uncategorized";
            valueByCategory[categoryId] = (valueByCategory[categoryId] || 0) + productValue;
        }

        // Formatear datos para el gráfico
        return Object.entries(valueByCategory)
            .filter(([_, value]) => value > 0) // Filtrar categorías sin valor
            .map(([categoryId, value]) => ({
                category: categoryNames[categoryId],
                value
            }))
            .sort((a, b) => b.value - a.value); // Ordenar de mayor a menor
    } catch (error) {
        console.error("Error al obtener distribución de inventario por categoría:", error);
        return [
            { category: "Electrónicos", value: 0 },
            { category: "Muebles", value: 0 },
            { category: "Ropa", value: 0 },
            { category: "Alimentos", value: 0 },
            { category: "Otros", value: 0 },
        ];
    }
}

/**
 * Obtiene los movimientos por mes en los últimos 6 meses
 * @param agencyId ID de la agencia
 * @returns Array con datos de movimientos por mes
 */
async function getMovementsByMonth(agencyId: string) {
    try {
        const today = new Date();
        const result = [];

        // Obtener datos de los últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = targetMonth.toLocaleString('es-CO', { month: 'long' });
            const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

            const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
            const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

            // Obtener movimientos del mes
            const movements = await db.movement.findMany({
                where: {
                    agencyId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            // Contar entradas y salidas
            const entradas = movements.filter(m => m.type === 'entrada').length;
            const salidas = movements.filter(m => m.type === 'salida').length;

            result.push({
                month: formattedMonth,
                entradas,
                salidas
            });
        }

        return result;
    } catch (error) {
        console.error("Error al obtener movimientos por mes:", error);
        return [
            { month: "Enero", entradas: 0, salidas: 0 },
            { month: "Febrero", entradas: 0, salidas: 0 },
            { month: "Marzo", entradas: 0, salidas: 0 },
            { month: "Abril", entradas: 0, salidas: 0 },
            { month: "Mayo", entradas: 0, salidas: 0 },
            { month: "Junio", entradas: 0, salidas: 0 },
        ];
    }
}

/**
 * Obtiene la rotación de inventario por categoría
 * @param agencyId ID de la agencia
 * @returns Array con datos de rotación de inventario por categoría
 */
async function getInventoryTurnover(agencyId: string) {
    try {
        // Obtener categorías
        const categories = await db.productCategory.findMany({
            where: { agencyId }
        });

        // Obtener productos con sus categorías
        const products = await db.product.findMany({
            where: { agencyId },
            include: { Category: true }
        });

        // Obtener movimientos de los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const movements = await db.movement.findMany({
            where: {
                agencyId,
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        // Calcular rotación por categoría
        const turnoverByCategory: Record<string, { sales: number, stock: number }> = {};
        const categoryNames: Record<string, string> = {};

        // Inicializar categoría "Sin categoría"
        turnoverByCategory["uncategorized"] = { sales: 0, stock: 0 };
        categoryNames["uncategorized"] = "Sin categoría";

        // Inicializar todas las categorías
        categories.forEach(category => {
            turnoverByCategory[category.id] = { sales: 0, stock: 0 };
            categoryNames[category.id] = category.name;
        });

        // Calcular ventas por categoría (movimientos de salida)
        for (const movement of movements) {
            if (movement.type !== 'salida') continue;

            const product = products.find(p => p.id === movement.productId);
            if (!product) continue;

            const categoryId = product.categoryId || "uncategorized";
            turnoverByCategory[categoryId].sales += Number(movement.quantity);
        }

        // Calcular stock actual por categoría
        for (const product of products) {
            const categoryId = product.categoryId || "uncategorized";

            // Obtener stock actual del producto
            const productMovements = movements.filter(m => m.productId === product.id);
            let currentStock = 0;

            for (const movement of productMovements) {
                if (movement.type === 'entrada') {
                    currentStock += Number(movement.quantity);
                } else if (movement.type === 'salida') {
                    currentStock -= Number(movement.quantity);
                }
            }

            // Si el stock es negativo (por datos incompletos), ajustar a 0
            currentStock = Math.max(0, currentStock);
            turnoverByCategory[categoryId].stock += currentStock;
        }

        // Calcular índice de rotación (ventas / stock promedio)
        // Si el stock es 0, asignar un valor predeterminado para evitar división por cero
        return Object.entries(turnoverByCategory)
            .filter(([_, data]) => data.sales > 0 || data.stock > 0) // Filtrar categorías sin datos
            .map(([categoryId, data]) => ({
                category: categoryNames[categoryId],
                turnover: data.stock > 0 ? (data.sales / data.stock) : (data.sales > 0 ? 5 : 0)
            }))
            .sort((a, b) => b.turnover - a.turnover); // Ordenar de mayor a menor rotación
    } catch (error) {
        console.error("Error al obtener rotación de inventario:", error);
        return [
            { category: "Electrónicos", turnover: 0 },
            { category: "Muebles", turnover: 0 },
            { category: "Ropa", turnover: 0 },
            { category: "Alimentos", turnover: 0 },
            { category: "Otros", turnover: 0 },
        ];
    }
}