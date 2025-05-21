"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Package,
    Search,
    Filter,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Plus,
    AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
// Nota: Las funciones de queries2.ts se importan dinámicamente cuando es necesario

interface StockOverviewProps {
    agencyId: string
    stocks: any[]
    products: any[]
    areas: any[]
    productsMap: Map<string, any>
    areasMap: Map<string, any>
}

export default function StockOverview({
    agencyId,
    stocks,
    products,
    areas,
    productsMap,
    areasMap,
}: StockOverviewProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedArea, setSelectedArea] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [showFilters, setShowFilters] = useState(false)

    // Agrupar stocks por producto
    const stocksByProduct = stocks.reduce((acc, stock) => {
        const productId = stock.productId
        if (!acc[productId]) {
            acc[productId] = []
        }
        acc[productId].push(stock)
        return acc
    }, {})

    // Calcular stock total por producto
    const productTotals = Object.keys(stocksByProduct)
        .map((productId) => {
            const product = productsMap.get(productId)
            if (!product) return null

            const productStocks = stocksByProduct[productId]
            const totalQuantity = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)

            // Nueva lógica para determinar el estado del stock
            let stockStatus = "normal"
            let stockPercentage = 0

            // Si el producto tiene maxStock definido, calculamos el porcentaje
            if (product.maxStock && product.maxStock > 0) {
                stockPercentage = (totalQuantity / product.maxStock) * 100

                if (stockPercentage <= 10) {
                    stockStatus = "low"
                } else if (stockPercentage >= 75) {
                    stockStatus = "high"
                } else {
                    stockStatus = "normal"
                }
            } else if (product.minStock) {
                // Si no hay maxStock pero hay minStock, usamos la lógica anterior como fallback
                stockStatus = totalQuantity <= product.minStock ? "low" : "normal"
                // Estimamos un porcentaje basado en minStock (asumiendo que minStock es aproximadamente el 20% de la capacidad)
                stockPercentage = product.minStock > 0 ? (totalQuantity / (product.minStock * 5)) * 100 : 0
            }

            return {
                productId,
                product,
                totalQuantity,
                stockStatus,
                stockPercentage,
                stocks: productStocks,
            }
        })
        .filter(Boolean)

    // Filtrar productos
    const filteredProducts = productTotals.filter((item) => {
        // Filtro por término de búsqueda
        const matchesSearch =
            item.product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.description?.toLowerCase().includes(searchTerm.toLowerCase())

        // Filtro por área
        const matchesArea = selectedArea === "all" || item.stocks.some((stock) => stock.areaId === selectedArea)

        // Filtro por estado de stock
        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "low" && item.stockStatus === "low") ||
            (selectedStatus === "normal" && item.stockStatus === "normal") ||
            (selectedStatus === "high" && item.stockStatus === "high") ||
            (selectedStatus === "out" && item.totalQuantity === 0)

        return matchesSearch && matchesArea && matchesStatus
    })

    // Navegar a la página de registro de movimiento
    const navigateToMovement = (type: string, productId?: string) => {
        if (type === "entrada") {
            router.push(`/agency/${agencyId}/movements/entrada${productId ? `?productId=${productId}` : ""}`)
        } else if (type === "salida") {
            router.push(`/agency/${agencyId}/movements/salida${productId ? `?productId=${productId}` : ""}`)
        } else if (type === "transferencia") {
            router.push(`/agency/${agencyId}/movements/transferencia${productId ? `?productId=${productId}` : ""}`)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle>Inventario de Productos</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar productos..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => navigateToMovement("entrada")}>
                                    <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                                    Entrada
                                </Button>
                                <Button variant="outline" onClick={() => navigateToMovement("salida")}>
                                    <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                                    Salida
                                </Button>
                                <Button variant="outline" onClick={() => navigateToMovement("transferencia")}>
                                    <ArrowLeftRight className="h-4 w-4 mr-2 text-blue-500" />
                                    Transferir
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filtros expandibles */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Área</label>
                                <Select value={selectedArea} onValueChange={setSelectedArea}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las áreas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las áreas</SelectItem>
                                        {areas.map((area) => (
                                            <SelectItem key={area._id.toString()} value={area._id.toString()}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Estado de Stock</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="low">Stock bajo</SelectItem>
                                        <SelectItem value="normal">Stock normal</SelectItem>
                                        <SelectItem value="high">Stock alto</SelectItem>
                                        <SelectItem value="out">Sin stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                            <p className="text-muted-foreground mb-6">
                                {searchTerm || selectedArea !== "all" || selectedStatus !== "all"
                                    ? "Intenta con otros filtros de búsqueda."
                                    : "No hay productos en el inventario."}
                            </p>
                            {!searchTerm && selectedArea === "all" && selectedStatus === "all" && (
                                <Button onClick={() => navigateToMovement("entrada")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Registrar Entrada
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Producto</TableHead>
                                        <TableHead>Stock Total</TableHead>
                                        <TableHead>Ubicaciones</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((item) => (
                                        <TableRow key={item.productId}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                                        {item.product.images && item.product.images.length > 0 ? (
                                                            <img
                                                                src={item.product.images[0] || "/placeholder.svg"}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-xs text-muted-foreground">{item.product.sku || "Sin SKU"}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.totalQuantity}</span>
                                                    {item.product.minStock && (
                                                        <div className="w-16 bg-muted rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${item.stockStatus === "low" ? "bg-red-500" : "bg-green-500"
                                                                    }`}
                                                                style={{
                                                                    width: `${Math.min(100, (item.totalQuantity / item.product.minStock) * 100)}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.stocks.map((stock) => {
                                                        const area = areasMap.get(stock.areaId)
                                                        return (
                                                            <Badge key={stock._id.toString()} variant="outline" className="text-xs">
                                                                {area ? area.name : "Área sin nombre"}: {stock.quantity}
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.totalQuantity === 0 ? (
                                                    <Badge variant="destructive">Sin stock</Badge>
                                                ) : item.stockStatus === "low" ? (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100/80">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Stock bajo
                                                    </Badge>
                                                ) : item.stockStatus === "high" ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">
                                                        Stock alto
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100/80">
                                                        Stock normal
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigateToMovement("entrada", item.productId)}
                                                    >
                                                        <ArrowDownToLine className="h-4 w-4 mr-1 text-green-500" />
                                                        Entrada
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigateToMovement("salida", item.productId)}
                                                        disabled={item.totalQuantity === 0}
                                                    >
                                                        <ArrowUpFromLine className="h-4 w-4 mr-1 text-red-500" />
                                                        Salida
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/agency/${agencyId}/(Inventory)?tab=product&productId=${item.productId}`}>
                                                            Ver
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
