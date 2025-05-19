import { redirect } from "next/navigation"
import { getAuthUserDetails, getAgencyDetails } from "@/lib/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowUpRight,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Activity,
  Layers,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Server,
  Globe,
  Database,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Cargamos los componentes de gráficos de forma dinámica para evitar errores de SSR
const PieChartComponent = dynamic(
  () => import("@/components/charts/client-charts").then((mod) => mod.PieChartComponent),
  { ssr: false },
)

const BarChartComponent = dynamic(
  () => import("@/components/charts/client-charts").then((mod) => mod.BarChartComponent),
  { ssr: false },
)

const LineChartComponent = dynamic(
  () => import("@/components/charts/client-charts").then((mod) => mod.LineChartComponent),
  { ssr: false },
)

// Servicio para obtener datos del dashboard
const getDashboardData = async (agencyId: string) => {
  try {
    const { db } = await connectToDatabase()

    // Obtener productos
    const products = await db.collection("products").find({ agencyId }).toArray()

    // Obtener stock
    const stocks = await db.collection("stocks").find({ agencyId }).toArray()

    // Obtener áreas
    const areas = await db.collection("areas").find({ agencyId }).toArray()

    // Obtener movimientos recientes (últimos 30)
    const movements = await db.collection("movements").find({ agencyId }).sort({ createdAt: -1 }).limit(30).toArray()

    // Calcular productos con bajo stock
    const lowStockProducts = products
      .filter((product: any) => {
        const productStocks = stocks.filter((stock: any) => stock.productId === product._id?.toString())

        const totalStock = productStocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0)

        return product.minStock && totalStock <= product.minStock
      })
      .map((product: any) => {
        const productStocks = stocks.filter((stock: any) => stock.productId === product._id?.toString())

        const currentStock = productStocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0)

        return {
          ...product,
          currentStock,
        }
      })

    // Calcular valor total del inventario
    const totalInventoryValue = stocks.reduce((total: number, stock: any) => {
      const product = products.find((p: any) => p._id?.toString() === stock.productId)
      return total + (product ? product.price * stock.quantity : 0)
    }, 0)

    // Calcular movimientos por tipo
    const entriesCount = movements.filter((m: any) => m.type === "entrada").length
    const exitsCount = movements.filter((m: any) => m.type === "salida").length

    // Procesar movimientos recientes para mostrar
    const recentMovements = await Promise.all(
      movements.slice(0, 10).map(async (movement: any) => {
        const product = products.find((p) => p._id?.toString() === movement.productId)
        const area = areas.find((a) => a._id?.toString() === movement.areaId)

        return {
          _id: movement._id,
          type: movement.type,
          productId: movement.productId,
          productName: product ? product.name : "Producto desconocido",
          productSku: product ? product.sku : "N/A",
          areaName: area ? area.name : "Área desconocida",
          quantity: movement.quantity,
          notes: movement.notes,
          date: movement.createdAt,
        }
      }),
    )

    // Agrupar movimientos por día para mostrar en timeline
    const groupedByDate = recentMovements.reduce((groups: any, movement: any) => {
      const date = new Date(movement.date).toLocaleDateString("es-CO")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(movement)
      return groups
    }, {})

    // Calcular productos por área
    const productsByArea = await Promise.all(
      areas.map(async (area: any) => {
        const areaStocks = stocks.filter((stock: any) => stock.areaId === area._id?.toString())
        const totalProducts = areaStocks.length
        const totalValue = areaStocks.reduce((total: number, stock: any) => {
          const product = products.find((p: any) => p._id?.toString() === stock.productId)
          return total + (product ? product.price * stock.quantity : 0)
        }, 0)

        return {
          _id: area._id,
          name: area.name,
          totalProducts,
          totalValue,
        }
      }),
    )

    // Calcular productos más vendidos (basado en movimientos de salida)
    const productSales = movements
      .filter((m: any) => m.type === "salida")
      .reduce((acc: { [key: string]: number }, movement: any) => {
        const productId = movement.productId
        if (!acc[productId]) acc[productId] = 0
        acc[productId] += movement.quantity
        return acc
      }, {})

    const topProducts = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find((p) => p._id?.toString() === productId)
        return {
          _id: productId,
          name: product ? product.name : "Producto desconocido",
          sku: product ? product.sku : "N/A",
          sales,
          price: product ? product.price : 0,
        }
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Calcular datos de ventas (simulado por ahora)
    const totalSales = topProducts.reduce((sum, product) => sum + product.sales * product.price, 0)
    const lastMonthSales = totalSales * 0.9 // Simulado
    const growth = totalSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : 0

    const salesData = {
      total: totalSales,
      growth: Number.parseFloat(growth.toFixed(1)),
      lastMonth: lastMonthSales,
    }

    // Datos de órdenes (simulado por ahora)
    const ordersCount = Math.floor(totalSales / 100000) || 1
    const ordersData = {
      total: ordersCount,
      pending: Math.floor(ordersCount * 0.15),
      completed: Math.floor(ordersCount * 0.85),
    }

    // Datos para gráficos (simulados para demostración)

    // 1. Datos para gráfico de valor de inventario por mes (últimos 6 meses)
    const inventoryValueTrend = [
      { month: "Enero", value: totalInventoryValue * 0.85 },
      { month: "Febrero", value: totalInventoryValue * 0.9 },
      { month: "Marzo", value: totalInventoryValue * 0.88 },
      { month: "Abril", value: totalInventoryValue * 0.92 },
      { month: "Mayo", value: totalInventoryValue * 0.95 },
      { month: "Junio", value: totalInventoryValue },
    ]

    // 2. Datos para gráfico de distribución de inventario por categoría
    const inventoryByCategory = [
      { category: "Electrónicos", value: totalInventoryValue * 0.35 },
      { category: "Muebles", value: totalInventoryValue * 0.25 },
      { category: "Ropa", value: totalInventoryValue * 0.2 },
      { category: "Alimentos", value: totalInventoryValue * 0.15 },
      { category: "Otros", value: totalInventoryValue * 0.05 },
    ]

    // 3. Datos para gráfico de movimientos por mes
    const movementsByMonth = [
      { month: "Enero", entradas: 45, salidas: 38 },
      { month: "Febrero", entradas: 52, salidas: 43 },
      { month: "Marzo", entradas: 48, salidas: 50 },
      { month: "Abril", entradas: 60, salidas: 55 },
      { month: "Mayo", entradas: 58, salidas: 52 },
      { month: "Junio", entradas: entriesCount, salidas: exitsCount },
    ]

    // 4. Datos para gráfico de rotación de inventario
    const inventoryTurnover = [
      { category: "Electrónicos", turnover: 3.2 },
      { category: "Muebles", turnover: 1.8 },
      { category: "Ropa", turnover: 4.5 },
      { category: "Alimentos", turnover: 6.2 },
      { category: "Otros", turnover: 2.1 },
    ]

    return {
      productsCount: products.length,
      areasCount: areas.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalInventoryValue,
      recentMovements,
      groupedByDate,
      entriesCount,
      exitsCount,
      productsByArea,
      topProducts,
      salesData,
      ordersData,
      inventoryValueTrend,
      inventoryByCategory,
      movementsByMonth,
      inventoryTurnover,
    }
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return {
      productsCount: 0,
      areasCount: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      totalInventoryValue: 0,
      recentMovements: [],
      groupedByDate: {},
      entriesCount: 0,
      exitsCount: 0,
      productsByArea: [],
      topProducts: [],
      salesData: { total: 0, growth: 0, lastMonth: 0 },
      ordersData: { total: 0, pending: 0, completed: 0 },
      inventoryValueTrend: [],
      inventoryByCategory: [],
      movementsByMonth: [],
      inventoryTurnover: [],
    }
  }
}

