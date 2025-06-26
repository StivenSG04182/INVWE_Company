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
import { Loader2, ArrowLeft, Trash2, DollarSign, Barcode, Package, Tag, ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SubaccountProductFormProps {
  subaccountId: string
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
    categoryId?: string
  }
  isEditing?: boolean
}

export default function SubaccountProductForm({ subaccountId, product, isEditing = false }: SubaccountProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price || "",
    cost: product?.cost || "",
    minStock: product?.minStock || "",
    images: product?.images || [],
    categoryId: product?.categoryId || "",
  })

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriesResponse = await fetch(`/api/inventory/${subaccountId}/categories`, {
          credentials: 'include',
        });
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        } else {
          console.error('Error al cargar categorías:', categoriesData.error);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos necesarios. Inténtalo de nuevo.',
        });
      }
    };

    fetchData();
  }, [subaccountId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "cost" || name === "minStock" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateProfit = () => {
    const price = typeof formData.price === 'number' ? formData.price : 0
    const cost = typeof formData.cost === 'number' ? formData.cost : 0
    return price - cost
  }

  const calculateMargin = () => {
    const price = typeof formData.price === 'number' ? formData.price : 0
    const cost = typeof formData.cost === 'number' ? formData.cost : 0
    if (price === 0) return 0
    return ((price - cost) / price) * 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = `/api/inventory/${subaccountId}`
      const method = isEditing ? "PUT" : "POST"
      const body = isEditing
        ? { type: "product", id: product?._id, data: { ...formData, subaccountId } }
        : { type: "product", data: { ...formData, subaccountId } }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include', // Incluir cookies y credenciales de autenticación
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: isEditing ? "Producto actualizado" : "Producto creado",
          description: `El producto ${formData.name} ha sido ${isEditing ? "actualizado" : "creado"} exitosamente.`,
        })
        router.refresh()
        router.push(`/subaccount/${subaccountId}/products`)
      } else {
        throw new Error(result.error || "Error al procesar la solicitud")
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
    <div className="container max-w-5xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Imágenes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
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
          </div>

          {/* Columna derecha - Información del producto */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="pricing">Precios e Inventario</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Información del Producto
                    </CardTitle>
                    <CardDescription>Datos básicos para identificar tu producto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder=""
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder=""
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder=""
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
                            placeholder=""
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
                                if (!newCategory.trim()) return;
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
                                  });
                                  
                                  const result = await response.json();
                                  
                                  if (result.success) {
                                    toast({
                                      title: "Categoría creada",
                                      description: `La categoría ${newCategory} ha sido creada exitosamente.`,
                                    });
                                    setCategories([...categories, result.data]);
                                    setFormData(prev => ({
                                      ...prev,
                                      categoryId: result.data.id
                                    }));
                                    setNewCategory("");
                                  } else {
                                    throw new Error(result.error || "Error al crear la categoría");
                                  }
                                } catch (error) {
                                  console.error("Error al crear categoría:", error);
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: "Hubo un problema al crear la categoría. Inténtalo de nuevo.",
                                  });
                                }
                              }}
                            >
                              Crear
                            </Button>
                          </div>
                        </div>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => handleSelectChange('categoryId', value)}
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Precios e Inventario
                    </CardTitle>
                    <CardDescription>Configura precios, costos y niveles de inventario</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Precio de Venta *
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cost" className="flex items-center">
                          Costo
                        </Label>
                        <Input
                          id="cost"
                          name="cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.cost}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minStock" className="flex items-center">
                          Stock Mínimo
                        </Label>
                        <Input
                          id="minStock"
                          name="minStock"
                          type="number"
                          min="0"
                          value={formData.minStock}
                          onChange={handleChange}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    {formData.price && formData.cost ? (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <h3 className="font-medium mb-2">Análisis de Rentabilidad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Ganancia por Unidad</p>
                            <p className="text-lg font-bold">${calculateProfit().toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                            <p className="text-lg font-bold">{calculateMargin().toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

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
            {isEditing ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}