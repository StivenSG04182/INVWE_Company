import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const PaymentsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Registrar Pago
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Configurar Métodos
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Historial de Pagos</h2>
          <p className="text-muted-foreground">
            Gestione todos los pagos recibidos de clientes y realice seguimiento de su estado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Pagos Recibidos (Mes)</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Pagos Pendientes</h3>
            <p className="text-2xl font-bold text-amber-600">$0.00</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Métodos de Pago</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar pago..." 
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los métodos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
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
              No hay pagos registrados en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;