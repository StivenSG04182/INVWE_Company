"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Users, ShoppingCart, Target, Award, Calendar, Loader2, Download } from "lucide-react"
import { RosenChart } from "@/components/ui/rosen-chart"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSalesReportsData, exportReportData } from "@/lib/reports-queries"

interface SalesReportsProps {
    agencyId: string
    user: any
    dateRange: string
}

export default function SalesReports({ agencyId, user, dateRange }: SalesReportsProps) {
    const [salesData, setSalesData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState("month")
    const [selectedSalesperson, setSelectedSalesperson] = useState("all")

    const loadSalesData = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getSalesReportsData(agencyId, selectedPeriod, selectedSalesperson)
            setSalesData(data)
        } catch (error) {
            console.error("Error loading sales data:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de ventas",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, selectedPeriod, selectedSalesperson])

    useEffect(() => {
        loadSalesData()
    }, [loadSalesData])

    const exportSales = async (format: string) => {
        try {
            await exportReportData(agencyId, "sales", format, selectedPeriod, {
                salesperson: selectedSalesperson,
            })

            toast({
                title: "Exportación exitosa",
                description: `Reporte de ventas exportado en formato ${format}`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo exportar el reporte",
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

    if (!salesData) {
        return (
            <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
            </div>
        )
    }

    // Configuración de gráficos
    const salesTrendConfig = {
        type: "line",
        data: {
            labels: salesData.salesTrend?.map((item: any) => item.period) || [],
            datasets: [
                {
                    label: "Ventas",
                    data: salesData.salesTrend?.map((item: any) => item.sales) || [],
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: "Objetivo",
                    data: salesData.salesTrend?.map((item: any) => item.target) || [],
                    borderColor: "rgb(239, 68, 68)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderDash: [5, 5],
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Tendencia de Ventas vs Objetivos" },
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

    const topProductsConfig = {
        type: "bar",
        data: {
            labels: salesData.topProducts?.map((item: any) => item.name) || [],
            datasets: [
                {
                    label: "Cantidad Vendida",
                    data: salesData.topProducts?.map((item: any) => item.quantity) || [],
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y" as const,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Top 10 Productos Más Vendidos" },
            },
            scales: {
                x: { beginAtZero: true },
            },
        },
    }

    const salesByChannelConfig = {
        type: "doughnut",
        data: {
            labels: salesData.salesByChannel?.map((item: any) => item.channel) || [],
            datasets: [
                {
                    data: salesData.salesByChannel?.map((item: any) => item.amount) || [],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                    ],
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "right" as const },
                title: { display: true, text: "Ventas por Canal" },
            },
        },
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Filtros de Ventas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Esta semana</SelectItem>
                                <SelectItem value="month">Este mes</SelectItem>
                                <SelectItem value="quarter">Este trimestre</SelectItem>
                                <SelectItem value="year">Este año</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Vendedor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los vendedores</SelectItem>
                                {salesData.salespeople?.map((person: any) => (
                                    <SelectItem key={person.id} value={person.id}>
                                        {person.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => exportSales("PDF")}>📄 Exportar PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportSales("EXCEL")}>📊 Exportar Excel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportSales("CSV")}>📝 Exportar CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Ventas Totales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">${salesData.totalSales?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">+{salesData.salesGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Número de Ventas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">
                            {salesData.totalTransactions?.toLocaleString() || 0}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">+{salesData.transactionsGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Ticket Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">${salesData.averageTicket?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-purple-600" />
                            <span className="text-purple-600">+{salesData.ticketGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Cumplimiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-800">{salesData.targetAchievement || 0}%</div>
                        <div className="mt-2 flex items-center text-sm">
                            <Target className="h-3 w-3 mr-1 text-amber-600" />
                            <span className="text-amber-600">del objetivo mensual</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tendencia de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={salesTrendConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ventas por Canal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={salesByChannelConfig} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={topProductsConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rendimiento por Vendedor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {salesData.salespeople?.length > 0 ? (
                                salesData.salespeople.map((person: any) => (
                                    <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {person.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{person.name}</h4>
                                                <p className="text-sm text-muted-foreground">{person.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">${person.totalSales?.toLocaleString()}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={person.achievement >= 100 ? "default" : "secondary"}>
                                                    {person.achievement}% objetivo
                                                </Badge>
                                                {person.achievement >= 100 && <Award className="h-4 w-4 text-yellow-500" />}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No hay datos de vendedores disponibles</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de ventas recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">Número</th>
                                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                                    <th className="text-left py-3 px-4 font-medium">Vendedor</th>
                                    <th className="text-left py-3 px-4 font-medium">Total</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.recentSales?.length > 0 ? (
                                    salesData.recentSales.map((sale: any) => (
                                        <tr key={sale.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4 font-medium">{sale.saleNumber}</td>
                                            <td className="py-3 px-4">{sale.customerName || "Cliente anónimo"}</td>
                                            <td className="py-3 px-4">{sale.salesperson}</td>
                                            <td className="py-3 px-4 font-bold text-green-600">${sale.total?.toLocaleString()}</td>
                                            <td className="py-3 px-4">{sale.date}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={sale.status === "completed" ? "default" : "secondary"}>
                                                    {sale.status === "completed" ? "Completada" : "Pendiente"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No hay ventas recientes disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
