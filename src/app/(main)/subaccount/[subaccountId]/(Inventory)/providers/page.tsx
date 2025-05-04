import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Props = {
  params: { subaccountId: string }
}

const ProvidersPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían los proveedores de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const providers = [
    {
      id: '1',
      name: 'Distribuidora Nacional S.A.',
      contact: 'Juan Pérez',
      email: 'juan.perez@disnacional.com',
      phone: '+57 300 123 4567',
      address: 'Calle 45 #23-67, Bogotá',
      status: 'Activo',
      productsCount: 12,
      lastOrder: '2023-10-10',
    },
    {
      id: '2',
      name: 'Importadora Global Ltda.',
      contact: 'María Rodríguez',
      email: 'maria@importadoraglobal.com',
      phone: '+57 315 987 6543',
      address: 'Carrera 15 #78-45, Medellín',
      status: 'Activo',
      productsCount: 8,
      lastOrder: '2023-09-28',
    },
    {
      id: '3',
      name: 'Suministros Industriales',
      contact: 'Carlos Gómez',
      email: 'cgomez@suministros.co',
      phone: '+57 320 456 7890',
      address: 'Av. Industrial #34-12, Cali',
      status: 'Inactivo',
      productsCount: 5,
      lastOrder: '2023-08-15',
    },
  ]

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Proveedores</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestiona tus proveedores y mantén actualizada su información de contacto
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedores..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">Filtrar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {providers.filter(p => p.status === 'Activo').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Suministrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {providers.reduce((acc, provider) => acc + provider.productsCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Directorio de Proveedores</CardTitle>
            <CardDescription>
              Lista completa de proveedores y su información de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Contacto</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Teléfono</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Productos</th>
                    <th className="text-left py-3 px-4">Último Pedido</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{provider.name}</td>
                      <td className="py-3 px-4">{provider.contact}</td>
                      <td className="py-3 px-4">{provider.email}</td>
                      <td className="py-3 px-4">{provider.phone}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={provider.status === 'Activo' ? 'success' : 'secondary'}
                        >
                          {provider.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{provider.productsCount}</td>
                      <td className="py-3 px-4">{provider.lastOrder}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Ver Productos</Button>
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
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Últimos pedidos realizados a proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                <p>Los datos de pedidos recientes estarán disponibles próximamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default ProvidersPage