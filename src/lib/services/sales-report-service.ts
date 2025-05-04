import { connectToDatabase } from '../mongodb';
import { db } from '../db';
import { ObjectId } from 'mongodb';

// Servicio para obtener datos de ventas para reportes
export const SalesReportService = {
    // Obtener estadísticas generales de ventas
    async getSalesStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener todas las ventas
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Calcular estadísticas
            const totalSales = sales.length;
            const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);

            // Calcular crecimiento respecto al mes anterior
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const currentYear = currentDate.getFullYear();
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            const currentMonthSales = sales.filter((sale: any) => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            });

            const previousMonthSales = sales.filter((sale: any) => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === previousMonth && saleDate.getFullYear() === previousYear;
            });

            const currentMonthRevenue = currentMonthSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
            const previousMonthRevenue = previousMonthSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);

            const growthPercentage = previousMonthRevenue > 0 
                ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
                : 100;

            // Obtener productos más vendidos
            const productSales = sales.reduce((acc: any, sale: any) => {
                if (sale.items && Array.isArray(sale.items)) {
                    sale.items.forEach((item: any) => {
                        if (!acc[item.productId]) {
                            acc[item.productId] = {
                                productId: item.productId,
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        acc[item.productId].quantity += item.quantity || 0;
                        acc[item.productId].revenue += item.total || 0;
                    });
                }
                return acc;
            }, {});

            // Convertir a array y ordenar por ingresos
            const topProducts = await Promise.all(
                Object.values(productSales)
                    .sort((a: any, b: any) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(async (item: any) => {
                        const product = await db
                            .collection('products')
                            .findOne({ _id: new ObjectId(item.productId) });

                        return {
                            name: product ? product.name : 'Producto desconocido',
                            revenue: item.revenue,
                            quantity: item.quantity
                        };
                    })
            );

            // Calcular distribución por canales de venta
            const channelDistribution = sales.reduce((acc: any, sale: any) => {
                const channel = sale.channel || 'Desconocido';
                if (!acc[channel]) {
                    acc[channel] = { count: 0, revenue: 0 };
                }
                acc[channel].count += 1;
                acc[channel].revenue += sale.total || 0;
                return acc;
            }, {});

            // Convertir a array y calcular porcentajes
            const channels = Object.entries(channelDistribution).map(([name, data]: [string, any]) => {
                return {
                    name,
                    count: data.count,
                    revenue: data.revenue,
                    percentage: Math.round((data.count / totalSales) * 100)
                };
            }).sort((a, b) => b.count - a.count);

            // Obtener ventas por día de la semana
            const weekdaySales = Array(7).fill(0).map(() => ({ sales: 0, target: 0 }));
            
            sales.forEach((sale: any) => {
                if (sale.date) {
                    const saleDate = new Date(sale.date);
                    const dayOfWeek = saleDate.getDay(); // 0 = Domingo, 1 = Lunes, ...
                    weekdaySales[dayOfWeek].sales += sale.total || 0;
                }
            });

            // Establecer objetivos de ventas (simulados)
            weekdaySales.forEach((day, index) => {
                // Objetivo simulado: 20% más que las ventas actuales
                day.target = day.sales * 1.2;
            });

            return {
                totalRevenue,
                growthPercentage,
                topProducts,
                channels,
                weekdaySales: [
                    { day: 'Lun', ...weekdaySales[1] },
                    { day: 'Mar', ...weekdaySales[2] },
                    { day: 'Mié', ...weekdaySales[3] },
                    { day: 'Jue', ...weekdaySales[4] },
                    { day: 'Vie', ...weekdaySales[5] },
                    { day: 'Sáb', ...weekdaySales[6] },
                    { day: 'Dom', ...weekdaySales[0] },
                ]
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de ventas:', error);
            throw error;
        }
    },

    // Obtener reportes disponibles
    async getAvailableReports(agencyId: string) {
        return [
            {
                id: 'sales-by-seller',
                title: 'Reporte de Ventas por Vendedor',
                description: 'Análisis detallado del rendimiento de cada vendedor.'
            },
            {
                id: 'sales-by-category',
                title: 'Reporte de Ventas por Categoría',
                description: 'Distribución de ventas por categorías de productos.'
            },
            {
                id: 'returns',
                title: 'Reporte de Devoluciones',
                description: 'Análisis de productos devueltos y motivos.'
            },
            {
                id: 'sales-by-location',
                title: 'Reporte de Ventas por Ubicación',
                description: 'Distribución geográfica de las ventas.'
            },
            {
                id: 'discounts',
                title: 'Reporte de Descuentos Aplicados',
                description: 'Análisis de descuentos y su impacto en ventas.'
            },
            {
                id: 'trends',
                title: 'Reporte de Tendencias',
                description: 'Análisis de tendencias de ventas a lo largo del tiempo.'
            }
        ];
    }
};