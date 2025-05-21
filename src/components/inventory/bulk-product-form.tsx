"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Download, FileSpreadsheet, Loader2, Plus, Trash2, HelpCircle, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createCategory, createProduct } from "@/lib/queries2"

interface BulkProductFormProps {
    agencyId: string
    subaccountId?: string
}

export default function BulkProductForm({ agencyId, subaccountId }: BulkProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [selectedSubaccount, setSelectedSubaccount] = useState(subaccountId || "")
    const [activeTab, setActiveTab] = useState("manual")
    const [csvData, setCsvData] = useState<any[]>([])
    const [manualProducts, setManualProducts] = useState([
        {
            name: "",
            sku: "",
            price: "",
            cost: "",
            minStock: "",
            categoryId: "",
            productImage: "",
            description: "",
            barcode: "",
            quantity: "0",
            isActive: true,
        },
    ])
    const [categories, setCategories] = useState<any[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvPreview, setCsvPreview] = useState<any[]>([])
    const [csvMapping, setCsvMapping] = useState<Record<string, string>>({})
    const [requiredFieldsOnly, setRequiredFieldsOnly] = useState(true)

    // Cargar subcuentas y categorías al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar subcuentas
                const subaccountsResponse = await fetch(`/api/agency/${agencyId}/subaccounts`, {
                    credentials: "include",
                })
                const subaccountsData = await subaccountsResponse.json()
                if (subaccountsData.success) {
                    setSubaccounts(subaccountsData.data || [])
                }

                // Cargar categorías
                const categoriesResponse = await fetch(`/api/inventory/${agencyId}/categories`, {
                    credentials: "include",
                })
                const categoriesData = await categoriesResponse.json()
                if (categoriesData.success) {
                    setCategories(categoriesData.data || [])
                }
            } catch (error) {
                console.error("Error al cargar datos:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudieron cargar los datos necesarios. Inténtalo de nuevo.",
                })
            }
        }

        fetchData()
    }, [agencyId, toast])

    const handleAddProduct = () => {
        setManualProducts([
            ...manualProducts,
            {
                name: "",
                sku: "",
                price: "",
                cost: "",
                minStock: "",
                categoryId: "",
                productImage: "",
                description: "",
                barcode: "",
                quantity: "0",
                isActive: true,
            },
        ])
    }

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...manualProducts]
        updatedProducts.splice(index, 1)
        setManualProducts(updatedProducts)
    }

    const handleProductChange = (index: number, field: string, value: string | boolean) => {
        const updatedProducts = [...manualProducts]
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]:
                field === "price" || field === "cost" || field === "minStock" || field === "quantity"
                    ? typeof value === "string"
                        ? Number(value)
                        : value
                    : value,
        }
        setManualProducts(updatedProducts)
    }

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return

        try {
            // Usar la función del servidor para crear categoría
            const result = await createCategory({
                name: newCategory,
                agencyId,
                subaccountId: selectedSubaccount,
            })

            if (result) {
                toast({
                    title: "Categoría creada",
                    description: `La categoría ${newCategory} ha sido creada exitosamente.`,
                })
                setCategories([...categories, result])
                setNewCategory("")
            } else {
                throw new Error("Error al crear la categoría")
            }
        } catch (error) {
            console.error("Error al crear categoría:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al crear la categoría. Inténtalo de nuevo.",
            })
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCsvFile(file)

            // Leer el archivo CSV
            const reader = new FileReader()
            reader.onload = (event) => {
                const text = event.target?.result as string
                const lines = text.split("\n")

                if (lines.length > 0) {
                    // Extraer encabezados
                    const headers = lines[0].split(",").map((header) => header.trim())
                    setCsvHeaders(headers)

                    // Crear mapeo inicial
                    const initialMapping: Record<string, string> = {}
                    headers.forEach((header) => {
                        // Intentar mapear automáticamente basado en nombres comunes
                        if (/nombre|name/i.test(header)) initialMapping[header] = "name"
                        else if (/sku|código/i.test(header)) initialMapping[header] = "sku"
                        else if (/precio|price/i.test(header)) initialMapping[header] = "price"
                        else if (/costo|cost/i.test(header)) initialMapping[header] = "cost"
                        else if (/stock_min|minstock/i.test(header)) initialMapping[header] = "minStock"
                        else if (/categoría|category/i.test(header)) initialMapping[header] = "categoryId"
                        else if (/descripción|description/i.test(header)) initialMapping[header] = "description"
                        else if (/barcode|código_barras/i.test(header)) initialMapping[header] = "barcode"
                        else if (/cantidad|quantity/i.test(header)) initialMapping[header] = "quantity"
                        else initialMapping[header] = ""
                    })
                    setCsvMapping(initialMapping)

                    // Extraer datos para vista previa (hasta 5 filas)
                    const preview = []
                    for (let i = 1; i < Math.min(lines.length, 6); i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(",").map((value) => value.trim())
                            const row: Record<string, string> = {}
                            headers.forEach((header, index) => {
                                row[header] = values[index] || ""
                            })
                            preview.push(row)
                        }
                    }
                    setCsvPreview(preview)
                }
            }
            reader.readAsText(file)

            toast({
                title: "Archivo seleccionado",
                description: `Se ha seleccionado el archivo: ${file.name}`,
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Validar que se haya seleccionado una subcuenta
        if (!selectedSubaccount) {
            toast({
                variant: "destructive",
                title: "Subcuenta requerida",
                description: "Por favor selecciona una subcuenta para continuar.",
            })
            setIsLoading(false)
            return
        }

        try {
            let productsToSubmit = []

            if (activeTab === "manual") {
                // Validar productos manuales
                const invalidProducts = manualProducts.filter((p) => !p.name || !p.sku || !p.price)
                if (invalidProducts.length > 0) {
                    throw new Error("Todos los productos deben tener nombre, SKU y precio")
                }
                productsToSubmit = manualProducts.map((p) => ({
                    ...p,
                    subaccountId: selectedSubaccount,
                }))
            } else {
                // Procesar datos del CSV
                if (!csvFile) {
                    throw new Error("Debes seleccionar un archivo CSV")
                }

                // Validar que los campos requeridos estén mapeados
                const requiredFields = ["name", "sku", "price"]
                const mappedFields = Object.values(csvMapping)
                const missingRequiredFields = requiredFields.filter((field) => !mappedFields.includes(field))

                if (missingRequiredFields.length > 0) {
                    throw new Error(`Faltan campos requeridos: ${missingRequiredFields.join(", ")}`)
                }

                // Convertir datos CSV a productos
                productsToSubmit = csvPreview.map((row) => {
                    const product: Record<string, any> = {
                        subaccountId: selectedSubaccount,
                        isActive: true,
                    }

                    // Mapear campos según la configuración
                    Object.entries(csvMapping).forEach(([csvHeader, productField]) => {
                        if (productField && row[csvHeader] !== undefined) {
                            // Convertir tipos de datos según el campo
                            if (["price", "cost", "minStock", "quantity"].includes(productField)) {
                                product[productField] = Number.parseFloat(row[csvHeader]) || 0
                            } else {
                                product[productField] = row[csvHeader]
                            }
                        }
                    })

                    return product
                })
            }

            // Crear productos uno por uno usando la función del servidor
            const createdProducts = []
            for (const productData of productsToSubmit) {
                try {
                    // Añadir el ID de la agencia a cada producto
                    const productWithAgencyId = {
                        ...productData,
                        agencyId
                    }
                    
                    const result = await createProduct(productWithAgencyId)
                    if (result) {
                        createdProducts.push(result)
                    }
                } catch (productError) {
                    console.error("Error al crear producto individual:", productError)
                }
            }

            if (createdProducts.length > 0) {
                toast({
                    title: "Productos creados",
                    description: `Se han creado ${createdProducts.length} de ${productsToSubmit.length} productos exitosamente.`,
                })
                router.refresh()

                // Redirigir a la página de productos correspondiente
                if (subaccountId) {
                    router.push(`/subaccount/${subaccountId}/products`)
                } else {
                    router.push(`/agency/${agencyId}/products`)
                }
            } else {
                throw new Error("No se pudo crear ningún producto")
            }
        } catch (error: any) {
            console.error("Error al guardar productos:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Hubo un problema al guardar los productos. Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const downloadTemplateCSV = () => {
        const headers = "nombre,sku,precio,costo,stock_minimo,codigo_barras,descripcion,cantidad\n"
        const exampleRow = "Producto Ejemplo,SKU123,100,80,10,7501234567890,Descripción del producto,5\n"
        const csvContent = headers + exampleRow

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "plantilla_productos.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="container max-w-6xl mx-auto pb-10">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Carga Masiva de Productos</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Selección de Subcuenta
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                            <HelpCircle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Todos los productos creados se asignarán a esta subcuenta. Es un campo obligatorio.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardTitle>
                        <CardDescription>Selecciona la subcuenta donde se crearán los productos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="subaccountId">Subcuenta *</Label>
                            <Select
                                value={selectedSubaccount}
                                onValueChange={setSelectedSubaccount}
                                required
                                disabled={!!subaccountId} // Deshabilitar si ya viene un subaccountId
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar subcuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subaccounts.length > 0 ? (
                                        subaccounts.map((subaccount) => (
                                            <SelectItem key={subaccount.id} value={subaccount.id}>
                                                {subaccount.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-subaccounts" disabled>
                                            No hay subcuentas disponibles. Por favor, crea una subcuenta primero.
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {subaccounts.length === 0 && (
                                <p className="text-sm text-destructive mt-1">
                                    No hay subcuentas disponibles. Debes crear una subcuenta antes de continuar.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="manual">Carga Manual</TabsTrigger>
                        <TabsTrigger value="csv">Carga por CSV</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Carga Manual de Productos</CardTitle>
                                        <CardDescription>Ingresa los datos de cada producto manualmente</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="required-only" checked={requiredFieldsOnly} onCheckedChange={setRequiredFieldsOnly} />
                                            <Label htmlFor="required-only">Solo campos requeridos</Label>
                                        </div>
                                        <Button type="button" onClick={handleAddProduct} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Añadir Producto
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Categoría</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    placeholder="Nueva categoría"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    className="w-48"
                                                />
                                                <Button type="button" size="sm" onClick={handleCreateCategory}>
                                                    Crear
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nombre *</TableHead>
                                                    <TableHead>SKU *</TableHead>
                                                    <TableHead>Precio *</TableHead>
                                                    {!requiredFieldsOnly && (
                                                        <>
                                                            <TableHead>Costo</TableHead>
                                                            <TableHead>Stock Mín.</TableHead>
                                                            <TableHead>Cantidad</TableHead>
                                                            <TableHead>Código Barras</TableHead>
                                                            <TableHead>Categoría</TableHead>
                                                            <TableHead>Imagen</TableHead>
                                                        </>
                                                    )}
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {manualProducts.map((product, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Input
                                                                value={product.name}
                                                                onChange={(e) => handleProductChange(index, "name", e.target.value)}
                                                                placeholder="Nombre del producto"
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={product.sku}
                                                                onChange={(e) => handleProductChange(index, "sku", e.target.value)}
                                                                placeholder="SKU"
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={product.price}
                                                                onChange={(e) => handleProductChange(index, "price", e.target.value)}
                                                                placeholder="0.00"
                                                                required
                                                            />
                                                        </TableCell>
                                                        {!requiredFieldsOnly && (
                                                            <>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={product.cost}
                                                                        onChange={(e) => handleProductChange(index, "cost", e.target.value)}
                                                                        placeholder="0.00"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={product.minStock}
                                                                        onChange={(e) => handleProductChange(index, "minStock", e.target.value)}
                                                                        placeholder="0"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={product.quantity}
                                                                        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                                                        placeholder="0"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        value={product.barcode}
                                                                        onChange={(e) => handleProductChange(index, "barcode", e.target.value)}
                                                                        placeholder="Código de barras"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        value={product.categoryId}
                                                                        onValueChange={(value) => handleProductChange(index, "categoryId", value)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccionar" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="no-category">Sin categoría</SelectItem>
                                                                            {categories.map((category) => (
                                                                                <SelectItem key={category.id} value={category.id}>
                                                                                    {category.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        {product.productImage ? (
                                                                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                                                                <Image
                                                                                    src={product.productImage || "/placeholder.svg"}
                                                                                    alt={product.name || "Imagen del producto"}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="absolute top-0 right-0 bg-background/80 p-1 rounded-bl-md"
                                                                                    onClick={() => handleProductChange(index, "productImage", "")}
                                                                                >
                                                                                    ×
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-full">
                                                                                <UploadButton
                                                                                    endpoint="productImage"
                                                                                    onClientUploadComplete={(res) => {
                                                                                        if (res && res.length > 0) {
                                                                                            handleProductChange(index, "productImage", res[0].url)
                                                                                            toast({
                                                                                                title: "Imagen subida",
                                                                                                description: "La imagen se ha subido correctamente",
                                                                                            })
                                                                                        }
                                                                                    }}
                                                                                    onUploadError={(error) => {
                                                                                        toast({
                                                                                            variant: "destructive",
                                                                                            title: "Error",
                                                                                            description: error.message || "Error al subir la imagen",
                                                                                        })
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        <TableCell>
                                                            <Switch
                                                                checked={product.isActive}
                                                                onCheckedChange={(checked) => handleProductChange(index, "isActive", checked)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {manualProducts.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveProduct(index)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {!requiredFieldsOnly && (
                                        <div className="mt-4">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-muted-foreground">
                                                        <HelpCircle className="h-4 w-4 mr-2" />
                                                        Campos adicionales
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Descripción de campos</h4>
                                                        <ul className="text-sm space-y-1">
                                                            <li>
                                                                <span className="font-medium">Costo:</span> Precio de compra del producto
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Stock Mín.:</span> Cantidad mínima antes de alertar
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Cantidad:</span> Stock inicial del producto
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Código Barras:</span> Código de barras del producto
                                                            </li>
                                                            <li>
                                                                <span className="font-medium">Categoría:</span> Clasificación del producto
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-6">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                    Los campos marcados con * son obligatorios
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isLoading || manualProducts.length === 0}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>Guardar {manualProducts.length} Productos</>
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="csv">
                        <Card>
                            <CardHeader>
                                <CardTitle>Carga por Archivo CSV</CardTitle>
                                <CardDescription>Sube un archivo CSV con los datos de tus productos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="mb-2 text-sm text-muted-foreground text-center">
                                            Arrastra y suelta tu archivo CSV aquí, o haz clic para seleccionarlo
                                        </p>
                                        <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs" />
                                        <div className="mt-4">
                                            <Button type="button" variant="outline" size="sm" onClick={downloadTemplateCSV}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar Plantilla
                                            </Button>
                                        </div>
                                    </div>

                                    {csvFile && csvHeaders.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Mapeo de Campos</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Asigna cada columna de tu CSV a un campo del producto. Los campos marcados con * son
                                                obligatorios.
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {csvHeaders.map((header) => (
                                                    <div key={header} className="space-y-2">
                                                        <Label>
                                                            Columna CSV: <span className="font-medium">{header}</span>
                                                        </Label>
                                                        <Select
                                                            value={csvMapping[header] || ""}
                                                            onValueChange={(value) => {
                                                                setCsvMapping({
                                                                    ...csvMapping,
                                                                    [header]: value,
                                                                })
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar campo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">No mapear</SelectItem>
                                                                <SelectItem value="name">Nombre *</SelectItem>
                                                                <SelectItem value="sku">SKU *</SelectItem>
                                                                <SelectItem value="price">Precio *</SelectItem>
                                                                <SelectItem value="cost">Costo</SelectItem>
                                                                <SelectItem value="minStock">Stock Mínimo</SelectItem>
                                                                <SelectItem value="quantity">Cantidad</SelectItem>
                                                                <SelectItem value="barcode">Código de Barras</SelectItem>
                                                                <SelectItem value="description">Descripción</SelectItem>
                                                                <SelectItem value="categoryId">Categoría</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-muted p-4 rounded-md">
                                                <h4 className="font-medium mb-2">Vista previa de datos</h4>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {csvHeaders.map((header) => (
                                                                    <TableHead key={header}>
                                                                        {header}
                                                                        {csvMapping[header] && (
                                                                            <Badge variant="outline" className="ml-2">
                                                                                {csvMapping[header]}
                                                                                {["name", "sku", "price"].includes(csvMapping[header]) && "*"}
                                                                            </Badge>
                                                                        )}
                                                                    </TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {csvPreview.map((row, rowIndex) => (
                                                                <TableRow key={rowIndex}>
                                                                    {csvHeaders.map((header) => (
                                                                        <TableCell key={`${rowIndex}-${header}`}>{row[header]}</TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-muted p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                                            <li>El archivo debe estar en formato CSV.</li>
                                            <li>La primera fila debe contener los encabezados.</li>
                                            <li>Los campos obligatorios son: nombre, sku y precio.</li>
                                            <li>Utiliza la plantilla descargable como guía.</li>
                                            <li>Asegúrate de mapear correctamente las columnas.</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-6">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {csvFile ? (
                                        <div className="flex items-center">
                                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                                            Archivo: {csvFile.name}
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                            Selecciona un archivo CSV
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            isLoading ||
                                            !csvFile ||
                                            csvPreview.length === 0 ||
                                            !Object.values(csvMapping).includes("name") ||
                                            !Object.values(csvMapping).includes("sku") ||
                                            !Object.values(csvMapping).includes("price")
                                        }
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>Importar {csvPreview.length} Productos</>
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    )
}
