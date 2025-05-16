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
  try {
    // Importar el serializador para convertir objetos MongoDB a objetos planos
    const { serializeMongoObject, serializeMongoArray } = await import("@/lib/serializers")

    // Obtener y serializar producto y categorías
    const rawProduct = await ProductService.getProductById(agencyId, productId)
    const rawCategories = await CategoryService.getCategories(agencyId)

    // Serializar para eliminar métodos y propiedades no serializables
    product = serializeMongoObject(rawProduct)
    categories = serializeMongoArray(rawCategories)
  } catch (error) {
    console.error("Error al cargar datos:", error)
    return redirect(`/agency/${agencyId}/products`)
  }

  if (!product) {
    return redirect(`/agency/${agencyId}/products`)
  }

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId)
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
    if (!product.expirationDate) return false
    const today = new Date()
    const expirationDate = new Date(product.expirationDate)
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
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {product.images.slice(1).map((image: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 2}`}
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
                <Badge variant={product.isActive !== false ? "default" : "secondary"}>
                  {product.isActive !== false ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Devoluciones:</span>
                <Badge variant={product.isReturnable ? "outline" : "secondary"}>
                  {product.isReturnable ? "Permitidas" : "No permitidas"}
                </Badge>
              </div>

              {product.warrantyMonths > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Garantía:</span>
                  <Badge variant="outline">
                    {product.warrantyMonths} {product.warrantyMonths === 1 ? "mes" : "meses"}
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Creado:</span>
                <span className="text-sm">{product.createdAt ? formatDate(product.createdAt) : "N/A"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="text-sm">{product.updatedAt ? formatDate(product.updatedAt) : "N/A"}</span>
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
                  {product.sku}
                </Badge>
              </div>

              {product.barcode && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Código de Barras:</span>
                  <Badge variant="outline" className="font-mono">
                    {product.barcode}
                  </Badge>
                </div>
              )}

              {product.serialNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número de Serie:</span>
                  <Badge variant="outline" className="font-mono">
                    {product.serialNumber}
                  </Badge>
                </div>
              )}

              {product.batchNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número de Lote:</span>
                  <Badge variant="outline">{product.batchNumber}</Badge>
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
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  {product.brand && product.model && (
                    <CardDescription className="text-base">
                      {product.brand} - {product.model}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold">${product.price?.toFixed(2) || "0.00"}</div>
                  {product.discount > 0 && (
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        ${((product.price || 0) / (1 - (product.discount || 0) / 100)).toFixed(2)}
                      </span>
                      <Badge className="bg-green-600 hover:bg-green-700">{product.discount}% descuento</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.categoryId && (
                  <Badge variant="outline" className="flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                    {getCategoryName(product.categoryId)}
                  </Badge>
                )}

                {product.tags &&
                  product.tags.length > 0 &&
                  product.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
              </div>

              <p className="text-muted-foreground mb-4">{product.description || "Sin descripción"}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <Box className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p className="text-lg font-medium">
                        {product.quantity || 0} {product.unit || "unidades"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <DollarSign className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Unitario</p>
                      <p className="text-lg font-medium">${product.cost?.toFixed(2) || "0.00"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-center">
                    <BarChart3 className="h-8 w-8 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Margen</p>
                      <p className="text-lg font-medium">
                        {product.cost && product.price
                          ? `${(((product.price - product.cost) / product.price) * 100).toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas */}
              <div className="space-y-3">
                {(product.quantity || 0) <= (product.minStock || 0) && (
                  <div className="flex items-center p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Stock bajo</p>
                      <p className="text-sm">
                        El stock actual ({product.quantity || 0}) está por debajo del mínimo recomendado (
                        {product.minStock || 0}).
                      </p>
                    </div>
                  </div>
                )}

                {product.expirationDate && isExpiringSoon() && (
                  <div className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                    <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Producto próximo a vencer</p>
                      <p className="text-sm">Este producto vence el {formatDate(product.expirationDate)}.</p>
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
                            <TableCell>{product.name}</TableCell>
                          </TableRow>
                          {product.brand && (
                            <TableRow>
                              <TableCell className="font-medium">Marca</TableCell>
                              <TableCell>{product.brand}</TableCell>
                            </TableRow>
                          )}
                          {product.model && (
                            <TableRow>
                              <TableCell className="font-medium">Modelo</TableCell>
                              <TableCell>{product.model}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium">Categoría</TableCell>
                            <TableCell>
                              {product.categoryId ? getCategoryName(product.categoryId) : "Sin categoría"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Unidad de Medida</TableCell>
                            <TableCell>{product.unit || "Unidad"}</TableCell>
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
                            <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Costo</TableCell>
                            <TableCell>${product.cost?.toFixed(2) || "0.00"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ganancia</TableCell>
                            <TableCell>${((product.price || 0) - (product.cost || 0)).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Margen</TableCell>
                            <TableCell>
                              {product.cost && product.price
                                ? `${(((product.price - product.cost) / product.price) * 100).toFixed(2)}%`
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                          {product.taxRate > 0 && (
                            <TableRow>
                              <TableCell className="font-medium">Impuesto</TableCell>
                              <TableCell>{product.taxRate}%</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {product.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Descripción</h3>
                      <div className="p-3 rounded-md bg-muted">
                        <p className="whitespace-pre-line">{product.description}</p>
                      </div>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string, index: number) => (
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
                              {product.quantity || 0} {product.unit || "unidades"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Stock Mínimo</TableCell>
                            <TableCell>
                              {product.minStock || 0} {product.unit || "unidades"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Estado</TableCell>
                            <TableCell>
                              <Badge
                                variant={(product.quantity || 0) <= (product.minStock || 0) ? "destructive" : "outline"}
                              >
                                {(product.quantity || 0) <= (product.minStock || 0) ? "Stock Bajo" : "Stock Normal"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Valor en Inventario</TableCell>
                            <TableCell>${((product.quantity || 0) * (product.cost || 0)).toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Ubicación y Lote</h3>
                      <Table>
                        <TableBody>
                          {product.warehouseId && (
                            <TableRow>
                              <TableCell className="font-medium">Almacén</TableCell>
                              <TableCell>
                                {product.warehouseId === "default" ? "Almacén Principal" : product.warehouseId}
                              </TableCell>
                            </TableRow>
                          )}
                          {product.locationId && (
                            <TableRow>
                              <TableCell className="font-medium">Ubicación</TableCell>
                              <TableCell>{product.locationId}</TableCell>
                            </TableRow>
                          )}
                          {product.batchNumber && (
                            <TableRow>
                              <TableCell className="font-medium">Número de Lote</TableCell>
                              <TableCell>{product.batchNumber}</TableCell>
                            </TableRow>
                          )}
                          {product.expirationDate && (
                            <TableRow>
                              <TableCell className="font-medium">Fecha de Vencimiento</TableCell>
                              <TableCell>
                                {formatDate(product.expirationDate)}
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
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atributo</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.variants.map((variant: any, index: number) => (
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
                  {product.documents && product.documents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.documents.map((doc: string, index: number) => (
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
