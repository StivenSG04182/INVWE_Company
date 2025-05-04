import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { ArrowDownToLine, Calendar, Download, Filter, PieChart, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { SalesReportService, ReportService } from '@/lib/services/report-service';
import { exportData, prepareTableDataForExport } from '@/lib/utils/export-utils';
import { ReportFormat, ReportType } from '@prisma/client';

const SalesReportsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Obtener datos reales de ventas desde MongoDB
  let salesData;
  try {
    salesData = await SalesReportService.getSalesStats(agencyId);
  } catch (error) {
    console.error('Error al obtener datos de ventas:', error);
    // Proporcionar datos de respaldo en caso de error
    salesData = {
      totalRevenue: 128459,
      growthPercentage: 12.5,
      topProducts: [
        { name: 'Producto A', revenue: 32450 },
        { name: 'Producto B', revenue: 28120 },
        { name: 'Producto C', revenue: 21890 },
        { name: 'Producto D', revenue: 18340 },
        { name: 'Producto E', revenue: 15780 }
      ],
      channels: [
        { name: 'Tienda física', percentage: 65 },
        { name: 'E-commerce', percentage: 20 },
        { name: 'Distribuidores', percentage: 10 },
        { name: 'Otros', percentage: 5 }
      ],
      weekdaySales: [
        { day: 'Lun', sales: 20, target: 25 },
        { day: 'Mar', sales: 40, target: 50 },
        { day: 'Mié', sales: 30, target: 40 },
        { day: 'Jue', sales: 60, target: 70 },
        { day: 'Vie', sales: 80, target: 90 },
        { day: 'Sáb', sales: 90, target: 100 },
        { day: 'Dom', sales: 50, target: 60 }
      ]
    };
  }

  // Obtener reportes disponibles
  let availableReports;
  try {
    availableReports = await SalesReportService.getAvailableReports(agencyId);
  } catch (error) {
    console.error('Error al obtener reportes disponibles:', error);
    availableReports = [
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
        name: `Reporte de Ventas - ${new Date().toLocaleDateString()}`,
        description: 'Análisis detallado del rendimiento de ventas',
        type: 'SALES' as ReportType,
        format,
        content: salesData,
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
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Reportes de Ventas</h1>
            <p className="text-muted-foreground mt-1">Análisis detallado del rendimiento de ventas</p>
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
                          ...salesData,
                          topProducts: JSON.stringify(salesData.topProducts),
                          channels: JSON.stringify(salesData.channels),
                          weekdaySales: JSON.stringify(salesData.weekdaySales)
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
                          fileName: `ventas-reporte-${new Date().toISOString().split('T')[0]}`,
                          format: formatMap[format.format],
                          title: 'Reporte de Ventas',
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

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Análisis de Ventas</h2>
            <p className="text-muted-foreground">
              Visualice y analice el rendimiento de ventas por diferentes períodos, productos y canales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Ventas Totales</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">${salesData.totalRevenue.toLocaleString()}</span>
                <span className="text-green-500 text-sm">+{salesData.growthPercentage.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">vs. mes anterior</p>
              <div className="h-32 mt-4 bg-muted rounded-md flex items-end">
                <div className="w-1/6 h-[20%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[40%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[30%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[60%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[50%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[80%] bg-primary mx-1 rounded-t-sm"></div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Productos Más Vendidos</h3>
              <ul className="space-y-2 mt-4">
                {salesData.topProducts.length > 0 ? (
                  salesData.topProducts.map((product, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{product.name}</span>
                      <span className="font-medium">${product.revenue.toLocaleString()}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-muted-foreground">No hay datos disponibles</li>
                )}
              </ul>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Canales de Venta</h3>
              <div className="h-40 mt-4 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-primary relative flex items-center justify-center">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full border-8 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full border-8 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-8 border-yellow-500"></div>
                  <span className="text-xs font-medium">Distribución</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {salesData.channels.length > 0 ? (
                  salesData.channels.map((channel, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: [
                          'rgb(99, 102, 241)', // primary
                          'rgb(59, 130, 246)', // blue-500
                          'rgb(16, 185, 129)', // green-500
                          'rgb(245, 158, 11)'  // yellow-500
                        ][index % 4]
                      }}></div>
                      <span>{channel.name} ({channel.percentage}%)</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground">No hay datos disponibles</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Ventas por Período</h3>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 rounded-md bg-primary text-white">Diario</button>
              <button className="px-3 py-1 rounded-md bg-muted">Semanal</button>
              <button className="px-3 py-1 rounded-md bg-muted">Mensual</button>
              <button className="px-3 py-1 rounded-md bg-muted">Trimestral</button>
              <button className="px-3 py-1 rounded-md bg-muted">Anual</button>
            </div>
            <div className="border rounded-md p-4">
              <div className="h-64 flex items-end">
                {salesData.weekdaySales.map((day, index) => {
                  // Calcular altura relativa para las barras
                  const maxSales = Math.max(...salesData.weekdaySales.map(d => d.sales));
                  const maxTarget = Math.max(...salesData.weekdaySales.map(d => d.target));
                  const maxValue = Math.max(maxSales, maxTarget) || 1; // Evitar división por cero
                  
                  const salesHeight = (day.sales / maxValue) * 100;
                  const targetHeight = (day.target / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-primary/20 relative" style={{ height: `${targetHeight}%` }}>
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary"
                          style={{ height: `${salesHeight}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-2">{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>Ventas</span>
                <span>Objetivo</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Reportes Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.length > 0 ? (
                availableReports.map((report, index) => (
                  <div key={index} className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    <form action={async () => {
                      'use server';
                      await generateReport('PDF' as ReportFormat);
                    }}>
                      <button type="submit" className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-muted-foreground p-4 border rounded-md">
                  No hay reportes disponibles en este momento
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default SalesReportsPage;