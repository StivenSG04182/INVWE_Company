"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Package,
    Search,
    Plus,
    ArrowDownToLine,
    ArrowUpFromLine,
    AlertTriangle,
    Eye,
    MoreHorizontal,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState("")
    const [areaFilter, setAreaFilter] = useState("")
    const [stockFilter, setStockFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filtrar productos
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))

        // Filtrar por área si se seleccionó una
        const matchesArea =
            areaFilter === "" ||
            stocks.some((stock) => stock.productId === product._id.toString() && stock.areaId === areaFilter)

        // Filtrar por estado de stock
        const productStocks = stocks.filter((stock) => stock.productId === product._id.toString())
        const totalStock = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)

        let matchesStockFilter = true
        if (stockFilter === "low") {
            matchesStockFilter = product.minStock && totalStock <= product.minStock
        } else if (stockFilter === "normal") {
            matchesStockFilter = !product.minStock || totalStock > product.minStock
        }

        return matchesSearch && matchesArea && matchesStockFilter
    })

    // Paginación
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Actualizar página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, areaFilter, stockFilter])

    // Navegar a la página de detalle de producto
    const viewProductDetails = (productId: string) => {
        router.push(`/agency/${agencyId}/(Inventory)?tab=product&productId=${productId}`)
    }

    // Navegar a la página de registro de movimiento
    const registerMovement = (type: string, productId: string) => {
        router.push(`/agency/${agencyId}/(Inventory)?tab=movement&type=${type}&productId=${productId}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar productos..."
                            className="w-full md:w-[300px] pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
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

                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Estado de stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los productos</SelectItem>
                            <SelectItem value="low">Stock bajo</SelectItem>
                            <SelectItem value="normal">Stock normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
                        <Link href={`/agency/${agencyId}/products/new`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Producto
                        </Link>
                    </Button>
                    <Button size="sm" asChild className="w-full md:w-auto">
                        <Link href={`/agency/${agencyId}/(Inventory)?tab=movement&type=entrada`}>
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            Registrar Entrada
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventario de Productos</CardTitle>
                    <CardDescription>{filteredProducts.length} productos encontrados</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                            <p className="text-muted-foreground mb-6">
                                No hay productos que coincidan con los criterios de búsqueda.
                            </p>
                            <Button asChild>
                                <Link href={`/agency/${agencyId}/products/new`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Producto
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-center">SKU</TableHead>
                                            <TableHead className="text-center">Stock</TableHead>
                                            <TableHead className="text-center">Valor</TableHead>
                                            <TableHead className="text-center">Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedProducts.map((product) => {
                                            const productStocks = stocks.filter((stock) => stock.productId === product._id.toString())
                                            const totalStock = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)
                                            const totalValue = product.price * totalStock
                                            const isLowStock = product.minStock && totalStock <= product.minStock

                                            return (
                                                <TableRow key={product._id.toString()}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-center">{product.sku || "—"}</TableCell>
                                                    <TableCell className="text-center">{totalStock}</TableCell>
                                                    <TableCell className="text-center">${totalValue.toLocaleString("es-CO")}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isLowStock ? (
                                                            <Badge
                                                                variant="destructive"
                                                                className="flex items-center justify-center gap-1 w-fit mx-auto"
                                                            >
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Bajo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="w-fit mx-auto">
                                                                Normal
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => viewProductDetails(product._id.toString())}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => registerMovement("entrada", product._id.toString())}>
                                                                        <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                                                                        Registrar Entrada
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => registerMovement("salida", product._id.toString())}>
                                                                        <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                                                                        Registrar Salida
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/agency/${agencyId}/products/${product._id.toString()}`}>
                                                                            Editar Producto
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
