import { getAuthUserDetails, getProducts, getCategories } from "@/lib/queries2"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import StockAlertNotification from "@/components/inventory/stock-alert-notification"
import { Package, Plus, Tag, BarChart3, AlertTriangle, Truck, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilteredProducts } from "@/components/inventory/filtered-products"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const ProductsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }
  const [rawProducts, categories] = await Promise.all([getProducts(agencyId), getCategories(agencyId)])
  const products = rawProducts.map((product) => {
    const price = product.price ? Number(product.price) : 0
    const cost = product.cost ? Number(product.cost) : 0
    const discount = product.discount ? Number(product.discount) : 0
    const taxRate = product.taxRate ? Number(product.taxRate) : 0
    const discountMinimumPrice = product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null
    const stockQuantity = product.Movements
      ? product.Movements.reduce((sum: number, movement: any) => {
          if (movement.type === "ENTRADA") return sum + movement.quantity
          if (movement.type === "SALIDA") return sum - movement.quantity
          return sum
        }, 0)
      : product.quantity || 0
    return {
      ...product,
      price,
      cost,
      discount,
      taxRate,
      discountMinimumPrice,
      stockQuantity,
    }
  })
  const subAccounts = user.Agency.SubAccount || []
  const totalProducts = products.length
  const activeProducts = products.filter((product: any) => product.active !== false).length
  const totalCategories = categories.length
  const inventoryValue = products.reduce((total: number, product: any) => {
    const quantity = product.stockQuantity || 0
    const salePrice = product.price || 0
    return total + salePrice * quantity
  }, 0)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COL",
      minimumFractionDigits: 2,
    }).format(value)
  }
  const lowStockProducts = products.filter((product: any) => {
    const currentStock = product.stockQuantity || 0
    const minStock = product.minStock || 0
    if (currentStock <= 0) return true
    if (currentStock < 10) return true
    if (minStock > 0 && currentStock < minStock * 0.1) return true
    if (minStock > 0 && currentStock <= minStock) return true
    return false
  }).length
  const outOfStockProducts = products.filter((product: any) => {
    return (product.stockQuantity || 0) <= 0
  }).length
  const discountedProducts = products.filter((product: any) => (product.discount || 0) > 0).length
  const today = new Date()
  const fiveDaysFromNow = new Date()
  fiveDaysFromNow.setDate(today.getDate() + 5)
  const expiringProducts = products.filter((product: any) => {
    if (!product.expirationDate) return false
    const expirationDate = new Date(product.expirationDate)
    return expirationDate > today && expirationDate <= fiveDaysFromNow
  }).length

  return (
    <div className="container mx-auto p-6">
      {/* Componente de notificación de stock bajo */}
      <StockAlertNotification products={products} threshold={10} minUnits={10} />

      <Tabs defaultValue="overview" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activeProducts} activos</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Inventario</p>
                    <p className="text-2xl font-bold">{formatCurrency(inventoryValue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{totalCategories} categorías</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                    <p className="text-2xl font-bold">{lowStockProducts}</p>
                    <p className="text-xs text-muted-foreground mt-1">{outOfStockProducts} sin stock</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ofertas Activas</p>
                    <p className="text-2xl font-bold">{discountedProducts}</p>
                    <p className="text-xs text-muted-foreground mt-1">{expiringProducts} por vencer</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-amber-700 dark:text-amber-500">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Productos con Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{lowStockProducts}</p>
                <p className="text-sm text-muted-foreground">Productos por debajo del nivel mínimo de stock</p>
                <Separator className="my-3" />
                <Link href={`/agency/${agencyId}/products?filter=low-stock`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver productos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-red-700 dark:text-red-500">
                  <Clock className="h-5 w-5 mr-2" />
                  Productos por Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{expiringProducts}</p>
                <p className="text-sm text-muted-foreground">Productos que vencerán en los próximos 5 días</p>
                <Separator className="my-3" />
                <Link href={`/agency/${agencyId}/products?filter=expiring`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver productos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-500">
                  <Truck className="h-5 w-5 mr-2" />
                  Pedidos Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pedidos de reabastecimiento pendientes</p>
                <Separator className="my-3" />
                <Link href={`/agency/${agencyId}/orders`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver pedidos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.length > 0 ? (
              categories.map((category: any) => {
                // Contar productos en esta categoría
                const productsInCategory = products.filter((p: any) => p.categoryId === category.id).length

                return (
                  <Card key={category.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Tag className="h-5 w-5 mr-2 text-primary" />
                          <h3 className="font-medium">{category.name}</h3>
                        </div>
                        <Badge variant="outline">{productsInCategory} productos</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{category.description || "Sin descripción"}</p>
                      <div className="flex justify-end">
                        <Link href={`/agency/${agencyId}/products?category=${category.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver productos
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center p-10">
                  <Tag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay categorías registradas</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Crea categorías para organizar mejor tus productos.
                  </p>
                  <Link href={`/agency/${agencyId}/categories/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Componente de productos filtrados */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No hay productos registrados</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comience creando su primer producto para gestionar su inventario.
            </p>
            <Link href={`/agency/${agencyId}/products/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <FilteredProducts agencyId={agencyId} products={products} categories={categories} subAccounts={subAccounts} />
      )}
    </div>
  )
}

export default ProductsPage