export default async function DashboardPage({
  params,
}: {
  params: { agencyId: string }
}) {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) return redirect("/agency")

  // Obtener datos de la agencia
  const agencyDetails = await getAgencyDetails(agencyId)
  if (!agencyDetails) return <div>Agencia no encontrada</div>

  // Obtener datos del dashboard
  const dashboardData = await getDashboardData(agencyId)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bienvenido al panel de control de {agencyDetails.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Últimos 30 días
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm">
            <Package className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardData.productsCount}</div>
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
              <div className="text-2xl font-bold">${dashboardData.totalInventoryValue.toLocaleString("es-CO")}</div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Valor total de productos en stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${dashboardData.salesData.total.toLocaleString("es-CO")}</div>
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  +{dashboardData.salesData.growth}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center text-green-500 dark:text-green-400 text-sm mt-2">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>vs. mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardData.lowStockCount}</div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Productos que requieren reposición</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background">
            <Layers className="h-4 w-4 mr-2" />
            Visión General
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-background">
            <Activity className="h-4 w-4 mr-2" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-md data-[state=active]:bg-background">
            <Globe className="h-4 w-4 mr-2" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Visión General */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimos movimientos de inventario</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    Entradas: {dashboardData.entriesCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                  >
                    Salidas: {dashboardData.exitsCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData.recentMovements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay movimientos recientes</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                      {dashboardData.recentMovements.slice(0, 6).map((movement: any) => (
                        <div
                          key={movement._id}
                          className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={movement.type === "entrada" ? "success" : "destructive"}>
                                {movement.type === "entrada" ? "Entrada" : "Salida"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(movement.date).toLocaleString("es-CO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <h4 className="font-medium mt-1">
                              {movement.type === "entrada" ? "Ingreso" : "Retiro"} de {movement.quantity} unidades
                            </h4>

                            <div className="mt-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Producto:</span> {movement.productName} (
                                {movement.productSku})
                              </p>
                              <p>
                                <span className="text-muted-foreground">Ubicación:</span> {movement.areaName}
                              </p>
                              {movement.notes && (
                                <p className="mt-1 text-muted-foreground italic">"{movement.notes}"</p>
                              )}
                            </div>
                          </div>

                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/${agencyId}/(Inventory)/movements/${movement._id}`}>Ver detalles</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)/movements`}>
                      Ver historial completo
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
                <CardDescription>Requieren reposición inmediata</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.lowStockProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay productos con stock bajo</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-3">
                      {dashboardData.lowStockProducts.map((product: any) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                              >
                                {product.currentStock}/{product.minStock}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Reabastecer
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)/stock`}>
                      Ver todos los productos
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Los productos con mayor rotación</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.topProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay datos de ventas disponibles</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[200px] mb-4">
                      <BarChartComponent
                        data={dashboardData.topProducts.map((product: any) => ({
                          name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
                          ventas: product.sales,
                        }))}
                        xAxisKey="name"
                        bars={[{ dataKey: "ventas", name: "Ventas", fill: "#3b82f6" }]}
                      />
                    </div>

                    <div className="space-y-3 mt-4">
                      {dashboardData.topProducts.map((product: any, index: number) => (
                        <div key={product._id} className="flex items-center justify-between p-2 border-b">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{product.sales} unidades</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="ml-auto" asChild>
                  <Link href={`/agency/${agencyId}/(Reports)/sales-reports`}>
                    Ver informe completo
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader>
                <CardTitle>Distribución por Áreas</CardTitle>
                <CardDescription>Valor del inventario por ubicación</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.productsByArea.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay áreas de inventario configuradas</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[200px] mb-4">
                      <PieChartComponent
                        data={dashboardData.productsByArea.map((area: any) => ({
                          name: area.name,
                          value: area.totalValue,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]}
                      />
                    </div>

                    <div className="space-y-3 mt-4">
                      {dashboardData.productsByArea.map((area: any) => (
                        <div key={area._id} className="flex items-center justify-between p-2 border-b">
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-xs text-muted-foreground">{area.totalProducts} productos</p>
                          </div>
                          <div className="text-sm font-medium">${area.totalValue.toLocaleString("es-CO")}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="ml-auto" asChild>
                  <Link href={`/agency/${agencyId}/(Inventory)/areas`}>
                    Ver todas las áreas
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-950 shadow-sm">
            <CardHeader>
              <CardTitle>Rendimiento del Inventario</CardTitle>
              <CardDescription>Visualización de tendencias y métricas clave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Distribución de Entradas/Salidas</h3>
                  <div className="h-[200px]">
                    <PieChartComponent
                      data={[
                        { name: "Entradas", value: dashboardData.entriesCount },
                        { name: "Salidas", value: dashboardData.exitsCount },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      colors={["#10b981", "#f43f5e"]}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Entradas: {dashboardData.entriesCount}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Salidas: {dashboardData.exitsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Productos por Estado de Stock</h3>
                  <div className="h-[200px]">
                    <BarChartComponent
                      data={[
                        { name: "Stock Normal", value: dashboardData.productsCount - dashboardData.lowStockCount },
                        { name: "Stock Bajo", value: dashboardData.lowStockCount },
                      ]}
                      xAxisKey="name"
                      bars={[{ dataKey: "value", name: "Productos", fill: "#3b82f6" }]}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Stock Normal: {dashboardData.productsCount - dashboardData.lowStockCount}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Stock Bajo: {dashboardData.lowStockCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="mt-2" asChild>
                  <Link href={`/agency/${agencyId}/(Reports)/performance`}>
                    Ver informes detallados
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Actividad */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-white dark:bg-gray-950 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cronología de Actividades</CardTitle>
                <CardDescription>Historial de movimientos ordenados por fecha</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  Entradas: {dashboardData.entriesCount}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                >
                  Salidas: {dashboardData.exitsCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(dashboardData.groupedByDate).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No hay actividades registradas en el período seleccionado</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-8">
                    {Object.entries(dashboardData.groupedByDate).map(([date, movements]: [string, any]) => (
                      <div key={date} className="relative">
                        <div className="sticky top-0 bg-background z-10 py-2">
                          <h3 className="font-medium text-sm bg-muted inline-block px-3 py-1 rounded-full">{date}</h3>
                        </div>

                        <div className="mt-2 space-y-3 pl-4 border-l-2 border-muted">
                          {movements.map((movement: any) => (
                            <div key={movement._id} className="relative">
                              {/* Indicador de línea de tiempo */}
                              <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary"></div>

                              <div className="bg-card border rounded-lg p-3 ml-2 hover:bg-muted/30 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={movement.type === "entrada" ? "success" : "destructive"}>
                                        {movement.type === "entrada" ? "Entrada" : "Salida"}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(movement.date).toLocaleTimeString("es-CO", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>

                                    <h4 className="font-medium mt-1">
                                      {movement.type === "entrada" ? "Ingreso" : "Retiro"} de {movement.quantity}{" "}
                                      unidades
                                    </h4>

                                    <div className="mt-1 text-sm">
                                      <p>
                                        <span className="text-muted-foreground">Producto:</span> {movement.productName}{" "}
                                        ({movement.productSku})
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Ubicación:</span> {movement.areaName}
                                      </p>
                                      {movement.notes && (
                                        <p className="mt-1 text-muted-foreground italic">"{movement.notes}"</p>
                                      )}
                                    </div>
                                  </div>

                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/agency/${agencyId}/(Inventory)/movements/${movement._id}`}>
                                      Ver detalles
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link href={`/agency/${agencyId}/(Inventory)/movements`}>
                    Ver historial completo
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Distribución de Movimientos</CardTitle>
                <CardDescription>Proporción de entradas y salidas de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <PieChartComponent
                    data={[
                      { name: "Entradas", value: dashboardData.entriesCount },
                      { name: "Salidas", value: dashboardData.exitsCount },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    colors={["#10b981", "#f43f5e"]}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Entradas: {dashboardData.entriesCount}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Salidas: {dashboardData.exitsCount}</span>
                  </div>
                  <div className="font-medium">Total: {dashboardData.entriesCount + dashboardData.exitsCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resumen de Actividad</CardTitle>
                <CardDescription>Estadísticas de movimientos recientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Movimientos</p>
                      <p className="text-2xl font-bold">{dashboardData.entriesCount + dashboardData.exitsCount}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Entradas</p>
                      <div className="flex items-center">
                        <p className="text-xl font-bold">{dashboardData.entriesCount}</p>
                        <ArrowDown className="h-4 w-4 ml-2 text-green-500" />
                      </div>
                    </div>
                    <div className="text-sm text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                      {dashboardData.entriesCount + dashboardData.exitsCount > 0
                        ? (
                            (dashboardData.entriesCount / (dashboardData.entriesCount + dashboardData.exitsCount)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Salidas</p>
                      <div className="flex items-center">
                        <p className="text-xl font-bold">{dashboardData.exitsCount}</p>
                        <ArrowUp className="h-4 w-4 ml-2 text-red-500" />
                      </div>
                    </div>
                    <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">
                      {dashboardData.entriesCount + dashboardData.exitsCount > 0
                        ? (
                            (dashboardData.exitsCount / (dashboardData.entriesCount + dashboardData.exitsCount)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Análisis */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">${dashboardData.totalInventoryValue.toLocaleString("es-CO")}</div>
                  <div className="flex items-center text-green-500 dark:text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">vs. mes anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rotación de Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">3.5x</div>
                  <div className="flex items-center text-green-500 dark:text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+0.8</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Promedio anual</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Movimientos (Mes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dashboardData.entriesCount + dashboardData.exitsCount}</div>
                  <div className="flex items-center text-red-500 dark:text-red-400 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>-2.1%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">vs. mes anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dashboardData.lowStockCount}</div>
                  <Badge variant={dashboardData.lowStockCount > 5 ? "destructive" : "outline"}>
                    {dashboardData.lowStockCount > 5 ? "Alto" : "Normal"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Requieren reposición</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
              <TabsTrigger value="distribution">Distribución</TabsTrigger>
              <TabsTrigger value="movements">Movimientos</TabsTrigger>
              <TabsTrigger value="turnover">Rotación</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="w-full">
              <Card className="bg-white dark:bg-gray-950 shadow-sm">
                <CardHeader>
                  <CardTitle>Tendencia del Valor de Inventario</CardTitle>
                  <CardDescription>Evolución del valor total del inventario en los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] p-4">
                    <LineChartComponent
                      data={dashboardData.inventoryValueTrend}
                      xAxisKey="month"
                      lines={[{ dataKey: "value", stroke: "#0ea5e9", name: "Valor del Inventario" }]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="w-full">
              <Card className="bg-white dark:bg-gray-950 shadow-sm">
                <CardHeader>
                  <CardTitle>Distribución del Inventario por Categoría</CardTitle>
                  <CardDescription>Valor del inventario distribuido por categorías de productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] p-4">
                    <PieChartComponent
                      data={dashboardData.inventoryByCategory}
                      dataKey="value"
                      nameKey="category"
                      colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="w-full">
              <Card className="bg-white dark:bg-gray-950 shadow-sm">
                <CardHeader>
                  <CardTitle>Movimientos de Inventario por Mes</CardTitle>
                  <CardDescription>Entradas y salidas de inventario en los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] p-4">
                    <BarChartComponent
                      data={dashboardData.movementsByMonth}
                      xAxisKey="month"
                      bars={[
                        { dataKey: "entradas", fill: "#10b981", name: "Entradas" },
                        { dataKey: "salidas", fill: "#f43f5e", name: "Salidas" },
                      ]}
                    />
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Mes</th>
                          <th className="text-center py-2 px-4 font-medium">Entradas</th>
                          <th className="text-center py-2 px-4 font-medium">Salidas</th>
                          <th className="text-center py-2 px-4 font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.movementsByMonth.map((item: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{item.month}</td>
                            <td className="py-2 px-4 text-center">{item.entradas}</td>
                            <td className="py-2 px-4 text-center">{item.salidas}</td>
                            <td className="py-2 px-4 text-center">
                              <span className={item.entradas >= item.salidas ? "text-green-500" : "text-red-500"}>
                                {item.entradas - item.salidas}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="turnover" className="w-full">
              <Card className="bg-white dark:bg-gray-950 shadow-sm">
                <CardHeader>
                  <CardTitle>Rotación de Inventario por Categoría</CardTitle>
                  <CardDescription>Índice de rotación anual por categoría de producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] p-4">
                    <BarChartComponent
                      data={dashboardData.inventoryTurnover}
                      xAxisKey="category"
                      bars={[{ dataKey: "turnover", fill: "#8884d8", name: "Índice de Rotación" }]}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                    {dashboardData.inventoryTurnover.map((item: any, index: number) => {
                      let bgColor = "bg-gray-100 dark:bg-gray-800"
                      let textColor = "text-gray-700 dark:text-gray-300"

                      if (item.turnover > 4) {
                        bgColor = "bg-green-100 dark:bg-green-900"
                        textColor = "text-green-800 dark:text-green-300"
                      } else if (item.turnover > 2) {
                        bgColor = "bg-amber-100 dark:bg-amber-900"
                        textColor = "text-amber-800 dark:text-amber-300"
                      } else {
                        bgColor = "bg-red-100 dark:bg-red-900"
                        textColor = "text-red-800 dark:text-red-300"
                      }

                      return (
                        <div key={index} className="p-3 border rounded-md">
                          <p className="font-medium">{item.category}</p>
                          <div className="flex items-center justify-center mt-2">
                            <span className="text-2xl font-bold">{item.turnover.toFixed(1)}x</span>
                          </div>
                          <p className={cn("text-xs mt-2 text-center px-2 py-1 rounded-full", bgColor, textColor)}>
                            {item.turnover > 4
                              ? "Alta rotación"
                              : item.turnover > 2
                                ? "Media rotación"
                                : "Baja rotación"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button asChild>
              <Link href={`/agency/${agencyId}/(Reports)/inventory-reports`}>
                Ver informes detallados
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Pestaña de Integraciones */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader>
                <CardTitle>Estado de Integraciones</CardTitle>
                <CardDescription>Servicios conectados y su estado actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <PieChartComponent
                    data={[
                      { name: "Activas", value: 3 },
                      { name: "Inactivas", value: 1 },
                      { name: "Pendientes", value: 2 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    colors={["#10b981", "#f43f5e", "#f59e0b"]}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium">E-commerce</p>
                        <p className="text-xs text-muted-foreground">Sincronización automática</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                    >
                      Activo
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium">API de Inventario</p>
                        <p className="text-xs text-muted-foreground">Endpoints REST</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                    >
                      Activo
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="font-medium">Proveedores</p>
                        <p className="text-xs text-muted-foreground">Catálogo externo</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    >
                      Pendiente
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-950 shadow-sm">
              <CardHeader>
                <CardTitle>Rendimiento de API</CardTitle>
                <CardDescription>Estadísticas de uso y respuesta de la API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <LineChartComponent
                    data={[
                      { name: "Lun", requests: 120, tiempo: 230 },
                      { name: "Mar", requests: 180, tiempo: 250 },
                      { name: "Mié", requests: 150, tiempo: 210 },
                      { name: "Jue", requests: 230, tiempo: 280 },
                      { name: "Vie", requests: 290, tiempo: 310 },
                      { name: "Sáb", requests: 110, tiempo: 190 },
                      { name: "Dom", requests: 90, tiempo: 180 },
                    ]}
                    xAxisKey="name"
                    lines={[
                      { dataKey: "requests", stroke: "#3b82f6", name: "Solicitudes" },
                      { dataKey: "tiempo", stroke: "#f59e0b", name: "Tiempo (ms)" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Disponibilidad</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xl font-bold">99.8%</p>
                      <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Tiempo Respuesta</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xl font-bold">235ms</p>
                      <TrendingUp className="h-4 w-4 ml-2 text-amber-500" />
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Ver documentación de API
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-gray-950 shadow-sm">
            <CardHeader>
              <CardTitle>Servicios Conectados</CardTitle>
              <CardDescription>Estado de las integraciones con sistemas externos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium">E-commerce</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                      >
                        Activo
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última sincronización:</span>
                        <span>Hace 15 minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Productos sincronizados:</span>
                        <span>{dashboardData.productsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Funcionando
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Configurar
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-medium">CRM</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                      >
                        Inactivo
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última sincronización:</span>
                        <span>Hace 3 días</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clientes sincronizados:</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <XCircle className="h-3 w-3 mr-1" /> Desconectado
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Conectar
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        <h3 className="font-medium">API de Inventario</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                      >
                        Activo
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Solicitudes (hoy):</span>
                        <span>243</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tiempo de respuesta:</span>
                        <span>235ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Operativa
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Ver documentación
                    </Button>
                  </div>
                </div>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Sistema de integraciones funcionando correctamente</AlertTitle>
                  <AlertDescription>
                    Todas las integraciones activas están funcionando sin problemas. Hay 1 integración inactiva y 2
                    pendientes de configuración.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
