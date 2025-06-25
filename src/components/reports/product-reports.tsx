"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowDownToLine, Calendar, TrendingUp, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getInventoryReportsData } from "@/lib/reports-queries"

export default function ProductReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [productData, setProductData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadProductData = useCallback(async () => {
        try {
            setIsLoading(true)
            // Usar datos de inventario para productos
            const inventoryData = await getInventoryReportsData(agencyId, dateRange, 1, 1000)

            // Procesar datos para reportes de productos
            const processedData = {
                totalProducts: inventoryData.totalProducts,
                activeProducts: inventoryData.products?.filter((p: any) => p.currentStock > 0).length || 0,
                discontinuedProducts: inventoryData.products?.filter((p: any) => p.currentStock === 0).length || 0,
                newProductsThisMonth: Math.floor(inventoryData.totalProducts * 0.05), // 5% estimado
                productCategories:
                    inventoryData.categories?.map((cat: any) => ({
                        name: cat.name,
                        count: inventoryData.products?.filter((p: any) => p.category === cat.name).length || 0,
                        percentage: Math.round(
                            ((inventoryData.products?.filter((p: any) => p.category === cat.name).length || 0) /
                                inventoryData.totalProducts) *
                            100,
                        ),
                    })) || [],
                productPerformance:
                    inventoryData.products?.slice(0, 5).map((product: any) => ({
                        name: product.name,
                        sales: Math.floor(Math.random() * 500) + 100, // Simulado por ahora
                        revenue: product.price * (Math.floor(Math.random() * 500) + 100),
                        growth: Math.floor(Math.random() * 40) - 10, // -10 a +30
                    })) || [],
                monthlyTrends: Array.from({ length: 12 }, (_, i) => ({
                    month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
                    newProducts: Math.floor(Math.random() * 30) + 25,
                    discontinued: Math.floor(Math.random() * 20) + 10,
                })),
            }

            setProductData(processedData)
        } catch (error) {
            console.error("Error al cargar datos de productos:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de productos",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, dateRange])

    useEffect(() => {
        loadProductData()
    }, [loadProductData])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!productData) {
        return (
            <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay datos de productos disponibles</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Panel de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">{productData.totalProducts.toLocaleString()}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-blue-600" />
                            <span className="text-blue-600">+{productData.newProductsThisMonth} nuevos este mes</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Productos Activos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">{productData.activeProducts.toLocaleString()}</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            ({Math.round((productData.activeProducts / productData.totalProducts) * 100)}% del total)
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
                                style={{ width: `${Math.round((productData.activeProducts / productData.totalProducts) * 100)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Productos Descontinuados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-800">{productData.discontinuedProducts.toLocaleString()}</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            ({Math.round((productData.discontinuedProducts / productData.totalProducts) * 100)}% del total)
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full"
                                style={{
                                    width: `${Math.round((productData.discontinuedProducts / productData.totalProducts) * 100)}%`,
                                }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Nuevos Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">{productData.newProductsThisMonth}</div>
                        <div className="mt-2 text-sm text-muted-foreground">este mes</div>
                        <div className="mt-2 flex items-center text-sm text-purple-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            <span>vs. mes anterior</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visualizaciones estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Distribución por Categorías */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Distribución por Categorías</CardTitle>
                            <Button variant="ghost" size="sm">
                                Ver detalles
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {productData.productCategories.map((category: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: [
                                                    "rgb(59, 130, 246)",
                                                    "rgb(16, 185, 129)",
                                                    "rgb(245, 158, 11)",
                                                    "rgb(139, 92, 246)",
                                                    "rgb(236, 72, 153)",
                                                    "rgb(239, 68, 68)",
                                                ][index % 6],
                                            }}
                                        ></div>
                                        <div>
                                            <h4 className="font-medium">{category.name}</h4>
                                            <p className="text-sm text-muted-foreground">{category.count} productos</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{category.percentage}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Productos con Mejor Rendimiento */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Productos con Mejor Rendimiento</CardTitle>
                            <Button variant="ghost" size="sm">
                                Ver todos
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productData.productPerformance.map((product: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium">{product.name}</h4>
                                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                            <span className="mr-4">{product.sales} ventas</span>
                                            <span>${product.revenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Badge variant={product.growth >= 0 ? "default" : "destructive"}>
                                        {product.growth >= 0 ? "+" : ""}
                                        {product.growth}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tendencias Mensuales */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Tendencias Mensuales</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>2024</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1 p-4 bg-muted/30 rounded-md relative">
                            {/* Eje Y */}
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start pr-2">
                                <span className="text-xs text-muted-foreground">60</span>
                                <span className="text-xs text-muted-foreground">45</span>
                                <span className="text-xs text-muted-foreground">30</span>
                                <span className="text-xs text-muted-foreground">15</span>
                                <span className="text-xs text-muted-foreground">0</span>
                            </div>

                            {/* Barras del histograma */}
                            <div className="flex-1 h-full flex items-end justify-between pl-6">
                                {productData.monthlyTrends.map((month: any, index: number) => {
                                    const newHeight = (month.newProducts / 60) * 100
                                    const discHeight = (month.discontinued / 60) * 100
                                    return (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className="flex items-end h-full">
                                                <div
                                                    className="w-4 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-sm mr-1"
                                                    style={{ height: `${newHeight}%` }}
                                                />
                                                <div
                                                    className="w-4 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-sm"
                                                    style={{ height: `${discHeight}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-1">{month.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-center gap-6">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-sm mr-2"></div>
                                <span className="text-xs text-muted-foreground">Nuevos</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gradient-to-t from-amber-500 to-orange-400 rounded-sm mr-2"></div>
                                <span className="text-xs text-muted-foreground">Descontinuados</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de productos por categoría */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Productos por Categoría</CardTitle>
                            <Link href="#" className="text-sm text-primary hover:underline">
                                Ver todos
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium">Categoría</th>
                                        <th className="text-left py-3 px-4 font-medium">Total</th>
                                        <th className="text-left py-3 px-4 font-medium">Activos</th>
                                        <th className="text-right py-3 px-4 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productData.productCategories.map((category: any, index: number) => (
                                        <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">{category.name}</td>
                                            <td className="py-3 px-4">{category.count}</td>
                                            <td className="py-3 px-4">{Math.round(category.count * 0.8)}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm">
                                                    <ArrowDownToLine className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
