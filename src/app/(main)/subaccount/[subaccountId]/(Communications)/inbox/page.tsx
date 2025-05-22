import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { Package, ShoppingCart, TruckIcon, AlertTriangle } from 'lucide-react';

const InboxPage = async ({ params }: { params: { subaccountId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  // Obtener la subcuenta
  const subaccount = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    select: {
      name: true,
      agencyId: true,
    },
  });

  if (!subaccount) {
    return redirect('/agency');
  }
  
  // Obtener productos con stock bajo
  const lowStockProducts = await db.product.findMany({
    where: {
      subAccountId: params.subaccountId,
      Stocks: {
        some: {
          quantity: {
            lte: db.product.fields.minStock,
          },
        },
      },
    },
    include: {
      Stocks: true,
      Category: true,
    },
    take: 5,
  });
  
  // Obtener movimientos recientes
  const recentMovements = await db.movement.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
    include: {
      Product: true,
      Area: true,
      Provider: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  // Obtener proveedores
  const providers = await db.provider.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
    take: 5,
  });

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notificaciones de Inventario</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Solicitar Reabastecimiento
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-md">
              Configurar Alertas
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Centro de Notificaciones de Inventario</h2>
            <p className="text-muted-foreground">
              Gestione todas las alertas y comunicaciones relacionadas con su inventario desde un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="md:col-span-1 border rounded-md p-4">
              <h3 className="font-medium text-lg mb-4">Categorías</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Alertas de Stock</span>
                  <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded-full">{lowStockProducts.length}</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Entradas Recientes</span>
                  <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {recentMovements.filter(m => m.type === 'ENTRADA').length}
                  </span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Salidas Recientes</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {recentMovements.filter(m => m.type === 'SALIDA').length}
                  </span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Transferencias</span>
                  <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {recentMovements.filter(m => m.type === 'TRANSFERENCIA').length}
                  </span>
                </li>
              </ul>
              
              <h3 className="font-medium text-lg mt-6 mb-4">Proveedores</h3>
              <ul className="space-y-2">
                {providers.map(provider => (
                  <li key={provider.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>{provider.name}</span>
                  </li>
                ))}
                {providers.length === 0 && (
                  <li className="text-sm text-muted-foreground p-2">No hay proveedores registrados</li>
                )}
              </ul>
            </div>
            
            <div className="md:col-span-3 border rounded-md overflow-hidden">
              <div className="bg-muted p-3 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar notificaciones..." 
                  className="flex-1 p-2 rounded-md border"
                />
                <button className="bg-primary text-white p-2 rounded-md">
                  Buscar
                </button>
              </div>
              
              <div className="divide-y">
                {/* Alertas de stock bajo */}
                {lowStockProducts.map(product => {
                  const currentStock = product.Stocks.reduce((total, stock) => total + stock.quantity, 0);
                  const minStock = product.minStock || 0;
                  return (
                    <div key={product.id} className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3 bg-amber-50">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">Alerta de Stock Bajo</h4>
                          <span className="text-xs text-muted-foreground">{format(new Date(), 'dd/MM/yyyy')}</span>
                        </div>
                        <p className="font-medium">{product.name} - {currentStock} unidades disponibles</p>
                        <p className="text-sm text-muted-foreground truncate">
                          El producto ha alcanzado el nivel mínimo de stock ({minStock} unidades). Se recomienda reabastecer pronto.
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Movimientos recientes */}
                {recentMovements.slice(0, 5).map(movement => (
                  <div key={movement.id} className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      {movement.type === 'ENTRADA' && (
                        <div className="bg-green-100 text-green-600 p-2 rounded-full">
                          <ShoppingCart size={20} />
                        </div>
                      )}
                      {movement.type === 'SALIDA' && (
                        <div className="bg-red-100 text-red-600 p-2 rounded-full">
                          <Package size={20} />
                        </div>
                      )}
                      {movement.type === 'TRANSFERENCIA' && (
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                          <TruckIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-semibold">
                          {movement.type === 'ENTRADA' ? 'Entrada de Producto' : 
                           movement.type === 'SALIDA' ? 'Salida de Producto' : 
                           'Transferencia de Producto'}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="font-medium">{movement.Product.name} - {movement.quantity} unidades</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {movement.type === 'ENTRADA' ? 'Se ha registrado una entrada de ' : 
                         movement.type === 'SALIDA' ? 'Se ha registrado una salida de ' : 
                         'Se ha transferido '} 
                        {movement.quantity} unidades en {movement.Area.name}.
                        {movement.notes && ` Nota: ${movement.notes}`}
                      </p>
                    </div>
                  </div>
                ))}
                
                {lowStockProducts.length === 0 && recentMovements.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No hay notificaciones recientes de inventario</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default InboxPage;