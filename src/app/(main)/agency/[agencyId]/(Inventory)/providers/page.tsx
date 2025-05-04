import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const ProvidersPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Directorio de Proveedores</h2>
          <p className="text-muted-foreground">
            Administre sus proveedores, contactos y productos asociados desde este panel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total de Proveedores</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Proveedores Activos</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Órdenes Pendientes</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <input 
                type="text" 
                placeholder="Buscar proveedor..." 
                className="px-3 py-2 border rounded-md w-64"
              />
              <select className="px-3 py-2 border rounded-md">
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <p className="text-center text-muted-foreground">
              No hay proveedores registrados. Agregue su primer proveedor para comenzar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvidersPage;