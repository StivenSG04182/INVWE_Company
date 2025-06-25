import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts, getAreas, getMovements } from "@/lib/queries2"
import StockOverview from "@/components/inventory/stock-overview"
import MovementRegistration from "@/components/inventory/movement-registration"
import ProductStockDetails from "@/components/inventory/product-stock-details"
import { Package, ArrowLeftRight, Search, Filter, DollarSign, AlertTriangle } from "lucide-react"
import { getStockPageData } from "@/lib/services/stock-utils"

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: { agencyId: string }
  searchParams: { tab?: string; productId?: string; type?: string }
}) {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) return redirect("/agency")

  // Obtener datos de stock
  const stockData = await getStockPageData(agencyId)

  // Determinar la pestaña activa basada en los parámetros de búsqueda
  const activeTab =
    searchParams.tab || (searchParams.productId ? "product" : searchParams.type ? "movement" : "overview")

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestión completa de productos, stock y movimientos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar productos..." className="w-full md:w-[200px] pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stockData.products?.length || 0}</div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Productos registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${stockData.totalValue?.toLocaleString("es-CO") || "0"}</div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Valor total de productos en stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stockData.lowStockItems || 0}</div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Productos que requieren reposición</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-6 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="movement" className="rounded-md data-[state=active]:bg-background">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Movimientos
          </TabsTrigger>
          {searchParams.productId && (
            <TabsTrigger value="product" className="rounded-md data-[state=active]:bg-background">
              <Package className="h-4 w-4 mr-2" />
              Detalle de Producto
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<StockOverviewSkeleton />}>
            <StockOverview
              agencyId={agencyId}
              stocks={stockData.stocks || []}
              products={stockData.products || []}
              areas={stockData.areas || []}
              productsMap={stockData.productsMap || new Map()}
              areasMap={stockData.areasMap || new Map()}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="movement" className="space-y-6">
          <Suspense fallback={<MovementRegistrationSkeleton />}>
            <MovementRegistration
              agencyId={agencyId}
              type={searchParams.type || "entrada"}
              products={stockData.products || []}
              areas={stockData.areas || []}
            />
          </Suspense>
        </TabsContent>

        {searchParams.productId && (
          <TabsContent value="product" className="space-y-6">
            <Suspense fallback={<ProductStockDetailsSkeleton />}>
              <ProductStockDetails
                agencyId={agencyId}
                productId={searchParams.productId}
                products={stockData.products || []}
                areas={stockData.areas || []}
                stocks={stockData.stocks || []}
              />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// Componente Skeleton para carga suspendida
const StockOverviewSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
)

// Componente Skeleton para carga suspendida
const MovementRegistrationSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
)

// Componente Skeleton para carga suspendida
const ProductStockDetailsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
)
