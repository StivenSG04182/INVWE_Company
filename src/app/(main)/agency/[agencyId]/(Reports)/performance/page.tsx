import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { ReportFormat, ReportType } from '@prisma/client';
import { ReportService, PerformanceReportService } from '@/lib/services/report-service';
import { exportData, prepareTableDataForExport } from '@/lib/utils/export-utils';

const PerformancePage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Desempeño</h1>
          <div className="flex gap-2">
            <form action={async () => {
              'use server';
              // Generar reporte en PDF
              await ReportService.saveReport({
                name: `Reporte de Desempeño - ${new Date().toLocaleDateString()}`,
                description: 'Análisis detallado del desempeño del negocio',
                type: 'PERFORMANCE' as ReportType,
                format: 'PDF' as ReportFormat,
                content: {},
                agencyId
              });
            }}>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
                Generar Reporte
              </button>
            </form>
            <form action={async () => {
              'use server';
              // Exportar datos
              const exportableData = prepareTableDataForExport([{
                kpis: 'Datos de KPIs',
                departamentos: 'Datos de departamentos',
                tendencias: 'Datos de tendencias',
                equipo: 'Datos del equipo'
              }]);
              
              exportData(exportableData, {
                fileName: `desempeño-reporte-${new Date().toISOString().split('T')[0]}`,
                format: 'excel',
                title: 'Reporte de Desempeño',
                subtitle: `Generado el ${new Date().toLocaleString()}`,
                author: user.name || 'Usuario INVWE'
              });
            }}>
              <button type="submit" className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
                Exportar Datos
              </button>
            </form>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Análisis de Desempeño</h2>
            <p className="text-muted-foreground">
              Visualice y analice el rendimiento general de su negocio, empleados y operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">KPIs Generales</h3>
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Ventas vs. Objetivo</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Satisfacción del Cliente</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Eficiencia Operativa</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Retención de Clientes</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Desempeño por Departamento</h3>
              <div className="h-40 mt-4 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-primary relative flex items-center justify-center">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full border-8 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full border-8 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-8 border-yellow-500"></div>
                  <span className="text-xs font-medium">Distribución</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Ventas (45%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Operaciones (25%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Marketing (20%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Soporte (10%)</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">Tendencia de Desempeño</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">+12.5%</span>
                <span className="text-green-500 text-sm">vs. trimestre anterior</span>
              </div>
              <div className="h-32 mt-4 bg-muted rounded-md flex items-end">
                <div className="w-1/6 h-[40%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[50%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[45%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[60%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[70%] bg-primary mx-1 rounded-t-sm"></div>
                <div className="w-1/6 h-[80%] bg-primary mx-1 rounded-t-sm"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Desempeño del Equipo</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Empleado</th>
                    <th className="text-left p-3">Departamento</th>
                    <th className="text-left p-3">Productividad</th>
                    <th className="text-left p-3">Calidad</th>
                    <th className="text-left p-3">Puntualidad</th>
                    <th className="text-left p-3">Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">Ana Martínez</td>
                    <td className="p-3">Ventas</td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Excelente</span>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Carlos Rodríguez</td>
                    <td className="p-3">Operaciones</td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Bueno</span>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Laura Gómez</td>
                    <td className="p-3">Marketing</td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Bueno</span>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Miguel Torres</td>
                    <td className="p-3">Soporte</td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Excelente</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Reportes Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Productividad</h4>
                <p className="text-sm text-muted-foreground mt-1">Análisis detallado de la productividad por empleado y departamento.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Eficiencia</h4>
                <p className="text-sm text-muted-foreground mt-1">Análisis de la eficiencia operativa y uso de recursos.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Calidad</h4>
                <p className="text-sm text-muted-foreground mt-1">Análisis de la calidad del trabajo y servicios prestados.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Objetivos</h4>
                <p className="text-sm text-muted-foreground mt-1">Seguimiento de objetivos y metas por departamento.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Capacitación</h4>
                <p className="text-sm text-muted-foreground mt-1">Análisis de necesidades de capacitación y desarrollo.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium">Reporte de Tendencias</h4>
                <p className="text-sm text-muted-foreground mt-1">Análisis de tendencias de desempeño a lo largo del tiempo.</p>
                <button className="mt-4 text-primary text-sm hover:underline">Generar Reporte</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default PerformancePage;