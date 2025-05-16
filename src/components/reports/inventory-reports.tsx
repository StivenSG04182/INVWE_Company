"use client"

import { useState, useEffect } from "react"
import { ArrowDownToLine, Calendar, RefreshCcw } from "lucide-react"
import Link from "next/link"

export default function InventoryReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [inventoryData, setInventoryData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [rotationData, setRotationData] = useState<any[]>([])

    useEffect(() => {
        // Simulación de carga de datos
        const loadData = async () => {
            try {
                // En una implementación real, aquí se llamaría a la API
                // await InventoryReportService.getInventoryStats(agencyId)

                // Datos de ejemplo
                setInventoryData({
                    totalProducts: 1245,
                    optimalStock: 980,
                    lowStock: 185,
                    outOfStock: 80,
                    categories: [
                        { name: "Electrónica", percentage: 35 },
                        { name: "Ropa", percentage: 25 },
                        { name: "Hogar", percentage: 20 },
                        { name: "Alimentos", percentage: 15 },
                        { name: "Otros", percentage: 5 },
                    ],
                    recentMovements: [
                        { id: 1, product: "Smartphone XYZ", type: "entrada", quantity: 50, date: "2023-10-15" },
                        { id: 2, product: "Laptop Pro", type: "salida", quantity: 25, date: "2023-10-14" },
                        { id: 3, product: "Auriculares Bluetooth", type: "entrada", quantity: 100, date: "2023-10-13" },
                        { id: 4, product: 'Monitor 27"', type: "salida", quantity: 15, date: "2023-10-12" },
                        { id: 5, product: "Teclado Mecánico", type: "entrada", quantity: 75, date: "2023-10-11" },
                    ],
                })

                // Datos de rotación para el histograma
                setRotationData([
                    { date: "2023-10-01", quantity: 85 },
                    { date: "2023-10-02", quantity: 65 },
                    { date: "2023-10-03", quantity: 45 },
                    { date: "2023-10-04", quantity: 70 },
                    { date: "2023-10-05", quantity: 55 },
                    { date: "2023-10-06", quantity: 40 },
                    { date: "2023-10-07", quantity: 60 },
                    { date: "2023-10-08", quantity: 75 },
                    { date: "2023-10-09", quantity: 50 },
                    { date: "2023-10-10", quantity: 90 },
                ])

                setIsLoading(false)
            } catch (error) {
                console.error("Error al cargar datos de inventario:", error)
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
            {/* Panel de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <h3 className="text-lg font-medium mb-2">Total de Productos</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{inventoryData.totalProducts}</span>
                        <span className="text-sm text-muted-foreground">unidades</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-500">
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        <span>Actualizado hoy</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                    <h3 className="text-lg font-medium mb-2">Stock Óptimo</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{inventoryData.optimalStock}</span>
                        <span className="text-sm text-muted-foreground">
                            ({Math.round((inventoryData.optimalStock / inventoryData.totalProducts) * 100)}%)
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
                            style={{ width: `${Math.round((inventoryData.optimalStock / inventoryData.totalProducts) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                    <h3 className="text-lg font-medium mb-2">Stock Bajo</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{inventoryData.lowStock}</span>
                        <span className="text-sm text-muted-foreground">
                            ({Math.round((inventoryData.lowStock / inventoryData.totalProducts) * 100)}%)
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full"
                            style={{ width: `${Math.round((inventoryData.lowStock / inventoryData.totalProducts) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
                    <h3 className="text-lg font-medium mb-2">Sin Stock</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{inventoryData.outOfStock}</span>
                        <span className="text-sm text-muted-foreground">
                            ({Math.round((inventoryData.outOfStock / inventoryData.totalProducts) * 100)}%)
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-red-500 to-rose-500 h-full"
                            style={{ width: `${Math.round((inventoryData.outOfStock / inventoryData.totalProducts) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Visualizaciones estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Gráfico Radial */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Distribución por Categorías</h3>
                        <button className="text-sm text-primary hover:underline">Ver detalles</button>
                    </div>

                    <div className="flex">
                        <div className="w-1/2">
                            <div className="aspect-square relative">
                                {/* Simulación de gráfico radial */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-8 border-blue-500/20 relative">
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-cyan-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 25% 0%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-purple-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 25% 0%, 50% 0%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-amber-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 0% 0%, 25% 0%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-green-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 0% 100%, 0% 0%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-red-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 100% 100%, 0% 100%)" }}
                                        ></div>

                                        {/* Líneas radiales */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full h-[1px] bg-border origin-center"
                                                style={{ transform: `rotate(${i * 72}deg)` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 flex flex-col justify-center">
                            {inventoryData.categories && inventoryData.categories.length > 0 ? (
                                inventoryData.categories.map((category: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{
                                                    backgroundColor: [
                                                        "rgb(59, 130, 246)",
                                                        "rgb(139, 92, 246)",
                                                        "rgb(245, 158, 11)",
                                                        "rgb(16, 185, 129)",
                                                        "rgb(239, 68, 68)",
                                                    ][index % 5],
                                                }}
                                            ></div>
                                            <span className="text-sm">{category.name}</span>
                                        </div>
                                        <span className="text-sm font-medium">{category.percentage}%</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground">No hay datos disponibles</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Histograma */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Rotación de Inventario</h3>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Últimos 30 días</span>
                            </button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-1 p-4 bg-muted/30 rounded-md relative">
                        {/* Eje Y */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start pr-2">
                            <span className="text-xs text-muted-foreground">100</span>
                            <span className="text-xs text-muted-foreground">75</span>
                            <span className="text-xs text-muted-foreground">50</span>
                            <span className="text-xs text-muted-foreground">25</span>
                            <span className="text-xs text-muted-foreground">0</span>
                        </div>

                        {/* Barras del histograma */}
                        <div className="flex-1 h-full flex items-end justify-between pl-6">
                            {rotationData.length > 0 ? (
                                rotationData.map((item, index) => {
                                    // Normalizar la altura para el gráfico (máximo 100%)
                                    const maxQuantity = Math.max(...rotationData.map((d) => d.quantity))
                                    const height = (item.quantity / maxQuantity) * 100 || 0
                                    return (
                                        <div key={index} className="flex flex-col items-center">
                                            <div
                                                className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-xs text-muted-foreground mt-1">{new Date(item.date).getDate()}</span>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="w-full flex items-center justify-center text-muted-foreground">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabla de movimientos recientes */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 md:col-span-2 mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Movimientos Recientes</h3>
                        <Link href="#" className="text-sm text-primary hover:underline">
                            Ver todos
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                                    <th className="text-left py-3 px-4 font-medium">Cantidad</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.recentMovements && inventoryData.recentMovements.length > 0 ? (
                                    inventoryData.recentMovements.map((movement: any) => (
                                        <tr key={movement.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">{movement.product}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${movement.type === "entrada" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                                >
                                                    {movement.type === "entrada" ? "↑ Entrada" : "↓ Salida"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{movement.quantity}</td>
                                            <td className="py-3 px-4">{movement.date}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-primary hover:text-primary/80 transition-colors">
                                                    <ArrowDownToLine className="h-4 w-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                            No hay movimientos recientes disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
