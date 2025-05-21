import { ObjectId } from 'mongodb';

// Verificar si estamos en el servidor
const isServer = typeof window === 'undefined';

// Importación dinámica para evitar errores en el cliente
const getDatabase = async () => {
  if (!isServer) {
    throw new Error('Esta función solo puede ser ejecutada en el servidor');
  }
  const { connectToDatabase } = await import('../mongodb');
  return connectToDatabase();
};

// Servicio para obtener datos de productos para reportes
export const ProductReportService = {
    // Obtener estadísticas generales de productos
    async getProductStats(agencyId: string) {
        try {
            const { db } = await getDatabase();

            // Obtener todos los productos
            const products = await db
                .collection('products')
                .find({ agencyId })
                .toArray();

            // Calcular estadísticas
            const totalProducts = products.length;

            // Calcular productos activos y descontinuados
            const activeProducts = products.filter((product: any) => product.status !== 'discontinued').length;
            const discontinuedProducts = products.filter((product: any) => product.status === 'discontinued').length;

            // Calcular productos nuevos este mes
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const newProductsThisMonth = products.filter((product: any) => {
                const createdAt = product.createdAt ? new Date(product.createdAt) : null;
                return createdAt && createdAt >= firstDayOfMonth;
            }).length;

            // Agrupar productos por categoría
            const categoriesMap = products.reduce((acc: any, product: any) => {
                const category = product.category || 'Sin categoría';
                if (!acc[category]) {
                    acc[category] = { count: 0, percentage: 0 };
                }
                acc[category].count += 1;
                return acc;
            }, {});

            // Calcular porcentajes
            const productCategories = Object.entries(categoriesMap).map(([name, data]: [string, any]) => {
                return {
                    name,
                    count: data.count,
                    percentage: parseFloat(((data.count / totalProducts) * 100).toFixed(1))
                };
            }).sort((a, b) => b.count - a.count);

            // Obtener datos de ventas para calcular rendimiento de productos
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Calcular rendimiento de productos
            const productPerformance = {};
            
            sales.forEach((sale: any) => {
                if (sale.items && Array.isArray(sale.items)) {
                    sale.items.forEach((item: any) => {
                        if (!productPerformance[item.productId]) {
                            productPerformance[item.productId] = {
                                productId: item.productId,
                                sales: 0,
                                revenue: 0,
                                lastMonthSales: 0,
                                lastMonthRevenue: 0
                            };
                        }
                        
                        productPerformance[item.productId].sales += item.quantity || 0;
                        productPerformance[item.productId].revenue += item.total || 0;
                        
                        // Calcular ventas del mes pasado para determinar crecimiento
                        const saleDate = new Date(sale.date);
                        const lastMonth = new Date();
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        
                        if (saleDate.getMonth() === lastMonth.getMonth() && 
                            saleDate.getFullYear() === lastMonth.getFullYear()) {
                            productPerformance[item.productId].lastMonthSales += item.quantity || 0;
                            productPerformance[item.productId].lastMonthRevenue += item.total || 0;
                        }
                    });
                }
            });

            // Convertir a array y calcular crecimiento
            const productPerformanceArray = await Promise.all(
                Object.values(productPerformance)
                    .sort((a: any, b: any) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(async (item: any) => {
                        const product = await db
                            .collection('products')
                            .findOne({ _id: new ObjectId(item.productId) });
                        
                        // Calcular crecimiento
                        const growth = item.lastMonthRevenue > 0 
                            ? ((item.revenue - item.lastMonthRevenue) / item.lastMonthRevenue) * 100 
                            : 0;
                        
                        return {
                            name: product ? product.name : 'Producto desconocido',
                            sales: item.sales,
                            revenue: item.revenue,
                            growth: parseFloat(growth.toFixed(1))
                        };
                    })
            );

            // Obtener tendencias mensuales de productos nuevos y descontinuados
            const monthlyTrends = [];
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            // Año actual
            const currentYear = new Date().getFullYear();
            
            // Inicializar array con datos mensuales
            for (let i = 0; i < 12; i++) {
                monthlyTrends.push({
                    month: months[i],
                    newProducts: 0,
                    discontinued: 0
                });
            }
            
            // Calcular productos nuevos por mes
            products.forEach((product: any) => {
                if (product.createdAt) {
                    const createdAt = new Date(product.createdAt);
                    if (createdAt.getFullYear() === currentYear) {
                        const month = createdAt.getMonth();
                        monthlyTrends[month].newProducts += 1;
                    }
                }
                
                if (product.status === 'discontinued' && product.updatedAt) {
                    const updatedAt = new Date(product.updatedAt);
                    if (updatedAt.getFullYear() === currentYear) {
                        const month = updatedAt.getMonth();
                        monthlyTrends[month].discontinued += 1;
                    }
                }
            });

            return {
                totalProducts,
                activeProducts,
                discontinuedProducts,
                newProductsThisMonth,
                productCategories,
                productPerformance: productPerformanceArray,
                monthlyTrends
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de productos:', error);
            throw error;
        }
    }
};