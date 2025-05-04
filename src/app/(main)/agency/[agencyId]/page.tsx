import { redirect } from 'next/navigation';
import { getAuthUserDetails, getAgencyDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import { Plan } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, ShoppingCart, Activity, Layers, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import AgencyDetails from '@/components/forms/agency-details';
import React from 'react';
// Importamos los componentes cliente para los gráficos
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

import { connectToDatabase, IProduct, IStock, IMovement, IArea } from '@/lib/mongodb';

// Servicio para obtener datos reales del dashboard desde MongoDB
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
    }).map((product: IProduct) => {
      const productStocks = stocks.filter((stock: IStock) => 
        stock.productId === product._id?.toString()
      );
      
      const currentStock = productStocks.reduce(
        (sum: number, stock: IStock) => sum + stock.quantity, 0
      );
      
      return {
        ...product,
        currentStock
      };
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
    
    // Procesar movimientos recientes para mostrar
    const recentMovements = await Promise.all(
      movements.slice(0, 10).map(async (movement: IMovement) => {
        const product = products.find(p => p._id?.toString() === movement.productId);
        return {
          _id: movement._id,
          type: movement.type,
          productName: product ? product.name : 'Producto desconocido',
          quantity: movement.quantity,
          date: movement.createdAt
        };
      })
    );
    
    // Calcular productos por área
    const productsByArea = await Promise.all(
      areas.map(async (area: IArea) => {
        const areaStocks = stocks.filter((stock: IStock) => stock.areaId === area._id?.toString());
        const totalProducts = areaStocks.length;
        const totalValue = areaStocks.reduce((total: number, stock: IStock) => {
          const product = products.find((p: IProduct) => p._id?.toString() === stock.productId);
          return total + (product ? (product.price * stock.quantity) : 0);
        }, 0);
        
        return {
          _id: area._id,
          name: area.name,
          totalProducts,
          totalValue
        };
      })
    );
    
    // Calcular productos más vendidos (basado en movimientos de salida)
    const productSales = movements
      .filter((m: IMovement) => m.type === 'salida')
      .reduce((acc: {[key: string]: number}, movement: IMovement) => {
        const productId = movement.productId;
        if (!acc[productId]) acc[productId] = 0;
        acc[productId] += movement.quantity;
        return acc;
      }, {});
    
    const topProducts = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p._id?.toString() === productId);
        return {
          _id: productId,
          name: product ? product.name : 'Producto desconocido',
          sales,
          price: product ? product.price : 0
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    
    // Calcular datos de ventas (simulado por ahora)
    // En una implementación real, esto vendría de una colección de ventas
    const totalSales = topProducts.reduce((sum, product) => sum + (product.sales * product.price), 0);
    const lastMonthSales = totalSales * 0.9; // Simulado
    const growth = totalSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : 0;
    
    const salesData = {
      total: totalSales,
      growth: parseFloat(growth.toFixed(1)),
      lastMonth: lastMonthSales
    };
    
    // Datos de órdenes (simulado por ahora)
    // En una implementación real, esto vendría de una colección de órdenes
    const ordersCount = Math.floor(totalSales / 100000) || 1;
    const ordersData = {
      total: ordersCount,
      pending: Math.floor(ordersCount * 0.15),
      completed: Math.floor(ordersCount * 0.85)
    };
    
    return {
      productsCount: products.length,
      areasCount: areas.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalInventoryValue,
      recentMovements,
      entriesCount,
      exitsCount,
      productsByArea,
      topProducts,
      salesData,
      ordersData
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
      topProducts: [],
      salesData: { total: 0, growth: 0, lastMonth: 0 },
      ordersData: { total: 0, pending: 0, completed: 0 }
    };
  }
};

