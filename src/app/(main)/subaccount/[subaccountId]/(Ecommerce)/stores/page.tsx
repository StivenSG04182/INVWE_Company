import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, PlusCircle, Search, Store } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: { subaccountId: string }
}

const StoresPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían las tiendas de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const stores = [
    {
      id: '1',
      name: 'Tienda Principal Bogotá',
      type: 'Física',
      address: 'Calle 85 #15-30, Bogotá',
      manager: 'Carlos Rodríguez',
      phone: '+57 300 123 4567',
      email: 'tienda.bogota@empresa.com',
      status: 'Activo',
      salesLastMonth: 12500000,
    },
    {
      id: '2',
      name: 'Tienda Online',
      type: 'Virtual',
      address: 'www.mitienda.com',
      manager: 'Ana Martínez',
      phone: '+57 315 987 6543',
      email: 'tienda.online@empresa.com',
      status: 'Activo',
      salesLastMonth: 18750000,
    },
    {
      id: '3',
      name: 'Sucursal Medellín',
      type: 'Física',
      address: 'Carrera 43A #1-50, Medellín',
      manager: 'Luis Pérez',
      phone: '+57 320 456 7890',
      email: 'tienda.medellin@empresa.com',
      status: 'Activo',
      salesLastMonth: 9800000,
    },
    {
      id: '4',
      name: 'Punto de Venta Cali',
      type: 'Física',
      address: 'Av. 6N #28N-23, Cali',
      manager: 'María López',
      phone: '+57 310 234 5678',
      email: 'tienda.cali@empresa.com',
      status: 'Inactivo',
      salesLastMonth: 0,
    },
  ]

  // Calcular estadísticas
  const totalStores = stores.length
  const activeStores = stores.filter(store => store.status === 'Activo').length
  const physicalStores = stores.filter(store => store.type === 'Física').length
  const onlineStores = stores.filter(store => store.type === 'Virtual').length
  const totalSales = stores.reduce((acc, store) => acc + store.salesLastMonth, 0)

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Tiendas</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Tienda
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestiona tus tiendas físicas y virtuales desde un solo lugar
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tiendas..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">Filtrar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tiendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStores}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tiendas Físicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{physicalStores}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tiendas Virtuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineStores}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales (Mes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalSales / 1000000).toFixed(2)}M
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Directorio de Tiendas</CardTitle>
            <CardDescription>
              Información detallada de todas tus tiendas y puntos de venta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-left py-3 px-4">Ubicación</th>
                    <th className="text-left py-3 px-4">Responsable</th>
                    <th className="text-left py-3 px-4">Contacto</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Ventas (Mes)</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{store.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={store.type === 'Física' ? 'outline' : 'secondary'}>
                          {store.type === 'Física' ? (
                            <>
                              <Store className="h-3 w-3 mr-1" />
                              {store.type}
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              {store.type}
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {store.type === 'Física' && <MapPin className="h-3 w-3 text-muted-foreground" />}
                          {store.address}
                        </div>
                      </td>
                      <td className="py-3 px-4">{store.manager}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs">{store.email}</span>
                          <span className="text-xs text-muted-foreground">{store.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={store.status === 'Activo' ? 'success' : 'destructive'}
                        >
                          {store.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {store.salesLastMonth > 0 ? (
                          <span>${(store.salesLastMonth / 1000000).toFixed(2)}M</span>
                        ) : (
                          <span className="text-muted-foreground">Sin ventas</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Ver Detalles</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Ventas</CardTitle>
              <CardDescription>Comparativa de ventas entre tiendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Los gráficos de rendimiento estarán disponibles próximamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default StoresPage