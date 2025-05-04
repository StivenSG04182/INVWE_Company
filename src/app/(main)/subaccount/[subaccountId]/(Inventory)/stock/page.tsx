import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Filter, PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type Props = {
  params: { subaccountId: string }
}

const StockPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían los datos de stock de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const stockItems = [
    {
      id: '1',
      productName: 'Producto Ejemplo 1',
      sku: 'SKU001',
      currentStock: 25,
      minStock: 10,
      maxStock: 50,
      location: 'Almacén Principal',
      lastUpdated: '2023-10-15',
    },
    {
      id: '2',
      productName: 'Producto Ejemplo 2',
      sku: 'SKU002',
      currentStock: 5,
      minStock: 15,
      maxStock: 60,
      location: 'Almacén Secundario',
      lastUpdated: '2023-10-14',
    },
    {
      id: '3',
      productName: 'Producto Ejemplo 3',
      sku: 'SKU003',
      currentStock: 30,
      minStock: 20,
      maxStock: 80,
      location: 'Almacén Principal',
      lastUpdated: '2023-10-13',
    },
    {
      id: '4',
      productName: 'Producto Ejemplo 4',
      sku: 'SKU004',
      currentStock: 0,
      minStock: 5,
      maxStock: 30,
      location: 'Almacén Principal',
      lastUpdated: '2023-10-12',
    },
  ]

  // Función para determinar el estado del stock
  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Sin Stock', variant: 'destructive' as const }
    if (current < min) return { label: 'Bajo', variant: 'destructive' as const }
    if (current >= min && current < min * 2) return { label: 'Medio', variant: 'warning' as const }
    return { label: 'Óptimo', variant: 'success' as const }
  }

  // Calcular porcentaje de stock
  const calculateStockPercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100)
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Control de Stock</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Ajustar Stock
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Monitorea y gestiona los niveles de existencias de tus productos
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Sin Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockItems.filter(item => item.currentStock === 0).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockItems.filter(item => item.currentStock < item.minStock && item.currentStock > 0).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Óptimo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockItems.filter(item => item.currentStock >= item.minStock).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Inventario Actual</CardTitle>
            <CardDescription>
              Estado actual de las existencias en todos los almacenes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Producto</th>
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Stock Actual</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Nivel</th>
                    <th className="text-left py-3 px-4">Ubicación</th>
                    <th className="text-left py-3 px-4">Última Actualización</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item) => {
                    const status = getStockStatus(item.currentStock, item.minStock)
                    const percentage = calculateStockPercentage(item.currentStock, item.maxStock)
                    
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{item.productName}</td>
                        <td className="py-3 px-4">{item.sku}</td>
                        <td className="py-3 px-4">{item.currentStock}</td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-4 w-[150px]">
                          <Progress value={percentage} className="h-2" />
                        </td>
                        <td className="py-3 px-4">{item.location}</td>
                        <td className="py-3 px-4">{item.lastUpdated}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Ajustar</Button>
                            <Button variant="outline" size="sm">Historial</Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </BlurPage>
  )
}

export default StockPage