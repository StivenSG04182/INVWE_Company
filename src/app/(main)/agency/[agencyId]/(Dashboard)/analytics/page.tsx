import { redirect } from 'next/navigation';
import { getAuthUserDetails } from '@/lib/queries';
import { connectToDatabase, IProduct, IStock, IMovement } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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

// Servicio para obtener datos analíticos
const getAnalyticsData = async (agencyId: string) => {
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
    
    // Obtener movimientos
    const movements = await db.collection('movements')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calcular valor total del inventario
    const totalInventoryValue = stocks.reduce((total: number, stock: IStock) => {
      const product = products.find(
        (p: IProduct) => p._id?.toString() === stock.productId
      );
      return total + (product ? (product.price * stock.quantity) : 0);
    }, 0);
    
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
    
    // Calcular movimientos por tipo
    const entriesCount = movements.filter((m: IMovement) => m.type === 'entrada').length;
    const exitsCount = movements.filter((m: IMovement) => m.type === 'salida').length;
    
    // Generar datos para gráficos (simulados para demostración)
    
    // 1. Datos para gráfico de valor de inventario por mes (últimos 6 meses)
    const inventoryValueTrend = [
      { month: 'Enero', value: totalInventoryValue * 0.85 },
      { month: 'Febrero', value: totalInventoryValue * 0.90 },
      { month: 'Marzo', value: totalInventoryValue * 0.88 },
      { month: 'Abril', value: totalInventoryValue * 0.92 },
      { month: 'Mayo', value: totalInventoryValue * 0.95 },
      { month: 'Junio', value: totalInventoryValue },
    ];
    
    // 2. Datos para gráfico de distribución de inventario por categoría
    const inventoryByCategory = [
      { category: 'Electrónicos', value: totalInventoryValue * 0.35 },
      { category: 'Muebles', value: totalInventoryValue * 0.25 },
      { category: 'Ropa', value: totalInventoryValue * 0.20 },
      { category: 'Alimentos', value: totalInventoryValue * 0.15 },
      { category: 'Otros', value: totalInventoryValue * 0.05 },
    ];
    
    // 3. Datos para gráfico de movimientos por mes
    const movementsByMonth = [
      { month: 'Enero', entradas: 45, salidas: 38 },
      { month: 'Febrero', entradas: 52, salidas: 43 },
      { month: 'Marzo', entradas: 48, salidas: 50 },
      { month: 'Abril', entradas: 60, salidas: 55 },
      { month: 'Mayo', entradas: 58, salidas: 52 },
      { month: 'Junio', entradas: entriesCount, salidas: exitsCount },
    ];
    
    // 4. Datos para gráfico de rotación de inventario
    const inventoryTurnover = [
      { category: 'Electrónicos', turnover: 3.2 },
      { category: 'Muebles', turnover: 1.8 },
      { category: 'Ropa', turnover: 4.5 },
      { category: 'Alimentos', turnover: 6.2 },
      { category: 'Otros', turnover: 2.1 },
    ];
    
    return {
      productsCount: products.length,
      lowStockCount: lowStockProducts.length,
      totalInventoryValue,
      entriesCount,
      exitsCount,
      inventoryValueTrend,
      inventoryByCategory,
      movementsByMonth,
      inventoryTurnover
    };
  } catch (error) {
    console.error('Error al obtener datos analíticos:', error);
    return {
      productsCount: 0,
      lowStockCount: 0,
      totalInventoryValue: 0,
      entriesCount: 0,
      exitsCount: 0,
      inventoryValueTrend: [],
      inventoryByCategory: [],
      movementsByMonth: [],
      inventoryTurnover: []
    };
  }
};