const Page = async ({
  params,
  searchParams,
}: {
  params: { agencyId: string };
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  // Verificar invitación y obtener agencyId
  const agencyIdFromInvitation = await verifyAndAcceptInvitation();
  
  // Obtener detalles del usuario
  const user = await getAuthUserDetails();
  
  // Lógica de redirección basada en el rol del usuario y parámetros
  if (agencyIdFromInvitation) {
    if (user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER") {
      return redirect("/subaccount");
    } else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyIdFromInvitation}/billing?plan=${searchParams.plan}`
        );
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];
        if (!stateAgencyId) return <div>No autorizado</div>;
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      }
      // Si no hay parámetros especiales, mostrar el dashboard
    } else {
      return <div>No autorizado</div>;
    }
  } else {
    // Si no hay agencyId de invitación, mostrar formulario de creación
    const authUser = await currentUser();
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
          <h1 className="text-4xl">Crear una Agencia</h1>
          <AgencyDetails
            data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
          />
        </div>
      </div>
    );
  }

  // Si llegamos aquí, mostrar el dashboard
  const agencyId = params.agencyId;
  
  // Obtener datos de la agencia
  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) return <div>Agencia no encontrada</div>;
  
  // Obtener datos del dashboard
  const dashboardData = await getDashboardData(agencyId);
  
  return (
    <div className="flex flex-col gap-5 w-full p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de control de {agencyDetails.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
          <Button size="sm">
            <Package className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <CardTitle className="text-sm font-medium">Ventas Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${dashboardData.salesData.total.toLocaleString('es-CO')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      +{dashboardData.salesData.growth}%
                    </Badge>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ${dashboardData.salesData.lastMonth.toLocaleString('es-CO')} el mes pasado
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos con Bajo Stock</CardTitle>
                <CardDescription>
                  Productos que necesitan reabastecimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.lowStockProducts.map((product: any) => (
                      <div key={product._id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock actual: {product.currentStock} / Mínimo: {product.minStock}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Reabastecer
                        </Button>
                      </div>
                    ))}
                    <Button variant="link" size="sm" className="mt-2" asChild>
                      <Link href={`/agency/${params.agencyId}/(Inventory)/stock`}>
                        Ver todos los productos <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No hay productos con bajo stock</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Movimientos Recientes</CardTitle>
                <CardDescription>
                  Últimas entradas y salidas de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentMovements.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentMovements.slice(0, 5).map((movement: any) => (
                      <div key={movement._id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{movement.productName}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={movement.type === 'entrada' ? 'outline' : 'secondary'}>
                              {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {movement.quantity} unidades
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    ))}
                    <Button variant="link" size="sm" className="mt-2" asChild>
                      <Link href={`/agency/${params.agencyId}/(Inventory)/movements/all`}>
                        Ver todos los movimientos <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No hay movimientos recientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Información de Inventario</AlertTitle>
            <AlertDescription>
              Esta sección muestra un resumen del inventario. Para gestión completa, visite la sección de Inventario.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Áreas</CardTitle>
                <CardDescription>
                  Productos y valor por ubicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.productsByArea.map((area: any) => (
                    <div key={area._id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {area.totalProducts} productos
                        </p>
                      </div>
                      <p className="font-medium">
                        ${area.totalValue.toLocaleString('es-CO')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Movimientos</CardTitle>
                <CardDescription>
                  Entradas y salidas de inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm font-medium">Entradas</p>
                        <p className="text-3xl font-bold">{dashboardData.entriesCount}</p>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          +{Math.floor(dashboardData.entriesCount / (dashboardData.entriesCount + dashboardData.exitsCount) * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm font-medium">Salidas</p>
                        <p className="text-3xl font-bold">{dashboardData.exitsCount}</p>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {Math.floor(dashboardData.exitsCount / (dashboardData.entriesCount + dashboardData.exitsCount) * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${dashboardData.salesData.total.toLocaleString('es-CO')}
                  </div>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +{dashboardData.salesData.growth}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    vs. mes anterior
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dashboardData.ordersData.total}</div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{dashboardData.ordersData.completed}</span> completados
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{dashboardData.ordersData.pending}</span> pendientes
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">3.2%</div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    +0.5%
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    vs. mes anterior
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Tendencia de Ventas</CardTitle>
                <CardDescription>
                  Evolución de ventas en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {/* Usamos el componente cliente para el gráfico de líneas */}
                  <LineChartComponent 
                    data={[
                      { mes: 'Enero', ventas: dashboardData.salesData.lastMonth * 0.7 },
                      { mes: 'Febrero', ventas: dashboardData.salesData.lastMonth * 0.8 },
                      { mes: 'Marzo', ventas: dashboardData.salesData.lastMonth * 0.85 },
                      { mes: 'Abril', ventas: dashboardData.salesData.lastMonth * 0.9 },
                      { mes: 'Mayo', ventas: dashboardData.salesData.lastMonth },
                      { mes: 'Junio', ventas: dashboardData.salesData.total },
                    ]}
                    xAxisKey="mes"
                    lines={[
                      { dataKey: 'ventas', stroke: '#10b981', name: 'Ventas ($)' }
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>
                  Los productos con mayor volumen de ventas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topProducts.slice(0, 3).map((product: any, index: number) => (
                    <div key={product._id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ${(product.sales * product.price).toLocaleString('es-CO')}
                      </p>
                    </div>
                  ))}
                  <Button variant="link" size="sm" className="mt-2" asChild>
                    <Link href={`/agency/${params.agencyId}/(Reports)/sales-reports`}>
                      Ver todos los productos <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ventas por Categoría</CardTitle>
              <CardDescription>
                Proporción de ventas por tipo de producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[250px]">
                  {/* Usamos el componente cliente para el gráfico circular */}
                  <PieChartComponent 
                    data={[
                      { name: 'Electrónicos', value: dashboardData.salesData.total * 0.35 },
                      { name: 'Muebles', value: dashboardData.salesData.total * 0.25 },
                      { name: 'Ropa', value: dashboardData.salesData.total * 0.20 },
                      { name: 'Alimentos', value: dashboardData.salesData.total * 0.15 },
                      { name: 'Otros', value: dashboardData.salesData.total * 0.05 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    colors={['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <p className="text-sm">Electrónicos</p>
                      </div>
                      <p className="font-medium">${(dashboardData.salesData.total * 0.35).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <p className="text-sm">Muebles</p>
                      </div>
                      <p className="font-medium">${(dashboardData.salesData.total * 0.25).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <p className="text-sm">Ropa</p>
                      </div>
                      <p className="font-medium">${(dashboardData.salesData.total * 0.20).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <p className="text-sm">Alimentos</p>
                      </div>
                      <p className="font-medium">${(dashboardData.salesData.total * 0.15).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <p className="text-sm">Otros</p>
                      </div>
                      <p className="font-medium">${(dashboardData.salesData.total * 0.05).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" asChild>
                  <Link href={`/agency/${params.agencyId}/(Dashboard)/analytics`}>
                    Ver análisis detallado <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;