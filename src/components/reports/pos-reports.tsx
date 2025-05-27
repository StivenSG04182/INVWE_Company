"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Clock, Users, TrendingUp, DollarSign, ShoppingCart, Timer, Loader2, Download } from "lucide-react"
import { RosenChart } from "@/components/ui/rosen-chart"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPosReportsData, exportReportData } from "@/lib/reports-queries"

interface PosReportsProps {
    agencyId: string
    user: any
    dateRange: string
}

export default function PosReports({ agencyId, user, dateRange }: PosReportsProps) {
    const [posData, setPosData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTerminal, setSelectedTerminal] = useState("all")
    const [selectedCashier, setSelectedCashier] = useState("all")

    useEffect(() => {
        loadPosData()
    }, [agencyId, dateRange, selectedTerminal, selectedCashier])

    const loadPosData = async () => {
        try {
            setIsLoading(true)
            const data = await getPosReportsData(agencyId, dateRange, selectedTerminal, selectedCashier)
            setPosData(data)
        } catch (error) {
            console.error("Error loading POS data:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos POS",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const exportPosReport = async (format: string) => {
        try {
            await exportReportData(agencyId, "pos", format, dateRange, {
                terminal: selectedTerminal,
                cashier: selectedCashier,
            })

            toast({
                title: "Exportación exitosa",
                description: `Reporte POS exportado en formato ${format}`,
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

    if (!posData) {
        return (
            <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay datos POS disponibles</p>
            </div>
        )
    }

    // Configuración de gráficos
    const salesByHourConfig = {
        type: "line",
        data: {
            labels: posData.salesByHour?.map((item: any) => item.hour) || [],
            datasets: [
                {
                    label: "Ventas por Hora",
                    data: posData.salesByHour?.map((item: any) => item.amount) || [],
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Ventas por Hora del Día" },
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

    const paymentMethodsConfig = {
        type: "doughnut",
        data: {
            labels: posData.paymentMethods?.map((item: any) => item.method) || [],
            datasets: [
                {
                    data: posData.paymentMethods?.map((item: any) => item.amount) || [],
                    backgroundColor: [
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                        "rgba(236, 72, 153, 0.8)",
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
                title: { display: true, text: "Métodos de Pago" },
            },
        },
    }

    const cashierPerformanceConfig = {
        type: "bar",
        data: {
            labels: posData.cashierPerformance?.map((item: any) => item.name) || [],
            datasets: [
                {
                    label: "Ventas",
                    data: posData.cashierPerformance?.map((item: any) => item.sales) || [],
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                },
                {
                    label: "Transacciones",
                    data: posData.cashierPerformance?.map((item: any) => item.transactions) || [],
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderColor: "rgb(59, 130, 246)",
                    borderWidth: 1,
                    yAxisID: "y1",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Rendimiento por Cajero" },
            },
            scales: {
                y: {
                    type: "linear" as const,
                    display: true,
                    position: "left" as const,
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => "$" + value.toLocaleString(),
                    },
                },
                y1: {
                    type: "linear" as const,
                    display: true,
                    position: "right" as const,
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        },
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Filtros POS
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Terminal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las terminales</SelectItem>
                                {posData.terminals?.map((terminal: any) => (
                                    <SelectItem key={terminal.id} value={terminal.id}>
                                        {terminal.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCashier} onValueChange={setSelectedCashier}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Cajero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los cajeros</SelectItem>
                                {posData.cashiers?.map((cashier: any) => (
                                    <SelectItem key={cashier.id} value={cashier.id}>
                                        {cashier.name}
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
                                <DropdownMenuItem onClick={() => exportPosReport("PDF")}>📄 Exportar PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportPosReport("EXCEL")}>📊 Exportar Excel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportPosReport("CSV")}>📝 Exportar CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Ventas POS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">${posData.totalSales?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">+{posData.salesGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Transacciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">{posData.totalTransactions?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-blue-600" />
                            <span className="text-blue-600">+{posData.transactionsGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            Tiempo Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">{posData.averageTime || 0}min</div>
                        <div className="mt-2 flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1 text-purple-600" />
                            <span className="text-purple-600">por transacción</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Ticket Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-800">${posData.averageTicket?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-amber-600" />
                            <span className="text-amber-600">+{posData.ticketGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ventas por Hora</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={salesByHourConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Métodos de Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={paymentMethodsConfig} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rendimiento por Cajero</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={cashierPerformanceConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Terminales Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {posData.terminals?.length > 0 ? (
                                posData.terminals.map((terminal: any) => (
                                    <div key={terminal.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {terminal.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{terminal.name}</h4>
                                                <p className="text-sm text-muted-foreground">{terminal.location}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">${terminal.sales?.toLocaleString()}</div>
                                            <Badge variant={terminal.status === "active" ? "default" : "secondary"}>
                                                {terminal.status === "active" ? "Activa" : "Inactiva"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No hay terminales disponibles</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de transacciones recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Transacciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">ID Transacción</th>
                                    <th className="text-left py-3 px-4 font-medium">Terminal</th>
                                    <th className="text-left py-3 px-4 font-medium">Cajero</th>
                                    <th className="text-left py-3 px-4 font-medium">Método Pago</th>
                                    <th className="text-left py-3 px-4 font-medium">Total</th>
                                    <th className="text-left py-3 px-4 font-medium">Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posData.recentTransactions?.length > 0 ? (
                                    posData.recentTransactions.map((transaction: any) => (
                                        <tr key={transaction.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4 font-medium">{transaction.id}</td>
                                            <td className="py-3 px-4">{transaction.terminal}</td>
                                            <td className="py-3 px-4">{transaction.cashier}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{transaction.paymentMethod}</Badge>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-green-600">${transaction.total?.toLocaleString()}</td>
                                            <td className="py-3 px-4">{transaction.time}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No hay transacciones recientes disponibles
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
