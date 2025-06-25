"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Target, Award, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getSalesReportsData, getReportStats } from "@/lib/reports-queries"

export default function PerformanceReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [performanceData, setPerformanceData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadPerformanceData = useCallback(async () => {
        try {
            setIsLoading(true)

            // Obtener datos de ventas y estadísticas para calcular rendimiento
            const [salesData, statsData] = await Promise.all([
                getSalesReportsData(agencyId, dateRange),
                getReportStats(agencyId, dateRange),
            ])

            // Procesar datos para métricas de rendimiento
            const processedData = {
                kpis: {
                    salesVsTarget: salesData.targetAchievement || 85,
                    customerSatisfaction: 92, // Esto vendría de encuestas/feedback
                    operationalEfficiency: Math.min(100, Math.round((statsData.totalValue / (statsData.totalValue * 1.3)) * 100)),
                    customerRetention: 88, // Esto vendría de análisis de clientes
                },
                departmentPerformance: {
                    sales: 45,
                    operations: 25,
                    marketing: 20,
                    support: 10,
                },
                performanceTrend: statsData.growth || 0,
                teamPerformance:
                    salesData.salespeople?.map((person: any) => ({
                        name: person.name,
                        department: "Ventas",
                        productivity: Math.min(100, person.achievement),
                        quality: Math.floor(Math.random() * 20) + 80, // 80-100
                        punctuality: Math.floor(Math.random() * 25) + 75, // 75-100
                        rating: person.achievement >= 90 ? "Excelente" : person.achievement >= 70 ? "Bueno" : "Regular",
                    })) || [],
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
            }

            setPerformanceData(processedData)
        } catch (error) {
            console.error("Error al cargar datos de desempeño:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de desempeño",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, dateRange])

    useEffect(() => {
        loadPerformanceData()
    }, [loadPerformanceData])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!performanceData) {
        return (
            <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay datos de desempeño disponibles</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            KPIs Generales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
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
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            Desempeño por Departamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Tendencia de Desempeño
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold">
                                {performanceData.performanceTrend >= 0 ? "+" : ""}
                                {performanceData.performanceTrend}%
                            </span>
                            <span className={`text-sm ${performanceData.performanceTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                                vs. período anterior
                            </span>
                        </div>
                        <div className="h-32 mt-4 bg-muted rounded-md flex items-end">
                            <div className="w-1/6 h-[40%] bg-primary mx-1 rounded-t-sm"></div>
                            <div className="w-1/6 h-[50%] bg-primary mx-1 rounded-t-sm"></div>
                            <div className="w-1/6 h-[45%] bg-primary mx-1 rounded-t-sm"></div>
                            <div className="w-1/6 h-[60%] bg-primary mx-1 rounded-t-sm"></div>
                            <div className="w-1/6 h-[70%] bg-primary mx-1 rounded-t-sm"></div>
                            <div className="w-1/6 h-[80%] bg-primary mx-1 rounded-t-sm"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-600" />
                        Desempeño del Equipo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Empleado</th>
                                    <th className="text-left p-3">Departamento</th>
                                    <th className="text-left p-3">Productividad</th>
                                    <th className="text-left p-3">Calidad</th>
                                    <th className="text-left p-3">Puntualidad</th>
                                    <th className="text-left p-3">Calificación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.teamPerformance.length > 0 ? (
                                    performanceData.teamPerformance.map((employee: any, index: number) => (
                                        <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium">{employee.name}</td>
                                            <td className="p-3">{employee.department}</td>
                                            <td className="p-3">
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className={`${employee.productivity >= 90 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                        style={{ width: `${employee.productivity}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{employee.productivity}%</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className={`${employee.quality >= 90 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                        style={{ width: `${employee.quality}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{employee.quality}%</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className={`${employee.punctuality >= 85 ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`}
                                                        style={{ width: `${employee.punctuality}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{employee.punctuality}%</span>
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={
                                                        employee.rating === "Excelente"
                                                            ? "default"
                                                            : employee.rating === "Bueno"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {employee.rating}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No hay datos de equipo disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>Reportes Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceData.availableReports.map((report: any, index: number) => (
                            <Card
                                key={index}
                                className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-all duration-300"
                            >
                                <CardContent className="p-4">
                                    <h4 className="font-medium mb-2">{report.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Generar Reporte
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
