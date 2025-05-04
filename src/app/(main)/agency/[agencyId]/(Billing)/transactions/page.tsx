import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const TransactionsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Nueva Transacción
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Historial de Transacciones</h2>
          <p className="text-muted-foreground">
            Registro de todas las operaciones financieras relacionadas con ventas, compras y ajustes de inventario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Ingresos (Este Mes)</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Gastos (Este Mes)</h3>
            <p className="text-2xl font-bold text-red-600">$0.00</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Balance</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar transacción..." 
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los tipos</option>
                  <option value="venta">Ventas</option>
                  <option value="compra">Compras</option>
                  <option value="ajuste">Ajustes</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="px-3 py-2 border rounded-md"
                />
                <input 
                  type="date" 
                  className="px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              No hay transacciones registradas en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;