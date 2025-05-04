import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const CRMPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRM - Gestión de Relaciones con Clientes</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Nuevo Contacto
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Nueva Oportunidad
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Panel de Relaciones</h2>
          <p className="text-muted-foreground">
            Gestione sus contactos, oportunidades de venta y seguimiento de clientes potenciales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Contactos</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Oportunidades</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Valor Potencial</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Embudo de Ventas</h3>
            <select className="px-3 py-2 border rounded-md">
              <option value="">Todos los estados</option>
              <option value="prospecto">Prospectos</option>
              <option value="contactado">Contactados</option>
              <option value="negociacion">En Negociación</option>
              <option value="cerrado">Cerrados</option>
            </select>
          </div>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-4 gap-0 border-b">
              {['Prospectos', 'Contactados', 'Negociación', 'Cerrados'].map((stage) => (
                <div key={stage} className="p-4 text-center border-r last:border-r-0">
                  <h4 className="font-medium">{stage}</h4>
                  <p className="text-xl font-bold mt-2">0</p>
                </div>
              ))}
            </div>
            
            <div className="p-4 text-center text-muted-foreground">
              No hay oportunidades de venta registradas. Comience agregando nuevos contactos y oportunidades.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMPage;