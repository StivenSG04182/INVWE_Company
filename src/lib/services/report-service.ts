import { connectToDatabase } from '../mongodb';
import { db } from '../db';
import { ReportType, ReportFormat } from '@prisma/client';
import { ObjectId } from 'mongodb';
import { SalesReportService } from './sales-report-service';

// Re-exportar SalesReportService
export { SalesReportService };

// Interfaces para los reportes
export interface IReportData {
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    content: any;
    agencyId: string;
    subAccountId?: string;
}

// Servicio para gestionar reportes
export const ReportService = {
    // Guardar un reporte en Prisma
    async saveReport(reportData: IReportData) {
        try {
            const report = await db.report.create({
                data: reportData
            });
            return report;
        } catch (error) {
            console.error('Error al guardar el reporte:', error);
            throw error;
        }
    },

    // Obtener todos los reportes de una agencia
    async getReports(agencyId: string, type?: ReportType) {
        try {
            const whereClause: any = { agencyId };
            if (type) {
                whereClause.type = type;
            }

            const reports = await db.report.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' }
            });
            return reports;
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    },

    // Obtener un reporte por ID
    async getReportById(id: string) {
        try {
            const report = await db.report.findUnique({
                where: { id }
            });
            return report;
        } catch (error) {
            console.error('Error al obtener el reporte:', error);
            throw error;
        }
    },

    // Eliminar un reporte
    async deleteReport(id: string) {
        try {
            await db.report.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            console.error('Error al eliminar el reporte:', error);
            throw error;
        }
    },

    // Exportar un reporte en formato específico
    async exportReport(reportData: any, format: ReportFormat) {
        try {
            let exportedContent: any;

            switch (format) {
                case 'PDF':
                    exportedContent = await ReportService.exportToPDF(reportData);
                    break;
                case 'CSV':
                    exportedContent = await ReportService.exportToCSV(reportData);
                    break;
                case 'EXCEL':
                    exportedContent = await ReportService.exportToExcel(reportData);
                    break;
                case 'JSON':
                    exportedContent = JSON.stringify(reportData, null, 2);
                    break;
                default:
                    throw new Error(`Formato de exportación no soportado: ${format}`);
            }

            return exportedContent;
        } catch (error) {
            console.error(`Error al exportar reporte en formato ${format}:`, error);
            throw error;
        }
    },

    // Exportar a PDF (simulado)
    async exportToPDF(data: any) {
        // Aquí se implementaría la lógica real de exportación a PDF
        // Usando bibliotecas como jsPDF, pdfmake, etc.
        console.log('Exportando a PDF:', data);
        return { format: 'PDF', content: 'Base64EncodedPDFContent', data };
    },

    // Exportar a CSV
    async exportToCSV(data: any) {
        try {
            // Función para convertir objetos a CSV
            const objectToCSV = (data: any[]) => {
                if (!data || !data.length) return '';
                
                // Obtener encabezados
                const headers = Object.keys(data[0]);
                
                // Crear filas de datos
                const csvRows = [];
                
                // Añadir encabezados
                csvRows.push(headers.join(','));
                
                // Añadir filas
                for (const row of data) {
                    const values = headers.map(header => {
                        const val = row[header];
                        // Escapar comas y comillas
                        return `"${val ? String(val).replace(/"/g, '""') : ''}"`;  
                    });
                    csvRows.push(values.join(','));
                }
                
                return csvRows.join('\n');
            };
            
            // Procesar diferentes estructuras de datos
            let csvContent = '';
            
            if (Array.isArray(data)) {
                csvContent = objectToCSV(data);
            } else if (typeof data === 'object') {
                // Si es un objeto con propiedades que son arrays
                const arrays = Object.entries(data)
                    .filter(([_, value]) => Array.isArray(value))
                    .map(([key, value]) => ({ key, data: value }));
                
                if (arrays.length > 0) {
                    // Usar el primer array encontrado
                    csvContent = objectToCSV(arrays[0].data);
                } else {
                    // Convertir el objeto en un array de un solo elemento
                    csvContent = objectToCSV([data]);
                }
            }
            
            return { format: 'CSV', content: csvContent, data };
        } catch (error) {
            console.error('Error al exportar a CSV:', error);
            throw error;
        }
    },

    // Exportar a Excel (simulado)
    async exportToExcel(data: any) {
        // Aquí se implementaría la lógica real de exportación a Excel
        // Usando bibliotecas como xlsx, exceljs, etc.
        console.log('Exportando a Excel:', data);
        return { format: 'EXCEL', content: 'Base64EncodedExcelContent', data };
    }
};

