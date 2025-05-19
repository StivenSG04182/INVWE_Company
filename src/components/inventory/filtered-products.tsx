"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import StockStatusBadge from "./stock-status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Copy,
    Edit,
    Eye,
    Grid,
    List,
    MoreHorizontal,
    Package,
    Search,
    Tag,
    Trash2,
    Plus,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FilteredProductsProps {
    agencyId: string
    products: any[]
    categories: any[]
    subAccounts: any[]
}

export function FilteredProducts({ agencyId, products, categories, subAccounts }: FilteredProductsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    
    // Función para obtener el nombre de la categoría por su ID
    const getCategoryName = (categoryId: string) => {
        // Convertir a string para asegurar una comparación consistente
        const category = categories.find(cat => String(cat._id) === String(categoryId))
        return category ? category.name : "Sin categoría"
    }

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedSubaccount, setSelectedSubaccount] = useState("all")
    const [sortBy, setSortBy] = useState("name-asc")
    const [viewMode, setViewMode] = useState<"grid" | "table">("table")

    // Aplicar filtros de URL al cargar
    useEffect(() => {
        const category = searchParams.get("category")
        const subaccount = searchParams.get("subaccount")
        const search = searchParams.get("search")
        const sort = searchParams.get("sort")
        const view = searchParams.get("view")

        if (category) setSelectedCategory(category)
        if (subaccount) setSelectedSubaccount(subaccount)
        if (search) setSearchTerm(search)
        if (sort) setSortBy(sort)
        if (view === "grid" || view === "table") setViewMode(view)
    }, [searchParams])

    // Filtrar productos
    const filteredProducts = products.filter((product) => {
        // Filtro por término de búsqueda
        const matchesSearch =
            searchTerm === "" ||
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())

        // Filtro por categoría
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory

        // Filtro por subcuenta
        const matchesSubaccount = selectedSubaccount === "all" || product.subaccountId === selectedSubaccount

        return matchesSearch && matchesCategory && matchesSubaccount
    })

    // Ordenar productos
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "name-asc":
                return (a.name || "").localeCompare(b.name || "")
            case "name-desc":
                return (b.name || "").localeCompare(a.name || "")
            case "price-asc":
                return (a.price || 0) - (b.price || 0)
            case "price-desc":
                return (b.price || 0) - (a.price || 0)
            case "stock-asc":
                return (a.quantity || 0) - (b.quantity || 0)
            case "stock-desc":
                return (b.quantity || 0) - (a.quantity || 0)
            default:
                return 0
        }
    })

    // Función para duplicar producto
    const duplicateProduct = async (productId: string) => {
        try {
            const response = await fetch(`/api/inventory/${agencyId}/duplicate-product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Producto duplicado",
                    description: "El producto se ha duplicado correctamente.",
                })
                router.refresh()
            } else {
                throw new Error(result.error || "Error al duplicar el producto")
            }
        } catch (error) {
            console.error("Error al duplicar producto:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo duplicar el producto. Inténtalo de nuevo.",
            })
        }
    }

    // Función para eliminar producto
    const deleteProduct = async (productId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            const response = await fetch(`/api/inventory/${agencyId}/product/${productId}`, {
                method: "DELETE",
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Producto eliminado",
                    description: "El producto se ha eliminado correctamente.",
                })
                router.refresh()
            } else {
                throw new Error(result.error || "Error al eliminar el producto")
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, SKU o código de barras..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSubaccount} onValueChange={setSelectedSubaccount}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Subcuenta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las subcuentas</SelectItem>
                            {subAccounts.map((subaccount) => (
                                <SelectItem key={subaccount._id} value={subaccount._id}>
                                    {subaccount.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2 items-center">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                            <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                            <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                            <SelectItem value="stock-asc">Stock (menor a mayor)</SelectItem>
                            <SelectItem value="stock-desc">Stock (mayor a menor)</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="border rounded-md flex">
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("table")}
                            className="rounded-l-none"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-full" />
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className="rounded-r-none"
                        >
                            <List className="h-4 w-4" />
                        </Button>

                    </div>
                </div>
            </div>

            <div className="text-sm text-muted-foreground">{filteredProducts.length} productos encontrados</div>

            {viewMode === "grid" ? (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>SKU / Código</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedProducts.length > 0 ? (
                                    sortedProducts.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell>
                                                <div className="relative h-10 w-10 rounded-md overflow-hidden border">
                                                    {product.images && product.images.length > 0 ? (
                                                        <Image
                                                            src={product.images[0] || "/placeholder.svg"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-muted">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {product.description || "Sin descripción"}
                                                </div>
                                                {(product.brand || product.model) && (
                                                    <div className="text-xs mt-1">
                                                        {product.brand && <span className="font-medium">{product.brand}</span>}
                                                        {product.brand && product.model && <span> - </span>}
                                                        {product.model && <span>{product.model}</span>}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>{product.sku}</div>
                                                {product.barcode && <div className="text-xs text-muted-foreground">{product.barcode}</div>}
                                                {product.serialNumber && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <span className="font-medium">S/N:</span> {product.serialNumber}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {product.categoryId ? (
                                                    <Badge variant="outline" className="font-normal">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {getCategoryName(product.categoryId)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs"></span>
                                                )}
                                                {product.tags && product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {product.tags.slice(0, 2).map((tag: string, index: number) => (
                                                            <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                                                        ))}
                                                        {product.tags.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">+{product.tags.length - 2}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">${typeof product.price === 'number' ? product.price.toFixed(2) : "0.00"}</div>
                                                {product.cost && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Costo: ${typeof product.cost === 'number' ? product.cost.toFixed(2) : "0.00"}
                                                    </div>
                                                )}
                                                {product.discount > 0 && (
                                                    <div className="text-xs text-green-600 dark:text-green-500 font-medium">
                                                        {product.discount}% descuento
                                                        {product.discountStartDate && product.discountEndDate && (
                                                            <span className="block text-[10px]">
                                                                {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    {product.quantity || 0} {product.unit || "unidades"}
                                                </div>
                                                <div className="flex justify-end mt-1">
                                                    <StockStatusBadge product={product} className="text-xs" />
                                                </div>
                                                {product.minStock > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Mín: {product.minStock} {product.unit || "unidades"}
                                                    </div>
                                                )}
                                                {product.warehouseId && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Ubicación: {product.locationId || "General"}
                                                    </div>
                                                )}
                                                {product.batchNumber && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Lote: {product.batchNumber}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={product.isActive !== false ? "default" : "secondary"}>
                                                    {product.isActive !== false ? "Activo" : "Inactivo"}
                                                </Badge>
                                                {product.expirationDate && (
                                                    <div className="text-xs mt-1">
                                                        <span className="font-medium">Vence:</span> {new Date(product.expirationDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {product.warrantyMonths > 0 && (
                                                    <div className="text-xs mt-1">
                                                        <span className="font-medium">Garantía:</span> {product.warrantyMonths} meses
                                                    </div>
                                                )}
                                                <div className="text-xs mt-1">
                                                    <span className="font-medium">Retornable:</span> {product.isReturnable ? "Sí" : "No"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/agency/${agencyId}/products/${product._id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Ver detalles
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/agency/${agencyId}/products/${product._id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => duplicateProduct(product._id)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => deleteProduct(product._id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No se encontraron productos con los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map((product) => (
                            <Card key={product._id} className="overflow-hidden">
                                <div className="relative aspect-square">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0] || "/placeholder.svg"}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-muted">
                                            <Package className="h-12 w-12 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    <div className="absolute top-2 left-2">
                                        <StockStatusBadge product={product} className="px-2 py-1" />
                                    </div>

                                    {product.discount > 0 && (
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 px-2 py-1">
                                                {product.discount}% descuento
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {product.expirationDate && new Date(product.expirationDate) < new Date(new Date().setMonth(new Date().getMonth() + 3)) && (
                                        <div className="absolute bottom-2 right-2">
                                            <Badge variant="destructive" className="px-2 py-1">
                                                Vence: {new Date(product.expirationDate).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4">
                                    <div className="mb-2">
                                        <h3 className="font-medium truncate">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{product.description || "Sin descripción"}</p>
                                        {(product.brand || product.model) && (
                                            <p className="text-xs mt-1">
                                                {product.brand && <span className="font-medium">{product.brand}</span>}
                                                {product.brand && product.model && <span> - </span>}
                                                {product.model && <span>{product.model}</span>}
                                            </p>
                                        )}
                                        {product.serialNumber && (
                                            <p className="text-xs mt-1">
                                                <span className="font-medium">S/N:</span> {product.serialNumber}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm">
                                            <span className="font-medium">${typeof product.price === 'number' ? product.price.toFixed(2) : "0.00"}</span>
                                            {product.discount > 0 && (
                                                <span className="text-xs text-muted-foreground line-through ml-1">
                                                    ${typeof product.price === 'number' ? (product.price / (1 - (product.discount || 0) / 100)).toFixed(2) : "0.00"}
                                                </span>
                                            )}
                                            {product.cost && (
                                                <div className="text-xs text-muted-foreground">
                                                    Costo: ${typeof product.cost === 'number' ? product.cost.toFixed(2) : "0.00"}
                                                </div>
                                            )}
                                            {product.discount > 0 && product.discountStartDate && product.discountEndDate && (
                                                <div className="text-xs text-green-600">
                                                    {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Stock:</span>{" "}
                                            <span className="font-medium">{product.quantity || 0} {product.unit || ""}</span>
                                            {product.minStock > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    Mín: {product.minStock}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <Badge variant="outline" className="font-normal text-xs">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {product.categoryId ? getCategoryName(product.categoryId) : "Sin categoría"}
                                        </Badge>
                                        <Badge variant={product.isActive !== false ? "default" : "secondary"} className="text-xs">
                                            {product.isActive !== false ? "Activo" : "Inactivo"}
                                        </Badge>
                                        {product.warrantyMonths > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                Garantía: {product.warrantyMonths}m
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {product.tags.slice(0, 3).map((tag: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs bg-muted/50">{tag}</Badge>
                                            ))}
                                            {product.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs bg-muted/50">+{product.tags.length - 3}</Badge>
                                            )}
                                        </div>
                                    )}
                                    
                                    {(product.batchNumber || product.locationId) && (
                                        <div className="text-xs text-muted-foreground mb-3">
                                            {product.batchNumber && <span>Lote: {product.batchNumber}</span>}
                                            {product.batchNumber && product.locationId && <span> | </span>}
                                            {product.locationId && <span>Ubicación: {product.locationId}</span>}
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <Link href={`/agency/${agencyId}/products/${product._id}`}>
                                                <Eye className="h-3.5 w-3.5 mr-1" />
                                                Ver
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <Link href={`/agency/${agencyId}/products/${product._id}/edit`}>
                                                <Edit className="h-3.5 w-3.5 mr-1" />
                                                Editar
                                            </Link>
                                        </Button> 
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => duplicateProduct(product._id)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteProduct(product._id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-10">
                                    <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-medium mb-2">No se encontraron productos</h3>
                                    <p className="text-muted-foreground text-center mb-6">
                                        Prueba con otros filtros o crea un nuevo producto.
                                    </p>
                                    <Link href={`/agency/${agencyId}/products/new`}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nuevo Producto
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
