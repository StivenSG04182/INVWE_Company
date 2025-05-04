import { redirect } from 'next/navigation';
import { getAuthUserDetails } from '@/lib/queries';
import { connectToDatabase, IProduct, IStock, IMovement } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, ShoppingCart, CheckCircle, XCircle, Server, Globe, Database, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
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

// Servicio para obtener datos de MongoDB
const getInventoryData = async (agencyId: string) => {
  try {
    const { db } = await connectToDatabase();
    
    // Obtener productos
    const products = await db.collection('products')
      .find({ agencyId })
      .toArray();
    
    // Obtener stock
    const stocks = await db.collection('stocks')
      .find({ agencyId })
      .toArray();
    
    // Obtener movimientos recientes (últimos 30)
    const movements = await db.collection('movements')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();
    
    // Calcular productos con bajo stock
    const lowStockProducts = products.filter((product: IProduct) => {
      const productStocks = stocks.filter((stock: IStock) => 
        stock.productId === product._id?.toString()
      );
      
      const totalStock = productStocks.reduce(
        (sum: number, stock: IStock) => sum + stock.quantity, 0
      );
      
      return product.minStock && totalStock <= product.minStock;
    });
    
    // Calcular valor total del inventario
    const totalInventoryValue = stocks.reduce((total: number, stock: IStock) => {
      const product = products.find(
        (p: IProduct) => p._id?.toString() === stock.productId
      );
      return total + (product ? (product.price * stock.quantity) : 0);
    }, 0);
    
    // Calcular movimientos por tipo
    const entriesCount = movements.filter((m: IMovement) => m.type === 'entrada').length;
    const exitsCount = movements.filter((m: IMovement) => m.type === 'salida').length;
    
    return {
      productsCount: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalInventoryValue,
      recentMovements: movements,
      entriesCount,
      exitsCount
    };
  } catch (error) {
    console.error('Error al obtener datos de inventario:', error);
    return {
      productsCount: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      totalInventoryValue: 0,
      recentMovements: [],
      entriesCount: 0,
      exitsCount: 0
    };
  }
};

export default async function IntegrationsPage({
  params,
}: {
  params: { agencyId: string };
}) {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');
  
  const agencyId = params.agencyId;
  if (!user.Agency) return redirect('/agency');
  
  // Obtener datos de inventario
  const inventoryData = await getInventoryData(agencyId);
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <h1 className="text-4xl font-bold">Integraciones y Estado del Sistema</h1>
      <p className="text-muted-foreground">
        Visualiza el estado actual de tu inventario y las integraciones con otros sistemas
      </p>
      
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{inventoryData.productsCount}</div>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Productos registrados en el sistema
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${inventoryData.totalInventoryValue.toLocaleString('es-CO')}
                  </div>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Valor total de productos en stock
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {inventoryData.entriesCount} / {inventoryData.exitsCount}
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Entradas / Salidas recientes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{inventoryData.lowStockCount}</div>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Productos que requieren reposición
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
                <CardDescription>
                  Productos que requieren reposición inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.lowStockProducts.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No hay productos con stock bajo actualmente
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inventoryData.lowStockProducts.slice(0, 5).map((product: IProduct) => (
                      <div key={product._id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="destructive">
                          Stock Bajo
                        </Badge>
                      </div>
                    ))}
                    
                    {inventoryData.lowStockProducts.length > 5 && (
                      <Button variant="link" asChild className="w-full">
                        <Link href={`/agency/${agencyId}/(Inventory)/stock`}>
                          Ver todos los productos con stock bajo
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Movimientos Recientes</CardTitle>
                <CardDescription>
                  Últimas entradas y salidas de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryData.recentMovements.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No hay movimientos recientes
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inventoryData.recentMovements.slice(0, 5).map((movement: IMovement) => (
                      <div key={movement._id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">
                            {movement.type === 'entrada' ? 'Entrada' : 'Salida'} de {movement.quantity} unidades
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(movement.createdAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <Badge variant={movement.type === 'entrada' ? 'success' : 'destructive'}>
                          {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </div>
                    ))}
                    
                    <Button variant="link" asChild className="w-full">
                      <Link href={`/agency/${agencyId}/(Inventory)/movements`}>
                        Ver todos los movimientos
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Rendimiento del Inventario</CardTitle>
              <CardDescription>
                Visualización del rendimiento y rotación de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Los gráficos de rendimiento estarán disponibles próximamente
                  </p>
                  <Button variant="outline" className="mt-4">
                    Ver informes detallados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Integraciones</CardTitle>
                <CardDescription>
                  Servicios conectados y su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <PieChartComponent 
                    data={[
                      { name: 'Activas', value: 3 },
                      { name: 'Inactivas', value: 1 },
                      { name: 'Pendientes', value: 2 }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    colors={['#10b981', '#f43f5e', '#f59e0b']}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">E-commerce</p>
                        <p className="text-xs text-muted-foreground">Sincronización automática</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Activo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-3 text-purple-600" />
                      <div>
                        <p className="font-medium">API de Inventario</p>
                        <p className="text-xs text-muted-foreground">Endpoints REST</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Activo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-amber-600" />
                      <div>
                        <p className="font-medium">Proveedores</p>
                        <p className="text-xs text-muted-foreground">Catálogo externo</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Pendiente
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de API</CardTitle>
                <CardDescription>
                  Estadísticas de uso y respuesta de la API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <LineChartComponent 
                    data={[
                      { name: 'Lun', requests: 120, tiempo: 230 },
                      { name: 'Mar', requests: 180, tiempo: 250 },
                      { name: 'Mié', requests: 150, tiempo: 210 },
                      { name: 'Jue', requests: 230, tiempo: 280 },
                      { name: 'Vie', requests: 290, tiempo: 310 },
                      { name: 'Sáb', requests: 110, tiempo: 190 },
                      { name: 'Dom', requests: 90, tiempo: 180 }
                    ]}
                    xAxisKey="name"
                    lines={[
                      { dataKey: 'requests', stroke: '#3b82f6', name: 'Solicitudes' },
                      { dataKey: 'tiempo', stroke: '#f59e0b', name: 'Tiempo (ms)' }
                    ]}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Disponibilidad</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xl font-bold">99.8%</p>
                      <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-3">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Servicios Conectados</CardTitle>
              <CardDescription>
                Estado de las integraciones con sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="font-medium">E-commerce</h3>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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
                        <span>{inventoryData.productsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Funcionando
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 mr-2 text-purple-600" />
                        <h3 className="font-medium">CRM</h3>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
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
                        <span className="text-red-600 flex items-center">
                          <XCircle className="h-3 w-3 mr-1" /> Desconectado
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Conectar
                    </Button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 mr-2 text-green-600" />
                        <h3 className="font-medium">API de Inventario</h3>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Operativa
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Ver documentación
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertTitle className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Sistema de integraciones funcionando correctamente
                  </AlertTitle>
                  <AlertDescription>
                    Todas las integraciones activas están funcionando sin problemas. Hay 1 integración inactiva y 2 pendientes de configuración.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>
                Notificaciones y alertas importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryData.lowStockCount > 0 ? (
                <Alert className="mb-4 border-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertTitle>Productos con stock bajo</AlertTitle>
                  <AlertDescription>
                    Hay {inventoryData.lowStockCount} productos que requieren reposición inmediata.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 border-green-500">
                  <AlertTitle>Inventario en niveles óptimos</AlertTitle>
                  <AlertDescription>
                    Todos los productos tienen niveles de stock adecuados.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href={`/agency/${agencyId}/(Inventory)/stock`}>
                    Ir a gestión de stock
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}