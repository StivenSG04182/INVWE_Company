import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter, Package, PlusCircle, Search, Truck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: { subaccountId: string }
}

const ShippingPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían los envíos de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const shipments = [
    {
      id: '1',
      trackingNumber: 'ENV-2023-001',
      customer: 'Juan Pérez',
      destination: 'Calle 45 #23-67, Bogotá',
      status: 'Entregado',
      carrier: 'Servientrega',
      shippingDate: '2023-10-10',
      deliveryDate: '2023-10-12',
      products: 3,
      total: 250000,
    },
    {
      id: '2',
      trackingNumber: 'ENV-2023-002',
      customer: 'María Rodríguez',
      destination: 'Carrera 15 #78-45, Medellín',
      status: 'En tránsito',
      carrier: 'Coordinadora',
      shippingDate: '2023-10-12',
      deliveryDate: null,
      products: 2,
      total: 180000,
    },
    {
      id: '3',
      trackingNumber: 'ENV-2023-003',
      customer: 'Carlos Gómez',
      destination: 'Av. Industrial #34-12, Cali',
      status: 'Preparando',
      carrier: 'Interrapidisimo',
      shippingDate: null,
      deliveryDate: null,
      products: 5,
      total: 420000,
    },
    {
      id: '4',
      trackingNumber: 'ENV-2023-004',
      customer: 'Laura Sánchez',
      destination: 'Calle 10 #5-23, Barranquilla',
      status: 'Cancelado',
      carrier: 'Servientrega',
      shippingDate: null,
      deliveryDate: null,
      products: 1,
      total: 75000,
    },
  ]

  // Calcular estadísticas
  const totalShipments = shipments.length
  const delivered = shipments.filter(s => s.status === 'Entregado').length
  const inTransit = shipments.filter(s => s.status === 'En tránsito').length
  const preparing = shipments.filter(s => s.status === 'Preparando').length
  const cancelled = shipments.filter(s => s.status === 'Cancelado').length

  // Función para determinar el color del badge según el estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entregado':
        return 'success'
      case 'En tránsito':
        return 'warning'
      case 'Preparando':
        return 'secondary'
      case 'Cancelado':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Gestión de Envíos</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Envío
          </Button>
        </div>
        <p className="text-muted-foreground">
          Controla y da seguimiento a todos los envíos de productos a tus clientes
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de seguimiento o cliente..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Envíos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShipments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{delivered}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inTransit}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preparando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preparing}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cancelled}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Seguimiento de Envíos</CardTitle>
            <CardDescription>
              Estado actual de todos los envíos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tracking</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Destino</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Transportista</th>
                    <th className="text-left py-3 px-4">Fecha Envío</th>
                    <th className="text-left py-3 px-4">Fecha Entrega</th>
                    <th className="text-left py-3 px-4">Productos</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          {shipment.trackingNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">{shipment.customer}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-[200px] truncate" title={shipment.destination}>
                          {shipment.destination}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadge(shipment.status) as any}>
                          {shipment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          {shipment.carrier}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {shipment.shippingDate || (
                          <span className="text-muted-foreground">Pendiente</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {shipment.deliveryDate || (
                          <span className="text-muted-foreground">Pendiente</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{shipment.products}</td>
                      <td className="py-3 px-4">${(shipment.total).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Detalles</Button>
                          <Button variant="outline" size="sm">Actualizar</Button>
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
              <CardTitle>Mapa de Envíos</CardTitle>
              <CardDescription>Visualización geográfica de envíos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">El mapa de seguimiento estará disponible próximamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default ShippingPage