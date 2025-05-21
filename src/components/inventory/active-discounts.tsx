"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, Loader2, Package, Percent, Search, Tag, Trash2 } from "lucide-react"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ActiveDiscountsProps {
    agencyId: string
    activeDiscounts: any[]
    products: any[]
    categories: any[]
}

export function ActiveDiscounts({ agencyId, activeDiscounts, products, categories }: ActiveDiscountsProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [discountToRemove, setDiscountToRemove] = useState<string | null>(null)

    // Filtrar descuentos según el término de búsqueda
    const filteredDiscounts = activeDiscounts.filter(
        (discount) =>
            discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            discount.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Obtener nombre de producto o categoría
    const getItemName = (itemId: string, type: "product" | "category") => {
        if (type === "product") {
            const product = products.find((p) => p._id === itemId)
            return product ? product.name : "Producto desconocido"
        } else {
            const category = categories.find((c) => c._id === itemId)
            return category ? category.name : "Categoría desconocida"
        }
    }

    // Formatear fecha
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return format(date, "dd/MM/yyyy", { locale: es })
    }

    // Verificar si un descuento está por vencer (en los próximos 3 días)
    const isExpiringSoon = (endDate: string) => {
        if (!endDate) return false
        const end = new Date(endDate)
        const today = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(today.getDate() + 3)
        return end > today && end <= threeDaysFromNow
    }

    // Eliminar descuento
    const removeDiscount = async (discountId: string) => {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/inventory/${agencyId}/discounts/${discountId}`, {
                method: "DELETE",
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Descuento eliminado",
                    description: "El descuento ha sido eliminado exitosamente.",
                })
                router.refresh()
            } else {
                throw new Error(result.error || "Error al eliminar el descuento")
            }
        } catch (error) {
            console.error("Error al eliminar descuento:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al eliminar el descuento. Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
            setDiscountToRemove(null)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Descuentos Activos</CardTitle>
                    <CardDescription>Gestiona los descuentos actualmente aplicados a productos y categorías</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeDiscounts.length > 0 ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar descuentos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descuento</TableHead>
                                            <TableHead>Vigencia</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDiscounts.map((discount) => (
                                            <TableRow key={discount._id}>
                                                <TableCell>
                                                    <div className="font-medium">{discount.name || "Sin nombre"}</div>
                                                    {discount.description && (
                                                        <div className="text-xs text-muted-foreground">{discount.description}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {discount.discountType === "product" ? (
                                                        <Badge variant="outline" className="flex items-center">
                                                            <Package className="h-3 w-3 mr-1" />
                                                            Producto
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="flex items-center">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            Categoría
                                                        </Badge>
                                                    )}
                                                    {discount.applyToAll ? (
                                                        <div className="text-xs text-muted-foreground mt-1">Aplicado a todos</div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {discount.itemIds?.length || 0} elementos
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-600 hover:bg-green-700">{discount.discount}%</Badge>
                                                    {discount.minimumPrice && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Mín: ${discount.minimumPrice.toFixed(2)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                        <span>
                                                            {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {isExpiringSoon(discount.endDate) ? (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Por vencer
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            Activo
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Percent className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.push(`/agency/${agencyId}/products/discounts/edit/${discount._id}`)
                                                                }
                                                            >
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setDiscountToRemove(discount._id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="text-sm text-muted-foreground">{filteredDiscounts.length} descuentos activos</div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Percent className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No hay descuentos activos</h3>
                            <p className="text-muted-foreground mb-6">
                                Actualmente no hay descuentos aplicados a productos o categorías.
                            </p>
                            <Button onClick={() => router.push(`/agency/${agencyId}/products/discounts?tab=create`)}>
                                Crear Descuento
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detalles de elementos con descuento */}
            {activeDiscounts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Elementos con Descuento</CardTitle>
                        <CardDescription>Lista de productos y categorías con descuentos aplicados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Productos con descuento */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Productos con Descuento</h3>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Descuento</TableHead>
                                                <TableHead>Precio Original</TableHead>
                                                <TableHead>Precio con Descuento</TableHead>
                                                <TableHead>Vigencia</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.filter(
                                                (p) => p.discount > 0 && p.discountEndDate && new Date(p.discountEndDate) > new Date(),
                                            ).length > 0 ? (
                                                products
                                                    .filter(
                                                        (p) => p.discount > 0 && p.discountEndDate && new Date(p.discountEndDate) > new Date(),
                                                    )
                                                    .map((product) => (
                                                        <TableRow key={product._id}>
                                                            <TableCell>
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-xs text-muted-foreground">{product.sku}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-green-600 hover:bg-green-700">{product.discount}%</Badge>
                                                            </TableCell>
                                                            <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                                                            <TableCell>
                                                                <span className="font-medium text-green-600">
                                                                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {product.discountEndDate && isExpiringSoon(product.discountEndDate) ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-amber-600 border-amber-600 flex items-center"
                                                                    >
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        Vence: {formatDate(product.discountEndDate)}
                                                                    </Badge>
                                                                ) : (
                                                                    <span>Hasta: {formatDate(product.discountEndDate)}</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        No hay productos con descuentos activos.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <Separator />

                            {/* Categorías con descuento */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">Categorías con Descuento</h3>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Descuento</TableHead>
                                                <TableHead>Productos Afectados</TableHead>
                                                <TableHead>Vigencia</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.filter(
                                                (c) => c.discount > 0 && c.discountEndDate && new Date(c.discountEndDate) > new Date(),
                                            ).length > 0 ? (
                                                categories
                                                    .filter(
                                                        (c) => c.discount > 0 && c.discountEndDate && new Date(c.discountEndDate) > new Date(),
                                                    )
                                                    .map((category) => {
                                                        // Contar productos en esta categoría
                                                        const productsInCategory = products.filter((p) => p.categoryId === category._id).length

                                                        return (
                                                            <TableRow key={category._id}>
                                                                <TableCell>
                                                                    <div className="font-medium">{category.name}</div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className="bg-green-600 hover:bg-green-700">{category.discount}%</Badge>
                                                                </TableCell>
                                                                <TableCell>{productsInCategory}</TableCell>
                                                                <TableCell>
                                                                    {category.discountEndDate && isExpiringSoon(category.discountEndDate) ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-amber-600 border-amber-600 flex items-center"
                                                                        >
                                                                            <Clock className="h-3 w-3 mr-1" />
                                                                            Vence: {formatDate(category.discountEndDate)}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span>Hasta: {formatDate(category.discountEndDate)}</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        No hay categorías con descuentos activos.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Diálogo de confirmación para eliminar descuento */}
            <AlertDialog open={!!discountToRemove} onOpenChange={(open) => !open && setDiscountToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el descuento seleccionado. Los productos o categorías volverán a su precio original.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => discountToRemove && removeDiscount(discountToRemove)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
