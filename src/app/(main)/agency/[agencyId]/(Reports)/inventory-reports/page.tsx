import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { ArrowDownToLine, Calendar, Download, Filter, PieChart, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { InventoryReportService, ReportService } from '@/lib/services/report-service';
import { exportData, prepareTableDataForExport } from '@/lib/utils/export-utils';
import { ReportFormat, ReportType } from '@prisma/client';

const InventoryReportsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Obtener datos reales del inventario desde MongoDB
  let inventoryData;
  try {
    inventoryData = await InventoryReportService.getInventoryStats(agencyId);
  } catch (error) {
    console.error('Error al obtener datos de inventario:', error);
    // Proporcionar datos de respaldo en caso de error
    inventoryData = {
      totalProducts: 0,
      optimalStock: 0,
      lowStock: 0,
      outOfStock: 0,
      categories: [],
      recentMovements: []
    };
  }

  // Obtener datos de rotación para el histograma
  let rotationData;
  try {
    rotationData = await InventoryReportService.getInventoryRotation(agencyId, 30);
  } catch (error) {
    console.error('Error al obtener datos de rotación:', error);
    rotationData = [];
  }

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
        name: `Reporte de Inventario - ${new Date().toLocaleDateString()}`,
        description: 'Análisis detallado del estado actual del inventario',
        type: 'INVENTORY' as ReportType,
        format,
        content: inventoryData,
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Reportes de Inventario</h1>
            <p className="text-muted-foreground mt-1">Análisis detallado del estado actual de su inventario</p>
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
                        const exportableData = prepareTableDataForExport([
                          {
                            ...inventoryData,
                            categories: JSON.stringify(inventoryData.categories),
                            recentMovements: JSON.stringify(inventoryData.recentMovements)
                          }
                        ]);
                        
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
                          fileName: `inventario-reporte-${new Date().toISOString().split('T')[0]}`,
                          format: formatMap[format.format],
                          title: 'Reporte de Inventario',
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
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <h3 className="text-lg font-medium mb-2">Total de Productos</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{inventoryData.totalProducts}</span>
              <span className="text-sm text-muted-foreground">unidades</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-500">
              <RefreshCcw className="h-3 w-3 mr-1" />
              <span>Actualizado hoy</span>
            </div>
          </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
            <h3 className="text-lg font-medium mb-2">Stock Óptimo</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{inventoryData.optimalStock}</span>
              <span className="text-sm text-muted-foreground">({Math.round(inventoryData.optimalStock / inventoryData.totalProducts * 100)}%)</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full" style={{ width: `${Math.round(inventoryData.optimalStock / inventoryData.totalProducts * 100)}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
            <h3 className="text-lg font-medium mb-2">Stock Bajo</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{inventoryData.lowStock}</span>
              <span className="text-sm text-muted-foreground">({Math.round(inventoryData.lowStock / inventoryData.totalProducts * 100)}%)</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full" style={{ width: `${Math.round(inventoryData.lowStock / inventoryData.totalProducts * 100)}%` }}></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
            <h3 className="text-lg font-medium mb-2">Sin Stock</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{inventoryData.outOfStock}</span>
              <span className="text-sm text-muted-foreground">({Math.round(inventoryData.outOfStock / inventoryData.totalProducts * 100)}%)</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 h-full" style={{ width: `${Math.round(inventoryData.outOfStock / inventoryData.totalProducts * 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Visualizaciones estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Gráfico Radial */}
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
                      <div className="absolute inset-0 rounded-full border-8 border-cyan-500/30" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 25% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-purple-500/30" style={{ clipPath: 'polygon(50% 50%, 25% 0%, 50% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-amber-500/30" style={{ clipPath: 'polygon(50% 50%, 0% 0%, 25% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-green-500/30" style={{ clipPath: 'polygon(50% 50%, 0% 100%, 0% 0%)' }}></div>
                      <div className="absolute inset-0 rounded-full border-8 border-red-500/30" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%)' }}></div>
                      
                      {/* Líneas radiales */}
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full h-[1px] bg-border origin-center"
                          style={{ transform: `rotate(${i * 72}deg)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-1/2 flex flex-col justify-center">
                {inventoryData.categories && inventoryData.categories.length > 0 ? inventoryData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ 
                          backgroundColor: [
                            'rgb(59, 130, 246)', 'rgb(139, 92, 246)', 
                            'rgb(245, 158, 11)', 'rgb(16, 185, 129)', 
                            'rgb(239, 68, 68)'
                          ][index % 5] 
                        }}
                      ></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                )) : [
                  { name: 'Sin datos', percentage: 100 }
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gray-400"></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Histograma */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Rotación de Inventario</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Últimos 30 días</span>
                </button>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-1 p-4 bg-muted/30 rounded-md relative">
              {/* Eje Y */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start pr-2">
                <span className="text-xs text-muted-foreground">100</span>
                <span className="text-xs text-muted-foreground">75</span>
                <span className="text-xs text-muted-foreground">50</span>
                <span className="text-xs text-muted-foreground">25</span>
                <span className="text-xs text-muted-foreground">0</span>
              </div>
              
              {/* Barras del histograma */}
              <div className="flex-1 h-full flex items-end justify-between pl-6">
                {rotationData.length > 0 ? rotationData.map((item, index) => {  
                  // Normalizar la altura para el gráfico (máximo 100%)
                  const maxQuantity = Math.max(...rotationData.map(d => d.quantity));
                  const height = (item.quantity / maxQuantity) * 100 || 0;
                  return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">{new Date(item.date).getDate()}</span>
                  </div>
                  );
                }) : [85, 65, 45, 70, 55, 40, 60, 75, 50, 90].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cartograma - Mapa de calor */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Distribución Geográfica</h3>
              <button className="text-sm text-primary hover:underline">Ver completo</button>
            </div>
            
            <div className="aspect-video bg-muted/30 rounded-md p-4 relative">
              {/* Simulación simplificada de un mapa */}
              <div className="absolute top-[20%] left-[10%] w-[25%] h-[30%] bg-primary/20 rounded-md border border-primary/40"></div>
              <div className="absolute top-[30%] left-[40%] w-[20%] h-[40%] bg-purple-500/40 rounded-md border border-purple-500/60"></div>
              <div className="absolute top-[15%] right-[15%] w-[20%] h-[25%] bg-blue-500/30 rounded-md border border-blue-500/50"></div>
              <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[20%] bg-amber-500/20 rounded-md border border-amber-500/40"></div>
              <div className="absolute bottom-[15%] right-[10%] w-[25%] h-[35%] bg-green-500/30 rounded-md border border-green-500/50"></div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary/20 border border-primary/40 rounded-sm mr-2"></div>
                <span className="text-xs text-muted-foreground">Baja densidad</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500/40 border border-purple-500/60 rounded-sm mr-2"></div>
                <span className="text-xs text-muted-foreground">Alta densidad</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Dispersión */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Relación Precio-Demanda</h3>
              <button className="text-sm text-primary hover:underline">Filtrar</button>
            </div>
            
            <div className="aspect-video bg-muted/30 rounded-md p-4 relative">
              {/* Simulación de puntos dispersos */}
              {[...Array(40)].map((_, i) => {
                const size = Math.random() * 10 + 4;
                return (
                  <div 
                    key={i} 
                    className="absolute rounded-full bg-gradient-to-br from-primary to-purple-500"
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
              <div className="text-xs text-muted-foreground">Precio</div>
              <div className="text-xs text-muted-foreground">Demanda</div>
            </div>
          </div>
              
          {/* Tabla de movimientos recientes */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 md:col-span-2 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Movimientos Recientes</h3>
              <Link href="#" className="text-sm text-primary hover:underline">Ver todos</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.recentMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">{movement.product}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${movement.type === 'entrada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {movement.type === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{movement.quantity}</td>
                      <td className="py-3 px-4">{movement.date}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <ArrowDownToLine className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                    );
                }) : [85, 65, 45, 70, 55, 40, 60, 75, 50, 90].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">{index + 1}</span>
                  </div>
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

export default InventoryReportsPage;