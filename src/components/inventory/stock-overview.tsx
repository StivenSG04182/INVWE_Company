"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    Search,
    Filter,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Plus,
    AlertTriangle,
    Calendar,
    Building2,
    Archive,
    Eye,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react"
import Image from "next/image"
import { getMovements, getSubAccountsForAgency, getProducts } from "@/lib/queries2"

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
    products: initialProducts,
    areas,
    productsMap: initialProductsMap,
    areasMap,
}: StockOverviewProps) {
    const router = useRouter()

    // Estados básicos
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedArea, setSelectedArea] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [showFilters, setShowFilters] = useState(false)
    const [activeTab, setActiveTab] = useState("products")

    // Estados para productos
    const [products, setProducts] = useState(initialProducts)
    const [productsMap, setProductsMap] = useState(initialProductsMap)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [productSortBy, setProductSortBy] = useState("name-asc")

    // Estados para movimientos
    const [movements, setMovements] = useState<any[]>([])
    const [selectedMovementType, setSelectedMovementType] = useState("all")
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [selectedSubaccount, setSelectedSubaccount] = useState("all")
    const [selectedDateRange, setSelectedDateRange] = useState("all")
    const [isLoading, setIsLoading] = useState(false)
    const [movementSearchTerm, setMovementSearchTerm] = useState("")
    const [movementSortBy, setMovementSortBy] = useState("date-desc")

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Cargar productos
                const productsData = await getProducts(agencyId)
                setProducts(productsData)

                // Actualizar productsMap
                const newProductsMap = new Map()
                productsData.forEach((product: any) => {
                    newProductsMap.set(product.id, product)
                })
                setProductsMap(newProductsMap)

                // Cargar movimientos y subaccounts
                const [movementsData, subaccountsData] = await Promise.all([
                    getMovements(agencyId),
                    getSubAccountsForAgency(agencyId),
                ])

                setMovements(movementsData)
                setSubaccounts(subaccountsData)
            } catch (error) {
                console.error("Error loading initial data:", error)
            }
        }

        loadInitialData()
    }, [agencyId])

    // Función para recargar productos
    const loadProducts = async () => {
        setIsLoadingProducts(true)
        try {
            const productsData = await getProducts(agencyId)
            setProducts(productsData)

            const newProductsMap = new Map()
            productsData.forEach((product: any) => {
                newProductsMap.set(product.id, product)
            })
            setProductsMap(newProductsMap)
        } catch (error) {
            console.error("Error loading products:", error)
        } finally {
            setIsLoadingProducts(false)
        }
    }

    // Función para recargar movimientos
    const loadMovements = async () => {
        setIsLoading(true)
        try {
            const [movementsData, subaccountsData] = await Promise.all([
                getMovements(agencyId),
                getSubAccountsForAgency(agencyId),
            ])
            setMovements(movementsData)
            setSubaccounts(subaccountsData)
        } catch (error) {
            console.error("Error loading movements:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // ✅ CORREGIDO: Filtrar y ordenar productos usando useMemo
    const filteredAndSortedProducts = useMemo(() => {
        const filtered = products.filter((product) => {
            // Filtro por término de búsqueda
            const matchesSearch =
                searchTerm === "" ||
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.model?.toLowerCase().includes(searchTerm.toLowerCase())

            // Calcular estado de stock
            const totalQuantity = product.quantity || 0
            let stockStatus = "normal"

            if (totalQuantity === 0) {
                stockStatus = "out"
            } else if (product.maxStock && product.maxStock > 0) {
                const stockPercentage = (totalQuantity / product.maxStock) * 100
                if (stockPercentage <= 10) {
                    stockStatus = "low"
                } else if (stockPercentage >= 75) {
                    stockStatus = "high"
                }
            } else if (product.minStock && totalQuantity <= product.minStock) {
                stockStatus = "low"
            }

            // Filtro por estado de stock
            const matchesStatus = selectedStatus === "all" || stockStatus === selectedStatus

            // Filtro por área (si el producto tiene área asignada)
            const matchesArea =
                selectedArea === "all" ||
                (product.areaId && String(product.areaId) === String(selectedArea)) ||
                (product.warehouseId && String(product.warehouseId) === String(selectedArea))

            return matchesSearch && matchesStatus && matchesArea
        })

        // Ordenar productos
        filtered.sort((a, b) => {
            switch (productSortBy) {
                case "name-asc":
                    return (a.name || "").localeCompare(b.name || "")
                case "name-desc":
                    return (b.name || "").localeCompare(a.name || "")
                case "stock-asc":
                    return (a.quantity || 0) - (b.quantity || 0)
                case "stock-desc":
                    return (b.quantity || 0) - (a.quantity || 0)
                case "sku-asc":
                    return (a.sku || "").localeCompare(b.sku || "")
                case "sku-desc":
                    return (b.sku || "").localeCompare(a.sku || "")
                default:
                    return 0
            }
        })

        return filtered.map((product) => {
            const totalQuantity = product.quantity || 0
            let stockStatus = "normal"
            let stockPercentage = 0

            if (totalQuantity === 0) {
                stockStatus = "out"
            } else if (product.maxStock && product.maxStock > 0) {
                stockPercentage = (totalQuantity / product.maxStock) * 100
                if (stockPercentage <= 10) {
                    stockStatus = "low"
                } else if (stockPercentage >= 75) {
                    stockStatus = "high"
                }
            } else if (product.minStock && totalQuantity <= product.minStock) {
                stockStatus = "low"
            }

            return {
                productId: product.id,
                product,
                totalQuantity,
                stockStatus,
                stockPercentage,
                stocks: [],
            }
        })
    }, [products, searchTerm, selectedArea, selectedStatus, productSortBy])

    // ✅ CORREGIDO: Filtrar movimientos por fecha
    const filterByDateRange = (movement: any) => {
        if (selectedDateRange === "all") return true

        const movementDate = new Date(movement.date)
        const now = new Date()

        switch (selectedDateRange) {
            case "today":
                return movementDate.toDateString() === now.toDateString()
            case "week":
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return movementDate >= weekAgo
            case "month":
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                return movementDate >= monthAgo
            case "quarter":
                const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                return movementDate >= quarterAgo
            default:
                return true
        }
    }

    // ✅ CORREGIDO: Filtrar y ordenar movimientos usando useMemo
    const filteredAndSortedMovements = useMemo(() => {
        const filtered = movements.filter((movement) => {
            const matchesType = selectedMovementType === "all" || movement.type === selectedMovementType
            const matchesSubaccount = selectedSubaccount === "all" || movement.subAccountId === selectedSubaccount
            const matchesDate = filterByDateRange(movement)
            const matchesSearch =
                !movementSearchTerm ||
                movement.Product?.name?.toLowerCase().includes(movementSearchTerm.toLowerCase()) ||
                movement.notes?.toLowerCase().includes(movementSearchTerm.toLowerCase()) ||
                movement.Area?.name?.toLowerCase().includes(movementSearchTerm.toLowerCase()) ||
                movement.DestinationArea?.name?.toLowerCase().includes(movementSearchTerm.toLowerCase())

            return matchesType && matchesSubaccount && matchesDate && matchesSearch
        })

        // Ordenar movimientos
        filtered.sort((a, b) => {
            switch (movementSortBy) {
                case "date-desc":
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                case "date-asc":
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                case "product-asc":
                    return (a.Product?.name || "").localeCompare(b.Product?.name || "")
                case "product-desc":
                    return (b.Product?.name || "").localeCompare(a.Product?.name || "")
                case "quantity-asc":
                    return (a.quantity || 0) - (b.quantity || 0)
                case "quantity-desc":
                    return (b.quantity || 0) - (a.quantity || 0)
                case "type-asc":
                    return (a.type || "").localeCompare(b.type || "")
                case "type-desc":
                    return (b.type || "").localeCompare(a.type || "")
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
            }
        })

        return filtered
    }, [movements, selectedMovementType, selectedSubaccount, selectedDateRange, movementSearchTerm, movementSortBy])

    // ✅ CORREGIDO: Estadísticas de movimientos calculadas correctamente
    const movementStats = useMemo(() => {
        return {
            total: filteredAndSortedMovements.length,
            entradas: filteredAndSortedMovements.filter((m) => m.type === "entrada").length,
            salidas: filteredAndSortedMovements.filter((m) => m.type === "salida").length,
            transferencias: filteredAndSortedMovements.filter((m) => m.type === "transferencia").length,
        }
    }, [filteredAndSortedMovements])

    // Navegar a movimientos
    const navigateToMovement = (type: string, productId?: string) => {
        const routes = {
            entrada: `/agency/${agencyId}/movements/entrada`,
            salida: `/agency/${agencyId}/movements/salida`,
            transferencia: `/agency/${agencyId}/movements/transferencia`,
        }

        const baseUrl = routes[type as keyof typeof routes]
        const url = productId ? `${baseUrl}?productId=${productId}` : baseUrl
        router.push(url)
    }

    // Obtener icono de movimiento
    const getMovementIcon = (type: string) => {
        switch (type) {
            case "entrada":
                return <TrendingUp className="h-4 w-4" />
            case "salida":
                return <TrendingDown className="h-4 w-4" />
            case "transferencia":
                return <ArrowLeftRight className="h-4 w-4" />
            default:
                return <Minus className="h-4 w-4" />
        }
    }

    // Obtener variant del badge para movimientos
    const getMovementBadgeVariant = (type: string) => {
        switch (type) {
            case "entrada":
                return "default" // Verde
            case "salida":
                return "destructive" // Rojo
            case "transferencia":
                return "secondary" // Azul
            default:
                return "outline"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
                    <p className="text-muted-foreground">Administra productos, stock y movimientos de inventario</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => navigateToMovement("entrada")} variant="outline">
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Nueva Entrada
                    </Button>
                    <Button onClick={() => navigateToMovement("salida")} variant="outline">
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Nueva Salida
                    </Button>
                    <Button onClick={() => navigateToMovement("transferencia")} variant="outline">
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Transferencia
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Productos ({filteredAndSortedProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="movements" className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Movimientos ({movementStats.total})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
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
                                    <Button variant="outline" size="icon" onClick={loadProducts} disabled={isLoadingProducts}>
                                        <RefreshCw className={`h-4 w-4 ${isLoadingProducts ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Área</label>
                                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas las áreas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las áreas</SelectItem>
                                                {areas.map((area) => (
                                                    <SelectItem key={area.id || area._id} value={String(area.id || area._id)}>
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
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Ordenar por</label>
                                        <Select value={productSortBy} onValueChange={setProductSortBy}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Ordenar por" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                                                <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                                                <SelectItem value="stock-asc">Stock (menor a mayor)</SelectItem>
                                                <SelectItem value="stock-desc">Stock (mayor a menor)</SelectItem>
                                                <SelectItem value="sku-asc">SKU (A-Z)</SelectItem>
                                                <SelectItem value="sku-desc">SKU (Z-A)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm("")
                                                setSelectedArea("all")
                                                setSelectedStatus("all")
                                                setProductSortBy("name-asc")
                                            }}
                                            className="w-full"
                                        >
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoadingProducts ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">Cargando productos...</p>
                                </div>
                            ) : filteredAndSortedProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm || selectedArea !== "all" || selectedStatus !== "all"
                                            ? "Intenta con otros filtros de búsqueda."
                                            : "No hay productos en el inventario."}
                                    </p>
                                    {!searchTerm && selectedArea === "all" && selectedStatus === "all" && (
                                        <Button onClick={() => navigateToMovement("entrada")}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar Primera Entrada
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {filteredAndSortedProducts.length} de {products.length} productos
                                        {searchTerm && <span className="ml-2">• Búsqueda: "{searchTerm}"</span>}
                                        {selectedStatus !== "all" && (
                                            <span className="ml-2">
                                                • Estado:{" "}
                                                {selectedStatus === "low"
                                                    ? "Stock bajo"
                                                    : selectedStatus === "high"
                                                        ? "Stock alto"
                                                        : selectedStatus === "out"
                                                            ? "Sin stock"
                                                            : "Stock normal"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Producto</TableHead>
                                                    <TableHead>Stock Total</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredAndSortedProducts.map((item) => (
                                                    <TableRow key={item.productId} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                                                    {item.product?.images?.length > 0 ? (
                                                                        <Image
                                                                            src={item.product.images[0] || "/placeholder.svg"}
                                                                            alt={item.product.name || ""}
                                                                            width={48}
                                                                            height={48}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-sm">{item.product.name}</div>
                                                                    <div className="text-xs text-muted-foreground">SKU: {item.product.sku || "N/A"}</div>
                                                                    {item.product.brand && (
                                                                        <div className="text-xs text-muted-foreground">Marca: {item.product.brand}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Building2 className="h-3 w-3 mr-1" />
                                                                    Total: {item.totalQuantity} {item.product.unit || "unidades"}
                                                                </Badge>
                                                                {item.product.minStock > 0 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Mín: {item.product.minStock}
                                                                    </Badge>
                                                                )}
                                                                {item.product.maxStock > 0 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Máx: {item.product.maxStock}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.totalQuantity === 0 ? (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Sin stock
                                                                </Badge>
                                                            ) : item.stockStatus === "low" ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-amber-100 text-amber-800 hover:bg-amber-100/80 gap-1"
                                                                >
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Stock bajo
                                                                </Badge>
                                                            ) : item.stockStatus === "high" ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-green-100 text-green-800 hover:bg-green-100/80 gap-1"
                                                                >
                                                                    <TrendingUp className="h-3 w-3" />
                                                                    Stock alto
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100/80">
                                                                    Stock normal
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => navigateToMovement("entrada", item.productId)}
                                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                                >
                                                                    <ArrowDownToLine className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => navigateToMovement("salida", item.productId)}
                                                                    disabled={item.totalQuantity === 0}
                                                                    className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                                                                >
                                                                    <ArrowUpFromLine className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={`/agency/${agencyId}/products/${item.productId}`}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="movements" className="space-y-4">
                    {/* ✅ CORREGIDO: Estadísticas de movimientos con filtrado interactivo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedMovementType === "all" ? "ring-2 ring-primary" : ""
                                }`}
                            onClick={() => setSelectedMovementType("all")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Archive className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                                        <p className="text-2xl font-bold">{movementStats.total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedMovementType === "entrada" ? "ring-2 ring-green-600" : ""
                                }`}
                            onClick={() => setSelectedMovementType("entrada")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                                        <p className="text-2xl font-bold text-green-600">{movementStats.entradas}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedMovementType === "salida" ? "ring-2 ring-red-600" : ""
                                }`}
                            onClick={() => setSelectedMovementType("salida")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Salidas</p>
                                        <p className="text-2xl font-bold text-red-600">{movementStats.salidas}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedMovementType === "transferencia" ? "ring-2 ring-blue-600" : ""
                                }`}
                            onClick={() => setSelectedMovementType("transferencia")}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Transferencias</p>
                                        <p className="text-2xl font-bold text-blue-600">{movementStats.transferencias}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <CardTitle>Historial de Movimientos</CardTitle>
                                <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar movimientos..."
                                            className="pl-8"
                                            value={movementSearchTerm}
                                            onChange={(e) => setMovementSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={showFilters ? "bg-muted" : ""}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={loadMovements} disabled={isLoading}>
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Tipo de Movimiento</label>
                                        <Select value={selectedMovementType} onValueChange={setSelectedMovementType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos los movimientos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los movimientos</SelectItem>
                                                <SelectItem value="entrada">Entradas</SelectItem>
                                                <SelectItem value="salida">Salidas</SelectItem>
                                                <SelectItem value="transferencia">Transferencias</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Sucursal</label>
                                        <Select value={selectedSubaccount} onValueChange={setSelectedSubaccount}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas las sucursales" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las sucursales</SelectItem>
                                                {subaccounts.map((subaccount) => (
                                                    <SelectItem key={subaccount.id} value={subaccount.id}>
                                                        {subaccount.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Período</label>
                                        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos los períodos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todo el tiempo</SelectItem>
                                                <SelectItem value="today">Hoy</SelectItem>
                                                <SelectItem value="week">Última semana</SelectItem>
                                                <SelectItem value="month">Último mes</SelectItem>
                                                <SelectItem value="quarter">Último trimestre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Ordenar por</label>
                                        <Select value={movementSortBy} onValueChange={setMovementSortBy}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Ordenar por" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                                                <SelectItem value="date-asc">Fecha (más antiguo)</SelectItem>
                                                <SelectItem value="product-asc">Producto (A-Z)</SelectItem>
                                                <SelectItem value="product-desc">Producto (Z-A)</SelectItem>
                                                <SelectItem value="quantity-desc">Cantidad (mayor a menor)</SelectItem>
                                                <SelectItem value="quantity-asc">Cantidad (menor a mayor)</SelectItem>
                                                <SelectItem value="type-asc">Tipo (A-Z)</SelectItem>
                                                <SelectItem value="type-desc">Tipo (Z-A)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setMovementSearchTerm("")
                                                setSelectedMovementType("all")
                                                setSelectedSubaccount("all")
                                                setSelectedDateRange("all")
                                                setMovementSortBy("date-desc")
                                            }}
                                            className="w-full"
                                        >
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">Cargando movimientos...</p>
                                </div>
                            ) : filteredAndSortedMovements.length === 0 ? (
                                <div className="text-center py-12">
                                    <Archive className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No se encontraron movimientos</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {movementSearchTerm ||
                                            selectedMovementType !== "all" ||
                                            selectedSubaccount !== "all" ||
                                            selectedDateRange !== "all"
                                            ? "Intenta con otros filtros de búsqueda."
                                            : "No hay movimientos registrados."}
                                    </p>
                                    {!movementSearchTerm &&
                                        selectedMovementType === "all" &&
                                        selectedSubaccount === "all" &&
                                        selectedDateRange === "all" && (
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <Button onClick={() => navigateToMovement("entrada")}>
                                                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                                                    Primera Entrada
                                                </Button>
                                                <Button onClick={() => navigateToMovement("salida")}>
                                                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                                                    Primera Salida
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {filteredAndSortedMovements.length} de {movements.length} movimientos
                                        {movementSearchTerm && <span className="ml-2">• Búsqueda: "{movementSearchTerm}"</span>}
                                        {selectedMovementType !== "all" && (
                                            <span className="ml-2">
                                                • Tipo: {selectedMovementType.charAt(0).toUpperCase() + selectedMovementType.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[120px]">Fecha</TableHead>
                                                    <TableHead className="w-[120px]">Tipo</TableHead>
                                                    <TableHead className="w-[250px]">Producto</TableHead>
                                                    <TableHead className="w-[100px] text-center">Cantidad</TableHead>
                                                    <TableHead className="w-[150px]">Área</TableHead>
                                                    <TableHead className="w-[150px]">Sucursal</TableHead>
                                                    <TableHead>Notas</TableHead>
                                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredAndSortedMovements.map((movement) => (
                                                    <TableRow key={movement.id} className="hover:bg-muted/50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium text-sm">
                                                                        {new Date(movement.date).toLocaleDateString("es-ES", {
                                                                            day: "2-digit",
                                                                            month: "2-digit",
                                                                            year: "numeric",
                                                                        })}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(movement.date).toLocaleTimeString("es-ES", {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getMovementBadgeVariant(movement.type)} className="gap-1 font-medium">
                                                                {getMovementIcon(movement.type)}
                                                                {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                                                    {movement.Product?.images && movement.Product.images.length > 0 ? (
                                                                        <Image
                                                                            src={movement.Product.images[0] || "/placeholder.svg"}
                                                                            alt={movement.Product.name}
                                                                            width={32}
                                                                            height={32}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-sm">
                                                                        {movement.Product?.name || "Producto eliminado"}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        SKU: {movement.Product?.sku || "N/A"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div
                                                                className={`font-bold text-lg ${movement.type === "entrada"
                                                                        ? "text-green-600"
                                                                        : movement.type === "salida"
                                                                            ? "text-red-600"
                                                                            : "text-blue-600"
                                                                    }`}
                                                            >
                                                                {movement.type === "entrada" ? "+" : movement.type === "salida" ? "-" : ""}
                                                                {movement.quantity}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{movement.Area?.name || "Área eliminada"}</span>
                                                            </div>
                                                            {movement.type === "transferencia" && movement.DestinationArea && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        → {movement.DestinationArea.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm">
                                                                {subaccounts.find((s) => s.id === movement.subAccountId)?.name || "Sucursal eliminada"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="max-w-[200px]">
                                                                <p className="text-sm text-muted-foreground truncate" title={movement.notes}>
                                                                    {movement.notes || "Sin notas"}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/agency/${agencyId}/movements/${movement.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Paginación simple */}
                                    {filteredAndSortedMovements.length > 0 && (
                                        <div className="flex justify-between items-center pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Mostrando {filteredAndSortedMovements.length} movimientos
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" disabled>
                                                    Anterior
                                                </Button>
                                                <Button variant="outline" size="sm" disabled>
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
