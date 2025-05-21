"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    PieChart,
    LineChart,
    ShoppingCart,
    DollarSign,
    CreditCard,
    FileText,
    BarChart,
    BarChart2,
    Layers,
    Tag,
    User,
    Clock,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function PosReports({ agencyId, user, dateRange }: { agencyId: string; user: any; dateRange: string }) {
    const [reportData, setReportData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTab, setSelectedTab] = useState("sales")
    const [selectedDetailTab, setSelectedDetailTab] = useState("daily")

    useEffect(() => {
        // Simulación de carga de datos
        const loadData = async () => {
            try {
                // En una implementación real, aquí se llamaría a la API
                // await getReportData(agencyId)

                // Datos de ejemplo
                setReportData({
                    salesByDay: [
                        { day: "Lunes", sales: 450000 },
                        { day: "Martes", sales: 380000 },
                        { day: "Miércoles", sales: 520000 },
                        { day: "Jueves", sales: 490000 },
                        { day: "Viernes", sales: 680000 },
                        { day: "Sábado", sales: 750000 },
                        { day: "Domingo", sales: 320000 },
                    ],
                    salesByPaymentMethod: [
                        { method: "Efectivo", amount: 1800000 },
                        { method: "Tarjeta", amount: 1500000 },
                        { method: "Transferencia", amount: 290000 },
                    ],
                    topProducts: [
                        { name: "Producto 1", sales: 45, amount: 675000 },
                        { name: "Producto 2", sales: 38, amount: 570000 },
                        { name: "Producto 3", sales: 32, amount: 480000 },
                        { name: "Producto 4", sales: 28, amount: 420000 },
                        { name: "Producto 5", sales: 25, amount: 375000 },
                    ],
                    topCashiers: [
                        { name: "Juan Pérez", sales: 85, amount: 1275000 },
                        { name: "María López", sales: 72, amount: 1080000 },
                        { name: "Carlos Rodríguez", sales: 65, amount: 975000 },
                    ],
                    salesSummary: {
                        totalSales: 3590000,
                        totalTransactions: 240,
                        averageTicket: 14958,
                        cashSales: 1800000,
                        cardSales: 1500000,
                        otherSales: 290000,
                    },
                    salesByHour: [
                        { hour: "08:00 - 10:00", sales: 375000, transactions: 25 },
                        { hour: "10:00 - 12:00", sales: 480000, transactions: 32 },
                        { hour: "12:00 - 14:00", sales: 675000, transactions: 45 },
                        { hour: "14:00 - 16:00", sales: 570000, transactions: 38 },
                        { hour: "16:00 - 18:00", sales: 780000, transactions: 52 },
                        { hour: "18:00 - 20:00", sales: 720000, transactions: 48 },
                    ],
                    salesByCategory: [
                        { category: "Ropa", amount: 1200000, percentage: 33.4 },
                        { category: "Calzado", amount: 950000, percentage: 26.5 },
                        { category: "Accesorios", amount: 750000, percentage: 20.9 },
                        { category: "Electrónica", amount: 450000, percentage: 12.5 },
                        { category: "Otros", amount: 240000, percentage: 6.7 },
                    ],
                })

                setIsLoading(false)
            } catch (error) {
                console.error("Error al cargar datos de POS:", error)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                                <p className="text-2xl font-bold">${(reportData.salesSummary.totalSales / 1000).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 12%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Transacciones</p>
                                <p className="text-2xl font-bold">{reportData.salesSummary.totalTransactions}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 8%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ticket Promedio</p>
                                <p className="text-2xl font-bold">${(reportData.salesSummary.averageTicket / 1000).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 5%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ventas con Tarjeta</p>
                                <p className="text-2xl font-bold">${(reportData.salesSummary.cardSales / 1000).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {((reportData.salesSummary.cardSales / reportData.salesSummary.totalSales) * 100).toFixed(1)}% del
                                    total
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="mb-6">
                <TabsList className="mb-4 w-full sm:w-auto">
                    <TabsTrigger value="sales" className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Ventas</span>
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline">Productos</span>
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="hidden sm:inline">Categorías</span>
                    </TabsTrigger>
                    <TabsTrigger value="cashiers" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Cajeros</span>
                    </TabsTrigger>
                    <TabsTrigger value="hours" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Horarios</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ventas por Día</CardTitle>
                                <CardDescription>Análisis de ventas diarias en el período seleccionado</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                    <LineChart className="h-16 w-16 text-muted-foreground/50" />
                                    <span className="ml-4 text-muted-foreground">Gráfico de ventas por día</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                                <span>
                                    Total: $
                                    {(reportData.salesByDay.reduce((sum: number, day: any) => sum + day.sales, 0) / 1000).toFixed(3)}
                                </span>
                                <span>
                                    Promedio diario: $
                                    {(
                                        reportData.salesByDay.reduce((sum: number, day: any) => sum + day.sales, 0) /
                                        reportData.salesByDay.length /
                                        1000
                                    ).toFixed(3)}
                                </span>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ventas por Método de Pago</CardTitle>
                                <CardDescription>Distribución de ventas según el método de pago</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                    <PieChart className="h-16 w-16 text-muted-foreground/50" />
                                    <span className="ml-4 text-muted-foreground">Gráfico de ventas por método de pago</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="w-full space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm">Efectivo</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            ${(reportData.salesByPaymentMethod[0].amount / 1000).toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                                            <span className="text-sm">Tarjeta</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            ${(reportData.salesByPaymentMethod[1].amount / 1000).toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm">Transferencia</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            ${(reportData.salesByPaymentMethod[2].amount / 1000).toFixed(3)}
                                        </span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Más Vendidos</CardTitle>
                            <CardDescription>Los 5 productos con mayor volumen de ventas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="py-3 px-4 text-left font-medium">Producto</th>
                                            <th className="py-3 px-4 text-left font-medium">Unidades</th>
                                            <th className="py-3 px-4 text-left font-medium">Ventas</th>
                                            <th className="py-3 px-4 text-left font-medium">% del Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.topProducts.map((product: any, index: number) => (
                                            <tr key={index} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4 font-medium">{product.name}</td>
                                                <td className="py-3 px-4">{product.sales}</td>
                                                <td className="py-3 px-4">${(product.amount / 1000).toFixed(3)}</td>
                                                <td className="py-3 px-4">
                                                    {((product.amount / reportData.salesSummary.totalSales) * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Ver reporte completo
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Categoría</CardTitle>
                            <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reportData.salesByCategory.map((category: any, index: number) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category.category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">${(category.amount / 1000).toFixed(3)}</span>
                                                <span className="text-xs text-muted-foreground">{category.percentage}%</span>
                                            </div>
                                        </div>
                                        <Progress value={category.percentage} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between text-sm text-muted-foreground">
                            <span>Total: ${(reportData.salesSummary.totalSales / 1000).toFixed(3)}</span>
                            <span>{reportData.salesByCategory.length} categorías</span>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="cashiers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cajeros con Mejor Desempeño</CardTitle>
                            <CardDescription>Rendimiento de los cajeros en el período seleccionado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="py-3 px-4 text-left font-medium">Cajero</th>
                                            <th className="py-3 px-4 text-left font-medium">Transacciones</th>
                                            <th className="py-3 px-4 text-left font-medium">Ventas</th>
                                            <th className="py-3 px-4 text-left font-medium">Ticket Promedio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.topCashiers.map((cashier: any, index: number) => (
                                            <tr key={index} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>{cashier.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{cashier.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{cashier.sales}</td>
                                                <td className="py-3 px-4">${(cashier.amount / 1000).toFixed(3)}</td>
                                                <td className="py-3 px-4">${(cashier.amount / cashier.sales / 1000).toFixed(3)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Ver reporte completo
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="hours" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Hora</CardTitle>
                            <CardDescription>Distribución de ventas por franjas horarias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                <BarChart className="h-16 w-16 text-muted-foreground/50" />
                                <span className="ml-4 text-muted-foreground">Gráfico de ventas por hora</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Hora pico: 16:00 - 18:00</span>
                                    <span>$780.000 (52 ventas)</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Hora valle: 08:00 - 10:00</span>
                                    <span>$375.000 (25 ventas)</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de Ventas</CardTitle>
                    <CardDescription>Análisis detallado por período</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={selectedDetailTab} onValueChange={setSelectedDetailTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="daily">Diario</TabsTrigger>
                            <TabsTrigger value="weekly">Semanal</TabsTrigger>
                            <TabsTrigger value="monthly">Mensual</TabsTrigger>
                            <TabsTrigger value="yearly">Anual</TabsTrigger>
                        </TabsList>

                        <TabsContent value="daily" className="w-full">
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="py-3 px-4 text-left font-medium">Hora</th>
                                                <th className="py-3 px-4 text-left font-medium">Transacciones</th>
                                                <th className="py-3 px-4 text-left font-medium">Ventas</th>
                                                <th className="py-3 px-4 text-left font-medium">Efectivo</th>
                                                <th className="py-3 px-4 text-left font-medium">Tarjeta</th>
                                                <th className="py-3 px-4 text-left font-medium">Otros</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.salesByHour.map((hourData: any, index: number) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-4">{hourData.hour}</td>
                                                    <td className="py-3 px-4">{hourData.transactions}</td>
                                                    <td className="py-3 px-4">${(hourData.sales / 1000).toFixed(3)}</td>
                                                    <td className="py-3 px-4">${((hourData.sales * 0.5) / 1000).toFixed(3)}</td>
                                                    <td className="py-3 px-4">${((hourData.sales * 0.42) / 1000).toFixed(3)}</td>
                                                    <td className="py-3 px-4">${((hourData.sales * 0.08) / 1000).toFixed(3)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-muted/50 font-medium">
                                                <td className="py-3 px-4">Total</td>
                                                <td className="py-3 px-4">
                                                    {reportData.salesByHour.reduce((sum: number, hour: any) => sum + hour.transactions, 0)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    $
                                                    {(
                                                        reportData.salesByHour.reduce((sum: number, hour: any) => sum + hour.sales, 0) / 1000
                                                    ).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    $
                                                    {(
                                                        (reportData.salesByHour.reduce((sum: number, hour: any) => sum + hour.sales, 0) * 0.5) /
                                                        1000
                                                    ).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    $
                                                    {(
                                                        (reportData.salesByHour.reduce((sum: number, hour: any) => sum + hour.sales, 0) * 0.42) /
                                                        1000
                                                    ).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    $
                                                    {(
                                                        (reportData.salesByHour.reduce((sum: number, hour: any) => sum + hour.sales, 0) * 0.08) /
                                                        1000
                                                    ).toFixed(3)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="weekly" className="w-full">
                            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                                <span className="ml-4 text-muted-foreground">Datos semanales no disponibles</span>
                            </div>
                        </TabsContent>

                        <TabsContent value="monthly" className="w-full">
                            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                                <span className="ml-4 text-muted-foreground">Datos mensuales no disponibles</span>
                            </div>
                        </TabsContent>

                        <TabsContent value="yearly" className="w-full">
                            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                                <span className="ml-4 text-muted-foreground">Datos anuales no disponibles</span>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
