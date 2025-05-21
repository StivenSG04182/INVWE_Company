"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/charts"
import { Download, FileText, RefreshCw } from "lucide-react"

interface SalesReportProps {
    agencyId: string
}

export default function SalesReport({ agencyId }: SalesReportProps) {
    const [dateRange, setDateRange] = useState("month")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [reportData, setReportData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState("chart")
    const [chartType, setChartType] = useState("bar")

    // Cargar datos del reporte
    useEffect(() => {
        loadReportData()
    }, [agencyId, dateRange, startDate, endDate])

    const loadReportData = async () => {
        try {
            setIsLoading(true)

            let url = `/api/reports/${agencyId}?type=sales&dateRange=${dateRange}`

            if (dateRange === "custom" && startDate && endDate) {
                url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            }

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setReportData(result.data)
            } else {
                console.error("Error al cargar reporte:", result.error)
            }
        } catch (error) {
            console.error("Error al cargar reporte:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Exportar reporte a CSV
    const exportToCSV = async () => {
        try {
            let url = `/api/reports/${agencyId}?type=sales&dateRange=${dateRange}&format=csv`

            if (dateRange === "custom" && startDate && endDate) {
                url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            }

            window.open(url, "_blank")
        } catch (error) {
            console.error("Error al exportar reporte:", error)
        }
    }

    // Preparar datos para gráficos
    const chartData = {
        labels: reportData.map((item) => item.date),
        datasets: [
            {
                label: "Ventas",
                data: reportData.map((item) => item.totalSales),
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
            },
            {
                label: "Ingresos",
                data: reportData.map((item) => item.totalRevenue),
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgb(16, 185, 129)",
            },
        ],
    }

    // Calcular totales
    const totals = reportData.reduce(
        (acc, item) => {
            acc.totalSales += item.totalSales
            acc.totalRevenue += item.totalRevenue
            acc.itemsSold += item.itemsSold
            return acc
        },
        { totalSales: 0, totalRevenue: 0, itemsSold: 0 },
    )

    const averageTicket = totals.totalSales > 0 ? totals.totalRevenue / totals.totalSales : 0

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Reporte de Ventas</CardTitle>
                        <CardDescription>Análisis de ventas por período</CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="week">Última semana</SelectItem>
                                <SelectItem value="month">Este mes</SelectItem>
                                <SelectItem value="year">Este año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>

                        {dateRange === "custom" && (
                            <div className="flex gap-2">
                                <DatePicker date={startDate} setDate={setStartDate} placeholder="Fecha inicial" />
                                <DatePicker date={endDate} setDate={setEndDate} placeholder="Fecha final" />
                            </div>
                        )}

                        <Button variant="outline" size="icon" onClick={loadReportData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>

                        <Button variant="outline" onClick={exportToCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Resumen de totales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{totals.totalSales}</div>
                            <p className="text-muted-foreground">Total de ventas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${totals.totalRevenue.toFixed(2)}</div>
                            <p className="text-muted-foreground">Ingresos totales</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${averageTicket.toFixed(2)}</div>
                            <p className="text-muted-foreground">Ticket promedio</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{totals.itemsSold}</div>
                            <p className="text-muted-foreground">Productos vendidos</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs para cambiar entre vista de gráfico y tabla */}
                <Tabs value={view} onValueChange={setView}>
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="chart">Gráfico</TabsTrigger>
                            <TabsTrigger value="table">Tabla</TabsTrigger>
                        </TabsList>

                        {view === "chart" && (
                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Tipo de gráfico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bar">Barras</SelectItem>
                                    <SelectItem value="line">Líneas</SelectItem>
                                    <SelectItem value="pie">Circular</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <TabsContent value="chart" className="mt-0">
                        <div className="h-[400px]">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : reportData.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mb-2 opacity-20" />
                                    <p>No hay datos disponibles para el período seleccionado</p>
                                </div>
                            ) : (
                                <>
                                    {chartType === "bar" && <BarChart data={chartData} />}
                                    {chartType === "line" && <LineChart data={chartData} />}
                                    {chartType === "pie" && (
                                        <PieChart
                                            data={{
                                                labels: reportData.map((item) => item.date),
                                                datasets: [
                                                    {
                                                        label: "Ventas",
                                                        data: reportData.map((item) => item.totalSales),
                                                        backgroundColor: [
                                                            "rgba(59, 130, 246, 0.5)",
                                                            "rgba(16, 185, 129, 0.5)",
                                                            "rgba(249, 115, 22, 0.5)",
                                                            "rgba(236, 72, 153, 0.5)",
                                                            "rgba(139, 92, 246, 0.5)",
                                                        ],
                                                    },
                                                ],
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="py-3 px-4 text-left font-medium">Fecha</th>
                                            <th className="py-3 px-4 text-left font-medium">Ventas</th>
                                            <th className="py-3 px-4 text-left font-medium">Ingresos</th>
                                            <th className="py-3 px-4 text-left font-medium">Ticket Promedio</th>
                                            <th className="py-3 px-4 text-left font-medium">Productos Vendidos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center">
                                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                                </td>
                                            </tr>
                                        ) : reportData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-muted-foreground">
                                                    No hay datos disponibles para el período seleccionado
                                                </td>
                                            </tr>
                                        ) : (
                                            reportData.map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-4">{item.date}</td>
                                                    <td className="py-3 px-4">{item.totalSales}</td>
                                                    <td className="py-3 px-4">${item.totalRevenue.toFixed(2)}</td>
                                                    <td className="py-3 px-4">${item.averageTicket.toFixed(2)}</td>
                                                    <td className="py-3 px-4">{item.itemsSold}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
