import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, MapPin, PlusCircle, Search, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: { subaccountId: string }
}

const InventoryAreasPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían las áreas de inventario de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const areas = [
    {
      id: '1',
      name: 'Almacén Principal',
      code: 'ALP-001',
      location: 'Bogotá - Sede Central',
      manager: 'Carlos Rodríguez',
      capacity: '500 m²',
      occupancy: 75, // porcentaje
      status: 'Activo',
      productCount: 120,
    },
    {
      id: '2',
      name: 'Almacén Secundario',
      code: 'ALS-002',
      location: 'Medellín - Sucursal Norte',
      manager: 'Ana Martínez',
      capacity: '300 m²',
      occupancy: 60,
      status: 'Activo',
      productCount: 85,
    },
    {
      id: '3',
      name: 'Bodega Temporal',
      code: 'BOD-003',
      location: 'Bogotá - Zona Industrial',
      manager: 'Luis Pérez',
      capacity: '200 m²',
      occupancy: 90,
      status: 'Activo',
      productCount: 45,
    },
    {
      id: '4',
      name: 'Área de Devoluciones',
      code: 'DEV-004',
      location: 'Bogotá - Sede Central',
      manager: 'María López',
      capacity: '100 m²',
      occupancy: 30,
      status: 'Activo',
      productCount: 25,
    },
  ]

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Áreas de Inventario</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Área
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestiona las diferentes ubicaciones y áreas donde se almacenan tus productos
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">Filtrar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Áreas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{areas.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Almacenados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {areas.reduce((acc, area) => acc + area.productCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {areas.reduce((acc, area) => acc + parseInt(area.capacity), 0)} m²
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(areas.reduce((acc, area) => acc + area.occupancy, 0) / areas.length)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Listado de Áreas de Inventario</CardTitle>
            <CardDescription>
              Información detallada de todas las áreas de almacenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Ubicación</th>
                    <th className="text-left py-3 px-4">Responsable</th>
                    <th className="text-left py-3 px-4">Capacidad</th>
                    <th className="text-left py-3 px-4">Ocupación</th>
                    <th className="text-left py-3 px-4">Productos</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <tr key={area.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{area.name}</td>
                      <td className="py-3 px-4">{area.code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {area.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">{area.manager}</td>
                      <td className="py-3 px-4">{area.capacity}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={area.occupancy > 80 ? 'destructive' : area.occupancy > 60 ? 'warning' : 'success'}
                        >
                          {area.occupancy}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{area.productCount}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{area.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" /> Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                          </Button>
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
              <CardTitle>Mapa de Distribución</CardTitle>
              <CardDescription>Visualización espacial de las áreas de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">El mapa de distribución estará disponible próximamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default InventoryAreasPage