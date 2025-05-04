import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const MovementsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Nuevo Movimiento
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Exportar Historial
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Historial de Movimientos</h2>
          <p className="text-muted-foreground">
            Registro de todas las entradas, salidas y transferencias de productos en el inventario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Entradas</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Salidas</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Transferencias</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar movimiento..." 
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los tipos</option>
                  <option value="entrada">Entradas</option>
                  <option value="salida">Salidas</option>
                  <option value="transferencia">Transferencias</option>
                </select>
              </div>
              <div>
                <input 
                  type="date" 
                  className="px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              No hay movimientos registrados en el inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementsPage;