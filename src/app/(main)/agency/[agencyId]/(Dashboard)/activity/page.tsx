import { redirect } from 'next/navigation';
import { getAuthUserDetails } from '@/lib/queries';
import { connectToDatabase, IMovement } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Package, ArrowDown, ArrowUp, AlertTriangle, Clock, Filter, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Cargamos los componentes de gráficos de forma dinámica para evitar errores de SSR
const PieChartComponent = dynamic(
  () => import('@/components/charts/client-charts').then(mod => mod.PieChartComponent),
  { ssr: false }
);

const BarChartComponent = dynamic(
  () => import('@/components/charts/client-charts').then(mod => mod.BarChartComponent),
  { ssr: false }
);

const LineChartComponent = dynamic(
  () => import('@/components/charts/client-charts').then(mod => mod.LineChartComponent),
  { ssr: false }
);

// Servicio para obtener datos de actividad
const getActivityData = async (agencyId: string) => {
  try {
    const { db } = await connectToDatabase();
    
    // Obtener movimientos recientes (últimos 50)
    const movements = await db.collection('movements')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    // Obtener productos para mostrar nombres
    const products = await db.collection('products')
      .find({ agencyId })
      .toArray();
    
    // Obtener áreas para mostrar nombres
    const areas = await db.collection('areas')
      .find({ agencyId })
      .toArray();
    
    // Crear mapas para buscar nombres de productos y áreas
    const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]));
    const areasMap = new Map(areas.map((a: any) => [a._id.toString(), a]));
    
    // Enriquecer los movimientos con información de productos y áreas
    const enrichedMovements = movements.map((movement: any) => {
      const product = productsMap.get(movement.productId);
      const area = areasMap.get(movement.areaId);
      
      return {
        ...movement,
        productName: product ? product.name : 'Producto desconocido',
        productSku: product ? product.sku : 'N/A',
        areaName: area ? area.name : 'Área desconocida',
      };
    });
    
    // Calcular estadísticas
    const totalMovements = movements.length;
    const entriesCount = movements.filter((m: IMovement) => m.type === 'entrada').length;
    const exitsCount = movements.filter((m: IMovement) => m.type === 'salida').length;
    
    // Agrupar movimientos por día para mostrar en timeline
    const groupedByDate = enrichedMovements.reduce((groups: any, movement: any) => {
      const date = new Date(movement.createdAt).toLocaleDateString('es-CO');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(movement);
      return groups;
    }, {});
    
    return {
      movements: enrichedMovements,
      groupedByDate,
      totalMovements,
      entriesCount,
      exitsCount
    };
  } catch (error) {
    console.error('Error al obtener datos de actividad:', error);
    return {
      movements: [],
      groupedByDate: {},
      totalMovements: 0,
      entriesCount: 0,
      exitsCount: 0
    };
  }
};

export default async function ActivityPage({
  params,
}: {
  params: { agencyId: string };
}) {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');
  
  const agencyId = params.agencyId;
  if (!user.Agency) return redirect('/agency');
  
  // Obtener datos de actividad
  const activityData = await getActivityData(agencyId);
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Actividad del Inventario</h1>
          <p className="text-muted-foreground">
            Registro de todas las operaciones y movimientos recientes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Últimos 7 días
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución de Movimientos</CardTitle>
            <CardDescription>
              Proporción de entradas y salidas de inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <PieChartComponent 
                data={[
                  { name: 'Entradas', value: activityData.entriesCount },
                  { name: 'Salidas', value: activityData.exitsCount }
                ]}
                dataKey="value"
                nameKey="name"
                colors={['#10b981', '#f43f5e']}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Entradas: {activityData.entriesCount}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Salidas: {activityData.exitsCount}</span>
              </div>
              <div className="font-medium">
                Total: {activityData.totalMovements}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resumen de Actividad</CardTitle>
            <CardDescription>
              Estadísticas de movimientos recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Movimientos</p>
                  <p className="text-2xl font-bold">{activityData.totalMovements}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entradas</p>
                  <div className="flex items-center">
                    <p className="text-xl font-bold">{activityData.entriesCount}</p>
                    <ArrowDown className="h-4 w-4 ml-2 text-green-500" />
                  </div>
                </div>
                <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {((activityData.entriesCount / activityData.totalMovements) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Salidas</p>
                  <div className="flex items-center">
                    <p className="text-xl font-bold">{activityData.exitsCount}</p>
                    <ArrowUp className="h-4 w-4 ml-2 text-red-500" />
                  </div>
                </div>
                <div className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  {((activityData.exitsCount / activityData.totalMovements) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cronología de Actividades</CardTitle>
            <CardDescription>
              Historial de movimientos ordenados por fecha
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Entradas: {activityData.entriesCount}
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              Salidas: {activityData.exitsCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(activityData.groupedByDate).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No hay actividades registradas en el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(activityData.groupedByDate).map(([date, movements]: [string, any]) => (
                <div key={date} className="relative">
                  <div className="sticky top-0 bg-background z-10 py-2">
                    <h3 className="font-medium text-sm bg-muted inline-block px-3 py-1 rounded-full">
                      {date}
                    </h3>
                  </div>
                  
                  <div className="mt-2 space-y-3 pl-4 border-l-2 border-muted">
                    {movements.map((movement: any) => (
                      <div key={movement._id} className="relative">
                        {/* Indicador de línea de tiempo */}
                        <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary"></div>
                        
                        <div className="bg-card border rounded-lg p-3 ml-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={movement.type === 'entrada' ? 'success' : 'destructive'}>
                                  {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(movement.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <h4 className="font-medium mt-1">
                                {movement.type === 'entrada' ? 'Ingreso' : 'Retiro'} de {movement.quantity} unidades
                              </h4>
                              
                              <div className="mt-1 text-sm">
                                <p>
                                  <span className="text-muted-foreground">Producto:</span> {movement.productName} ({movement.productSku})
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Ubicación:</span> {movement.areaName}
                                </p>
                                {movement.notes && (
                                  <p className="mt-1 text-muted-foreground italic">
                                    "{movement.notes}"
                                  </p>
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
    </div>
  );
}