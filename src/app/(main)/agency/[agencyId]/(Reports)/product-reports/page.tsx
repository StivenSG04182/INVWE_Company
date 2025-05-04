import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { ArrowDownToLine, Calendar, Download, Filter, PieChart, RefreshCcw, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { ReportFormat, ReportType } from '@prisma/client';
import { ReportService, ProductReportService } from '@/lib/services/report-service';
import { exportData, prepareTableDataForExport } from '@/lib/utils/export-utils';

const ProductReportsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Datos de ejemplo para los gráficos
  const productData = {
    totalProducts: 1245,
    activeProducts: 980,
    discontinuedProducts: 265,
    newProductsThisMonth: 48,
    productCategories: [
      { name: 'Electrónica', count: 320, percentage: 25.7 },
      { name: 'Ropa', count: 285, percentage: 22.9 },
      { name: 'Hogar', count: 210, percentage: 16.9 },
      { name: 'Alimentos', count: 180, percentage: 14.5 },
      { name: 'Belleza', count: 150, percentage: 12.0 },
      { name: 'Otros', count: 100, percentage: 8.0 },
    ],
    productPerformance: [
      { name: 'Smartphone XYZ', sales: 450, revenue: 225000, growth: 15.2 },
      { name: 'Laptop Pro', sales: 320, revenue: 384000, growth: 8.5 },
      { name: 'Auriculares Bluetooth', sales: 580, revenue: 52200, growth: 22.4 },
      { name: 'Monitor 27"', sales: 210, revenue: 84000, growth: -3.8 },
      { name: 'Teclado Mecánico', sales: 350, revenue: 31500, growth: 12.7 },
    ],
    monthlyTrends: [
      { month: 'Ene', newProducts: 35, discontinued: 12 },
      { month: 'Feb', newProducts: 28, discontinued: 15 },
      { month: 'Mar', newProducts: 42, discontinued: 18 },
      { month: 'Abr', newProducts: 38, discontinued: 22 },
      { month: 'May', newProducts: 45, discontinued: 20 },
      { month: 'Jun', newProducts: 52, discontinued: 25 },
      { month: 'Jul', newProducts: 48, discontinued: 30 },
      { month: 'Ago', newProducts: 55, discontinued: 28 },
      { month: 'Sep', newProducts: 60, discontinued: 32 },
      { month: 'Oct', newProducts: 48, discontinued: 24 },
      { month: 'Nov', newProducts: 42, discontinued: 20 },
      { month: 'Dic', newProducts: 38, discontinued: 18 },
    ],
  };

  // Formatos de exportación disponibles
  const exportFormats = [
    { name: 'PDF', icon: '📄', format: 'PDF' as ReportFormat },
    { name: 'Excel', icon: '📊', format: 'EXCEL' as ReportFormat },
    { name: 'CSV', icon: '📝', format: 'CSV' as ReportFormat },
    { name: 'JSON', icon: '🔢', format: 'JSON' as ReportFormat },
  ];
  
  // Función para generar y guardar un reporte
  const generateReport = async (format: ReportFormat) => {
    'use server';
    try {
      // Guardar el reporte en la base de datos
      await ReportService.saveReport({
        name: `Reporte de Productos - ${new Date().toLocaleDateString()}`,
        description: 'Análisis detallado del catálogo de productos',
        type: 'PRODUCT' as ReportType,
        format,
        content: productData,
        agencyId
      });
      
      return true;
    } catch (error) {
      console.error('Error al generar reporte:', error);
      return false;
    }
  };

  return (
    <BlurPage>
      <div className="flex flex-col gap-6 p-6">
        {/* Encabezado con título y acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Reportes de Productos</h1>
            <p className="text-muted-foreground mt-1">Análisis detallado del catálogo de productos</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <form action={async () => {
              'use server';
              await generateReport('PDF' as ReportFormat);
            }}>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                <PieChart className="h-4 w-4" />
                <span>Generar Reporte</span>
              </button>
            </form>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border hidden group-hover:block z-10">
                <div className="py-1">
                  {exportFormats.map((format, index) => (
                    <form 
                      key={index} 
                      action={async () => {
                        'use server';
                        // Preparar datos para exportación
                        const exportableData = prepareTableDataForExport([{
                          ...productData,
                          productCategories: JSON.stringify(productData.productCategories),
                          productPerformance: JSON.stringify(productData.productPerformance),
                          monthlyTrends: JSON.stringify(productData.monthlyTrends)
                        }]);
                        
                        // Exportar datos en el formato seleccionado
                        const formatMap: Record<ReportFormat, 'pdf' | 'excel' | 'csv' | 'json'> = {
                          'PDF': 'pdf',
                          'EXCEL': 'excel',
                          'CSV': 'csv',
                          'JSON': 'json',
                          'POWERPOINT': 'pdf', // Fallback a PDF
                          'WORD': 'pdf', // Fallback a PDF
                          'POWERBI': 'excel', // Fallback a Excel
                        };
                        
                        exportData(exportableData, {
                          fileName: `productos-reporte-${new Date().toISOString().split('T')[0]}`,
                          format: formatMap[format.format],
                          title: 'Reporte de Productos',
                          subtitle: `Generado el ${new Date().toLocaleString()}`,
                          author: user.name || 'Usuario INVWE'
                        });
                        
                        // Guardar el reporte en la base de datos
                        await generateReport(format.format);
                      }}
                    >
                      <button 
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted transition-colors"
                      >
                        <span className="text-xl">{format.icon}</span>
                        <span>{format.name}</span>
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        {/* Panel de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <h3 className="text-lg font-medium mb-2">Total Productos</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{productData.totalProducts.toLocaleString()}</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{productData.newProductsThisMonth} nuevos este mes</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
            <h3 className="text-lg font-medium mb-2">Productos Activos</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{productData.activeProducts.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">({Math.round(productData.activeProducts / productData.totalProducts * 100)}%)</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full" style={{ width: `${Math.round(productData.activeProducts / productData.totalProducts * 100)}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
            <h3 className="text-lg font-medium mb-2">Productos Descontinuados</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{productData.discontinuedProducts.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">({Math.round(productData.discontinuedProducts / productData.totalProducts * 100)}%)</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full" style={{ width: `${Math.round(productData.discontinuedProducts / productData.totalProducts * 100)}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
            <h3 className="text-lg font-medium mb-2">Nuevos Productos</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{productData.newProductsThisMonth}</span>
              <span className="text-sm text-muted-foreground">este mes</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% vs. mes anterior</span>
            </div>
          </div>
        </div>

        {/* Visualizaciones estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Gráfico Radial - Distribución por Categorías */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Distribución por Categorías</h3>
              <button className="text-sm text-primary hover:underline">Ver detalles</button>
            </div>
            
            <div className="flex">
              <div className="w-1/2">
                <div className="aspect-square relative">
                  {/* Simulación de gráfico radial */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-8 border-blue-500/20 relative">
                      <div className="absolute inset-0 rounded-full border-8 border-blue-500/30" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-indigo-500/30" style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 50%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-purple-500/30" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-pink-500/30" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 100% 100%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-amber-500/30" style={{ clipPath: 'polygon(50% 50%, 0% 100%, 50% 100%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-green-500/30" style={{ clipPath: 'polygon(50% 50%, 0% 0%, 0% 100%)' }}></div>
                      
                      {/* Líneas radiales */}
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full h-[1px] bg-border origin-center"
                          style={{ transform: `rotate(${i * 60}deg)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 flex flex-col justify-center">
                {productData.productCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ 
                          backgroundColor: [
                            'rgb(59, 130, 246)', 'rgb(99, 102, 241)', 
                            'rgb(139, 92, 246)', 'rgb(219, 39, 119)', 
                            'rgb(245, 158, 11)', 'rgb(16, 185, 129)'
                          ][index % 6] 
                        }}
                      ></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Histograma - Tendencias Mensuales */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Tendencias Mensuales</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>2023</span>
                </button>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-1 p-4 bg-muted/30 rounded-md relative">
              {/* Eje Y */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start pr-2">
                <span className="text-xs text-muted-foreground">60</span>
                <span className="text-xs text-muted-foreground">45</span>
                <span className="text-xs text-muted-foreground">30</span>
                <span className="text-xs text-muted-foreground">15</span>
                <span className="text-xs text-muted-foreground">0</span>
              </div>
              
              {/* Barras del histograma */}
              <div className="flex-1 h-full flex items-end justify-between pl-6">
                {productData.monthlyTrends.map((month, index) => {
                  const newHeight = (month.newProducts / 60) * 100;
                  const discHeight = (month.discontinued / 60) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex items-end h-full">
                        <div 
                          className="w-4 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-sm mr-1"
                          style={{ height: `${newHeight}%` }}
                        />
                        <div 
                          className="w-4 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-sm"
                          style={{ height: `${discHeight}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-sm mr-2"></div>
                <span className="text-xs text-muted-foreground">Nuevos</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-t from-amber-500 to-orange-400 rounded-sm mr-2"></div>
                <span className="text-xs text-muted-foreground">Descontinuados</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Dispersión - Rendimiento de Productos */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Rendimiento de Productos</h3>
              <button className="text-sm text-primary hover:underline">Filtrar</button>
            </div>
            
            <div className="aspect-video bg-muted/30 rounded-md p-4 relative">
              {/* Simulación de puntos dispersos */}
              {[...Array(40)].map((_, i) => {
                const size = Math.random() * 10 + 4;
                return (
                  <div 
                    key={i} 
                    className="absolute rounded-full bg-gradient-to-br from-blue-500 to-indigo-500"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${Math.random() * 90}%`,
                      top: `${Math.random() * 90}%`,
                      opacity: 0.6 + Math.random() * 0.4
                    }}
                  />
                );
              })}
              {/* Ejes */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-border"></div>
              <div className="absolute top-0 left-0 w-[1px] h-full bg-border"></div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <div className="text-xs text-muted-foreground">Ventas</div>
              <div className="text-xs text-muted-foreground">Ingresos</div>
            </div>
          </div>

          {/* Productos con Mejor Rendimiento */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Productos con Mejor Rendimiento</h3>
              <button className="text-sm text-primary hover:underline">Ver todos</button>
            </div>
            
            <div className="space-y-4">
              {productData.productPerformance.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span className="mr-4">{product.sales} ventas</span>
                      <span>${product.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${product.growth >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {product.growth >= 0 ? '+' : ''}{product.growth}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de productos por categoría */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 md:col-span-2 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Productos por Categoría</h3>
              <Link href="#" className="text-sm text-primary hover:underline">Ver todos</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Categoría</th>
                    <th className="text-left py-3 px-4 font-medium">Total Productos</th>
                    <th className="text-left py-3 px-4 font-medium">Activos</th>
                    <th className="text-left py-3 px-4 font-medium">Descontinuados</th>
                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.productCategories.map((category, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">{category.count}</td>
                      <td className="py-3 px-4">{Math.round(category.count * 0.8)}</td>
                      <td className="py-3 px-4">{Math.round(category.count * 0.2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <ArrowDownToLine className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default ProductReportsPage;