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

interface SubaccountBulkProductFormProps {
    subaccountId: string
}

export default function SubaccountBulkProductForm({ subaccountId }: SubaccountBulkProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
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

    // Cargar categorías al montar el componente
    useState(() => {
        const fetchData = async () => {
            try {
                // Cargar categorías
                const categoriesResponse = await fetch(`/api/inventory/${subaccountId}/categories`, {
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
    }, [subaccountId, toast])

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
            const response = await fetch(`/api/inventory/${subaccountId}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCategory,
                    subAccountId: subaccountId,
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
                    subaccountId: subaccountId,
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

            const response = await fetch(`/api/inventory/${subaccountId}/bulk-products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    products: productsToSubmit,
                    subaccountId,
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
                router.push(`/subaccount/${subaccountId}/products`)
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
                                                            <div className="w-20 h-20 border rounded-md flex items-center justify-center bg-muted/20">
                                                                {product.productImage ? (
                                                                    <Image
                                                                        src={product.productImage}
                                                                        alt={`Producto ${index + 1}`}
                                                                        width={80}
                                                                        height={80}
                                                                        className="object-cover rounded-md"
                                                                    />
                                                                ) : (
                                                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveProduct(index)}
                                                                disabled={manualProducts.length === 1}
                                                            >
                                                                Eliminar
                                                            </Button>
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
                                <CardTitle className="flex items-center">
                                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                                    Carga por Archivo CSV
                                </CardTitle>
                                <CardDescription>Sube un archivo CSV con tus productos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Button type="button" variant="outline" onClick={downloadTemplateCSV}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar Plantilla
                                        </Button>
                                    </div>

                                    <div className="border rounded-md p-6 flex flex-col items-center justify-center gap-4">
                                        <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                                        <div className="text-center">
                                            <h3 className="font-medium">Selecciona un archivo CSV</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                El archivo debe seguir el formato de la plantilla
                                            </p>
                                        </div>
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="max-w-xs"
                                        />
                                        {csvFile && (
                                            <div className="text-sm font-medium">
                                                Archivo seleccionado: {csvFile.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Productos
                    </Button>
                </div>
            </form>
        </div>
    )
}