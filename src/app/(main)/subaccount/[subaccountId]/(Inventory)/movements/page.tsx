import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownUp, Filter, PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MovementService } from '@/lib/services/inventory-service'

type Props = {
  params: { subaccountId: string }
}

const MovementsPage = async ({ params }: Props) => {
  const subaccountId = params.subaccountId;
  
  // Obtener movimientos de la subaccount específica
  let movements = [];
  try {
    movements = await MovementService.getMovementsBySubaccount(subaccountId);
    
    // Transformar los datos para la visualización
    movements = movements.map(movement => ({
      id: movement._id?.toString(),
      date: movement.createdAt ? new Date(movement.createdAt).toISOString().split('T')[0] : 'N/A',
      type: movement.type.charAt(0).toUpperCase() + movement.type.slice(1),
      productId: movement.productId,
      quantity: movement.quantity,
      location: movement.areaId,
      reference: movement.notes || 'Sin referencia',
      user: 'Sistema'
    }));
  } catch (error) {
    console.error("Error al cargar movimientos:", error);
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Movimientos de Inventario</h1>
          <div className="flex gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Registra y consulta todos los movimientos de entrada, salida y traslados de productos
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por producto, referencia o usuario..."
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
              <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movements.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movements.filter(m => m.type === 'Entrada').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Salidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movements.filter(m => m.type === 'Salida').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Otros Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movements.filter(m => !['Entrada', 'Salida'].includes(m.type)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Registro detallado de todas las operaciones de inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-left py-3 px-4">Producto</th>
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Cantidad</th>
                    <th className="text-left py-3 px-4">Ubicación</th>
                    <th className="text-left py-3 px-4">Referencia</th>
                    <th className="text-left py-3 px-4">Usuario</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    // Determinar el color del badge según el tipo de movimiento
                    let badgeVariant: 'default' | 'success' | 'destructive' | 'outline' | 'secondary' = 'default';
                    if (movement.type === 'Entrada') badgeVariant = 'success';
                    if (movement.type === 'Salida') badgeVariant = 'destructive';
                    if (movement.type === 'Traslado') badgeVariant = 'secondary';
                    if (movement.type === 'Ajuste') badgeVariant = 'outline';
                    
                    return (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{movement.date}</td>
                        <td className="py-3 px-4">
                          <Badge variant={badgeVariant}>{movement.type}</Badge>
                        </td>
                        <td className="py-3 px-4">{movement.productName}</td>
                        <td className="py-3 px-4">{movement.sku}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {movement.type === 'Entrada' && <ArrowDownUp className="h-3 w-3 text-green-500 rotate-180" />}
                            {movement.type === 'Salida' && <ArrowDownUp className="h-3 w-3 text-red-500" />}
                            {movement.quantity}
                          </div>
                        </td>
                        <td className="py-3 px-4">{movement.location}</td>
                        <td className="py-3 px-4">{movement.reference}</td>
                        <td className="py-3 px-4">{movement.user}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Ver Detalles</Button>
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

export default MovementsPage