"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, Clock, TrendingDown, AlertTriangle } from "lucide-react"

interface StockForecastProps {
    agencyId: string
    products: any[]
    stocks: any[]
    movements?: any[] // Historial de movimientos
}

interface ForecastDataPoint {
    date: string
    stock: number
    reorderPoint: number
    minStock: number
}

export default function StockForecast({ agencyId, products, stocks, movements = [] }: StockForecastProps) {
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [forecastPeriod, setForecastPeriod] = useState<string>("30") // días
    const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([])
    const [stockoutDate, setStockoutDate] = useState<Date | null>(null)
    const [daysUntilStockout, setDaysUntilStockout] = useState<number | null>(null)
    const [averageConsumption, setAverageConsumption] = useState<number>(0)
    const [reorderDate, setReorderDate] = useState<Date | null>(null)

    // Agrupar stocks por producto
    const stocksByProduct = stocks.reduce((acc, stock) => {
        const productId = stock.productId
        if (!acc[productId]) {
            acc[productId] = []
        }
        acc[productId].push(stock)
        return acc
    }, {})

    // Generar datos de previsión cuando cambia el producto o el período
    useEffect(() => {
        if (!selectedProduct) return

        // Obtener el producto seleccionado
        const product = products.find((p) => p.id === selectedProduct || p._id === selectedProduct)
        if (!product) return

        // Obtener el stock actual del producto
        const productStocks = stocksByProduct[selectedProduct] || []
        const currentStock = productStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0)

        // Filtrar movimientos del producto seleccionado (solo salidas)
        const productMovements = movements
            .filter((m) => (m.productId === selectedProduct || m._id === selectedProduct) && m.type === "salida")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Si no hay movimientos, no podemos hacer previsiones
        if (productMovements.length === 0) {
            setForecastData([])
            setStockoutDate(null)
            setDaysUntilStockout(null)
            setAverageConsumption(0)
            setReorderDate(null)
            return
        }

        // Calcular consumo promedio diario
        const firstMovementDate = new Date(productMovements[0].date)
        const lastMovementDate = new Date(productMovements[productMovements.length - 1].date)
        const daysDiff = Math.max(1, (lastMovementDate.getTime() - firstMovementDate.getTime()) / (1000 * 60 * 60 * 24))

        const totalConsumed = productMovements.reduce((sum, m) => sum + (m.quantity || 0), 0)
        const dailyConsumption = totalConsumed / daysDiff

        setAverageConsumption(dailyConsumption)

        // Calcular fecha de agotamiento
        const daysToStockout = dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : null

        if (daysToStockout !== null) {
            const stockoutDateValue = new Date()
            stockoutDateValue.setDate(stockoutDateValue.getDate() + daysToStockout)
            setStockoutDate(stockoutDateValue)
            setDaysUntilStockout(daysToStockout)
        } else {
            setStockoutDate(null)
            setDaysUntilStockout(null)
        }

        // Calcular fecha de reorden
        if (product.reorderPoint && daysToStockout !== null) {
            const daysToReorder =
                dailyConsumption > 0 ? Math.floor((currentStock - product.reorderPoint) / dailyConsumption) : null

            if (daysToReorder !== null && daysToReorder >= 0) {
                const reorderDateValue = new Date()
                reorderDateValue.setDate(reorderDateValue.getDate() + daysToReorder)
                setReorderDate(reorderDateValue)
            } else {
                // Ya estamos por debajo del punto de reorden
                setReorderDate(new Date())
            }
        } else {
            setReorderDate(null)
        }

        // Generar datos para el gráfico de previsión
        const forecastDays = Number.parseInt(forecastPeriod) || 30
        const forecastDataPoints: ForecastDataPoint[] = []

        // Punto inicial (hoy)
        const today = new Date()
        forecastDataPoints.push({
            date: today.toISOString().split("T")[0],
            stock: currentStock,
            reorderPoint: product.reorderPoint || 0,
            minStock: product.minStock || 0,
        })

        // Generar puntos de previsión
        for (let i = 1; i <= forecastDays; i++) {
            const forecastDate = new Date()
            forecastDate.setDate(forecastDate.getDate() + i)

            const projectedStock = Math.max(0, currentStock - dailyConsumption * i)

            forecastDataPoints.push({
                date: forecastDate.toISOString().split("T")[0],
                stock: projectedStock,
                reorderPoint: product.reorderPoint || 0,
                minStock: product.minStock || 0,
            })
        }

        setForecastData(forecastDataPoints)
    }, [selectedProduct, forecastPeriod, products, stocks, stocksByProduct, movements])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle>Previsión de Stock</CardTitle>
                        <CardDescription>Análisis predictivo de niveles de inventario</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="product-select" className="mb-2 block">
                                Seleccionar Producto
                            </Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger id="product-select">
                                    <SelectValue placeholder="Seleccione un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id || product._id} value={product.id || product._id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="forecast-period" className="mb-2 block">
                                Período de Previsión
                            </Label>
                            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                                <SelectTrigger id="forecast-period">
                                    <SelectValue placeholder="Seleccione un período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 días</SelectItem>
                                    <SelectItem value="15">15 días</SelectItem>
                                    <SelectItem value="30">30 días</SelectItem>
                                    <SelectItem value="60">60 días</SelectItem>
                                    <SelectItem value="90">90 días</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!selectedProduct ? (
                        <div className="text-center py-8">
                            <TrendingDown className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Seleccione un producto</h3>
                            <p className="text-muted-foreground">Seleccione un producto para ver su previsión de stock.</p>
                        </div>
                    ) : forecastData.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Datos insuficientes</h3>
                            <p className="text-muted-foreground">
                                No hay suficientes datos de movimientos para generar una previsión.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Consumo Diario</p>
                                                <p className="text-xl font-bold">{averageConsumption.toFixed(2)} unidades</p>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Fecha de Agotamiento</p>
                                                {stockoutDate ? (
                                                    <p className="text-xl font-bold">{stockoutDate.toLocaleDateString()}</p>
                                                ) : (
                                                    <p className="text-xl font-bold">No determinada</p>
                                                )}
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            </div>
                                        </div>
                                        {daysUntilStockout !== null && (
                                            <Badge variant={daysUntilStockout < 7 ? "destructive" : "outline"} className="mt-2">
                                                {daysUntilStockout} días restantes
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Fecha de Reorden</p>
                                                {reorderDate ? (
                                                    <p className="text-xl font-bold">{reorderDate.toLocaleDateString()}</p>
                                                ) : (
                                                    <p className="text-xl font-bold">No determinada</p>
                                                )}
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                        </div>
                                        {reorderDate && new Date() >= reorderDate && (
                                            <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-800">
                                                ¡Realizar pedido ahora!
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Tabs defaultValue="chart">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="chart">Gráfico</TabsTrigger>
                                    <TabsTrigger value="table">Tabla</TabsTrigger>
                                </TabsList>

                                <TabsContent value="chart">
                                    <div className="h-[300px] mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value)
                                                        return `${date.getDate()}/${date.getMonth() + 1}`
                                                    }}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value: any) => [`${value} unidades`, ""]}
                                                    labelFormatter={(label) => {
                                                        const date = new Date(label)
                                                        return date.toLocaleDateString()
                                                    }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="stock"
                                                    name="Stock Proyectado"
                                                    stroke="#3b82f6"
                                                    activeDot={{ r: 8 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="reorderPoint"
                                                    name="Punto de Reorden"
                                                    stroke="#f59e0b"
                                                    strokeDasharray="5 5"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="minStock"
                                                    name="Stock Mínimo"
                                                    stroke="#ef4444"
                                                    strokeDasharray="3 3"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>

                                <TabsContent value="table">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Stock Proyectado</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {forecastData.map((data, index) => {
                                                    const date = new Date(data.date)
                                                    let status = "normal"
                                                    if (data.stock <= 0) {
                                                        status = "out"
                                                    } else if (data.stock <= data.minStock) {
                                                        status = "low"
                                                    } else if (data.stock <= data.reorderPoint) {
                                                        status = "reorder"
                                                    }

                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell>{date.toLocaleDateString()}</TableCell>
                                                            <TableCell>{Math.round(data.stock * 100) / 100}</TableCell>
                                                            <TableCell>
                                                                {status === "out" ? (
                                                                    <Badge variant="destructive">Sin stock</Badge>
                                                                ) : status === "low" ? (
                                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                                                        Stock bajo
                                                                    </Badge>
                                                                ) : status === "reorder" ? (
                                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                                        Punto de reorden
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Normal</Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="bg-muted/50 p-4 rounded-md mt-4">
                                <h4 className="font-medium mb-2">Recomendaciones</h4>
                                <ul className="space-y-2 text-sm">
                                    {daysUntilStockout !== null && daysUntilStockout < 7 && (
                                        <li className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                            <span>
                                                <strong>Acción urgente:</strong> El stock se agotará en {daysUntilStockout} días. Realice un
                                                pedido inmediatamente.
                                            </span>
                                        </li>
                                    )}
                                    {reorderDate && new Date() >= reorderDate && (
                                        <li className="flex items-start gap-2">
                                            <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                                            <span>
                                                <strong>Punto de reorden alcanzado:</strong> Es momento de realizar un nuevo pedido para evitar
                                                quedarse sin stock.
                                            </span>
                                        </li>
                                    )}
                                    {averageConsumption > 0 && (
                                        <li className="flex items-start gap-2">
                                            <TrendingDown className="h-4 w-4 text-blue-500 mt-0.5" />
                                            <span>
                                                <strong>Consumo diario:</strong> Este producto tiene un consumo promedio de{" "}
                                                {averageConsumption.toFixed(2)} unidades por día.
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
