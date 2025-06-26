import { db } from '../db';

// Servicio para obtener datos financieros para reportes
export const FinancialReportService = {
    // Obtener estadísticas financieras generales
    async getFinancialStats(agencyId: string) {
        try {
            // Obtener todas las facturas para calcular ingresos
            const invoices = await db.invoice.findMany({
                where: { agencyId }
            });

            // Calcular ingresos totales usando el campo total
            const totalRevenue = invoices.reduce((sum, invoice) => {
                return sum + (Number(invoice.total) || 0);
            }, 0);

            // Por ahora, establecer gastos en 0 ya que no tenemos tabla de gastos
            const totalExpenses = 0;

            // Calcular beneficio neto
            const netProfit = totalRevenue - totalExpenses;

            // Calcular margen de beneficio
            const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

            // Obtener datos financieros mensuales
            const monthlyFinancials: Array<{month: string, revenue: number, expenses: number}> = [];
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            // Año actual
            const currentYear = new Date().getFullYear();

            // Inicializar array con datos mensuales
            for (let i = 0; i < 12; i++) {
                monthlyFinancials.push({
                    month: months[i],
                    revenue: 0,
                    expenses: 0
                });
            }

            // Calcular ingresos mensuales
            invoices.forEach((invoice) => {
                if (invoice.createdAt) {
                    const invoiceDate = new Date(invoice.createdAt);
                    if (invoiceDate.getFullYear() === currentYear) {
                        const month = invoiceDate.getMonth();
                        const invoiceTotal = Number(invoice.total) || 0;
                        monthlyFinancials[month].revenue += invoiceTotal;
                    }
                }
            });

            // Por ahora, categorías de gastos vacías
            const expenseCategoriesArray: any[] = [];

            // Obtener facturas recientes
            const recentInvoices = await db.invoice.findMany({
                where: { agencyId },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            // Formatear facturas recientes como transacciones
            const formattedTransactions = recentInvoices.map((invoice) => {
                return {
                    id: invoice.id,
                    description: `Factura ${invoice.invoiceNumber || 'N/A'}`,
                    type: 'ingreso',
                    amount: Number(invoice.total) || 0,
                    date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : 'Fecha desconocida'
                };
            });

            return {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin: parseFloat(profitMargin.toFixed(1)),
                monthlyFinancials,
                expenseCategories: expenseCategoriesArray,
                recentTransactions: formattedTransactions
            };
        } catch (error) {
            console.error('Error al obtener estadísticas financieras:', error);
            throw error;
        }
    },

    // Obtener datos de flujo de caja
    async getCashFlow(agencyId: string, period: number = 12) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - period);

            // Obtener todas las facturas en el período
            const invoices = await db.invoice.findMany({
                where: { 
                    agencyId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: { createdAt: 'asc' }
            });

            // Agrupar por mes
            const cashFlowByMonth: any = {};
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            invoices.forEach((invoice) => {
                if (invoice.createdAt) {
                    const date = new Date(invoice.createdAt);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    const monthName = months[date.getMonth()];

                    if (!cashFlowByMonth[monthKey]) {
                        cashFlowByMonth[monthKey] = {
                            month: monthName,
                            inflow: 0,
                            outflow: 0,
                            balance: 0
                        };
                    }

                    const invoiceTotal = Number(invoice.total) || 0;
                    
                    cashFlowByMonth[monthKey].inflow += invoiceTotal;
                    cashFlowByMonth[monthKey].balance = 
                        cashFlowByMonth[monthKey].inflow - cashFlowByMonth[monthKey].outflow;
                }
            });

            // Convertir a array y ordenar por fecha
            return Object.values(cashFlowByMonth).sort((a: any, b: any) => {
                const monthA = months.indexOf(a.month);
                const monthB = months.indexOf(b.month);
                return monthA - monthB;
            });
        } catch (error) {
            console.error('Error al obtener datos de flujo de caja:', error);
            throw error;
        }
    }
};