import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import Link from 'next/link';
import { ArrowUpRight, Download, FileSpreadsheet, FileText, PieChart } from 'lucide-react';
import { ReportFormat, ReportType } from '@prisma/client';
import { ReportService } from '@/lib/services/report-service';
import { exportData, prepareTableDataForExport } from '@/lib/utils/export-utils';

const ReportsPage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails();
    if (!user) return redirect('/sign-in');

    const agencyId = params.agencyId;
    if (!user.Agency) {
        return redirect('/agency');
    }

    // Tipos de reportes disponibles
    const reportTypes = [
        {
            title: 'Reportes de Inventario',
            description: 'Análisis detallado del inventario, rotación de productos y niveles de stock',
            icon: <FileText className="h-8 w-8 text-primary" />,
            link: `/agency/${agencyId}/inventory-reports`,
            color: 'from-blue-500 to-cyan-400',
        },
        {
            title: 'Reportes de Ventas',
            description: 'Análisis de ventas por período, producto, cliente y canal',
            icon: <PieChart className="h-8 w-8 text-primary" />,
            link: `/agency/${agencyId}/sales-reports`,
            color: 'from-purple-500 to-pink-400',
        },
        {
            title: 'Reportes de Rendimiento',
            description: 'Métricas de rendimiento, KPIs y análisis de objetivos',
            icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
            link: `/agency/${agencyId}/performance`,
            color: 'from-amber-500 to-orange-400',
        },
    ];

    // Formatos de exportación disponibles
    const exportFormats = [
        { name: 'PDF', icon: '📄', format: 'PDF' as ReportFormat },
        { name: 'Excel', icon: '📊', format: 'EXCEL' as ReportFormat },
        { name: 'CSV', icon: '📝', format: 'CSV' as ReportFormat },
        { name: 'JSON', icon: '🔢', format: 'JSON' as ReportFormat },
    ];
    
    // Función para generar y exportar un reporte
    const generateAndExportReport = async (format: ReportFormat) => {
        'use server';
        try {
            // Preparar datos para exportación
            const exportableData = prepareTableDataForExport([{
                reportTypes: JSON.stringify(reportTypes),
                date: new Date().toISOString()
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
                fileName: `reporte-general-${new Date().toISOString().split('T')[0]}`,
                format: formatMap[format],
                title: 'Reporte General INVWE',
                subtitle: `Generado el ${new Date().toLocaleString()}`,
                author: user.name || 'Usuario INVWE'
            });
            
            // Guardar el reporte en la base de datos
            await ReportService.saveReport({
                name: `Reporte General - ${new Date().toLocaleDateString()}`,
                description: 'Reporte general del sistema',
                type: 'GENERAL' as ReportType,
                format,
                content: { reportTypes },
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
            <div className="flex flex-col gap-8 p-6">
                {/* Encabezado con título y descripción */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Centro de Reportes INVWE</h1>
                    <p className="text-muted-foreground text-lg max-w-3xl">
                        Visualiza, analiza y exporta datos críticos de tu negocio con nuestras herramientas avanzadas de reportes
                    </p>
                </div>

                {/* Tarjetas de tipos de reportes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reportTypes.map((report, index) => (
                        <Link
                            href={report.link}
                            key={index}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br bg-opacity-10 p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${report.color}"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-4">{report.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{report.title}</h3>
                                <p className="text-muted-foreground mb-4 flex-grow">{report.description}</p>
                                <div className="flex items-center text-sm text-primary font-medium">
                                    <span>Ver reportes</span>
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Sección de visualizaciones estadísticas */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6">Tipos de Visualizaciones Disponibles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gráfico Radial */}
                        <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <h3 className="text-xl font-semibold mb-3">Gráfico Radial o de Telaraña</h3>
                            <p className="text-muted-foreground mb-4">Se construye utilizando ejes radiales que se extienden desde el origen inicial, ideal para comparar múltiples variables.</p>
                            <div className="aspect-square max-w-xs mx-auto bg-muted rounded-full relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3/4 h-3/4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full"></div>
                                    <div className="absolute w-2/3 h-2/3 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full"></div>
                                    <div className="absolute w-1/2 h-1/2 bg-gradient-to-br from-primary/40 to-purple-500/40 rounded-full"></div>
                                    <div className="absolute w-1/3 h-1/3 bg-gradient-to-br from-primary/50 to-purple-500/50 rounded-full"></div>
                                    {/* Líneas radiales */}
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full h-[1px] bg-border origin-center"
                                            style={{ transform: `rotate(${i * 45}deg)` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Histograma */}
                        <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <h3 className="text-xl font-semibold mb-3">Histograma</h3>
                            <p className="text-muted-foreground mb-4">Indica la distribución de una variable continua mediante ejes cartesianos, perfecto para analizar la frecuencia de datos.</p>
                            <div className="h-48 flex items-end justify-between gap-2 p-4 bg-muted/30 rounded-md">
                                {[35, 65, 45, 80, 55, 70, 40, 90, 60, 50].map((height, index) => (
                                    <div
                                        key={index}
                                        className="w-full bg-gradient-to-t from-primary to-purple-500 rounded-t-sm"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Cartograma */}
                        <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <h3 className="text-xl font-semibold mb-3">Cartograma</h3>
                            <p className="text-muted-foreground mb-4">Ilustra datos referidos a áreas geográficas o zonas en las que se visualiza una menor o mayor frecuencia.</p>
                            <div className="aspect-video bg-muted/30 rounded-md p-4 relative">
                                {/* Simulación simplificada de un mapa */}
                                <div className="absolute top-[20%] left-[10%] w-[25%] h-[30%] bg-primary/20 rounded-md border border-primary/40"></div>
                                <div className="absolute top-[30%] left-[40%] w-[20%] h-[40%] bg-purple-500/40 rounded-md border border-purple-500/60"></div>
                                <div className="absolute top-[15%] right-[15%] w-[20%] h-[25%] bg-blue-500/30 rounded-md border border-blue-500/50"></div>
                                <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[20%] bg-amber-500/20 rounded-md border border-amber-500/40"></div>
                                <div className="absolute bottom-[15%] right-[10%] w-[25%] h-[35%] bg-green-500/30 rounded-md border border-green-500/50"></div>
                            </div>
                        </div>

                        {/* Gráfico de Dispersión */}
                        <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <h3 className="text-xl font-semibold mb-3">Gráfico de Dispersión</h3>
                            <p className="text-muted-foreground mb-4">Representa los datos en forma de puntos, ideal para mostrar la relación entre dos variables continuas.</p>
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
                        </div>
                    </div>
                </div>

                {/* Sección de formatos de exportación */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-6">Exportar Reportes</h2>
                    <div className="bg-card rounded-xl p-6 border border-border">
                        <p className="text-muted-foreground mb-6">Todos nuestros reportes pueden ser exportados en los siguientes formatos:</p>
                        <div className="flex flex-wrap gap-4">
                            {exportFormats.map((format, index) => (
                                <form 
                                    key={index}
                                    action={async () => {
                                        'use server';
                                        await generateAndExportReport(format.format);
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-primary/10 border border-border hover:border-primary transition-colors"
                                    >
                                        <span className="text-xl">{format.icon}</span>
                                        <span>{format.name}</span>
                                        <Download className="h-4 w-4 ml-1" />
                                    </button>
                                </form>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BlurPage>
    );
};

export default ReportsPage;