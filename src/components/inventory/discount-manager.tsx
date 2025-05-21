"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, DollarSign, Loader2, Percent } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DiscountManagerProps {
    agencyId: string
    products: any[]
    categories: any[]
}

export function DiscountManager({ agencyId, products, categories }: DiscountManagerProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [discountType, setDiscountType] = useState<"product" | "category">("product")
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [discountValue, setDiscountValue] = useState("")
    const [discountStartDate, setDiscountStartDate] = useState<Date | undefined>(new Date())
    const [discountEndDate, setDiscountEndDate] = useState<Date | undefined>(undefined)
    const [applyToAll, setApplyToAll] = useState(false)
    const [showMinimumPrice, setShowMinimumPrice] = useState(false)
    const [minimumPrice, setMinimumPrice] = useState("")
    const [discountName, setDiscountName] = useState("")
    const [discountDescription, setDiscountDescription] = useState("")
    const [showOriginalPrice, setShowOriginalPrice] = useState(true)
    const [highlightInCatalog, setHighlightInCatalog] = useState(true)

    // Filtrar productos o categorías según el término de búsqueda
    const filteredItems =
        discountType === "product"
            ? products.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            : categories.filter((category) => category.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Manejar selección de todos los items
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(filteredItems.map((item) => item._id))
        } else {
            setSelectedItems([])
        }
    }

    // Manejar selección individual
    const handleSelectItem = (itemId: string, checked: boolean) => {
        if (checked) {
            setSelectedItems((prev) => [...prev, itemId])
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== itemId))
        }
    }

    // Calcular precio con descuento para previsualización
    const calculateDiscountedPrice = (originalPrice: number) => {
        const discount = Number.parseFloat(discountValue) || 0
        if (discount <= 0 || discount >= 100) return originalPrice
        return originalPrice * (1 - discount / 100)
    }

    // Aplicar descuento
    const applyDiscount = async () => {
        // Validaciones
        if (selectedItems.length === 0 && !applyToAll) {
            toast({
                variant: "destructive",
                title: "Selección requerida",
                description: "Debes seleccionar al menos un elemento o aplicar a todos",
            })
            return
        }

        if (!discountValue || Number.parseFloat(discountValue) <= 0 || Number.parseFloat(discountValue) >= 100) {
            toast({
                variant: "destructive",
                title: "Descuento inválido",
                description: "El descuento debe ser mayor a 0% y menor a 100%",
            })
            return
        }

        if (!discountStartDate) {
            toast({
                variant: "destructive",
                title: "Fecha de inicio requerida",
                description: "Debes seleccionar una fecha de inicio para el descuento",
            })
            return
        }

        if (!discountEndDate) {
            toast({
                variant: "destructive",
                title: "Fecha de fin requerida",
                description: "Debes seleccionar una fecha de fin para el descuento",
            })
            return
        }

        if (discountEndDate < discountStartDate) {
            toast({
                variant: "destructive",
                title: "Fechas inválidas",
                description: "La fecha de fin debe ser posterior a la fecha de inicio",
            })
            return
        }

        if (showMinimumPrice && (!minimumPrice || Number.parseFloat(minimumPrice) <= 0)) {
            toast({
                variant: "destructive",
                title: "Precio mínimo inválido",
                description: "El precio mínimo debe ser mayor a 0",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`/api/inventory/${agencyId}/discounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    discountType,
                    itemIds: applyToAll ? [] : selectedItems,
                    applyToAll,
                    discount: Number.parseFloat(discountValue),
                    startDate: discountStartDate,
                    endDate: discountEndDate,
                    minimumPrice: showMinimumPrice ? Number.parseFloat(minimumPrice) : null,
                    name: discountName || `Descuento ${Number.parseFloat(discountValue)}%`,
                    description: discountDescription,
                    showOriginalPrice,
                    highlightInCatalog,
                }),
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Descuento aplicado",
                    description: `El descuento ha sido aplicado exitosamente a ${result.affectedItems || "los"} elementos seleccionados.`,
                })
                router.refresh()

                // Limpiar formulario
                setSelectedItems([])
                setDiscountValue("")
                setDiscountEndDate(undefined)
                setMinimumPrice("")
                setDiscountName("")
                setDiscountDescription("")
            } else {
                throw new Error(result.error || "Error al aplicar el descuento")
            }
        } catch (error) {
            console.error("Error al aplicar descuento:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al aplicar el descuento. Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Descuento</CardTitle>
                    <CardDescription>Aplica descuentos a productos individuales o categorías completas</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="product" onValueChange={(value) => setDiscountType(value as "product" | "category")}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="product">Por Producto</TabsTrigger>
                            <TabsTrigger value="category">Por Categoría</TabsTrigger>
                        </TabsList>

                        <TabsContent value="product">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Seleccionar Productos</h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="applyToAll"
                                            checked={applyToAll}
                                            onCheckedChange={(checked) => {
                                                setApplyToAll(checked === true)
                                                if (checked) setSelectedItems([])
                                            }}
                                        />
                                        <Label htmlFor="applyToAll">Aplicar a todos los productos</Label>
                                    </div>
                                </div>

                                {!applyToAll && (
                                    <>
                                        <div className="relative">
                                            <Input
                                                placeholder="Buscar productos por nombre o SKU..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="mb-4"
                                            />
                                        </div>

                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">
                                                            <Checkbox
                                                                checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length}
                                                                onCheckedChange={handleSelectAll}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Producto</TableHead>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead className="text-right">Precio</TableHead>
                                                        <TableHead className="text-right">Con Descuento</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredItems.length > 0 ? (
                                                        filteredItems.map((product) => (
                                                            <TableRow key={product._id}>
                                                                <TableCell>
                                                                    <Checkbox
                                                                        checked={selectedItems.includes(product._id)}
                                                                        onCheckedChange={(checked) => handleSelectItem(product._id, checked === true)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">{product.name}</div>
                                                                    {product.discount > 0 && (
                                                                        <Badge variant="outline" className="mt-1 text-green-600">
                                                                            {product.discount}% activo
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{product.sku}</TableCell>
                                                                <TableCell className="text-right">${product.price?.toFixed(2) || "0.00"}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {discountValue && Number.parseFloat(discountValue) > 0 ? (
                                                                        <span className="font-medium text-green-600">
                                                                            ${calculateDiscountedPrice(product.price).toFixed(2)}
                                                                        </span>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-24 text-center">
                                                                No se encontraron productos con el término de búsqueda.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {selectedItems.length} productos seleccionados de {filteredItems.length} mostrados
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="category">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Seleccionar Categorías</h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="applyToAllCat"
                                            checked={applyToAll}
                                            onCheckedChange={(checked) => {
                                                setApplyToAll(checked === true)
                                                if (checked) setSelectedItems([])
                                            }}
                                        />
                                        <Label htmlFor="applyToAllCat">Aplicar a todas las categorías</Label>
                                    </div>
                                </div>

                                {!applyToAll && (
                                    <>
                                        <div className="relative">
                                            <Input
                                                placeholder="Buscar categorías por nombre..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="mb-4"
                                            />
                                        </div>

                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">
                                                            <Checkbox
                                                                checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length}
                                                                onCheckedChange={handleSelectAll}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Categoría</TableHead>
                                                        <TableHead className="text-right">Productos</TableHead>
                                                        <TableHead className="text-right">Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredItems.length > 0 ? (
                                                        filteredItems.map((category) => {
                                                            // Contar productos en esta categoría
                                                            const productsInCategory = products.filter((p) => p.categoryId === category._id).length

                                                            return (
                                                                <TableRow key={category._id}>
                                                                    <TableCell>
                                                                        <Checkbox
                                                                            checked={selectedItems.includes(category._id)}
                                                                            onCheckedChange={(checked) => handleSelectItem(category._id, checked === true)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="font-medium">{category.name}</div>
                                                                        {category.discount > 0 && (
                                                                            <Badge variant="outline" className="mt-1 text-green-600">
                                                                                {category.discount}% activo
                                                                            </Badge>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">{productsInCategory}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant={category.isActive !== false ? "default" : "secondary"}>
                                                                            {category.isActive !== false ? "Activa" : "Inactiva"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="h-24 text-center">
                                                                No se encontraron categorías con el término de búsqueda.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {selectedItems.length} categorías seleccionadas de {filteredItems.length} mostradas
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Configuración del Descuento</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="discountName">Nombre de la Promoción (opcional)</Label>
                                <Input
                                    id="discountName"
                                    placeholder="Ej. Oferta de Verano"
                                    value={discountName}
                                    onChange={(e) => setDiscountName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountValue">Porcentaje de Descuento (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="0.01"
                                        max="99.99"
                                        step="0.01"
                                        placeholder="Ej. 15"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountDescription">Descripción (opcional)</Label>
                            <Input
                                id="discountDescription"
                                placeholder="Ej. Descuento especial por temporada"
                                value={discountDescription}
                                onChange={(e) => setDiscountDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Fecha de Inicio</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !discountStartDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {discountStartDate ? (
                                                format(discountStartDate, "PPP", { locale: es })
                                            ) : (
                                                <span>Seleccionar fecha</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={discountStartDate}
                                            onSelect={setDiscountStartDate}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha de Fin</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !discountEndDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {discountEndDate ? (
                                                format(discountEndDate, "PPP", { locale: es })
                                            ) : (
                                                <span>Seleccionar fecha</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={discountEndDate}
                                            onSelect={setDiscountEndDate}
                                            disabled={(date) => (discountStartDate ? date < discountStartDate : false) || date < new Date()}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="showMinimumPrice"
                                checked={showMinimumPrice}
                                onCheckedChange={(checked) => setShowMinimumPrice(checked === true)}
                            />
                            <Label htmlFor="showMinimumPrice">Establecer precio mínimo</Label>
                        </div>

                        {showMinimumPrice && (
                            <div className="space-y-2">
                                <Label htmlFor="minimumPrice">Precio Mínimo ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="minimumPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Ej. 9.99"
                                        value={minimumPrice}
                                        onChange={(e) => setMinimumPrice(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    El precio con descuento nunca será menor que este valor, independientemente del porcentaje de
                                    descuento.
                                </p>
                            </div>
                        )}

                        <Separator />

                        <h3 className="text-lg font-medium">Opciones de Visualización</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="showOriginalPrice">Mostrar Precio Original</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Muestra el precio original tachado junto al precio con descuento
                                    </p>
                                </div>
                                <Switch id="showOriginalPrice" checked={showOriginalPrice} onCheckedChange={setShowOriginalPrice} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="highlightInCatalog">Destacar en Catálogo</Label>
                                    <p className="text-sm text-muted-foreground">Resalta los productos con descuento en el catálogo</p>
                                </div>
                                <Switch id="highlightInCatalog" checked={highlightInCatalog} onCheckedChange={setHighlightInCatalog} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => router.refresh()} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={applyDiscount} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Aplicando...
                            </>
                        ) : (
                            <>
                                <Percent className="mr-2 h-4 w-4" />
                                Aplicar Descuento
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
