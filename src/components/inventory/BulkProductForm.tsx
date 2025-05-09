"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Download, FileSpreadsheet, ImageIcon, Loader2, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"

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
        },
    ])
    const [categories, setCategories] = useState<any[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [csvFile, setCsvFile] = useState<File | null>(null)

    // Cargar subcuentas y categorías al montar el componente
    useState(() => {
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
        setManualProducts([...manualProducts, { name: "", sku: "", price: "", cost: "", minStock: "", categoryId: "" }])
    }

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...manualProducts]
        updatedProducts.splice(index, 1)
        setManualProducts(updatedProducts)
    }

    const handleProductChange = (index: number, field: string, value: string) => {
        const updatedProducts = [...manualProducts]
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: field === "price" || field === "cost" || field === "minStock" ? Number(value) : value,
        }
        setManualProducts(updatedProducts)
    }

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return

        try {
            const response = await fetch(`/api/inventory/${agencyId}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCategory,
                    subaccountId: selectedSubaccount,
                }),
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Categoría creada",
                    description: `La categoría ${newCategory} ha sido creada exitosamente.`,
                })
                setCategories([...categories, result.data])
                setNewCategory("")
            } else {
                throw new Error(result.error || "Error al crear la categoría")
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
            // Aquí se procesaría el archivo CSV
            // Por simplicidad, solo mostraremos que se ha seleccionado
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
                const invalidProducts = manualProducts.filter(p => !p.name || !p.sku || !p.price)
                if (invalidProducts.length > 0) {
                    throw new Error("Todos los productos deben tener nombre, SKU y precio")
                }
                productsToSubmit = manualProducts.map(p => ({
                    ...p,
                    subaccountId: selectedSubaccount,
                }))
            } else {
                // Procesar datos del CSV
                if (!csvFile) {
                    throw new Error("Debes seleccionar un archivo CSV")
                }
                // Aquí iría la lógica para procesar el CSV
                // Por ahora, mostramos un mensaje de que esta funcionalidad está en desarrollo
                toast({
                    title: "Funcionalidad en desarrollo",
                    description: "La carga por CSV estará disponible próximamente.",
                })
                setIsLoading(false)
                return
            }

            const response = await fetch(`/api/inventory/${agencyId}/bulk-products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    products: productsToSubmit,
                    agencyId,
                }),
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Productos creados",
                    description: `Se han creado ${productsToSubmit.length} productos exitosamente.`,
                })
                router.refresh()

                // Redirigir a la página de productos correspondiente
                if (subaccountId) {
                    router.push(`/subaccount/${subaccountId}/products`)
                } else {
                    router.push(`/agency/${agencyId}/products`)
                }
            } else {
                throw new Error(result.error || "Error al procesar la solicitud")
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
        const headers = "nombre,sku,precio,costo,stock_minimo,categoria_id\n"
        const exampleRow = "Producto Ejemplo,SKU123,100,80,10,\n"
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
        <div className="container max-w-5xl mx-auto">
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
                        <CardTitle>Selección de Subcuenta</CardTitle>
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
                                <CardTitle className="flex items-center justify-between">
                                    <span>Carga Manual de Productos</span>
                                    <Button type="button" onClick={handleAddProduct} size="sm">
                                        Añadir Producto
                                    </Button>
                                </CardTitle>
                                <CardDescription>Ingresa los datos de cada producto manualmente</CardDescription>
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
                                                    <TableHead>Costo</TableHead>
                                                    <TableHead>Stock Mín.</TableHead>
                                                    <TableHead>Categoría</TableHead>
                                                    <TableHead>Imagen</TableHead>
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
                                                                            src={product.productImage} 
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
                                                                                    handleProductChange(index, "productImage", res[0].url);
                                                                                    toast({
                                                                                        title: "Imagen subida",
                                                                                        description: "La imagen se ha subido correctamente",
                                                                                    });
                                                                                }
                                                                            }}
                                                                            onUploadError={(error) => {
                                                                                toast({
                                                                                    variant: "destructive",
                                                                                    title: "Error",
                                                                                    description: error.message || "Error al subir la imagen",
                                                                                });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
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
                                                                    Eliminar
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
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
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="max-w-xs"
                                        />
                                        <div className="mt-4">
                                            <Button type="button" variant="outline" size="sm" onClick={downloadTemplateCSV}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar Plantilla
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                                            <li>El archivo debe estar en formato CSV.</li>
                                            <li>La primera fila debe contener los encabezados.</li>
                                            <li>Los campos obligatorios son: nombre, sku y precio.</li>
                                            <li>Utiliza la plantilla descargable como guía.</li>
                                        </ul>
                                    </div>

                                    {csvFile && (
                                        <div className="p-4 border rounded-md">
                                            <p className="text-sm font-medium">Archivo seleccionado:</p>
                                            <p className="text-sm text-muted-foreground">{csvFile.name}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-6 gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>Guardar Productos</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}