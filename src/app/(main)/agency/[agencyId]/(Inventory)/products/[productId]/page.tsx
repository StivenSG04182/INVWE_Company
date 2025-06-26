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

interface PageProps {
  params: {
    productId: string;
    agencyId: string;
  }
}

const ProductDetailPage = async ({ params }: PageProps) => {
  const { productId, agencyId } = params;
  
  try {
    const user = await getAuthUserDetails();
    if (!user) return redirect("/sign-in")

    if (!user.Agency) {
      return redirect("/agency")
    }

    const product = await ProductService.getProductById(agencyId, productId);
    
    if (!product) {
      return redirect(`/agency/${agencyId}/products`)
    }

    // Normalizar campos null a undefined y convertir tipos
    const normalizedProduct = {
      ...product,
      description: product.description ?? undefined,
      sku: product.sku ?? undefined,
      barcode: product.barcode ?? undefined,
      cost: typeof product.cost === 'object' && product.cost !== null && 'toNumber' in product.cost ? product.cost.toNumber() : (product.cost ?? undefined),
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price ? product.price.toNumber() : (product.price ?? undefined),
      minStock: product.minStock ?? undefined,
      subAccountId: product.subAccountId ?? undefined,
      categoryId: product.categoryId ?? undefined,
      brand: product.brand ?? undefined,
      model: product.model ?? undefined,
      unit: product.unit ?? undefined,
      quantity: product.quantity ?? undefined,
      locationId: product.locationId ?? undefined,
      warehouseId: product.warehouseId ?? undefined,
      batchNumber: product.batchNumber ?? undefined,
      expirationDate: product.expirationDate ? product.expirationDate.toISOString() : undefined,
      serialNumber: product.serialNumber ?? undefined,
      warrantyMonths: product.warrantyMonths ?? undefined,
      discount: typeof product.discount === 'object' && product.discount !== null && 'toNumber' in product.discount ? product.discount.toNumber() : (product.discount ?? undefined),
      discountStartDate: product.discountStartDate ? product.discountStartDate.toISOString() : undefined,
      discountEndDate: product.discountEndDate ? product.discountEndDate.toISOString() : undefined,
      discountMinimumPrice: typeof product.discountMinimumPrice === 'object' && product.discountMinimumPrice !== null && 'toNumber' in product.discountMinimumPrice ? product.discountMinimumPrice.toNumber() : (product.discountMinimumPrice ?? undefined),
      taxRate: typeof product.taxRate === 'object' && product.taxRate !== null && 'toNumber' in product.taxRate ? product.taxRate.toNumber() : (product.taxRate ?? undefined),
      supplierId: product.supplierId ?? undefined,
      variants: Array.isArray(product.variants) ? (product.variants as Array<{ name: string; value: string; }>) : undefined,
      documents: Array.isArray(product.documents) ? (product.documents as string[]) : undefined,
      externalIntegrations: product.externalIntegrations ? (product.externalIntegrations as Record<string, string>) : undefined,
      customFields: product.customFields ? (product.customFields as Record<string, any>) : undefined,
      createdAt: product.createdAt ? product.createdAt.toISOString() : undefined,
      updatedAt: product.updatedAt ? product.updatedAt.toISOString() : undefined,
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A"
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    }

    const isExpiringSoon = () => {
      if (!normalizedProduct.expirationDate) return false
      const today = new Date()
      const expirationDate = new Date(normalizedProduct.expirationDate)
      const fiveDaysFromNow = new Date()
      fiveDaysFromNow.setDate(today.getDate() + 5)

      return expirationDate > today && expirationDate <= fiveDaysFromNow
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
                  {normalizedProduct.images && normalizedProduct.images.length > 0 ? (
                    <Image
                      src={normalizedProduct.images[0] || "/placeholder.svg"}
                      alt={normalizedProduct.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <Package className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {normalizedProduct.images && normalizedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {normalizedProduct.images.slice(1).map((image: string, index: number) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${normalizedProduct.name} ${index + 2}`}
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
                  <Badge variant={normalizedProduct.isActive !== false ? "default" : "secondary"}>
                    {normalizedProduct.isActive !== false ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Devoluciones:</span>
                  <Badge variant={normalizedProduct.isReturnable ? "outline" : "secondary"}>
                    {normalizedProduct.isReturnable ? "Permitidas" : "No permitidas"}
                  </Badge>
                </div>

                {normalizedProduct.warrantyMonths && normalizedProduct.warrantyMonths > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Garantía:</span>
                    <Badge variant="outline">
                      {normalizedProduct.warrantyMonths} {normalizedProduct.warrantyMonths === 1 ? "mes" : "meses"}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="text-sm">{normalizedProduct.createdAt ? formatDate(normalizedProduct.createdAt) : "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Actualizado:</span>
                  <span className="text-sm">{normalizedProduct.updatedAt ? formatDate(normalizedProduct.updatedAt) : "N/A"}</span>
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
                    {normalizedProduct.sku}
                  </Badge>
                </div>

                {normalizedProduct.barcode && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Código de Barras:</span>
                    <Badge variant="outline" className="font-mono">
                      {normalizedProduct.barcode}
                    </Badge>
                  </div>
                )}

                {normalizedProduct.serialNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Número de Serie:</span>
                    <Badge variant="outline" className="font-mono">
                      {normalizedProduct.serialNumber}
                    </Badge>
                  </div>
                )}

                {normalizedProduct.batchNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Número de Lote:</span>
                    <Badge variant="outline">{normalizedProduct.batchNumber}</Badge>
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
                    <CardTitle className="text-2xl">{normalizedProduct.name}</CardTitle>
                    {normalizedProduct.brand && normalizedProduct.model && (
                      <CardDescription className="text-base">
                        {normalizedProduct.brand} - {normalizedProduct.model}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold">${typeof normalizedProduct.price === 'number' ? normalizedProduct.price.toFixed(2) : parseFloat(String(normalizedProduct.price || 0)).toFixed(2) || "0.00"}</div>
                    {normalizedProduct.discount && normalizedProduct.discount > 0 && (
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          ${((parseFloat(String(normalizedProduct.price || 0))) / (1 - (normalizedProduct.discount || 0) / 100)).toFixed(2)}
                        </span>
                        <Badge className="bg-green-600 hover:bg-green-700">{normalizedProduct.discount}% descuento</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {normalizedProduct.categoryId && (
                    <Badge variant="outline" className="flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1.5" />
                      {normalizedProduct.Category?.name || "Sin categoría"}
                    </Badge>
                  )}

                  {normalizedProduct.tags &&
                    normalizedProduct.tags.length > 0 &&
                    normalizedProduct.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>

                <p className="text-muted-foreground mb-4">{normalizedProduct.description || "Sin descripción"}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center">
                      <Box className="h-8 w-8 mr-3 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Stock Actual</p>
                        <p className="text-lg font-medium">
                          {normalizedProduct.quantity || 0} {normalizedProduct.unit || "unidades"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center">
                      <DollarSign className="h-8 w-8 mr-3 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Costo Unitario</p>
                        <p className="text-lg font-medium">${typeof normalizedProduct.cost === 'number' ? normalizedProduct.cost.toFixed(2) : parseFloat(String(normalizedProduct.cost || 0)).toFixed(2) || "0.00"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center">
                      <BarChart3 className="h-8 w-8 mr-3 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Margen</p>
                        <p className="text-lg font-medium">
                          {normalizedProduct.cost && normalizedProduct.price
                            ? `${(((parseFloat(String(normalizedProduct.price || 0)) - parseFloat(String(normalizedProduct.cost || 0))) / parseFloat(String(normalizedProduct.price || 0))) * 100).toFixed(2)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alertas */}
                <div className="space-y-3">
                  {(normalizedProduct.quantity || 0) <= (normalizedProduct.minStock || 0) && (
                    <div className="flex items-center p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Stock bajo</p>
                        <p className="text-sm">
                          El stock actual ({normalizedProduct.quantity || 0}) está por debajo del mínimo recomendado (
                          {normalizedProduct.minStock || 0}).
                        </p>
                      </div>
                    </div>
                  )}

                  {normalizedProduct.expirationDate && isExpiringSoon() && (
                    <div className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                      <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Producto próximo a vencer</p>
                        <p className="text-sm">Este producto vence el {formatDate(normalizedProduct.expirationDate)}.</p>
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
                              <TableCell>{normalizedProduct.name}</TableCell>
                            </TableRow>
                            {normalizedProduct.brand && (
                              <TableRow>
                                <TableCell className="font-medium">Marca</TableCell>
                                <TableCell>{normalizedProduct.brand}</TableCell>
                              </TableRow>
                            )}
                            {normalizedProduct.model && (
                              <TableRow>
                                <TableCell className="font-medium">Modelo</TableCell>
                                <TableCell>{normalizedProduct.model}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell className="font-medium">Categoría</TableCell>
                              <TableCell>
                                {normalizedProduct.categoryId ? normalizedProduct.Category?.name || "Sin categoría" : "Sin categoría"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Unidad de Medida</TableCell>
                              <TableCell>{normalizedProduct.unit || "Unidad"}</TableCell>
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
                              <TableCell>${typeof normalizedProduct.price === 'number' ? normalizedProduct.price.toFixed(2) : parseFloat(String(normalizedProduct.price || 0)).toFixed(2) || "0.00"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Costo</TableCell>
                              <TableCell>${typeof normalizedProduct.cost === 'number' ? normalizedProduct.cost.toFixed(2) : parseFloat(String(normalizedProduct.cost || 0)).toFixed(2) || "0.00"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Ganancia</TableCell>
                              <TableCell>${((normalizedProduct.price || 0) - (normalizedProduct.cost || 0)).toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Margen</TableCell>
                              <TableCell>
                                {normalizedProduct.cost && normalizedProduct.price
                                  ? `${(((normalizedProduct.price - normalizedProduct.cost) / normalizedProduct.price) * 100).toFixed(2)}%`
                                  : "N/A"}
                              </TableCell>
                            </TableRow>
                            {normalizedProduct.taxRate && normalizedProduct.taxRate > 0 && (
                              <TableRow>
                                <TableCell className="font-medium">Impuesto</TableCell>
                                <TableCell>{normalizedProduct.taxRate}%</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {normalizedProduct.description && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Descripción</h3>
                        <div className="p-3 rounded-md bg-muted">
                          <p className="whitespace-pre-line">{normalizedProduct.description}</p>
                        </div>
                      </div>
                    )}

                    {normalizedProduct.tags && normalizedProduct.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
                        <div className="flex flex-wrap gap-2">
                          {normalizedProduct.tags.map((tag: string, index: number) => (
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
                                {normalizedProduct.quantity || 0} {normalizedProduct.unit || "unidades"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Stock Mínimo</TableCell>
                              <TableCell>
                                {normalizedProduct.minStock || 0} {normalizedProduct.unit || "unidades"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Estado</TableCell>
                              <TableCell>
                                <Badge
                                  variant={(normalizedProduct.quantity || 0) <= (normalizedProduct.minStock || 0) ? "destructive" : "outline"}
                                >
                                  {(normalizedProduct.quantity || 0) <= (normalizedProduct.minStock || 0) ? "Stock Bajo" : "Stock Normal"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Valor en Inventario</TableCell>
                              <TableCell>${((normalizedProduct.quantity || 0) * (normalizedProduct.cost || 0)).toFixed(2)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Ubicación y Lote</h3>
                        <Table>
                          <TableBody>
                            {normalizedProduct.warehouseId && (
                              <TableRow>
                                <TableCell className="font-medium">Almacén</TableCell>
                                <TableCell>
                                  {normalizedProduct.warehouseId === "default" ? "Almacén Principal" : normalizedProduct.warehouseId}
                                </TableCell>
                              </TableRow>
                            )}
                            {normalizedProduct.locationId && (
                              <TableRow>
                                <TableCell className="font-medium">Ubicación</TableCell>
                                <TableCell>{normalizedProduct.locationId}</TableCell>
                              </TableRow>
                            )}
                            {normalizedProduct.batchNumber && (
                              <TableRow>
                                <TableCell className="font-medium">Número de Lote</TableCell>
                                <TableCell>{normalizedProduct.batchNumber}</TableCell>
                              </TableRow>
                            )}
                            {normalizedProduct.expirationDate && (
                              <TableRow>
                                <TableCell className="font-medium">Fecha de Vencimiento</TableCell>
                                <TableCell>
                                  {formatDate(normalizedProduct.expirationDate)}
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
                    {normalizedProduct.variants && normalizedProduct.variants.length > 0 ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Atributo</TableHead>
                              <TableHead>Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {normalizedProduct.variants.map((variant: any, index: number) => (
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
                    {normalizedProduct.documents && normalizedProduct.documents.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {normalizedProduct.documents.map((doc: string, index: number) => (
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
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    return redirect(`/agency/${agencyId}/products`);
  }
}

export default ProductDetailPage
