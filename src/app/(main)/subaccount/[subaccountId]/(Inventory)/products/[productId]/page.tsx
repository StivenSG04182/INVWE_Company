import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService, CategoryService } from "@/lib/services/inventory-service"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Package,
  ArrowLeft,
  Edit,
  Tag,
  DollarSign,
  Box,
  Truck,
  Clock,
  AlertTriangle,
  Layers,
  FileText,
  Info,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ProductDetailPage = async ({ params }: { params: { agencyId: string; productId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const { agencyId, productId } = params
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener producto de MongoDB
  let product = null
  let categories = []
  
  if (!product) {
    return redirect(`/agency/${agencyId}/products`)
  }

  const productAny = product as any
  const categoriesAny = categories as any[]

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: string) => {
    // Convertir a string para asegurar una comparación consistente
    const category = categoriesAny.find((cat: any) => String(cat._id) === String(categoryId))
    return category ? category.name : "Sin categoría"
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Verificar si el producto está por vencer (en los próximos 30 días)
  const isExpiringSoon = () => {
    if (!productAny.expirationDate) return false
    const today = new Date()
    const expirationDate = new Date(productAny.expirationDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return expirationDate > today && expirationDate <= thirtyDaysFromNow
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/agency/${agencyId}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Productos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Imágenes y estado */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square">
                {productAny.images && productAny.images.length > 0 ? (
                  <Image
                    src={productAny.images[0] || "/placeholder.svg"}
                    alt={productAny.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {productAny.images && productAny.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {productAny.images.slice(1).map((image: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${productAny.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              <Button variant="outline" asChild>
                <Link href={`/agency/${agencyId}/products/${productId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Producto
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={productAny.isActive !== false ? "default" : "secondary"}>
                  {productAny.isActive !== false ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Devoluciones:</span>
                <Badge variant={productAny.isReturnable ? "outline" : "secondary"}>
                  {productAny.isReturnable ? "Permitidas" : "No permitidas"}
                </Badge>
              </div>

              {productAny.warrantyMonths > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Garantía:</span>
                  <Badge variant="outline">
                    {productAny.warrantyMonths} {productAny.warrantyMonths === 1 ? "mes" : "meses"}
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Creado:</span>
                <span className="text-sm">{productAny.createdAt ? formatDate(productAny.createdAt) : "N/A"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="text-sm">{productAny.updatedAt ? formatDate(productAny.updatedAt) : "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Códigos y Referencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <Badge variant="outline" className="font-mono">
                  {productAny.sku}
                </Badge>
              </div>

              {productAny.barcode && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Código de Barras:</span>
                  <Badge variant="outline" className="font-mono">
                    {productAny.barcode}
                  </Badge>
                </div>
              )}

              {productAny.serialNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número de Serie:</span>
                  <Badge variant="outline" className="font-mono">
                    {productAny.serialNumber}
                  </Badge>
                </div>
              )}

              {productAny.batchNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número de Lote:</span>
                  <Badge variant="outline">{productAny.batchNumber}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Información del producto */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{productAny.name}</CardTitle>
                  {productAny.brand && productAny.model && (
                    <CardDescription className="text-base">
                      {productAny.brand} - {productAny.model}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold">${typeof productAny.price === 'number' ? productAny.price.toFixed(2) : parseFloat(productAny.price || 0).toFixed(2) || "0.00"}</div>
                  {productAny.discount > 0 && (
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        ${((parseFloat(productAny.price || 0)) / (1 - (productAny.discount || 0) / 100)).toFixed(2)}
                      </span>
                      <Badge className="bg-green-600 hover:bg-green-700">{productAny.discount}% descuento</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {productAny.categoryId && (
                  <Badge variant="outline" className="flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                    {getCategoryName(productAny.categoryId)}
                  </Badge>
                )}

                {productAny.tags &&
                  productAny.tags.length > 0 &&
                  productAny.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
              </div>

              <p className="text-muted-foreground mb-4">{productAny.description || "Sin descripción"}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <Box className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p className="text-lg font-medium">
                        {productAny.quantity || 0} {productAny.unit || "unidades"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <DollarSign className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Unitario</p>
                      <p className="text-lg font-medium">${typeof productAny.cost === 'number' ? productAny.cost.toFixed(2) : parseFloat(productAny.cost || 0).toFixed(2) || "0.00"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <BarChart3 className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Margen</p>
                      <p className="text-lg font-medium">
                        {productAny.cost && productAny.price
                          ? `${(((parseFloat(productAny.price || 0) - parseFloat(productAny.cost || 0)) / parseFloat(productAny.price || 0)) * 100).toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas */}
              <div className="space-y-3">
                {(productAny.quantity || 0) <= (productAny.minStock || 0) && (
                  <div className="flex items-center p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Stock bajo</p>
                      <p className="text-sm">
                        El stock actual ({productAny.quantity || 0}) está por debajo del mínimo recomendado (
                        {productAny.minStock || 0}).
                      </p>
                    </div>
                  </div>
                )}

                {productAny.expirationDate && isExpiringSoon() && (
                  <div className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                    <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Producto próximo a vencer</p>
                      <p className="text-sm">Este producto vence el {formatDate(productAny.expirationDate)}.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Información Detallada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Información General</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Nombre</TableCell>
                            <TableCell>{productAny.name}</TableCell>
                          </TableRow>
                          {productAny.brand && (
                            <TableRow>
                              <TableCell className="font-medium">Marca</TableCell>
                              <TableCell>{productAny.brand}</TableCell>
                            </TableRow>
                          )}
                          {productAny.model && (
                            <TableRow>
                              <TableCell className="font-medium">Modelo</TableCell>
                              <TableCell>{productAny.model}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium">Categoría</TableCell>
                            <TableCell>
                              {productAny.categoryId ? getCategoryName(productAny.categoryId) : "Sin categoría"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Unidad de Medida</TableCell>
                            <TableCell>{productAny.unit || "Unidad"}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Información Comercial</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Precio de Venta</TableCell>
                            <TableCell>${typeof productAny.price === 'number' ? productAny.price.toFixed(2) : parseFloat(productAny.price || 0).toFixed(2) || "0.00"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Costo</TableCell>
                            <TableCell>${typeof productAny.cost === 'number' ? productAny.cost.toFixed(2) : parseFloat(productAny.cost || 0).toFixed(2) || "0.00"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ganancia</TableCell>
                            <TableCell>${((productAny.price || 0) - (productAny.cost || 0)).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Margen</TableCell>
                            <TableCell>
                              {productAny.cost && productAny.price
                                ? `${(((productAny.price - productAny.cost) / productAny.price) * 100).toFixed(2)}%`
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                          {productAny.taxRate > 0 && (
                            <TableRow>
                              <TableCell className="font-medium">Impuesto</TableCell>
                              <TableCell>{productAny.taxRate}%</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {productAny.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Descripción</h3>
                      <div className="p-3 rounded-md bg-muted">
                        <p className="whitespace-pre-line">{productAny.description}</p>
                      </div>
                    </div>
                  )}

                  {productAny.tags && productAny.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {productAny.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Box className="h-5 w-5 mr-2" />
                    Información de Inventario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Niveles de Stock</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Stock Actual</TableCell>
                            <TableCell>
                              {productAny.quantity || 0} {productAny.unit || "unidades"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Stock Mínimo</TableCell>
                            <TableCell>
                              {productAny.minStock || 0} {productAny.unit || "unidades"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Estado</TableCell>
                            <TableCell>
                              <Badge
                                variant={(productAny.quantity || 0) <= (productAny.minStock || 0) ? "destructive" : "outline"}
                              >
                                {(productAny.quantity || 0) <= (productAny.minStock || 0) ? "Stock Bajo" : "Stock Normal"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Valor en Inventario</TableCell>
                            <TableCell>${((productAny.quantity || 0) * (productAny.cost || 0)).toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Ubicación y Lote</h3>
                      <Table>
                        <TableBody>
                          {productAny.warehouseId && (
                            <TableRow>
                              <TableCell className="font-medium">Almacén</TableCell>
                              <TableCell>
                                {productAny.warehouseId === "default" ? "Almacén Principal" : productAny.warehouseId}
                              </TableCell>
                            </TableRow>
                          )}
                          {productAny.locationId && (
                            <TableRow>
                              <TableCell className="font-medium">Ubicación</TableCell>
                              <TableCell>{productAny.locationId}</TableCell>
                            </TableRow>
                          )}
                          {productAny.batchNumber && (
                            <TableRow>
                              <TableCell className="font-medium">Número de Lote</TableCell>
                              <TableCell>{productAny.batchNumber}</TableCell>
                            </TableRow>
                          )}
                          {productAny.expirationDate && (
                            <TableRow>
                              <TableCell className="font-medium">Fecha de Vencimiento</TableCell>
                              <TableCell>
                                {formatDate(productAny.expirationDate)}
                                {isExpiringSoon() && (
                                  <Badge variant="destructive" className="ml-2">
                                    Próximo a vencer
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-300 flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Movimientos de Inventario
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      Consulta los movimientos de entrada y salida de este producto.
                    </p>
                    <Button variant="outline" size="sm" className="bg-white dark:bg-blue-900" asChild>
                      <Link href={`/agency/${agencyId}/inventory?product=${productId}`}>Ver Movimientos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="h-5 w-5 mr-2" />
                    Variantes del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productAny.variants && productAny.variants.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atributo</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productAny.variants.map((variant: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{variant.name}</TableCell>
                              <TableCell>{variant.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay variantes</h3>
                      <p className="text-muted-foreground mb-6">Este producto no tiene variantes configuradas.</p>
                      <Button variant="outline" asChild>
                        <Link href={`/agency/${agencyId}/products/${productId}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Añadir Variantes
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documentos Adjuntos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productAny.documents && productAny.documents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {productAny.documents.map((doc: string, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4 flex items-center">
                              <FileText className="h-8 w-8 mr-3 text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">Documento {index + 1}</p>
                                <p className="text-sm text-muted-foreground truncate">{doc}</p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={doc} target="_blank" rel="noopener noreferrer">
                                  Ver
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
                      <p className="text-muted-foreground mb-6">Este producto no tiene documentos adjuntos.</p>
                      <Button variant="outline" asChild>
                        <Link href={`/agency/${agencyId}/products/${productId}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Añadir Documentos
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
