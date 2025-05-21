"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"
import {
    Loader2,
    ArrowLeft,
    Trash2,
    DollarSign,
    Barcode,
    Tag,
    ImageIcon,
    Info,
    Box,
    Percent,
    Layers,
    FileText,
    Settings,
    Plus,
    X,
    Save,
    Globe,
    Calendar,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProductFormProps {
    agencyId: string
    product?: {
        _id?: string
        name: string
        description?: string
        sku: string
        barcode?: string
        price: number
        cost?: number
        minStock?: number
        images?: string[]
        productImage?: string           
        subAccountId?: string            
        categoryId?: string
        brand?: string
        model?: string
        tags?: string[]
        unit?: string
        quantity?: number
        locationId?: string
        warehouseId?: string
        batchNumber?: string
        expirationDate?: string          
        serialNumber?: string
        warrantyMonths?: number
        isReturnable?: boolean
        active?: boolean                
        discount?: number
        discountStartDate?: string       
        discountEndDate?: string        
        discountMinimumPrice?: number
        taxRate?: number
        supplierId?: string
        variants?: Array<{
            name: string
            value: string
        }>
        documents?: string[]
        customFields?: Record<string, any>
        externalIntegrations?: Record<string, string>
    }
    isEditing?: boolean
}

export default function ProductForm({ agencyId, product, isEditing = false }: ProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [newTag, setNewTag] = useState("")
    const [newVariantName, setNewVariantName] = useState("")
    const [newVariantValue, setNewVariantValue] = useState("")
    const [hasDiscountDates, setHasDiscountDates] = useState(false)
    const [hasMinimumPrice, setHasMinimumPrice] = useState(false)

    const [formData, setFormData] = useState({
        // Información básica
        name: product?.name || "",
        description: product?.description || "",
        sku: product?.sku || "",
        barcode: product?.barcode || "",
        price: product?.price || "",
        cost: product?.cost || "",
        minStock: product?.minStock || "",
        images: product?.images || [],
        subaccountId: product?.subaccountId || "",
        categoryId: product?.categoryId || "",

        // Información adicional
        brand: product?.brand || "",
        model: product?.model || "",
        tags: product?.tags || [],
        unit: product?.unit || "pieza",

        // Detalles de inventario
        quantity: product?.quantity || "",
        locationId: product?.locationId || "",
        warehouseId: product?.warehouseId || "",
        batchNumber: product?.batchNumber || "",
        expirationDate: product?.expirationDate || "",
        serialNumber: product?.serialNumber || "",

        // Ciclo de vida
        warrantyMonths: product?.warrantyMonths || "",
        isReturnable: product?.isReturnable || false,
        isActive: product?.isActive !== false, // Por defecto activo

        // Gestión comercial
        discount: product?.discount || "",
        discountStartDate: product?.discountStartDate || "",
        discountEndDate: product?.discountEndDate || "",
        discountMinimumPrice: product?.discountMinimumPrice || "",
        taxRate: product?.taxRate || "",
        supplierId: product?.supplierId || "",

        // Variantes
        variants: product?.variants || [],

        // Documentos
        documents: product?.documents || [],

        // Extras
        customFields: product?.customFields || {},
        externalIntegrations: product?.externalIntegrations || {},
    })

    // Inicializar estados basados en los datos del producto
    useEffect(() => {
        if (product) {
            setHasDiscountDates(!!product.discountStartDate || !!product.discountEndDate)
            setHasMinimumPrice(!!product.discountMinimumPrice)
        }
    }, [product])

    // Cargar subcuentas y categorías al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Importar las funciones del servidor dinámicamente
                const { getAgencyDetails, getCategories } = await import("@/lib/queries2")
                
                // Cargar detalles de la agencia para obtener subcuentas
                const agencyDetails = await getAgencyDetails(agencyId)
                if (agencyDetails && agencyDetails.SubAccount) {
                    setSubaccounts(agencyDetails.SubAccount || [])
                } else {
                    console.error("Error al cargar subcuentas: No se encontraron subcuentas")
                }

                // Cargar categorías
                const categoriesData = await getCategories(agencyId)
                if (categoriesData) {
                    setCategories(categoriesData || [])
                } else {
                    console.error("Error al cargar categorías: No se encontraron categorías")
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "price" ||
                    name === "cost" ||
                    name === "minStock" ||
                    name === "quantity" ||
                    name === "warrantyMonths" ||
                    name === "discount" ||
                    name === "discountMinimumPrice" ||
                    name === "taxRate"
                    ? Number.parseFloat(value) || 0
                    : value,
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }))
    }

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }))
            setNewTag("")
        }
    }

    const removeTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }))
    }

    const addVariant = () => {
        if (newVariantName.trim() && newVariantValue.trim()) {
            setFormData((prev) => ({
                ...prev,
                variants: [...prev.variants, { name: newVariantName.trim(), value: newVariantValue.trim() }],
            }))
            setNewVariantName("")
            setNewVariantValue("")
        }
    }

    const removeVariant = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }))
    }

    const calculateProfit = () => {
        if (!formData.price || !formData.cost) return 0
        return formData.price - formData.cost
    }

    const calculateMargin = () => {
        if (!formData.price || !formData.cost) return 0
        return ((formData.price - formData.cost) / formData.price) * 100
    }

    const calculateDiscountedPrice = () => {
        if (!formData.price || !formData.discount) return formData.price

        const discountedPrice = formData.price * (1 - formData.discount / 100)

        // Si hay un precio mínimo configurado, no permitir que el precio baje de ese valor
        if (hasMinimumPrice && formData.discountMinimumPrice > 0) {
            return Math.max(discountedPrice, formData.discountMinimumPrice)
        }

        return discountedPrice
    }

    const isDiscountActive = () => {
        if (!formData.discount) return false

        if (!hasDiscountDates) return true

        const now = new Date()
        const startDate = formData.discountStartDate ? new Date(formData.discountStartDate) : null
        const endDate = formData.discountEndDate ? new Date(formData.discountEndDate) : null

        if (startDate && endDate) {
            return now >= startDate && now <= endDate
        } else if (startDate) {
            return now >= startDate
        } else if (endDate) {
            return now <= endDate
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Validar que se haya seleccionado una subcuenta
        if (!formData.subaccountId) {
            toast({
                variant: "destructive",
                title: "Subcuenta requerida",
                description: "Por favor selecciona una subcuenta para continuar.",
            })
            setIsLoading(false)
            return
        }

        try {
            // Importar las funciones del servidor dinámicamente
            const { createProduct, updateProduct } = await import("@/lib/queries2")
            
            let result;
            
            if (isEditing && product?._id) {
                // Actualizar producto existente
                result = await updateProduct(product._id, { ...formData, agencyId })
            } else {
                // Crear nuevo producto
                result = await createProduct({ ...formData, agencyId })
            }

            if (result) {
                // Si es un producto nuevo y tiene cantidad inicial, crear un registro de movimiento
                if (!isEditing && formData.quantity > 0) {
                    try {
                        // Crear un movimiento de entrada para el stock inicial
                        const movementEndpoint = `/api/inventory/${agencyId}/movements`
                        const movementBody = {
                            type: "ENTRADA",
                            quantity: formData.quantity,
                            notes: "Stock inicial al crear el producto",
                            productId: result.id,
                            areaId: formData.locationId || formData.warehouseId, // Usar locationId o warehouseId como areaId
                            agencyId: agencyId,
                            subAccountId: formData.subaccountId
                        }

                        await fetch(movementEndpoint, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(movementBody),
                            credentials: "include",
                        })
                    } catch (movementError) {
                        console.error("Error al registrar el movimiento de stock inicial:", movementError)
                        // No interrumpimos el flujo si falla el registro del movimiento
                    }
                }

                toast({
                    title: isEditing ? "Producto actualizado" : "Producto creado",
                    description: `El producto ${formData.name} ha sido ${isEditing ? "actualizado" : "creado"} exitosamente.`,
                })
                router.refresh()
                router.push(`/agency/${agencyId}/products/${isEditing ? product?._id : result.id}`)
            } else {
                throw new Error("Error al procesar la solicitud")
            }
        } catch (error) {
            console.error("Error al guardar el producto:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al guardar el producto. Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }))
    }

    return (
        <div className="container max-w-7xl mx-auto pb-10">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h1>
                {isEditing && (
                    <Badge variant="outline" className="ml-4">
                        ID: {product?._id?.substring(0, 8)}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Columna izquierda - Imágenes y estado */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <ImageIcon className="h-5 w-5 mr-2" />
                                    Imágenes
                                </CardTitle>
                                <CardDescription>Agrega imágenes para mostrar tu producto</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                                                <Image
                                                    src={image || "/placeholder.svg"}
                                                    alt={`Producto ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {formData.images.length === 0 && (
                                            <div className="col-span-2 aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/20">
                                                <div className="text-center text-muted-foreground">
                                                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                                    <p>Sin imágenes</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <span className="ml-2">Cargando imagen...</span>
                                            </div>
                                        )}
                                        <UploadButton
                                            endpoint="media"
                                            onUploadBegin={() => {
                                                setIsUploading(true)
                                                toast({
                                                    title: "Subiendo imagen",
                                                    description: "Por favor espere mientras se sube la imagen...",
                                                })
                                            }}
                                            onClientUploadComplete={(res) => {
                                                setIsUploading(false)
                                                if (res && res.length > 0) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        images: [...prev.images, ...res.map((file) => file.url)],
                                                    }))
                                                    toast({
                                                        title: "Imagen subida",
                                                        description: "La imagen se ha subido correctamente.",
                                                    })
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                setIsUploading(false)
                                                console.error("Error de carga:", error)
                                                toast({
                                                    variant: "destructive",
                                                    title: "Error al subir imagen",
                                                    description: error.message,
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Settings className="h-5 w-5 mr-2" />
                                    Estado del Producto
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="isActive">Producto Activo</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Los productos inactivos no se muestran en el catálogo
                                            </p>
                                        </div>
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="isReturnable">Producto Retornable</Label>
                                            <p className="text-sm text-muted-foreground">Permite devoluciones de este producto</p>
                                        </div>
                                        <Switch
                                            id="isReturnable"
                                            checked={formData.isReturnable}
                                            onCheckedChange={(checked) => handleSwitchChange("isReturnable", checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna derecha - Información del producto */}
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid grid-cols-5 mb-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="pricing">Precios</TabsTrigger>
                                <TabsTrigger value="inventory">Inventario</TabsTrigger>
                                <TabsTrigger value="variants">Variantes</TabsTrigger>
                                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                            </TabsList>

                            {/* Pestaña de Información General */}
                            <TabsContent value="general">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Info className="h-5 w-5 mr-2" />
                                            Información General
                                        </CardTitle>
                                        <CardDescription>Datos básicos para identificar tu producto</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nombre del Producto *</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Ej. Camiseta de algodón"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subaccountId">Subcuenta *</Label>
                                                <Select
                                                    value={formData.subaccountId}
                                                    onValueChange={(value) => handleSelectChange("subaccountId", value)}
                                                    required
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
                                                                No hay subcuentas disponibles
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
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descripción *</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe tu producto con detalle"
                                                rows={3}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sku" className="flex items-center">
                                                    <Tag className="h-4 w-4 mr-2" />
                                                    SKU *
                                                </Label>
                                                <Input
                                                    id="sku"
                                                    name="sku"
                                                    value={formData.sku}
                                                    onChange={handleChange}
                                                    placeholder="Ej. CAM-001"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="barcode" className="flex items-center">
                                                    <Barcode className="h-4 w-4 mr-2" />
                                                    Código de Barras
                                                </Label>
                                                <Input
                                                    id="barcode"
                                                    name="barcode"
                                                    value={formData.barcode}
                                                    onChange={handleChange}
                                                    placeholder="Ej. 7501234567890"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unit">Unidad de Medida</Label>
                                                <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar unidad" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pieza">Pieza</SelectItem>
                                                        <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                                                        <SelectItem value="g">Gramo (g)</SelectItem>
                                                        <SelectItem value="l">Litro (l)</SelectItem>
                                                        <SelectItem value="ml">Mililitro (ml)</SelectItem>
                                                        <SelectItem value="m">Metro (m)</SelectItem>
                                                        <SelectItem value="cm">Centímetro (cm)</SelectItem>
                                                        <SelectItem value="m2">Metro cuadrado (m²)</SelectItem>
                                                        <SelectItem value="m3">Metro cúbico (m³)</SelectItem>
                                                        <SelectItem value="docena">Docena</SelectItem>
                                                        <SelectItem value="caja">Caja</SelectItem>
                                                        <SelectItem value="paquete">Paquete</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="brand">Marca</Label>
                                                <Input
                                                    id="brand"
                                                    name="brand"
                                                    value={formData.brand}
                                                    onChange={handleChange}
                                                    placeholder="Ej. Nike"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="model">Modelo</Label>
                                                <Input
                                                    id="model"
                                                    name="model"
                                                    value={formData.model}
                                                    onChange={handleChange}
                                                    placeholder="Ej. Air Max 90"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="categoryId">Categoría</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Input
                                                        placeholder="Nueva categoría"
                                                        value={newCategory}
                                                        onChange={(e) => setNewCategory(e.target.value)}
                                                        className="w-48"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={async () => {
                                                            if (!newCategory.trim()) return
                                                            try {
                                                                const response = await fetch(`/api/inventory/${agencyId}/categories`, {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                    body: JSON.stringify({
                                                                        name: newCategory,
                                                                        subAccountId: formData.subaccountId,
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
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        categoryId: result.data.id,
                                                                    }))
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
                                                        }}
                                                    >
                                                        Crear
                                                    </Button>
                                                </div>
                                            </div>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) => handleSelectChange("categoryId", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar categoría" />
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
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Etiquetas</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {formData.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {tag}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 rounded-full"
                                                            onClick={() => removeTag(tag)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                                {formData.tags.length === 0 && (
                                                    <span className="text-sm text-muted-foreground">No hay etiquetas</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Nueva etiqueta"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            addTag()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" onClick={addTag}>
                                                    Añadir
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Pestaña de Precios */}
                            <TabsContent value="pricing">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <DollarSign className="h-5 w-5 mr-2" />
                                            Precios y Costos
                                        </CardTitle>
                                        <CardDescription>Configura precios, costos e impuestos</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="price">Precio de Venta *</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="price"
                                                        name="price"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        className="pl-9"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cost">Costo *</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="cost"
                                                        name="cost"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={formData.cost}
                                                        onChange={handleChange}
                                                        className="pl-9"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                                                <div className="relative">
                                                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="taxRate"
                                                        name="taxRate"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={formData.taxRate}
                                                        onChange={handleChange}
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {formData.cost > 0 && formData.price > 0 && (
                                            <>
                                                <Separator />
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-4 rounded-lg bg-muted/30">
                                                        <div className="text-sm text-muted-foreground mb-1">Ganancia</div>
                                                        <div className="text-xl font-semibold">${calculateProfit().toFixed(2)}</div>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-muted/30">
                                                        <div className="text-sm text-muted-foreground mb-1">Margen</div>
                                                        <div className="text-xl font-semibold">{calculateMargin().toFixed(2)}%</div>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-muted/30">
                                                        <div className="text-sm text-muted-foreground mb-1">Precio con Impuesto</div>
                                                        <div className="text-xl font-semibold">
                                                            ${(formData.price * (1 + formData.taxRate / 100)).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <Separator />

                                        {/* Sección de Descuentos Mejorada */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-medium">Configuración de Descuento</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="discount">Porcentaje de Descuento (%)</Label>
                                                    <div className="relative">
                                                        <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="discount"
                                                            name="discount"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={formData.discount}
                                                            onChange={handleChange}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="hasMinimumPrice">Precio Mínimo con Descuento</Label>
                                                        <Switch
                                                            id="hasMinimumPrice"
                                                            checked={hasMinimumPrice}
                                                            onCheckedChange={setHasMinimumPrice}
                                                        />
                                                    </div>
                                                    {hasMinimumPrice && (
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="discountMinimumPrice"
                                                                name="discountMinimumPrice"
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={formData.discountMinimumPrice}
                                                                onChange={handleChange}
                                                                className="pl-9"
                                                                placeholder="Precio mínimo"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="hasDiscountDates">Periodo de Descuento</Label>
                                                <Switch
                                                    id="hasDiscountDates"
                                                    checked={hasDiscountDates}
                                                    onCheckedChange={setHasDiscountDates}
                                                />
                                            </div>

                                            {hasDiscountDates && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="discountStartDate" className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Fecha de Inicio
                                                        </Label>
                                                        <Input
                                                            id="discountStartDate"
                                                            name="discountStartDate"
                                                            type="date"
                                                            value={formData.discountStartDate}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="discountEndDate" className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Fecha de Fin
                                                        </Label>
                                                        <Input
                                                            id="discountEndDate"
                                                            name="discountEndDate"
                                                            type="date"
                                                            value={formData.discountEndDate}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {formData.discount > 0 && (
                                            <>
                                                <Separator />
                                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm text-muted-foreground mb-1">Precio con Descuento</div>
                                                            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                                                                ${calculateDiscountedPrice().toFixed(2)}
                                                            </div>
                                                            {hasDiscountDates && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {formData.discountStartDate && formData.discountEndDate ? (
                                                                        <>
                                                                            Válido del {new Date(formData.discountStartDate).toLocaleDateString()} al{" "}
                                                                            {new Date(formData.discountEndDate).toLocaleDateString()}
                                                                        </>
                                                                    ) : formData.discountStartDate ? (
                                                                        <>Válido desde el {new Date(formData.discountStartDate).toLocaleDateString()}</>
                                                                    ) : formData.discountEndDate ? (
                                                                        <>Válido hasta el {new Date(formData.discountEndDate).toLocaleDateString()}</>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                                                            >
                                                                Ahorro: ${((formData.price * formData.discount) / 100).toFixed(2)}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {!isDiscountActive() && (
                                                        <Alert variant="destructive" className="mt-3">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertTitle>Descuento inactivo</AlertTitle>
                                                            <AlertDescription>
                                                                Este descuento no está activo actualmente porque está fuera del periodo configurado.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="supplierId">Proveedor</Label>
                                            <Select
                                                value={formData.supplierId}
                                                onValueChange={(value) => handleSelectChange("supplierId", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar proveedor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no-supplier">Sin proveedor</SelectItem>
                                                    {/* Aquí irían los proveedores si estuvieran disponibles */}
                                                    <SelectItem value="add-supplier">+ Añadir proveedor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Pestaña de Inventario */}
                            <TabsContent value="inventory">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Box className="h-5 w-5 mr-2" />
                                            Detalles de Inventario
                                        </CardTitle>
                                        <CardDescription>Configura niveles de stock y ubicaciones</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="minStock">Stock Mínimo *</Label>
                                                <Input
                                                    id="minStock"
                                                    name="minStock"
                                                    type="number"
                                                    min="0"
                                                    value={formData.minStock}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground">Cantidad mínima antes de alertar por bajo stock</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Stock Inicial</Label>
                                                <Input
                                                    id="quantity"
                                                    name="quantity"
                                                    type="number"
                                                    min="0"
                                                    value={formData.quantity}
                                                    onChange={handleChange}
                                                />
                                                <p className="text-xs text-muted-foreground">Cantidad inicial en inventario</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="warehouseId">Almacén</Label>
                                                <Select
                                                    value={formData.warehouseId}
                                                    onValueChange={(value) => handleSelectChange("warehouseId", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar almacén" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="default">Almacén Principal</SelectItem>
                                                        {/* Aquí irían los almacenes si estuvieran disponibles */}
                                                        <SelectItem value="add-warehouse">+ Añadir almacén</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="locationId">Ubicación en Almacén</Label>
                                                <Input
                                                    id="locationId"
                                                    name="locationId"
                                                    value={formData.locationId}
                                                    onChange={handleChange}
                                                    placeholder="Ej. Estante A-12"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="batchNumber">Número de Lote</Label>
                                                <Input
                                                    id="batchNumber"
                                                    name="batchNumber"
                                                    value={formData.batchNumber}
                                                    onChange={handleChange}
                                                    placeholder="Ej. LOT-2023-001"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="serialNumber">Número de Serie</Label>
                                                <Input
                                                    id="serialNumber"
                                                    name="serialNumber"
                                                    value={formData.serialNumber}
                                                    onChange={handleChange}
                                                    placeholder="Ej. SN-12345678"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
                                                <Input
                                                    id="expirationDate"
                                                    name="expirationDate"
                                                    type="date"
                                                    value={formData.expirationDate}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="warrantyMonths">Garantía (meses)</Label>
                                                <Input
                                                    id="warrantyMonths"
                                                    name="warrantyMonths"
                                                    type="number"
                                                    min="0"
                                                    value={formData.warrantyMonths}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                            <h3 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">
                                                Información de Stock
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                                                    <p className="text-lg font-medium">
                                                        {formData.quantity} {formData.unit}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Valor en Inventario</p>
                                                    <p className="text-lg font-medium">${(formData.quantity * formData.cost).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Estado</p>
                                                    <Badge
                                                        variant={
                                                            formData.quantity <= Math.max(formData.minStock * 0.1, 5)
                                                                ? "destructive"
                                                                : formData.quantity >= formData.minStock * 0.6
                                                                    ? "default"
                                                                    : "outline"
                                                        }
                                                    >
                                                        {formData.quantity <= Math.max(formData.minStock * 0.1, 5)
                                                            ? "Stock Bajo"
                                                            : formData.quantity >= formData.minStock * 0.6
                                                                ? "Stock Alto"
                                                                : "Stock Normal"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Pestaña de Variantes */}
                            <TabsContent value="variants">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Layers className="h-5 w-5 mr-2" />
                                            Variantes del Producto
                                        </CardTitle>
                                        <CardDescription>Configura diferentes variantes como color, tamaño, etc.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="variantName">Nombre de Variante</Label>
                                                    <Input
                                                        id="variantName"
                                                        value={newVariantName}
                                                        onChange={(e) => setNewVariantName(e.target.value)}
                                                        placeholder="Ej. Color, Tamaño, Material"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="variantValue">Valor de Variante</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="variantValue"
                                                            value={newVariantValue}
                                                            onChange={(e) => setNewVariantValue(e.target.value)}
                                                            placeholder="Ej. Rojo, XL, Algodón"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault()
                                                                    addVariant()
                                                                }
                                                            }}
                                                        />
                                                        <Button type="button" onClick={addVariant}>
                                                            Añadir
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.variants.length > 0 ? (
                                                <div className="border rounded-md">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Nombre</TableHead>
                                                                <TableHead>Valor</TableHead>
                                                                <TableHead className="w-[100px]">Acciones</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {formData.variants.map((variant, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell className="font-medium">{variant.name}</TableCell>
                                                                    <TableCell>{variant.value}</TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removeVariant(index)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border rounded-md">
                                                    <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No hay variantes</h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Añade variantes para crear diferentes versiones del producto
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-lg bg-muted">
                                            <h3 className="text-sm font-medium mb-2">¿Cómo funcionan las variantes?</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Las variantes te permiten definir diferentes versiones del mismo producto. Por ejemplo, puedes
                                                tener una camiseta en diferentes colores y tamaños. Cada combinación de variantes puede tener su
                                                propio stock y precio.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Pestaña de Avanzado */}
                            <TabsContent value="advanced">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            Configuración Avanzada
                                        </CardTitle>
                                        <CardDescription>Documentos y configuraciones adicionales</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Documentos Adjuntos</Label>
                                            <div className="border rounded-md p-4">
                                                <div className="text-center py-4">
                                                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Añade fichas técnicas, manuales u otros documentos relacionados con el producto
                                                    </p>
                                                    <Button type="button" variant="outline">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Añadir Documento
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label>Campos Personalizados</Label>
                                            <div className="border rounded-md p-4">
                                                <div className="text-center py-4">
                                                    <Settings className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No hay campos personalizados</h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Añade campos personalizados para almacenar información adicional
                                                    </p>
                                                    <Button type="button" variant="outline">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Añadir Campo
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label>Integraciones Externas</Label>
                                            <div className="border rounded-md p-4">
                                                <div className="text-center py-4">
                                                    <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No hay integraciones</h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Conecta este producto con sistemas externos como tiendas online
                                                    </p>
                                                    <Button type="button" variant="outline">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Añadir Integración
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditing ? "Actualizando..." : "Guardando..."}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? "Actualizar" : "Guardar"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
