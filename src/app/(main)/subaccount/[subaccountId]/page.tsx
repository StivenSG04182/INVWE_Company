import React from 'react'
import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
  params: { subaccountId: string }
}

const SubAccountPageId = async ({ params }: Props) => {
  // Obtener datos de la subcuenta
  const subaccount = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    include: {
      Agency: true,
    },
  })

  if (!subaccount) {
    return (
      <BlurPage>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-4xl font-bold">Dashboard de Tienda</h1>
          <p className="text-muted-foreground">No se encontró la subcuenta</p>
        </div>
      </BlurPage>
    )
  }

  // TODO: Implementar lógica para obtener estos datos desde Prisma
  const totalProducts = 0
  const activeProducts = 0
  const lowStockProducts = 0
  const inventoryValue = 0
  const enrichedMovements = []

  return (
    <BlurPage>
      <div className="flex flex-col gap-6 p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Dashboard de Tienda</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de control de {subaccount.name}
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <CardDescription>Productos registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <Progress className="mt-2" value={totalProducts > 0 ? 100 : 0} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <CardDescription>Productos disponibles para venta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProducts}</div>
              <Progress
                className="mt-2"
                value={totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <CardDescription>Productos con inventario bajo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <Progress
                className="mt-2"
                value={totalProducts > 0 ? (lowStockProducts / totalProducts) * 100 : 0}
                style={{
                  '--progress-background': lowStockProducts > 0 ? 'hsl(var(--destructive))' : '',
                } as any}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor de Inventario</CardTitle>
              <CardDescription>Valor total del inventario actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${inventoryValue.toFixed(2)}</div>
              <Progress className="mt-2" value={100} />
            </CardContent>
          </Card>
        </div>

        {/* Accesos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`/subaccount/${params.subaccountId}/products`}>
                <Button className="w-full" variant="outline">
                  Gestionar Productos
                </Button>
              </Link>
              <Link href={`/subaccount/${params.subaccountId}/products/new`}>
                <Button className="w-full" variant="outline">
                  Nuevo Producto
                </Button>
              </Link>
              <Link href={`/subaccount/${params.subaccountId}/activity`}>
                <Button className="w-full" variant="outline">
                  Ver Actividad
                </Button>
              </Link>
              <Link href={`/subaccount/${params.subaccountId}/analytics`}>
                <Button className="w-full" variant="outline">
                  Ver Análisis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Movimientos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimos movimientos de inventario</CardDescription>
          </CardHeader>
          <CardContent>
            {enrichedMovements.length > 0 ? (
              <div className="space-y-4">
                {enrichedMovements.map((movement: any) => (
                  <div key={movement._id.toString()} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{movement.Product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {movement.type === 'entrada' ? '➕ Entrada' :
                          movement.type === 'salida' ? '➖ Salida' : '↔️ Transferencia'} en {movement.Area.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{movement.quantity} unidades</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay movimientos recientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </BlurPage>
  )
}

export default SubAccountPageId