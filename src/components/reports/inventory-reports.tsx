"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, RefreshCw, Search, AlertTriangle } from "lucide-react"

interface InventoryReportProps {
    agencyId: string
}

export default function InventoryReport({ agencyId }: InventoryReportProps) {
    const [dateRange, setDateRange] = useState("month")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [reportData, setReportData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("all")

    // Cargar datos del reporte
    useEffect(() => {
        loadReportData()
        loadCategories()
    }, [agencyId, dateRange, startDate, endDate])

    // Filtrar datos según la vista y búsqueda
    useEffect(() => {
        let filtered = [...reportData]

        // Filtrar por vista
        if (view === "low-stock") {
            filtered = filtered.filter((item) => item.isLowStock)
        }

        // Filtrar por categoría
        if (selectedCategory !== "all") {
            filtered = filtered.filter((item) => item.categoryName === selectedCategory)
        }

        // Filtrar por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (item) => item.productName.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query),
            )
        }

        setFilteredData(filtered)
    }, [reportData, view, searchQuery, selectedCategory])

    const loadReportData = async () => {
        try {
            setIsLoading(true)

            let url = `/api/reports/${agencyId}?type=inventory&dateRange=${dateRange}`

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
                setFilteredData(result.data)
            } else {
                console.error("Error al cargar reporte:", result.error)
            }
        } catch (error) {
            console.error("Error al cargar reporte:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadCategories = async () => {
        try {
            const response = await fetch(`/api/inventory/${agencyId}?type=categories`)

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setCategories(result.data)
            } else {
                console.error("Error al cargar categorías:", result.error)
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error)
        }
    }

    // Exportar reporte a CSV
    const exportToCSV = async () => {
        try {
            let url = `/api/reports/${agencyId}?type=inventory&dateRange=${dateRange}&format=csv`

            if (dateRange === "custom" && startDate && endDate) {
                url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            }

            if (selectedCategory !== "all") {
                url += `&categoryId=${selectedCategory}`
            }

            window.open(url, "_blank")
        } catch (error) {
            console.error("Error al exportar reporte:", error)
        }
    }

    // Calcular totales
    const totals = filteredData.reduce(
        (acc, item) => {
            acc.totalProducts += 1
            acc.totalStock += item.currentStock
            acc.totalValue += item.totalValue
            if (item.isLowStock) acc.lowStockProducts += 1
            return acc
        },
        { totalProducts: 0, totalStock: 0, totalValue: 0, lowStockProducts: 0 },
    )

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Reporte de Inventario</CardTitle>
                        <CardDescription>Análisis de stock y movimientos</CardDescription>
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
                            <div className="text-2xl font-bold">{totals.totalProducts}</div>
                            <p className="text-muted-foreground">Total de productos</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{totals.totalStock}</div>
                            <p className="text-muted-foreground">Unidades en stock</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">${totals.totalValue.toFixed(2)}</div>
                            <p className="text-muted-foreground">Valor del inventario</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-500">{totals.lowStockProducts}</div>
                            <p className="text-muted-foreground">Productos con stock bajo</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar productos..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Tabla de inventario */}
                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="py-3 px-4 text-left font-medium">Producto</th>
                                    <th className="py-3 px-4 text-left font-medium">SKU</th>
                                    <th className="py-3 px-4 text-left font-medium">Categoría</th>
                                    <th className="py-3 px-4 text-left font-medium">Stock Inicial</th>
                                    <th className="py-3 px-4 text-left font-medium">Entradas</th>
                                    <th className="py-3 px-4 text-left font-medium">Salidas</th>
                                    <th className="py-3 px-4 text-left font-medium">Stock Actual</th>
                                    <th className="py-3 px-4 text-left font-medium">Precio</th>
                                    <th className="py-3 px-4 text-left font-medium">Valor Total</th>
                                    <th className="py-3 px-4 text-left font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="py-10 text-center">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-10 text-center text-muted-foreground">
                                            No hay datos disponibles para los filtros seleccionados
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.productId} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{item.productName}</td>
                                            <td className="py-3 px-4">{item.sku}</td>
                                            <td className="py-3 px-4">{item.categoryName}</td>
                                            <td className="py-3 px-4">{item.initialStock}</td>
                                            <td className="py-3 px-4 text-green-600">+{item.entries}</td>
                                            <td className="py-3 px-4 text-red-600">-{item.exits}</td>
                                            <td className="py-3 px-4 font-medium">{item.currentStock}</td>
                                            <td className="py-3 px-4">${item.price.toFixed(2)}</td>
                                            <td className="py-3 px-4">${item.totalValue.toFixed(2)}</td>
                                            <td className="py-3 px-4">
                                                {item.isLowStock ? (
                                                    <Badge variant="destructive" className="flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Stock Bajo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                        Normal
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