export default async function AnalyticsPage({
  params,
}: {
  params: { agencyId: string };
}) {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');
  
  const agencyId = params.agencyId;
  if (!user.Agency) return redirect('/agency');
  
  // Obtener datos analíticos
  const analyticsData = await getAnalyticsData(agencyId);
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Análisis de Inventario</h1>
          <p className="text-muted-foreground">
            Estadísticas y métricas detalladas de tu inventario
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            Últimos 6 meses
          </Button>
          <Button variant="outline">
            Exportar Informe
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${analyticsData.totalInventoryValue.toLocaleString('es-CO')}
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5.2%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs. mes anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rotación de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">3.5x</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+0.8</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Promedio anual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimientos (Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {analyticsData.entriesCount + analyticsData.exitsCount}
              </div>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>-2.1%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs. mes anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analyticsData.lowStockCount}</div>
              <Badge variant={analyticsData.lowStockCount > 5 ? 'destructive' : 'outline'}>
                {analyticsData.lowStockCount > 5 ? 'Alto' : 'Normal'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requieren reposición
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="turnover">Rotación</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia del Valor de Inventario</CardTitle>
              <CardDescription>
                Evolución del valor total del inventario en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] p-4">
                <LineChartComponent
                  data={analyticsData.inventoryValueTrend}
                  xAxisKey="month"
                  lines={[
                    { dataKey: 'value', stroke: '#0ea5e9', name: 'Valor del Inventario' }
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Inventario por Categoría</CardTitle>
              <CardDescription>
                Valor del inventario distribuido por categorías de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] p-4">
                <PieChartComponent
                  data={analyticsData.inventoryByCategory}
                  dataKey="value"
                  nameKey="category"
                  colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="movements" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos de Inventario por Mes</CardTitle>
              <CardDescription>
                Entradas y salidas de inventario en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] p-4">
                <BarChartComponent
                  data={analyticsData.movementsByMonth}
                  xAxisKey="month"
                  bars={[
                    { dataKey: 'entradas', fill: '#10b981', name: 'Entradas' },
                    { dataKey: 'salidas', fill: '#f43f5e', name: 'Salidas' }
                  ]}
                />
              </div>
              
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">Mes</th>
                      <th className="text-center py-2 px-4 font-medium">Entradas</th>
                      <th className="text-center py-2 px-4 font-medium">Salidas</th>
                      <th className="text-center py-2 px-4 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.movementsByMonth.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{item.month}</td>
                        <td className="py-2 px-4 text-center">{item.entradas}</td>
                        <td className="py-2 px-4 text-center">{item.salidas}</td>
                        <td className="py-2 px-4 text-center">
                          <span className={item.entradas >= item.salidas ? 'text-green-500' : 'text-red-500'}>
                            {item.entradas - item.salidas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="turnover" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Rotación de Inventario por Categoría</CardTitle>
              <CardDescription>
                Índice de rotación anual por categoría de producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] p-4">
                <BarChartComponent
                  data={analyticsData.inventoryTurnover}
                  xAxisKey="category"
                  bars={[
                    { dataKey: 'turnover', fill: '#8884d8', name: 'Índice de Rotación' }
                  ]}
                />
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                {analyticsData.inventoryTurnover.map((item, index) => {
                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-gray-700';
                  
                  if (item.turnover > 4) {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                  } else if (item.turnover > 2) {
                    bgColor = 'bg-amber-100';
                    textColor = 'text-amber-800';
                  } else {
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                  }
                  
                  return (
                    <div key={index} className="p-3 border rounded-md">
                      <p className="font-medium">{item.category}</p>
                      <div className="flex items-center justify-center mt-2">
                        <span className="text-2xl font-bold">{item.turnover.toFixed(1)}x</span>
                      </div>
                      <p className={cn("text-xs mt-2 text-center px-2 py-1 rounded-full", bgColor, textColor)}>
                        {item.turnover > 4 ? 'Alta rotación' : item.turnover > 2 ? 'Media rotación' : 'Baja rotación'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button asChild>
          <Link href={`/agency/${agencyId}/(Reports)/inventory-reports`}>
            Ver informes detallados
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}