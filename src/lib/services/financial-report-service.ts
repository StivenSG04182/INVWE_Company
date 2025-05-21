import { connectToDatabase } from '../mongodb';
import { db } from '../db';
import { ObjectId } from 'mongodb';

// Servicio para obtener datos financieros para reportes
export const FinancialReportService = {
    // Obtener estadísticas financieras generales
    async getFinancialStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener todas las transacciones financieras
            const transactions = await db
                .collection('transactions')
                .find({ agencyId })
                .toArray();

            // Obtener ventas para calcular ingresos
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Obtener gastos
            const expenses = await db
                .collection('expenses')
                .find({ agencyId })
                .toArray();

            // Calcular ingresos totales
            const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);

            // Calcular gastos totales
            const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);

            // Calcular beneficio neto
            const netProfit = totalRevenue - totalExpenses;

            // Calcular margen de beneficio
            const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

            // Obtener datos financieros mensuales
            const monthlyFinancials = [];
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
            sales.forEach((sale: any) => {
                if (sale.date) {
                    const saleDate = new Date(sale.date);
                    if (saleDate.getFullYear() === currentYear) {
                        const month = saleDate.getMonth();
                        monthlyFinancials[month].revenue += sale.total || 0;
                    }
                }
            });

            // Calcular gastos mensuales
            expenses.forEach((expense: any) => {
                if (expense.date) {
                    const expenseDate = new Date(expense.date);
                    if (expenseDate.getFullYear() === currentYear) {
                        const month = expenseDate.getMonth();
                        monthlyFinancials[month].expenses += expense.amount || 0;
                    }
                }
            });

            // Calcular categorías de gastos
            const expenseCategories = expenses.reduce((acc: any, expense: any) => {
                const category = expense.category || 'Otros';
                if (!acc[category]) {
                    acc[category] = { amount: 0, percentage: 0 };
                }
                acc[category].amount += expense.amount || 0;
                return acc;
            }, {});

            // Calcular porcentajes de categorías de gastos
            Object.values(expenseCategories).forEach((category: any) => {
                category.percentage = totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0;
            });

            // Convertir a array y ordenar por monto
            const expenseCategoriesArray = Object.entries(expenseCategories).map(([name, data]: [string, any]) => {
                return {
                    name,
                    amount: data.amount,
                    percentage: data.percentage
                };
            }).sort((a, b) => b.amount - a.amount);

            // Obtener transacciones recientes
            const recentTransactions = await db
                .collection('transactions')
                .find({ agencyId })
                .sort({ date: -1 })
                .limit(5)
                .toArray();

            // Formatear transacciones recientes
            const formattedTransactions = recentTransactions.map((transaction: any) => {
                return {
                    id: transaction._id.toString(),
                    description: transaction.description || 'Transacción sin descripción',
                    type: transaction.type || 'desconocido',
                    amount: transaction.amount || 0,
                    date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : 'Fecha desconocida'
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
            const { db } = await connectToDatabase();
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - period);

            // Obtener todas las transacciones en el período
            const transactions = await db
                .collection('transactions')
                .find({
                    agencyId,
                    date: { $gte: startDate, $lte: endDate }
                })
                .sort({ date: 1 })
                .toArray();

            // Agrupar por mes
            const cashFlowByMonth = {};
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

            transactions.forEach((transaction: any) => {
                if (transaction.date) {
                    const date = new Date(transaction.date);
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

                    if (transaction.type === 'ingreso') {
                        cashFlowByMonth[monthKey].inflow += transaction.amount || 0;
                    } else if (transaction.type === 'gasto') {
                        cashFlowByMonth[monthKey].outflow += transaction.amount || 0;
                    }

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