"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function SalesReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [salesData, setSalesData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [availableReports, setAvailableReports] = useState<any[]>([])

    useEffect(() => {
        // Simulación de carga de datos
        const loadData = async () => {
            try {
                // En una implementación real, aquí se llamaría a la API
                // await SalesReportService.getSalesStats(agencyId)

                // Datos de ejemplo
                setSalesData({
                    totalRevenue: 128459,
                    growthPercentage: 12.5,
                    topProducts: [
                        { name: "Producto A", revenue: 32450 },
                        { name: "Producto B", revenue: 28120 },
                        { name: "Producto C", revenue: 21890 },
                        { name: "Producto D", revenue: 18340 },
                        { name: "Producto E", revenue: 15780 },
                    ],
                    channels: [
                        { name: "Tienda física", percentage: 65 },
                        { name: "E-commerce", percentage: 20 },
                        { name: "Distribuidores", percentage: 10 },
                        { name: "Otros", percentage: 5 },
                    ],
                    weekdaySales: [
                        { day: "Lun", sales: 20, target: 25 },
                        { day: "Mar", sales: 40, target: 50 },
                        { day: "Mié", sales: 30, target: 40 },
                        { day: "Jue", sales: 60, target: 70 },
                        { day: "Vie", sales: 80, target: 90 },
                        { day: "Sáb", sales: 90, target: 100 },
                        { day: "Dom", sales: 50, target: 60 },
                    ],
                })

                setAvailableReports([
                    {
                        id: "sales-by-seller",
                        title: "Reporte de Ventas por Vendedor",
                        description: "Análisis detallado del rendimiento de cada vendedor.",
                    },
                    {
                        id: "sales-by-category",
                        title: "Reporte de Ventas por Categoría",
                        description: "Distribución de ventas por categorías de productos.",
                    },
                    {
                        id: "returns",
                        title: "Reporte de Devoluciones",
                        description: "Análisis de productos devueltos y motivos.",
                    },
                    {
                        id: "sales-by-location",
                        title: "Reporte de Ventas por Ubicación",
                        description: "Distribución geográfica de las ventas.",
                    },
                    {
                        id: "discounts",
                        title: "Reporte de Descuentos Aplicados",
                        description: "Análisis de descuentos y su impacto en ventas.",
                    },
                    {
                        id: "trends",
                        title: "Reporte de Tendencias",
                        description: "Análisis de tendencias de ventas a lo largo del tiempo.",
                    },
                ])

                setIsLoading(false)
            } catch (error) {
                console.error("Error al cargar datos de ventas:", error)
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
                    <h3 className="font-medium text-lg mb-2">Ventas Totales</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">${salesData.totalRevenue.toLocaleString()}</span>
                        <span className="text-green-500 text-sm">+{salesData.growthPercentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">vs. mes anterior</p>
                    <div className="h-32 mt-4 bg-muted rounded-md flex items-end">
                        <div className="w-1/6 h-[20%] bg-primary mx-1 rounded-t-sm"></div>
                        <div className="w-1/6 h-[40%] bg-primary mx-1 rounded-t-sm"></div>
                        <div className="w-1/6 h-[30%] bg-primary mx-1 rounded-t-sm"></div>
                        <div className="w-1/6 h-[60%] bg-primary mx-1 rounded-t-sm"></div>
                        <div className="w-1/6 h-[50%] bg-primary mx-1 rounded-t-sm"></div>
                        <div className="w-1/6 h-[80%] bg-primary mx-1 rounded-t-sm"></div>
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Productos Más Vendidos</h3>
                    <ul className="space-y-2 mt-4">
                        {salesData.topProducts.length > 0 ? (
                            salesData.topProducts.map((product: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span>{product.name}</span>
                                    <span className="font-medium">${product.revenue.toLocaleString()}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-center text-muted-foreground">No hay datos disponibles</li>
                        )}
                    </ul>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Canales de Venta</h3>
                    <div className="h-40 mt-4 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-8 border-primary relative flex items-center justify-center">
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full border-8 border-blue-500"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full border-8 border-green-500"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-8 border-yellow-500"></div>
                            <span className="text-xs font-medium">Distribución</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        {salesData.channels.length > 0 ? (
                            salesData.channels.map((channel: any, index: number) => (
                                <div key={index} className="flex items-center gap-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: [
                                                "rgb(99, 102, 241)", // primary
                                                "rgb(59, 130, 246)", // blue-500
                                                "rgb(16, 185, 129)", // green-500
                                                "rgb(245, 158, 11)", // yellow-500
                                            ][index % 4],
                                        }}
                                    ></div>
                                    <span>
                                        {channel.name} ({channel.percentage}%)
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-muted-foreground">No hay datos disponibles</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-medium text-lg mb-4">Ventas por Período</h3>
                <div className="flex gap-2 mb-4">
                    <button className="px-3 py-1 rounded-md bg-primary text-white">Diario</button>
                    <button className="px-3 py-1 rounded-md bg-muted">Semanal</button>
                    <button className="px-3 py-1 rounded-md bg-muted">Mensual</button>
                    <button className="px-3 py-1 rounded-md bg-muted">Trimestral</button>
                    <button className="px-3 py-1 rounded-md bg-muted">Anual</button>
                </div>
                <div className="border rounded-md p-4">
                    <div className="h-64 flex items-end">
                        {salesData.weekdaySales.map((day: any, index: number) => {
                            // Calcular altura relativa para las barras
                            const maxSales = Math.max(...salesData.weekdaySales.map((d: any) => d.sales))
                            const maxTarget = Math.max(...salesData.weekdaySales.map((d: any) => d.target))
                            const maxValue = Math.max(maxSales, maxTarget) || 1 // Evitar división por cero

                            const salesHeight = (day.sales / maxValue) * 100
                            const targetHeight = (day.target / maxValue) * 100

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full bg-primary/20 relative" style={{ height: `${targetHeight}%` }}>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-primary"
                                            style={{ height: `${salesHeight}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs mt-2">{day.day}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                        <span>Ventas</span>
                        <span>Objetivo</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="font-medium text-lg mb-4">Reportes Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableReports.length > 0 ? (
                        availableReports.map((report: any, index: number) => (
                            <div key={index} className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                                <h4 className="font-medium">{report.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                                <Button variant="link" className="mt-4 p-0 h-auto text-primary text-sm hover:underline">
                                    Generar Reporte
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-muted-foreground p-4 border rounded-md">
                            No hay reportes disponibles en este momento
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
