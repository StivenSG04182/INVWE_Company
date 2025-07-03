import React, { Suspense } from 'react'
import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getDashboardData, getSubaccountMovements } from '@/lib/subaccount-queries'
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, BarChart3, Box, DollarSign, Package, Repeat } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  params: { subaccountId: string }
}

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  </div>
)

const MovementsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)

const SubAccountPageId = async ({ params }: Props) => {
  console.log('🔍 SubAccountPageId - Starting with params:', params)
  
  try {
    console.log('🔍 Looking for subaccount with ID:', params.subaccountId)
    
    const subaccount = await db.subAccount.findUnique({
      where: { id: params.subaccountId },
      include: { Agency: true },
    })

    console.log('🔍 Subaccount found:', !!subaccount, subaccount?.name)

    if (!subaccount) {
      console.log('❌ Subaccount not found')
      return (
        <BlurPage>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se encontró la subcuenta especificada</AlertDescription>
          </Alert>
        </BlurPage>
      )
    }

    console.log('🔍 Getting dashboard data...')
    // Obtener datos del dashboard y movimientos usando las funciones correctas
    const dashboardData = await getDashboardData(params.subaccountId)
    console.log('🔍 Dashboard data:', dashboardData)
    
    console.log('🔍 Getting movements...')
    const movements = await getSubaccountMovements(params.subaccountId)
    console.log('🔍 Movements count:', movements?.length || 0)

    const { totalProducts, activeProducts, lowStockProducts, inventoryValue } = dashboardData

    console.log('✅ SubAccountPageId - Rendering successfully')
    return (
      <BlurPage>
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Dashboard de {subaccount.name}</h1>
              <p className="text-muted-foreground">
                Gestiona tu inventario y monitorea el rendimiento de tu tienda
              </p>
            </div>

            {/* Tarjetas de estadísticas con iconos y mejores estilos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{totalProducts}</div>
                  <Progress className="h-2" value={totalProducts > 0 ? 100 : 0} />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                  <Box className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{activeProducts}</div>
                  <Progress
                    className="h-2"
                    value={totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0}
                  />
                </CardContent>
              </Card>

              <Card className={`hover:shadow-lg transition-shadow ${lowStockProducts > 0 ? 'border-red-200' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertCircle className={`h-4 w-4 ${lowStockProducts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{lowStockProducts}</div>
                  <Progress
                    className={`h-2 ${lowStockProducts > 0 ? 'bg-red-100' : ''}`}
                    value={totalProducts > 0 ? (lowStockProducts / totalProducts) * 100 : 0}
                  />
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Valor de Inventario</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    ${inventoryValue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </div>
                  <Progress className="h-2" value={100} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accesos rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Accesos Rápidos</CardTitle>
                  <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href={`/subaccount/${params.subaccountId}/products`}>
                      <Button className="w-full h-20" variant="outline">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-6 w-6" />
                          <span>Gestionar Productos</span>
                        </div>
                      </Button>
                    </Link>
                    <Link href={`/subaccount/${params.subaccountId}/products/new`}>
                      <Button className="w-full h-20" variant="outline">
                        <div className="flex flex-col items-center gap-2">
                          <Box className="h-6 w-6" />
                          <span>Nuevo Producto</span>
                        </div>
                      </Button>
                    </Link>
                    <Link href={`/subaccount/${params.subaccountId}/activity`}>
                      <Button className="w-full h-20" variant="outline">
                        <div className="flex flex-col items-center gap-2">
                          <BarChart3 className="h-6 w-6" />
                          <span>Ver Actividad</span>
                        </div>
                      </Button>
                    </Link>
                    <Link href={`/subaccount/${params.subaccountId}/analytics`}>
                      <Button className="w-full h-20" variant="outline">
                        <div className="flex flex-col items-center gap-2">
                          <BarChart3 className="h-6 w-6" />
                          <span>Ver Análisis</span>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Movimientos recientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Movimientos Recientes</CardTitle>
                  <CardDescription>Últimos movimientos de inventario</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<MovementsSkeleton />}>
                    <ScrollArea className="h-[400px] pr-4">
                      {movements && movements.length > 0 ? (
                        <div className="space-y-4">
                          {movements.map((movement) => (
                            <div
                              key={movement.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                {movement.type === 'entrada' ? (
                                  <ArrowUpCircle className="h-8 w-8 text-green-500" />
                                ) : movement.type === 'salida' ? (
                                  <ArrowDownCircle className="h-8 w-8 text-red-500" />
                                ) : (
                                  <Repeat className="h-8 w-8 text-blue-500" />
                                )}
                                <div>
                                  <p className="font-medium">Producto ID: {movement.productId}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {movement.type === 'entrada' ? 'Entrada' :
                                      movement.type === 'salida' ? 'Salida' : 'Transferencia'} en Área ID: {movement.areaId}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{movement.quantity} unidades</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(movement.createdAt).toLocaleDateString('es-CO', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                          <Repeat className="h-12 w-12 mb-4" />
                          <p>No hay movimientos recientes</p>
                        </div>
                      )}
                    </ScrollArea>
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </Suspense>
      </BlurPage>
    )
  } catch (error) {
    console.error('❌ Error al cargar datos del dashboard:', error)
    return (
      <BlurPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Ocurrió un error al cargar los datos del dashboard. Por favor, intenta de nuevo más tarde.
            <br />
            <strong>Error:</strong> {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
      </BlurPage>
    )
  }
}

export default SubAccountPageId