"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { Agency, Report, ReportFormat, ReportType, SubAccount } from "@prisma/client";
import { revalidatePath } from 'next/cache';

/**
 * Obtiene todos los reportes de una agencia
 */
export const getAgencyReports = async (agencyId: string) => {
    return await db.report.findMany({
        where: {
            agencyId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Obtiene todos los reportes de una subcuenta
 */
export const getSubAccountReports = async (subAccountId: string) => {
    return await db.report.findMany({
        where: {
            subAccountId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Obtiene un reporte específico por su ID
 */
export const getReportById = async (reportId: string) => {
    return await db.report.findUnique({
        where: {
            id: reportId,
        },
    });
};

/**
 * Crea un nuevo reporte
 */
export const createReport = async ({
    name,
    description,
    type,
    format,
    content,
    agencyId,
    subAccountId,
}: {
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    content: any;
    agencyId: string;
    subAccountId?: string;
}) => {
    const authUser = await currentUser();
    if (!authUser) throw new Error("No autorizado");

    const report = await db.report.create({
        data: {
            name,
            description,
            type,
            format,
            content,
            Agency: {
                connect: {
                    id: agencyId,
                },
            },
            ...(subAccountId && {
                SubAccount: {
                    connect: {
                        id: subAccountId,
                    },
                },
            }),
        },
    });

    // Registrar actividad
    await saveReportActivityLog({
        agencyId,
        subAccountId,
        description: `Reporte creado: ${name}`,
    });

    revalidatePath(`/agency/${agencyId}/reports`);
    if (subAccountId) revalidatePath(`/subaccount/${subAccountId}/reports`);

    return report;
};

/**
 * Actualiza un reporte existente
 */
export const updateReport = async ({
    id,
    name,
    description,
    type,
    format,
    content,
    agencyId,
    subAccountId,
}: {
    id: string;
    name?: string;
    description?: string;
    type?: ReportType;
    format?: ReportFormat;
    content?: any;
    agencyId: string;
    subAccountId?: string;
}) => {
    const authUser = await currentUser();
    if (!authUser) throw new Error("No autorizado");

    const report = await db.report.update({
        where: {
            id,
        },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(type && { type }),
            ...(format && { format }),
            ...(content && { content }),
        },
    });

    // Registrar actividad
    await saveReportActivityLog({
        agencyId,
        subAccountId,
        description: `Reporte actualizado: ${report.name}`,
    });

    revalidatePath(`/agency/${agencyId}/reports`);
    if (subAccountId) revalidatePath(`/subaccount/${subAccountId}/reports`);

    return report;
};

/**
 * Elimina un reporte
 */
export const deleteReport = async ({
    id,
    agencyId,
    subAccountId,
}: {
    id: string;
    agencyId: string;
    subAccountId?: string;
}) => {
    const authUser = await currentUser();
    if (!authUser) throw new Error("No autorizado");

    const report = await db.report.findUnique({
        where: {
            id,
        },
    });

    if (!report) throw new Error("Reporte no encontrado");

    await db.report.delete({
        where: {
            id,
        },
    });

    // Registrar actividad
    await saveReportActivityLog({
        agencyId,
        subAccountId,
        description: `Reporte eliminado: ${report.name}`,
    });

    revalidatePath(`/agency/${agencyId}/reports`);
    if (subAccountId) revalidatePath(`/subaccount/${subAccountId}/reports`);

    return report;
};

/**
 * Obtiene reportes de ventas para una agencia o subcuenta
 */
export const getSalesReports = async ({
    agencyId,
    subAccountId,
    dateRange,
    startDate,
    endDate,
}: {
    agencyId: string;
    subAccountId?: string;
    dateRange: "day" | "week" | "month" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
}) => {
    // Determinar fechas basadas en el rango
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
        case "day":
            start.setHours(0, 0, 0, 0);
            break;
        case "week":
            start.setDate(start.getDate() - start.getDay());
            start.setHours(0, 0, 0, 0);
            break;
        case "month":
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            break;
        case "year":
            start = new Date(start.getFullYear(), 0, 1);
            break;
        case "custom":
            if (startDate) start = startDate;
            if (endDate) end = endDate;
            break;
    }

    // Consultar ventas en el rango de fechas
    const sales = await db.sale.findMany({
        where: {
            agencyId,
            ...(subAccountId && { subAccountId }),
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        include: {
            products: true,
        },
    });

    // Procesar datos para el reporte
    const reportData = processReportData(sales, dateRange, start, end);

    return reportData;
};

/**
 * Obtiene reportes de inventario para una agencia o subcuenta
 */
export const getInventoryReports = async ({
    agencyId,
    subAccountId,
    areaId,
    categoryId,
    includeMovements = false,
}: {
    agencyId: string;
    subAccountId?: string;
    areaId?: string;
    categoryId?: string;
    includeMovements?: boolean;
}) => {
    // Consultar productos con su inventario
    const products = await db.product.findMany({
        where: {
            agencyId,
            ...(subAccountId && { subAccountId }),
            ...(areaId && { areaId }),
            ...(categoryId && { categoryId }),
        },
        include: {
            category: true,
            provider: true,
            area: true,
        },
    });

    // Obtener movimientos de inventario si se solicitan
    let movements = [];
    if (includeMovements) {
        movements = await db.movement.findMany({
            where: {
                agencyId,
                ...(subAccountId && { subAccountId }),
                type: "INVENTORY",
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 100, // Limitar a los últimos 100 movimientos
        });
    }

    // Procesar datos para el reporte
    const reportData = products.map((product) => {
        const isLowStock = product.stock <= product.minStock;
        const isHighStock = product.stock >= product.maxStock;

        return {
            id: product.id,
            productName: product.name,
            sku: product.sku || "",
            categoryId: product.categoryId,
            categoryName: product.category?.name || "Sin categoría",
            providerName: product.provider?.name || "Sin proveedor",
            areaName: product.area?.name || "Sin área",
            stock: product.stock,
            minStock: product.minStock,
            maxStock: product.maxStock,
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            profit: Number(product.salePrice) - Number(product.costPrice),
            profitMargin: Number(product.costPrice) > 0
                ? Math.round(((Number(product.salePrice) - Number(product.costPrice)) / Number(product.salePrice)) * 100)
                : 0,
            totalCost: Number(product.costPrice) * product.stock,
            totalValue: Number(product.salePrice) * product.stock,
            status: isLowStock ? "Bajo" : isHighStock ? "Alto" : "Normal",
            isLowStock,
            isHighStock,
            lastUpdated: product.updatedAt,
        };
    });

    // Obtener categorías únicas para filtrado
    const categories = [...new Set(reportData.map(item => item.categoryName))]
        .filter(Boolean)
        .sort()
        .map(name => ({
            name,
            count: reportData.filter(item => item.categoryName === name).length
        }));

    // Calcular estadísticas generales
    const stats = {
        totalProducts: reportData.length,
        totalValue: reportData.reduce((sum, item) => sum + item.totalValue, 0),
        totalCost: reportData.reduce((sum, item) => sum + item.totalCost, 0),
        lowStockCount: reportData.filter(item => item.isLowStock).length,
        highStockCount: reportData.filter(item => item.isHighStock).length,
        categories,
    };

    return {
        products: reportData,
        stats,
        movements: includeMovements ? movements : undefined,
    };
};

/**
 * Obtiene reportes financieros para una agencia o subcuenta
 */
export const getFinancialReports = async ({
    agencyId,
    subAccountId,
    dateRange,
    startDate,
    endDate,
}: {
    agencyId: string;
    subAccountId?: string;
    dateRange: "day" | "week" | "month" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
}) => {
    // Determinar fechas basadas en el rango
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
        case "day":
            start.setHours(0, 0, 0, 0);
            break;
        case "week":
            start.setDate(start.getDate() - start.getDay());
            start.setHours(0, 0, 0, 0);
            break;
        case "month":
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            break;
        case "year":
            start = new Date(start.getFullYear(), 0, 1);
            break;
        case "custom":
            if (startDate) start = startDate;
            if (endDate) end = endDate;
            break;
    }

    // Consultar ventas y movimientos en el rango de fechas
    const [sales, movements] = await Promise.all([
        db.sale.findMany({
            where: {
                agencyId,
                ...(subAccountId && { subAccountId }),
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                products: true,
            },
        }),
        db.movement.findMany({
            where: {
                agencyId,
                ...(subAccountId && { subAccountId }),
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
        }),
    ]);

    // Calcular ingresos, gastos y balance
    const income = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const expenses = movements
        .filter((movement) => movement.type === "EXPENSE")
        .reduce((sum, movement) => sum + Number(movement.amount), 0);
    const balance = income - expenses;

    // Procesar datos para el reporte
    const reportData = {
        income,
        expenses,
        balance,
        salesCount: sales.length,
        expensesCount: movements.filter((movement) => movement.type === "EXPENSE").length,
        salesByDay: groupSalesByDate(sales, "day"),
        expensesByDay: groupExpensesByDate(movements, "day"),
        salesByCategory: groupSalesByCategory(sales),
    };

    return reportData;
};

/**
 * Obtiene reportes de rendimiento para una agencia o subcuenta
 */
export const getPerformanceReports = async ({
    agencyId,
    subAccountId,
    dateRange,
    startDate,
    endDate,
}: {
    agencyId: string;
    subAccountId?: string;
    dateRange: "day" | "week" | "month" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
}) => {
    // Implementación similar a los otros reportes
    // Aquí se pueden incluir métricas de rendimiento como
    // ventas por empleado, tiempo promedio de atención, etc.
    return [];
};

/**
 * Guarda un registro de actividad relacionado con reportes
 */
export const saveReportActivityLog = async ({
    agencyId,
    description,
    subAccountId,
}: {
    agencyId?: string;
    description: string;
    subAccountId?: string;
}) => {
    const authUser = await currentUser();
    if (!authUser) return;

    const userData = await db.user.findUnique({
        where: { email: authUser.emailAddresses[0].emailAddress },
    });

    if (!userData) return;

    let foundAgencyId = agencyId;
    if (!foundAgencyId && subAccountId) {
        const subAccount = await db.subAccount.findUnique({
            where: { id: subAccountId },
        });
        if (subAccount) foundAgencyId = subAccount.agencyId;
    }

    if (!foundAgencyId) return;

    if (subAccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
                SubAccount: {
                    connect: { id: subAccountId },
                },
            },
        });
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
            },
        });
    }
};

// Funciones auxiliares para procesar datos de reportes

const processReportData = (sales: any[], dateRange: string, startDate: Date, endDate: Date) => {
    // Procesar datos según el tipo de reporte
    const dailyData: Record<string, any> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Inicializar datos diarios en el rango de fechas
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyData[dateKey] = {
            date: dateKey,
            displayDate: `${currentDate.getDate()} ${months[currentDate.getMonth()]}`,
            totalSales: 0,
            totalRevenue: 0,
            itemsSold: 0,
            transactions: 0
        };
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Procesar ventas
    sales.forEach(sale => {
        const saleDate = new Date(sale.createdAt);
        const dateKey = saleDate.toISOString().split('T')[0];

        if (dailyData[dateKey]) {
            dailyData[dateKey].totalSales += 1;
            dailyData[dateKey].totalRevenue += Number(sale.total);
            dailyData[dateKey].transactions += 1;

            // Contar productos vendidos
            if (sale.products && Array.isArray(sale.products)) {
                dailyData[dateKey].itemsSold += sale.products.reduce((sum: number, product: any) => {
                    return sum + (product.quantity || 1);
                }, 0);
            }
        }
    });

    // Convertir a array y ordenar por fecha
    return Object.values(dailyData).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
};

const groupSalesByDate = (sales: any[], groupBy: "day" | "week" | "month" | "year") => {
    const groupedData: Record<string, any> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    sales.forEach(sale => {
        const saleDate = new Date(sale.createdAt);
        let key = '';

        switch (groupBy) {
            case 'day':
                key = saleDate.toISOString().split('T')[0];
                break;
            case 'week':
                // Obtener el primer día de la semana (domingo)
                const firstDayOfWeek = new Date(saleDate);
                const dayOfWeek = saleDate.getDay();
                firstDayOfWeek.setDate(saleDate.getDate() - dayOfWeek);
                key = `${firstDayOfWeek.getFullYear()}-W${Math.ceil((firstDayOfWeek.getDate() + 1 + dayOfWeek) / 7)}`;
                break;
            case 'month':
                key = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
                break;
            case 'year':
                key = saleDate.getFullYear().toString();
                break;
        }

        if (!groupedData[key]) {
            let displayLabel = '';

            switch (groupBy) {
                case 'day':
                    displayLabel = `${saleDate.getDate()} ${months[saleDate.getMonth()]}`;
                    break;
                case 'week':
                    displayLabel = `Sem ${Math.ceil((saleDate.getDate() + 1 + saleDate.getDay()) / 7)}`;
                    break;
                case 'month':
                    displayLabel = months[saleDate.getMonth()];
                    break;
                case 'year':
                    displayLabel = saleDate.getFullYear().toString();
                    break;
            }

            groupedData[key] = {
                period: key,
                displayLabel,
                totalSales: 0,
                totalRevenue: 0,
                itemsSold: 0,
                transactions: 0
            };
        }

        groupedData[key].totalSales += 1;
        groupedData[key].totalRevenue += Number(sale.total);
        groupedData[key].transactions += 1;

        // Contar productos vendidos
        if (sale.products && Array.isArray(sale.products)) {
            groupedData[key].itemsSold += sale.products.reduce((sum: number, product: any) => {
                return sum + (product.quantity || 1);
            }, 0);
        }
    });

    // Convertir a array y ordenar
    return Object.values(groupedData).sort((a, b) => {
        return a.period.localeCompare(b.period);
    });
};

const groupExpensesByDate = (movements: any[], groupBy: "day" | "week" | "month" | "year") => {
    const groupedData: Record<string, any> = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Filtrar solo gastos
    const expenses = movements.filter(movement => movement.type === "EXPENSE");

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.createdAt);
        let key = '';

        switch (groupBy) {
            case 'day':
                key = expenseDate.toISOString().split('T')[0];
                break;
            case 'week':
                // Obtener el primer día de la semana (domingo)
                const firstDayOfWeek = new Date(expenseDate);
                const dayOfWeek = expenseDate.getDay();
                firstDayOfWeek.setDate(expenseDate.getDate() - dayOfWeek);
                key = `${firstDayOfWeek.getFullYear()}-W${Math.ceil((firstDayOfWeek.getDate() + 1 + dayOfWeek) / 7)}`;
                break;
            case 'month':
                key = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}`;
                break;
            case 'year':
                key = expenseDate.getFullYear().toString();
                break;
        }

        if (!groupedData[key]) {
            let displayLabel = '';

            switch (groupBy) {
                case 'day':
                    displayLabel = `${expenseDate.getDate()} ${months[expenseDate.getMonth()]}`;
                    break;
                case 'week':
                    displayLabel = `Sem ${Math.ceil((expenseDate.getDate() + 1 + expenseDate.getDay()) / 7)}`;
                    break;
                case 'month':
                    displayLabel = months[expenseDate.getMonth()];
                    break;
                case 'year':
                    displayLabel = expenseDate.getFullYear().toString();
                    break;
            }

            groupedData[key] = {
                period: key,
                displayLabel,
                totalExpenses: 0,
                transactions: 0
            };
        }

        groupedData[key].totalExpenses += Number(expense.amount);
        groupedData[key].transactions += 1;
    });

    // Convertir a array y ordenar
    return Object.values(groupedData).sort((a, b) => {
        return a.period.localeCompare(b.period);
    });
};

const groupSalesByCategory = (sales: any[]) => {
    const categoriesData: Record<string, any> = {};

    sales.forEach(sale => {
        if (sale.products && Array.isArray(sale.products)) {
            sale.products.forEach((product: any) => {
                const categoryName = product.category?.name || 'Sin categoría';

                if (!categoriesData[categoryName]) {
                    categoriesData[categoryName] = {
                        category: categoryName,
                        totalSales: 0,
                        totalRevenue: 0,
                        itemsSold: 0
                    };
                }

                categoriesData[categoryName].totalSales += 1;
                categoriesData[categoryName].totalRevenue += Number(product.price) * (product.quantity || 1);
                categoriesData[categoryName].itemsSold += (product.quantity || 1);
            });
        }
    });

    // Calcular porcentajes
    const totalRevenue = Object.values(categoriesData).reduce((sum: number, category: any) => {
        return sum + category.totalRevenue;
    }, 0);

    Object.values(categoriesData).forEach((category: any) => {
        category.percentage = totalRevenue > 0 ? Math.round((category.totalRevenue / totalRevenue) * 100) : 0;
    });

    // Convertir a array y ordenar por ingresos
    return Object.values(categoriesData).sort((a: any, b: any) => {
        return b.totalRevenue - a.totalRevenue;
    });
};