// Servicio para obtener datos de inventario para reportes
export const InventoryReportService = {
    // Obtener estadísticas generales del inventario
    async getInventoryStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener todos los productos
            const products = await db
                .collection('products')
                .find({ agencyId })
                .toArray();

            // Obtener todo el stock
            const stocks = await db
                .collection('stocks')
                .find({ agencyId })
                .toArray();

            // Calcular estadísticas
            const totalProducts = products.length;

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
            const categories = Object.entries(categoriesMap).map(([name, data]: [string, any]) => {
                return {
                    name,
                    count: data.count,
                    percentage: Math.round((data.count / totalProducts) * 100)
                };
            }).sort((a, b) => b.count - a.count);

            // Calcular productos con stock óptimo, bajo y sin stock
            let optimalStock = 0;
            let lowStock = 0;
            let outOfStock = 0;

            // Crear un mapa de productos con su stock total
            const productStockMap = new Map();

            stocks.forEach((stock: any) => {
                const productId = stock.productId;
                const currentTotal = productStockMap.get(productId) || 0;
                productStockMap.set(productId, currentTotal + stock.quantity);
            });

            // Evaluar el estado del stock para cada producto
            products.forEach((product: any) => {
                const totalStock = productStockMap.get(product._id.toString()) || 0;
                const minStock = product.minStock || 0;

                if (totalStock === 0) {
                    outOfStock++;
                } else if (totalStock < minStock) {
                    lowStock++;
                } else {
                    optimalStock++;
                }
            });

            // Obtener movimientos recientes
            const recentMovements = await db
                .collection('movements')
                .find({ agencyId })
                .sort({ date: -1 })
                .limit(5)
                .toArray();

            // Enriquecer los movimientos con información del producto
            const enrichedMovements = await Promise.all(
                recentMovements.map(async (movement: any) => {
                    const product = await db
                        .collection('products')
                        .findOne({ _id: new ObjectId(movement.productId) });

                    return {
                        id: movement._id.toString(),
                        product: product ? product.name : 'Producto desconocido',
                        type: movement.type,
                        quantity: movement.quantity,
                        date: movement.date ? new Date(movement.date).toISOString().split('T')[0] : 'Fecha desconocida'
                    };
                })
            );

            return {
                totalProducts,
                optimalStock,
                lowStock,
                outOfStock,
                categories,
                recentMovements: enrichedMovements
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de inventario:', error);
            throw error;
        }
    },

    // Obtener datos de rotación de inventario
    async getInventoryRotation(agencyId: string, days: number = 30) {
        try {
            const { db } = await connectToDatabase();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Obtener movimientos en el período especificado
            const movements = await db
                .collection('movements')
                .find({
                    agencyId,
                    date: { $gte: startDate }
                })
                .sort({ date: 1 })
                .toArray();

            // Agrupar movimientos por día
            const dailyMovements: any = {};

            movements.forEach((movement: any) => {
                const date = new Date(movement.date).toISOString().split('T')[0];
                if (!dailyMovements[date]) {
                    dailyMovements[date] = 0;
                }

                // Sumar entradas y restar salidas para calcular rotación
                if (movement.type === 'entrada') {
                    dailyMovements[date] += movement.quantity;
                } else if (movement.type === 'salida') {
                    dailyMovements[date] -= movement.quantity;
                }
            });

            // Convertir a array para la visualización
            const rotationData = Object.entries(dailyMovements).map(([date, quantity]) => {
                return { date, quantity: Math.abs(Number(quantity)) };
            }).slice(-10); // Últimos 10 días con datos

            return rotationData;
        } catch (error) {
            console.error('Error al obtener datos de rotación de inventario:', error);
            throw error;
        }
    }
};

