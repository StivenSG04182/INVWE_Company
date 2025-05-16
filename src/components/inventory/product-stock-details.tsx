"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
    Package,
    Plus,
    ArrowLeft,
    Layers,
    Trash2,
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Edit,
    Eye,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProductStockDetailsProps {
    agencyId: string
    productId: string
    products: any[]
    stocks: any[]
    areas: any[]
    productsMap: Map<string, any>
    areasMap: Map<string, any>
}

export default function ProductStockDetails({
    agencyId,
    productId,
    products,
    stocks,
    areas,
    productsMap,
    areasMap,
}: ProductStockDetailsProps) {
    const router = useRouter()
    const { toast } = useToast()

    // Obtener el producto
    const product = productsMap.get(productId)

    if (!product) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Producto no encontrado</h3>
                <p className="text-muted-foreground mb-6">El producto que está buscando no existe o ha sido eliminado.</p>
                <Button asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al inventario
                    </Link>
                </Button>
            </div>
        )
    }

    // Calcular stock total
    const totalStock = stocks.reduce((total, stock) => total + stock.quantity, 0)
    const stockStatus = product.minStock && totalStock <= product.minStock ? "bajo" : "normal"

    // Calcular valor total del inventario para este producto
    const totalValue = product.price * totalStock

    // Navegar a la página de registro de movimiento
    const registerMovement = (type: string, areaId?: string) => {
        const params = new URLSearchParams()
        params.set("tab", "movement")
        params.set("type", type)
        params.set("productId", productId)
        if (areaId) params.set("areaId", areaId)

        router.push(`/agency/${agencyId}/(Inventory)?${params.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al inventario
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stock Total</p>
                                <p className="text-2xl font-bold">{totalStock} unidades</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Valor del Inventario</p>
                                <p className="text-2xl font-bold">${totalValue.toLocaleString("es-CO")}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado del Stock</p>
                                <div className="flex items-center">
                                    <p className="text-2xl font-bold mr-2">{stockStatus === "bajo" ? "Bajo mínimo" : "Normal"}</p>
                                    <Badge variant={stockStatus === "bajo" ? "destructive" : "outline"}>
                                        {product.minStock || "Sin mínimo"}
                                    </Badge>
                                </div>
                            </div>
                            <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center ${stockStatus === "bajo" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"}`}
                            >
                                <AlertTriangle
                                    className={`h-6 w-6 ${stockStatus === "bajo" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"}`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Información del producto */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Información del Producto</CardTitle>
                        <CardDescription>Detalles del producto seleccionado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0] || "/placeholder.svg"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Package className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">{product.name}</h2>
                                <p className="text-sm text-muted-foreground">SKU: {product.sku || "Sin SKU"}</p>
                                {product.barcode && (
                                    <p className="text-sm text-muted-foreground">Código de barras: {product.barcode}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm font-medium">Precio</p>
                                    <p className="text-lg">${product.price.toLocaleString("es-CO")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Stock Mínimo</p>
                                    <p className="text-lg">{product.minStock || "No definido"}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium">Stock Total</p>
                                <div className="flex items-center mt-1">
                                    <p className="text-2xl font-bold mr-2">{totalStock}</p>
                                    <Badge variant={stockStatus === "bajo" ? "destructive" : "outline"}>
                                        {stockStatus === "bajo" ? "Stock Bajo" : "Stock Normal"}
                                    </Badge>
                                </div>
                                {product.minStock && (
                                    <div className="mt-2">
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${stockStatus === "bajo" ? "bg-destructive" : "bg-primary"}`}
                                                style={{ width: `${Math.min(100, (totalStock / product.minStock) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>0</span>
                                            <span>{product.minStock}</span>
                                            <span>{product.minStock * 2}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 space-y-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/agency/${agencyId}/products/${productId}`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar Producto
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/agency/${agencyId}/products/${productId}/stock`}>
                                        <Layers className="h-4 w-4 mr-2" />
                                        Gestión Avanzada
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de stock por ubicación */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Stock por Ubicación</CardTitle>
                            <CardDescription>Gestiona el stock en diferentes áreas</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => registerMovement("entrada")}>
                                        <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                                        Registrar Entrada
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => registerMovement("salida")}>
                                        <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                                        Registrar Salida
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!stocks || stocks.length === 0 ? (
                            <div className="text-center py-8">
                                <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No hay stock registrado</h3>
                                <p className="text-muted-foreground mb-6">
                                    Este producto no tiene stock registrado en ninguna ubicación.
                                </p>
                                <Button onClick={() => registerMovement("entrada")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Stock
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead className="text-center">Cantidad</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stocks.map((stock) => {
                                        const area = areasMap.get(stock.areaId)
                                        return (
                                            <TableRow key={stock._id.toString()}>
                                                <TableCell className="font-medium">{area ? area.name : "Área sin nombre"}</TableCell>
                                                <TableCell className="text-center">
                                                    {stock.quantity}
                                                    {product.minStock && (
                                                        <div className="flex items-center justify-center mt-1">
                                                            <div className="w-16 bg-muted rounded-full h-1.5">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${stock.quantity <= product.minStock ? "bg-red-500" : "bg-green-500"}`}
                                                                    style={{
                                                                        width: `${Math.min(100, (stock.quantity / product.minStock) * 100)}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${(product.price * stock.quantity).toLocaleString("es-CO")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Layers className="h-4 w-4 mr-2" />
                                                                    Acciones
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => registerMovement("entrada", stock.areaId)}>
                                                                    <Plus className="h-4 w-4 mr-2 text-green-500" />
                                                                    Registrar Entrada
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => registerMovement("salida", stock.areaId)}>
                                                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                                                    Registrar Salida
                                                                </DropdownMenuItem>
                                                                {area && (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/agency/${agencyId}/areas/workspace?areaId=${stock.areaId}`}>
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver Área
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
