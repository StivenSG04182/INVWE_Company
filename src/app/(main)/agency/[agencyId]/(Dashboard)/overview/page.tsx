import { redirect } from 'next/navigation';
import { getAuthUserDetails } from '@/lib/queries';
import { connectToDatabase, IProduct, IStock, IMovement, IArea } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, ShoppingCart, Activity, Layers, PieChart as PieChartIcon } from 'lucide-react';
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
const getDashboardData = async (agencyId: string) => {
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
    
    // Obtener áreas
    const areas = await db.collection('areas')
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
    
    // Calcular productos por área
    const productsByArea = areas.map((area: IArea) => {
      const areaStocks = stocks.filter((stock: IStock) => stock.areaId === area._id?.toString());
      const totalProducts = areaStocks.length;
      const totalValue = areaStocks.reduce((total: number, stock: IStock) => {
        const product = products.find((p: IProduct) => p._id?.toString() === stock.productId);
        return total + (product ? (product.price * stock.quantity) : 0);
      }, 0);
      
      return {
        ...area,
        totalProducts,
        totalValue
      };
    });
    
    // Calcular productos más vendidos (simulado)
    const topProducts = products
      .slice(0, 5)
      .map((product: IProduct) => ({
        ...product,
        sales: Math.floor(Math.random() * 100) // Simulado para demostración
      }));
    
    return {
      productsCount: products.length,
      areasCount: areas.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalInventoryValue,
      recentMovements: movements,
      entriesCount,
      exitsCount,
      productsByArea,
      topProducts
    };
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return {
      productsCount: 0,
      areasCount: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      totalInventoryValue: 0,
      recentMovements: [],
      entriesCount: 0,
      exitsCount: 0,
      productsByArea: [],
      topProducts: []
    };
  }
};

export default async function OverviewPage({
  params,
}: {
  params: { agencyId: string };
}) {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');
  
  const agencyId = params.agencyId;
  if (!user.Agency) return redirect('/agency');
  
  // Obtener datos del dashboard
  const dashboardData = await getDashboardData(agencyId);
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <h1 className="text-4xl font-bold">Panel de Control</h1>
      <p className="text-muted-foreground">
        Resumen general del estado de tu inventario y operaciones
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardData.productsCount}</div>
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
                ${dashboardData.totalInventoryValue.toLocaleString('es-CO')}
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
            <CardTitle className="text-sm font-medium">Áreas de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardData.areasCount}</div>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ubicaciones de almacenamiento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{dashboardData.lowStockCount}</div>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Productos que requieren reposición
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos movimientos de inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentMovements.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No hay movimientos recientes
              </p>
            ) : (
              <div className="space-y-2">
                {dashboardData.recentMovements.slice(0, 5).map((movement: IMovement) => (
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
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
            <CardDescription>
              Requieren reposición inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.lowStockProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No hay productos con stock bajo
              </p>
            ) : (
              <div className="space-y-2">
                {dashboardData.lowStockProducts.slice(0, 5).map((product: IProduct) => (
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
                
                {dashboardData.lowStockProducts.length > 5 && (
                  <Button variant="link" asChild className="w-full">
                    <Link href={`/agency/${agencyId}/(Inventory)/stock`}>
                      Ver todos
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Los productos con mayor rotación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.topProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No hay datos de ventas disponibles
              </p>
            ) : (
              <>
                <div className="h-[200px] mb-4">
                  <BarChartComponent 
                    data={dashboardData.topProducts.map(product => ({
                      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
                      ventas: product.sales
                    }))}
                    xAxisKey="name"
                    bars={[
                      { dataKey: "ventas", name: "Ventas", fill: "#3b82f6" }
                    ]}
                  />
                </div>
                
                <div className="space-y-2">
                  {dashboardData.topProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {product.sales} ventas
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="link" asChild className="w-full">
                    <Link href={`/agency/${agencyId}/(Reports)/sales-reports`}>
                      Ver informe completo
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Áreas</CardTitle>
            <CardDescription>
              Valor del inventario por ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.productsByArea.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No hay áreas de inventario configuradas
              </p>
            ) : (
              <>
                <div className="h-[200px] mb-4">
                  <PieChartComponent 
                    data={dashboardData.productsByArea.map(area => ({
                      name: area.name,
                      value: area.totalValue
                    }))}
                    dataKey="value"
                    nameKey="name"
                    colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
                  />
                </div>
                
                <div className="space-y-2">
                  {dashboardData.productsByArea.map((area: any) => (
                    <div key={area._id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-xs text-muted-foreground">{area.totalProducts} productos</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${area.totalValue.toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="link" asChild className="w-full">
                    <Link href={`/agency/${agencyId}/(Inventory)/areas`}>
                      Ver todas las áreas
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Rendimiento del Inventario</CardTitle>
          <CardDescription>
            Visualización de tendencias y métricas clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Distribución de Entradas/Salidas</h3>
              <div className="h-[200px]">
                <PieChartComponent 
                  data={[
                    { name: 'Entradas', value: dashboardData.entriesCount },
                    { name: 'Salidas', value: dashboardData.exitsCount }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  colors={['#10b981', '#f43f5e']}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Entradas: {dashboardData.entriesCount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Salidas: {dashboardData.exitsCount}</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Productos por Estado de Stock</h3>
              <div className="h-[200px]">
                <BarChartComponent 
                  data={[
                    { name: 'Stock Normal', value: dashboardData.productsCount - dashboardData.lowStockCount },
                    { name: 'Stock Bajo', value: dashboardData.lowStockCount }
                  ]}
                  xAxisKey="name"
                  bars={[
                    { dataKey: "value", name: "Productos", fill: "#3b82f6" }
                  ]}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Stock Normal: {dashboardData.productsCount - dashboardData.lowStockCount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Stock Bajo: {dashboardData.lowStockCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" className="mt-2" asChild>
              <Link href={`/agency/${agencyId}/(Reports)/performance`}>
                Ver informes detallados
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}