// Servicio para obtener datos de productos para reportes
export const ProductReportService = {
    // Obtener estadísticas de productos
    async getProductStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener todos los productos
            const products = await db
                .collection('products')
                .find({ agencyId })
                .toArray();

            const totalProducts = products.length;

            // Calcular productos activos y descontinuados
            const activeProducts = products.filter((p: any) => p.status !== 'discontinued').length;
            const discontinuedProducts = totalProducts - activeProducts;

            // Calcular productos nuevos este mes
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const newProductsThisMonth = products.filter((p: any) => {
                const createdAt = new Date(p.createdAt);
                return createdAt >= startOfMonth;
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
            const productPerformance: any = {};
            sales.forEach((sale: any) => {
                if (sale.items && Array.isArray(sale.items)) {
                    sale.items.forEach((item: any) => {
                        if (!productPerformance[item.productId]) {
                            productPerformance[item.productId] = {
                                sales: 0,
                                revenue: 0,
                                productId: item.productId
                            };
                        }
                        productPerformance[item.productId].sales += item.quantity || 0;
                        productPerformance[item.productId].revenue += (item.price * item.quantity) || 0;
                    });
                }
            });

            // Convertir a array y enriquecer con datos del producto
            const performanceArray = await Promise.all(
                Object.values(productPerformance)
                    .sort((a: any, b: any) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(async (perf: any) => {
                        const product = await db
                            .collection('products')
                            .findOne({ _id: new ObjectId(perf.productId) });

                        return {
                            name: product ? product.name : 'Producto desconocido',
                            sales: perf.sales,
                            revenue: perf.revenue,
                            growth: Math.random() * 30 - 5 // Simulación de crecimiento (-5% a 25%)
                        };
                    })
            );

            // Obtener tendencias mensuales de productos nuevos y descontinuados
            const monthlyTrends = [
                { month: 'Ene', newProducts: 0, discontinued: 0 },
                { month: 'Feb', newProducts: 0, discontinued: 0 },
                { month: 'Mar', newProducts: 0, discontinued: 0 },
                { month: 'Abr', newProducts: 0, discontinued: 0 },
                { month: 'May', newProducts: 0, discontinued: 0 },
                { month: 'Jun', newProducts: 0, discontinued: 0 },
                { month: 'Jul', newProducts: 0, discontinued: 0 },
                { month: 'Ago', newProducts: 0, discontinued: 0 },
                { month: 'Sep', newProducts: 0, discontinued: 0 },
                { month: 'Oct', newProducts: 0, discontinued: 0 },
                { month: 'Nov', newProducts: 0, discontinued: 0 },
                { month: 'Dic', newProducts: 0, discontinued: 0 },
            ];

            // Calcular tendencias mensuales (simulación con datos reales parciales)
            products.forEach((product: any) => {
                if (product.createdAt) {
                    const createdDate = new Date(product.createdAt);
                    const month = createdDate.getMonth();
                    if (month >= 0 && month < 12) {
                        monthlyTrends[month].newProducts += 1;
                    }
                }

                if (product.status === 'discontinued' && product.updatedAt) {
                    const updatedDate = new Date(product.updatedAt);
                    const month = updatedDate.getMonth();
                    if (month >= 0 && month < 12) {
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
                productPerformance: performanceArray,
                monthlyTrends
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de productos:', error);
            throw error;
        }
    },

    // Obtener reportes disponibles
    async getAvailableReports(agencyId: string) {
        try {
            return [
                {
                    id: 'product-catalog',
                    title: 'Catálogo de Productos',
                    description: 'Listado completo de productos con detalles.'
                },
                {
                    id: 'product-performance',
                    title: 'Rendimiento de Productos',
                    description: 'Análisis de ventas y rendimiento por producto.'
                },
                {
                    id: 'inventory-status',
                    title: 'Estado de Inventario',
                    description: 'Niveles actuales de stock por producto.'
                },
                {
                    id: 'product-lifecycle',
                    title: 'Ciclo de Vida de Productos',
                    description: 'Análisis de productos nuevos y descontinuados.'
                },
                {
                    id: 'category-analysis',
                    title: 'Análisis por Categoría',
                    description: 'Distribución y rendimiento por categoría de producto.'
                },
                {
                    id: 'price-analysis',
                    title: 'Análisis de Precios',
                    description: 'Estudio de precios y márgenes por producto.'
                }
            ];
        } catch (error) {
            console.error('Error al obtener reportes disponibles:', error);
            throw error;
        }
    }
};

// Servicio para obtener datos de desempeño para reportes
export const PerformanceReportService = {
    // Obtener estadísticas de desempeño
    async getPerformanceStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener datos de ventas para calcular KPIs
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Obtener datos de empleados
            const employees = await db
                .collection('employees')
                .find({ agencyId })
                .toArray();

            // Calcular KPIs generales
            const targetSales = 100000; // Objetivo de ventas (simulado)
            const totalSales = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
            const salesVsTarget = Math.min(Math.round((totalSales / targetSales) * 100), 100);

            // Calcular satisfacción del cliente (simulado con datos parciales)
            let customerSatisfaction = 0;
            let satisfactionCount = 0;
            sales.forEach((sale: any) => {
                if (sale.customerRating) {
                    customerSatisfaction += sale.customerRating;
                    satisfactionCount++;
                }
            });
            const avgCustomerSatisfaction = satisfactionCount > 0
                ? Math.round((customerSatisfaction / satisfactionCount) * 20)
                : 92; // Valor por defecto si no hay datos

            // Calcular eficiencia operativa (simulado)
            const operationalEfficiency = 78;

            // Calcular retención de clientes (simulado con datos parciales)
            const customerRetention = 88;

            // Calcular desempeño por departamento
            const departmentPerformance = [
                { name: 'Ventas', percentage: 45 },
                { name: 'Operaciones', percentage: 25 },
                { name: 'Marketing', percentage: 20 },
                { name: 'Soporte', percentage: 10 }
            ];

            // Calcular tendencia de desempeño (simulado)
            const performanceTrend = 12.5;

            // Calcular desempeño del equipo
            const teamPerformance = employees.map((employee: any) => {
                // Generar métricas simuladas basadas en datos reales parciales
                const productivity = Math.round(60 + Math.random() * 40); // 60-100%
                const quality = Math.round(70 + Math.random() * 30); // 70-100%
                const punctuality = Math.round(65 + Math.random() * 35); // 65-100%

                // Determinar calificación basada en promedios
                const average = (productivity + quality + punctuality) / 3;
                let rating = 'Regular';
                if (average >= 90) rating = 'Excelente';
                else if (average >= 80) rating = 'Bueno';
                else if (average >= 70) rating = 'Satisfactorio';

                return {
                    name: employee.name || 'Empleado sin nombre',
                    department: employee.department || 'Sin departamento',
                    productivity,
                    quality,
                    punctuality,
                    rating
                };
            }).sort((a: any, b: any) => {
                // Ordenar por productividad descendente
                return b.productivity - a.productivity;
            });

            return {
                kpis: {
                    salesVsTarget,
                    customerSatisfaction: avgCustomerSatisfaction,
                    operationalEfficiency,
                    customerRetention
                },
                departmentPerformance,
                performanceTrend,
                teamPerformance
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de desempeño:', error);
            throw error;
        }
    },

    // Obtener datos de desempeño por departamento
    async getDepartmentPerformance(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener datos de empleados
            const employees = await db
                .collection('employees')
                .find({ agencyId })
                .toArray();

            // Obtener datos de ventas
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Agrupar empleados por departamento
            const departmentMap = employees.reduce((acc: any, employee: any) => {
                const department = employee.department || 'Sin departamento';
                if (!acc[department]) {
                    acc[department] = {
                        name: department,
                        employeeCount: 0,
                        totalProductivity: 0,
                        averageProductivity: 0,
                        salesContribution: 0,
                        performance: 0
                    };
                }
                acc[department].employeeCount += 1;
                
                // Calcular productividad (simulada con datos parciales)
                const productivity = employee.productivity || Math.round(60 + Math.random() * 40);
                acc[department].totalProductivity += productivity;
                
                return acc;
            }, {});

            // Calcular promedios y métricas adicionales
            Object.values(departmentMap).forEach((dept: any) => {
                dept.averageProductivity = Math.round(dept.totalProductivity / dept.employeeCount);
                
                // Asignar contribución de ventas (simulada con datos parciales)
                if (dept.name === 'Ventas') {
                    dept.salesContribution = 65;
                } else if (dept.name === 'Marketing') {
                    dept.salesContribution = 25;
                } else {
                    dept.salesContribution = 10;
                }
                
                // Calcular desempeño general (promedio ponderado)
                dept.performance = Math.round(
                    (dept.averageProductivity * 0.6) + (dept.salesContribution * 0.4)
                );
            });

            // Convertir a array y ordenar por desempeño
            const departmentPerformance = Object.values(departmentMap)
                .sort((a: any, b: any) => b.performance - a.performance);

            // Calcular tendencias mensuales (simuladas)
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const currentMonth = new Date().getMonth();
            
            const performanceTrends = departmentPerformance.map((dept: any) => {
                const trend = [];
                
                // Generar datos de los últimos 6 meses
                for (let i = 0; i < 6; i++) {
                    const monthIndex = (currentMonth - i + 12) % 12;
                    const basePerformance = dept.performance;
                    
                    // Variación aleatoria de ±15%
                    const variation = (Math.random() * 30) - 15;
                    const monthlyPerformance = Math.max(0, Math.min(100, basePerformance + variation));
                    
                    trend.unshift({
                        month: months[monthIndex],
                        performance: Math.round(monthlyPerformance)
                    });
                }
                
                return {
                    department: dept.name,
                    trend
                };
            });

            return {
                departments: departmentPerformance,
                trends: performanceTrends
            };
        } catch (error) {
            console.error('Error al obtener desempeño por departamento:', error);
            throw error;
        }
    },

    // Obtener datos de desempeño individual de empleados
    async getEmployeePerformance(agencyId: string, departmentFilter?: string) {
        try {
            const { db } = await connectToDatabase();

            // Construir filtro
            const filter: any = { agencyId };
            if (departmentFilter) {
                filter.department = departmentFilter;
            }

            // Obtener datos de empleados
            const employees = await db
                .collection('employees')
                .find(filter)
                .toArray();

            // Obtener datos de ventas (para vendedores)
            const sales = await db
                .collection('sales')
                .find({ agencyId })
                .toArray();

            // Mapear ventas por vendedor
            const salesByEmployee: any = {};
            sales.forEach((sale: any) => {
                if (sale.employeeId) {
                    if (!salesByEmployee[sale.employeeId]) {
                        salesByEmployee[sale.employeeId] = {
                            count: 0,
                            total: 0
                        };
                    }
                    salesByEmployee[sale.employeeId].count += 1;
                    salesByEmployee[sale.employeeId].total += sale.total || 0;
                }
            });

            // Calcular métricas de desempeño para cada empleado
            const employeePerformance = employees.map((employee: any) => {
                // Métricas base (simuladas con datos parciales)
                const productivity = employee.productivity || Math.round(60 + Math.random() * 40);
                const quality = employee.quality || Math.round(70 + Math.random() * 30);
                const punctuality = employee.punctuality || Math.round(65 + Math.random() * 35);
                
                // Calcular promedio general
                const averagePerformance = Math.round((productivity + quality + punctuality) / 3);
                
                // Determinar calificación
                let rating = 'Regular';
                if (averagePerformance >= 90) rating = 'Excelente';
                else if (averagePerformance >= 80) rating = 'Bueno';
                else if (averagePerformance >= 70) rating = 'Satisfactorio';
                
                // Datos de ventas si es vendedor
                const salesData = salesByEmployee[employee._id.toString()] || { count: 0, total: 0 };
                
                // Calcular tendencia (simulada)
                const performanceTrend = Math.round((Math.random() * 20) - 5); // -5% a +15%
                
                return {
                    id: employee._id.toString(),
                    name: employee.name || 'Empleado sin nombre',
                    department: employee.department || 'Sin departamento',
                    position: employee.position || 'Posición no especificada',
                    metrics: {
                        productivity,
                        quality,
                        punctuality,
                        averagePerformance
                    },
                    sales: salesData,
                    rating,
                    trend: performanceTrend
                };
            }).sort((a: any, b: any) => {
                // Ordenar por desempeño promedio descendente
                return b.metrics.averagePerformance - a.metrics.averagePerformance;
            });

            return employeePerformance;
        } catch (error) {
            console.error('Error al obtener desempeño de empleados:', error);
            throw error;
        }
    },

    // Generar reporte de desempeño
    async generatePerformanceReport(agencyId: string, reportType: string) {
        try {
            let reportData: any = {};
            
            switch (reportType) {
                case 'team-performance':
                    reportData = await PerformanceReportService.getEmployeePerformance(agencyId);
                    break;
                case 'department-kpis':
                    reportData = await PerformanceReportService.getDepartmentPerformance(agencyId);
                    break;
                case 'operational-efficiency':
                    const stats = await PerformanceReportService.getPerformanceStats(agencyId);
                    reportData = {
                        operationalEfficiency: stats.kpis.operationalEfficiency,
                        departmentPerformance: stats.departmentPerformance,
                        // Datos adicionales simulados
                        processEfficiency: 82,
                        resourceUtilization: 76,
                        timeEfficiency: 85,
                        costEfficiency: 79
                    };
                    break;
                case 'customer-satisfaction':
                    const perfStats = await PerformanceReportService.getPerformanceStats(agencyId);
                    reportData = {
                        customerSatisfaction: perfStats.kpis.customerSatisfaction,
                        // Datos adicionales simulados
                        nps: 72, // Net Promoter Score
                        csat: 85, // Customer Satisfaction Score
                        customerRetention: perfStats.kpis.customerRetention,
                        feedbackAnalysis: [
                            { category: 'Atención al cliente', score: 88 },
                            { category: 'Calidad del producto', score: 92 },
                            { category: 'Tiempo de respuesta', score: 76 },
                            { category: 'Resolución de problemas', score: 82 }
                        ]
                    };
                    break;
                default:
                    reportData = await PerformanceReportService.getPerformanceStats(agencyId);
            }
            
            return {
                type: reportType,
                generatedAt: new Date(),
                data: reportData
            };
        } catch (error) {
            console.error(`Error al generar reporte de desempeño ${reportType}:`, error);
            throw error;
        }
    },

    // Obtener reportes disponibles
    async getAvailableReports(agencyId: string) {
        try {
            return [
                {
                    id: 'team-performance',
                    title: 'Desempeño del Equipo',
                    description: 'Análisis detallado del rendimiento de cada empleado.'
                },
                {
                    id: 'department-kpis',
                    title: 'KPIs por Departamento',
                    description: 'Indicadores clave de rendimiento por departamento.'
                },
                {
                    id: 'operational-efficiency',
                    title: 'Eficiencia Operativa',
                    description: 'Análisis de procesos y eficiencia operacional.'
                },
                {
                    id: 'customer-satisfaction',
                    title: 'Satisfacción del Cliente',
                    description: 'Métricas de satisfacción y experiencia del cliente.'
                },
                {
                    id: 'sales-performance',
                    title: 'Desempeño de Ventas',
                    description: 'Análisis del rendimiento del equipo de ventas.'
                },
                {
                    id: 'employee-productivity',
                    title: 'Productividad de Empleados',
                    description: 'Métricas de productividad individual y grupal.'
                }
            ];
        } catch (error) {
            console.error('Error al obtener reportes disponibles:', error);
            throw error;
        }
    }
};

// Servicio para obtener datos financieros para reportes
export const FinancialReportService = {
    // Obtener estadísticas financieras
    async getFinancialStats(agencyId: string) {
        try {
            const { db } = await connectToDatabase();

            // Obtener datos de ingresos y gastos
            const income = await db
                .collection('incomes')
                .find({ agencyId })
                .toArray();

            const expenses = await db
                .collection('expenses')
                .find({ agencyId })
                .toArray();

            // Calcular ingresos y gastos totales
            const totalIncome = income.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0);
            const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

            // Calcular balance financiero
            const financialBalance = totalIncome - totalExpenses;

            // Calcular ROI (Return on Investment)
            const roi = financialBalance > 0 ? Math.round((financialBalance / totalExpenses) * 100) : 0;

            // Calcular margen de beneficios
            const profitMargin = financialBalance > 0 ? Math.round((financialBalance / totalIncome) * 100) : 0;

            // Calcular flujo de caja   
            const cashFlow = income.map((inc: any) => {
                return {
                    date: inc.date,
                    amount: inc.amount,
                    type: 'income'
                }
            });
            
            return {
                totalIncome,
                totalExpenses,
                financialBalance,
                roi,
                profitMargin,
                cashFlow
            };
        } catch (error) {
            console.error('Error al obtener estadísticas financieras:', error);
            throw error;
        }
    },
    
    // Obtener reportes disponibles
    async getAvailableReports(agencyId: string) {
        try {
            return [
                {
                    id: 'financial-summary',
                    title: 'Resumen Financiero',
                    description: 'Resumen general de ingresos, gastos y balance.'
                },
                {
                    id: 'profit-loss',
                    title: 'Ganancias y Pérdidas',
                    description: 'Análisis detallado de ganancias y pérdidas por período.'
                },
                {
                    id: 'cash-flow',
                    title: 'Flujo de Caja',
                    description: 'Análisis del flujo de efectivo entrante y saliente.'
                },
                {
                    id: 'expense-analysis',
                    title: 'Análisis de Gastos',
                    description: 'Desglose detallado de gastos por categoría.'
                },
                {
                    id: 'revenue-analysis',
                    title: 'Análisis de Ingresos',
                    description: 'Desglose detallado de ingresos por fuente.'
                },
                {
                    id: 'financial-projections',
                    title: 'Proyecciones Financieras',
                    description: 'Proyecciones de ingresos y gastos futuros.'
                }
            ];
        } catch (error) {
            console.error('Error al obtener reportes disponibles:', error);
            throw error;
        }
    }
}