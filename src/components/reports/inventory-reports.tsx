"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, TrendingUp, Search, Filter, Download, Loader2, Eye, BarChart3 } from "lucide-react"
import { RosenChart } from "@/components/ui/rosen-chart"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertSystem } from "@/components/alerts/alert-system"
import { getInventoryReportsData, exportReportData } from "@/lib/reports-queries"

interface InventoryReportsProps {
    agencyId: string
    user: any
    dateRange: string
}

export default function InventoryReports({ agencyId, user, dateRange }: InventoryReportsProps) {
    const [inventoryData, setInventoryData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")

    const loadInventoryData = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getInventoryReportsData(
                agencyId,
                dateRange,
                currentPage,
                pageSize,
                categoryFilter,
                sortBy,
                sortOrder,
                searchTerm,
            )
            setInventoryData(data)
        } catch (error) {
            console.error("Error loading inventory data:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de inventario",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, dateRange, currentPage, pageSize, categoryFilter, sortBy, sortOrder, searchTerm])

    useEffect(() => {
        loadInventoryData()
    }, [loadInventoryData])

    const handleSearch = () => {
        setCurrentPage(1)
        loadInventoryData()
    }

    const exportInventory = async (format: string) => {
        try {
            await exportReportData(agencyId, "inventory", format, dateRange, {
                category: categoryFilter,
                search: searchTerm,
            })

            toast({
                title: "Exportación exitosa",
                description: `Inventario exportado en formato ${format}`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo exportar el inventario",
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

    if (!inventoryData) {
        return (
            <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay datos de inventario disponibles</p>
            </div>
        )
    }

    // Configuración de gráficos
    const stockLevelsConfig = {
        type: "bar",
        data: {
            labels: inventoryData.stockLevels?.map((item: any) => item.category) || [],
            datasets: [
                {
                    label: "Stock Actual",
                    data: inventoryData.stockLevels?.map((item: any) => item.currentStock) || [],
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                },
                {
                    label: "Stock Mínimo",
                    data: inventoryData.stockLevels?.map((item: any) => item.minStock) || [],
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
                legend: { position: "top" as const },
                title: { display: true, text: "Niveles de Stock por Categoría" },
            },
            scales: {
                y: { beginAtZero: true },
            },
        },
    }

    const movementsConfig = {
        type: "line",
        data: {
            labels: inventoryData.movements?.map((item: any) => item.date) || [],
            datasets: [
                {
                    label: "Entradas",
                    data: inventoryData.movements?.map((item: any) => item.entries) || [],
                    borderColor: "rgb(34, 197, 94)",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "Salidas",
                    data: inventoryData.movements?.map((item: any) => item.exits) || [],
                    borderColor: "rgb(239, 68, 68)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Movimientos de Inventario" },
            },
            scales: {
                y: { beginAtZero: true },
            },
        },
    }

    const valueDistributionConfig = {
        type: "doughnut",
        data: {
            labels: inventoryData.valueDistribution?.map((item: any) => item.category) || [],
            datasets: [
                {
                    data: inventoryData.valueDistribution?.map((item: any) => item.value) || [],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
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
                title: { display: true, text: "Distribución de Valor por Categoría" },
            },
        },
    }

    return (
        <div className="space-y-6">
            {/* Sistema de Alertas */}
            <AlertSystem agencyId={agencyId} type="inventory" />

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Productos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">{inventoryData.totalProducts?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">+{inventoryData.productsGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Valor Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">${inventoryData.totalValue?.toLocaleString() || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600">+{inventoryData.valueGrowth || 0}% vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Stock Bajo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-800">{inventoryData.lowStockCount || 0}</div>
                        <div className="mt-2 flex items-center text-sm">
                            <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                            <span className="text-amber-600">Productos con stock crítico</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Rotación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">{inventoryData.turnoverRate || 0}x</div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1 text-purple-600" />
                            <span className="text-purple-600">Rotación promedio</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros y Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} size="sm">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {inventoryData.categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Nombre</SelectItem>
                                <SelectItem value="stock">Stock</SelectItem>
                                <SelectItem value="value">Valor</SelectItem>
                                <SelectItem value="category">Categoría</SelectItem>
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
                                <DropdownMenuItem onClick={() => exportInventory("PDF")}>📄 Exportar PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportInventory("EXCEL")}>📊 Exportar Excel</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportInventory("CSV")}>📝 Exportar CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Niveles de Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={stockLevelsConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Movimientos de Inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={movementsConfig} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Valor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <RosenChart config={valueDistributionConfig} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Productos con Stock Bajo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {inventoryData.lowStockProducts?.length > 0 ? (
                                inventoryData.lowStockProducts.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{product.name}</h4>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="destructive" className="mb-1">
                                                Stock: {product.currentStock}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">Mín: {product.minStock}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No hay productos con stock bajo</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de productos */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                                    <th className="text-left py-3 px-4 font-medium">Categoría</th>
                                    <th className="text-left py-3 px-4 font-medium">Stock Actual</th>
                                    <th className="text-left py-3 px-4 font-medium">Stock Mínimo</th>
                                    <th className="text-left py-3 px-4 font-medium">Valor Unitario</th>
                                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.products?.length > 0 ? (
                                    inventoryData.products.map((product: any) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4 font-medium">{product.name}</td>
                                            <td className="py-3 px-4">{product.category}</td>
                                            <td className="py-3 px-4">{product.currentStock}</td>
                                            <td className="py-3 px-4">{product.minStock}</td>
                                            <td className="py-3 px-4">${product.price?.toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={
                                                        product.currentStock <= product.minStock
                                                            ? "destructive"
                                                            : product.currentStock <= product.minStock * 1.5
                                                                ? "secondary"
                                                                : "default"
                                                    }
                                                >
                                                    {product.currentStock <= product.minStock
                                                        ? "Crítico"
                                                        : product.currentStock <= product.minStock * 1.5
                                                            ? "Bajo"
                                                            : "Normal"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                            No hay productos disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {inventoryData.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                                {Math.min(currentPage * pageSize, inventoryData.totalItems)} de {inventoryData.totalItems} productos
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(inventoryData.totalPages, prev + 1))}
                                    disabled={currentPage === inventoryData.totalPages}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
