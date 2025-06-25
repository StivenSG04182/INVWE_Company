"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownToLine, Calendar, TrendingUp, TrendingDown, DollarSign, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { RosenChart } from "@/components/ui/rosen-chart"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getFinancialReportsData } from "@/lib/reports-queries"

interface FinancialReportsProps {
    agencyId: string
    user: any
    dateRange: string
}

export default function FinancialReports({ agencyId, user, dateRange }: FinancialReportsProps) {
    const [financialData, setFinancialData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [availableReports, setAvailableReports] = useState<any[]>([])

    const loadFinancialData = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getFinancialReportsData(agencyId, dateRange)
            setFinancialData(data)
            setAvailableReports(data.availableReports || [])
        } catch (error) {
            console.error("Error loading financial data:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos financieros",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, dateRange])

    useEffect(() => {
        loadFinancialData()
    }, [loadFinancialData])

    const downloadReport = async (reportType: string) => {
        try {
            // Aquí se implementaría la descarga usando las funciones de reports-queries
            toast({
                title: "Descarga iniciada",
                description: "El reporte se está generando",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo descargar el reporte",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!financialData) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No hay datos financieros disponibles</p>
            </div>
        )
    }

    // Configuración de gráficos para RosenCharts
    const revenueVsExpensesConfig = {
        type: "bar",
        data: {
            labels: financialData.monthlyFinancials?.map((item: any) => item.month) || [],
            datasets: [
                {
                    label: "Ingresos",
                    data: financialData.monthlyFinancials?.map((item: any) => item.revenue) || [],
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                },
                {
                    label: "Gastos",
                    data: financialData.monthlyFinancials?.map((item: any) => item.expenses) || [],
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                    borderColor: "rgb(239, 68, 68)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: "Ingresos vs Gastos Mensuales",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => "$" + value.toLocaleString(),
                    },
                },
            },
        },
    }

    const expenseDistributionConfig = {
        type: "doughnut",
        data: {
            labels: financialData.expenseCategories?.map((cat: any) => cat.name) || [],
            datasets: [
                {
                    data: financialData.expenseCategories?.map((cat: any) => cat.amount) || [],
                    backgroundColor: [
                        "rgba(239, 68, 68, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                    ],
                    borderColor: [
                        "rgb(239, 68, 68)",
                        "rgb(245, 158, 11)",
                        "rgb(59, 130, 246)",
                        "rgb(16, 185, 129)",
                        "rgb(139, 92, 246)",
                    ],
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right" as const,
                },
                title: {
                    display: true,
                    text: "Distribución de Gastos",
                },
            },
        },
    }

    return (
        <div className="space-y-6">
            {/* Panel de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Ingresos Totales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">
                            ${financialData.totalRevenue?.toLocaleString() || "0"}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Gastos Totales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-800">
                            ${financialData.totalExpenses?.toLocaleString() || "0"}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
                            <span className="text-red-600">vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Beneficio Neto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">${financialData.netProfit?.toLocaleString() || "0"}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Margen de Beneficio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-800">{financialData.profitMargin || 0}%</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos con RosenCharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Ingresos vs Gastos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={revenueVsExpensesConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Distribución de Gastos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={expenseDistributionConfig} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transacciones recientes */}
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <ArrowDownToLine className="h-5 w-5 text-purple-600" />
                            Transacciones Recientes
                        </CardTitle>
                        <Link href="#" className="text-sm text-primary hover:underline">
                            Ver todas
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium">Descripción</th>
                                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                                    <th className="text-left py-3 px-4 font-medium">Monto</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData.recentTransactions?.length > 0 ? (
                                    financialData.recentTransactions.map((transaction: any) => (
                                        <tr key={transaction.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-medium">{transaction.description}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={transaction.type === "ingreso" ? "default" : "destructive"}
                                                    className="flex items-center gap-1 w-fit"
                                                >
                                                    {transaction.type === "ingreso" ? (
                                                        <TrendingUp className="h-3 w-3" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3" />
                                                    )}
                                                    {transaction.type === "ingreso" ? "Ingreso" : "Gasto"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`font-semibold ${transaction.type === "ingreso" ? "text-green-600" : "text-red-600"
                                                        }`}
                                                >
                                                    {transaction.type === "ingreso" ? "+" : "-"}${transaction.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">{transaction.date}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => downloadReport(transaction.id)}>
                                                    <ArrowDownToLine className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No hay transacciones recientes disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Reportes disponibles */}
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Reportes Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableReports.length > 0 ? (
                            availableReports.map((report: any, index: number) => (
                                <Card
                                    key={index}
                                    className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-md"
                                >
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-lg mb-2">{report.title}</h4>
                                        <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => downloadReport(report.id)}>
                                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                                            Generar Reporte
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-muted-foreground p-8 border-2 border-dashed border-muted rounded-lg">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay reportes disponibles en este momento</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
