import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const ClientsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Directorio de Clientes</h2>
          <p className="text-muted-foreground">
            Administre la información de sus clientes, historial de compras y datos de contacto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total de Clientes</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Clientes Activos</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Ventas Totales</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los tipos</option>
                  <option value="individual">Persona Natural</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
              <select className="px-3 py-2 border rounded-md">
                <option value="">Ordenar por</option>
                <option value="nombre">Nombre</option>
                <option value="reciente">Más reciente</option>
                <option value="ventas">Mayor compra</option>
              </select>
            </div>
            <p className="text-center text-muted-foreground">
              No hay clientes registrados. Agregue su primer cliente para comenzar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;