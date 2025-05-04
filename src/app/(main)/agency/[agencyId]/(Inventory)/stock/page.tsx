import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { StockService, ProductService, AreaService } from '@/lib/services/inventory-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const StockPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }
  
  // Obtener datos de stock, productos y áreas de MongoDB
  let stocks = [];
  let products = [];
  let areas = [];
  let totalItems = 0;
  let totalValue = 0;
  let lowStockItems = 0;
  
  try {
    // Obtener stock
    stocks = await StockService.getStocks(agencyId);
    
    // Obtener productos y áreas para mostrar nombres
    products = await ProductService.getProducts(agencyId);
    areas = await AreaService.getAreas(agencyId);
    
    // Calcular estadísticas
    totalItems = stocks.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    // Calcular valor total del inventario
    const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]));
    totalValue = stocks.reduce((sum: number, item: any) => {
      const product = productsMap.get(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    // Contar productos bajo mínimo
    lowStockItems = stocks.filter((item: any) => {
      const product = productsMap.get(item.productId);
      return product && product.minStock && item.quantity <= product.minStock;
    }).length;
  } catch (error) {
    console.error('Error al cargar datos de inventario:', error);
  }
  
  // Crear mapas para buscar nombres de productos y áreas
  const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]));
  const areasMap = new Map(areas.map((a: any) => [a._id.toString(), a]));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Stock</h1>
        <div className="flex gap-2">
          <Link href={`/agency/${agencyId}/movements/entrada`}>
            <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
              Registrar Entrada
            </Button>
          </Link>
          <Link href={`/agency/${agencyId}/movements/salida`}>
            <Button className="bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/80">
              Registrar Salida
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Inventario Actual</h2>
          <p className="text-muted-foreground">
            Visualice y gestione el stock disponible de todos sus productos por ubicación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total en Inventario</h3>
            <p className="text-2xl font-bold">{totalItems} unidades</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Valor del Inventario</h3>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Productos Bajo Mínimo</h3>
            <p className="text-2xl font-bold">{lowStockItems}</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="px-3 py-2 border rounded-md w-64"
              />
              <select className="px-3 py-2 border rounded-md">
                <option value="">Todas las ubicaciones</option>
                {areas.map((area: any) => (
                  <option key={area._id} value={area._id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            
            {stocks.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No hay registros de stock disponibles. Agregue productos al inventario.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-left">Ubicación</th>
                      <th className="px-4 py-2 text-left">Cantidad</th>
                      <th className="px-4 py-2 text-left">Valor</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock: any) => {
                      const product = productsMap.get(stock.productId);
                      const area = areasMap.get(stock.areaId);
                      const isLowStock = product && product.minStock && stock.quantity <= product.minStock;
                      
                      return (
                        <tr key={stock._id} className="border-t hover:bg-muted/30">
                          <td className="px-4 py-2">{product ? product.name : 'Producto desconocido'}</td>
                          <td className="px-4 py-2">{area ? area.name : 'Área desconocida'}</td>
                          <td className="px-4 py-2">{stock.quantity}</td>
                          <td className="px-4 py-2">
                            ${product ? (product.price * stock.quantity).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-2">
                            {isLowStock ? (
                              <span className="text-destructive font-medium">Bajo mínimo</span>
                            ) : (
                              <span className="text-green-600 font-medium">Normal</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <Link href={`/agency/${agencyId}/movements/entrada?productId=${stock.productId}&areaId=${stock.areaId}`}>
                                <Button variant="outline" size="sm">Entrada</Button>
                              </Link>
                              <Link href={`/agency/${agencyId}/movements/salida?productId=${stock.productId}&areaId=${stock.areaId}`}>
                                <Button variant="outline" size="sm">Salida</Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPage;