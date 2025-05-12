import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService, StockService } from "@/lib/services/inventory-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Package,
  Plus,
  ArrowLeft,
  Layers,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const ProductStockPage = async ({ params }: { params: { agencyId: string; productId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  const productId = params.productId
  
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener producto
  let product = null
  let stocks = []
  
  try {
    // Importar el serializador para convertir objetos MongoDB a objetos planos
    const { serializeMongoObject, serializeMongoArray } = await import('@/lib/serializers')
    
    const rawProduct = await ProductService.getProductById(productId)
    if (!rawProduct) {
      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>El producto no existe o ha sido eliminado.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href={`/agency/${agencyId}/products`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Link>
            </Button>
          </div>
        </div>
      )
    }
    
    // Serializar producto y stock
    product = serializeMongoObject(rawProduct)
    
    // Obtener stock del producto
    const rawStocks = await StockService.getStockByProductId(productId)
    stocks = serializeMongoArray(rawStocks)
  } catch (error) {
    console.error("Error al cargar producto o stock:", error)
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Ocurrió un error al cargar la información del producto.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href={`/agency/${agencyId}/products`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calcular stock total
  const totalStock = stocks.reduce((total, stock) => total + stock.quantity, 0)
  const stockStatus = product.minStock && totalStock <= product.minStock ? "bajo" : "normal"

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/agency/${agencyId}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Gestión de Stock</h1>
        <Badge variant="outline" className="ml-4">
          ID: {typeof product._id === 'string' ? product._id.substring(0, 8) : product._id.toString().substring(0, 8)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Información del producto */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Detalles del producto seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                {(product.images && product.images.length > 0) ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                {product.barcode && (
                  <p className="text-sm text-muted-foreground">Código de barras: {product.barcode}</p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Precio</p>
                  <p className="text-lg">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Stock Mínimo</p>
                  <p className="text-lg">{product.minStock || "No definido"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Stock Total</p>
                <div className="flex items-center mt-1">
                  <p className="text-2xl font-bold mr-2">{totalStock}</p>
                  <Badge variant={stockStatus === "bajo" ? "destructive" : "outline"}>
                    {stockStatus === "bajo" ? "Stock Bajo" : "Stock Normal"}
                  </Badge>
                </div>
                {product.minStock && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stockStatus === "bajo" ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, (totalStock / product.minStock) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>{product.minStock}</span>
                      <span>{product.minStock * 2}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/agency/${agencyId}/products/${productId}`}>
                    Editar Producto
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de stock por ubicación */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock por Ubicación</CardTitle>
            <CardDescription>Gestiona el stock en diferentes áreas</CardDescription>
          </CardHeader>
          <CardContent>
            {stocks.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay stock registrado</h3>
                <p className="text-muted-foreground mb-6">
                  Este producto no tiene stock registrado en ninguna ubicación.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Stock
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => (
                    <TableRow key={stock._id.toString()}>
                      <TableCell className="font-medium">{stock.areaName || "Área sin nombre"}</TableCell>
                      <TableCell className="text-right">{stock.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajustar
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Button variant="outline" className="w-full" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Nueva Ubicación
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProductStockPage