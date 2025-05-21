"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function PerformanceReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [performanceData, setPerformanceData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulación de carga de datos
        const loadData = async () => {
            try {
                // En una implementación real, aquí se llamaría a la API
                // await PerformanceReportService.getPerformanceStats(agencyId)

                // Datos de ejemplo
                setPerformanceData({
                    kpis: {
                        salesVsTarget: 85,
                        customerSatisfaction: 92,
                        operationalEfficiency: 78,
                        customerRetention: 88,
                    },
                    departmentPerformance: {
                        sales: 45,
                        operations: 25,
                        marketing: 20,
                        support: 10,
                    },
                    performanceTrend: 12.5,
                    teamPerformance: [
                        {
                            name: "Ana Martínez",
                            department: "Ventas",
                            productivity: 95,
                            quality: 90,
                            punctuality: 85,
                            rating: "Excelente",
                        },
                        {
                            name: "Carlos Rodríguez",
                            department: "Operaciones",
                            productivity: 85,
                            quality: 88,
                            punctuality: 75,
                            rating: "Bueno",
                        },
                        {
                            name: "Laura Gómez",
                            department: "Marketing",
                            productivity: 70,
                            quality: 92,
                            punctuality: 88,
                            rating: "Bueno",
                        },
                        {
                            name: "Miguel Torres",
                            department: "Soporte",
                            productivity: 82,
                            quality: 95,
                            punctuality: 90,
                            rating: "Excelente",
                        },
                    ],
                    availableReports: [
                        {
                            title: "Reporte de Productividad",
                            description: "Análisis detallado de la productividad por empleado y departamento.",
                        },
                        {
                            title: "Reporte de Eficiencia",
                            description: "Análisis de la eficiencia operativa y uso de recursos.",
                        },
                        {
                            title: "Reporte de Calidad",
                            description: "Análisis de la calidad del trabajo y servicios prestados.",
                        },
                        {
                            title: "Reporte de Objetivos",
                            description: "Seguimiento de objetivos y metas por departamento.",
                        },
                        {
                            title: "Reporte de Capacitación",
                            description: "Análisis de necesidades de capacitación y desarrollo.",
                        },
                        {
                            title: "Reporte de Tendencias",
                            description: "Análisis de tendencias de desempeño a lo largo del tiempo.",
                        },
                    ],
                })

                setIsLoading(false)
            } catch (error) {
                console.error("Error al cargar datos de desempeño:", error)
                setIsLoading(false)
            }
        }

        loadData()
    }, [agencyId, dateRange])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">KPIs Generales</h3>
                    <div className="space-y-4 mt-4">
                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Ventas vs. Objetivo</span>
                                <span className="font-medium">{performanceData.kpis.salesVsTarget}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${performanceData.kpis.salesVsTarget}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Satisfacción del Cliente</span>
                                <span className="font-medium">{performanceData.kpis.customerSatisfaction}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${performanceData.kpis.customerSatisfaction}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Eficiencia Operativa</span>
                                <span className="font-medium">{performanceData.kpis.operationalEfficiency}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${performanceData.kpis.operationalEfficiency}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Retención de Clientes</span>
                                <span className="font-medium">{performanceData.kpis.customerRetention}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${performanceData.kpis.customerRetention}%` }}
                                ></div>
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
                            <span>Ventas ({performanceData.departmentPerformance.sales}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Operaciones ({performanceData.departmentPerformance.operations}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Marketing ({performanceData.departmentPerformance.marketing}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Soporte ({performanceData.departmentPerformance.support}%)</span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Tendencia de Desempeño</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">+{performanceData.performanceTrend}%</span>
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
                            {performanceData.teamPerformance.map((employee: any, index: number) => (
                                <tr key={index} className="border-t">
                                    <td className="p-3">{employee.name}</td>
                                    <td className="p-3">{employee.department}</td>
                                    <td className="p-3">
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className={`${employee.productivity >= 90 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                style={{ width: `${employee.productivity}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className={`${employee.quality >= 90 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                style={{ width: `${employee.quality}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className={`${employee.punctuality >= 85 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                style={{ width: `${employee.punctuality}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`text-xs ${employee.rating === "Excelente" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} px-2 py-1 rounded-full`}
                                        >
                                            {employee.rating}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-medium text-lg mb-4">Reportes Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performanceData.availableReports.map((report: any, index: number) => (
                        <div key={index} className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                            <h4 className="font-medium">{report.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            <Button variant="link" className="mt-4 p-0 h-auto text-primary text-sm hover:underline">
                                Generar Reporte
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
