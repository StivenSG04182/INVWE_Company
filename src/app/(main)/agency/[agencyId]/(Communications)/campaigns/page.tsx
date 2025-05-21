import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';

const CampaignsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Campañas</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
              Nueva Campaña
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
              Importar Datos
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Gestión de Campañas</h2>
            <p className="text-muted-foreground">
              Cree, gestione y analice campañas de marketing para aumentar sus ventas y alcance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
              <h3 className="font-medium text-lg mb-2">Campañas de Email</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Gestione campañas de email marketing con seguimiento de apertura y clics.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                <span className="text-sm">3 campañas</span>
              </div>
            </div>
            
            <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
              <h3 className="font-medium text-lg mb-2">Campañas de SMS</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Envíe mensajes SMS a sus clientes con ofertas y promociones.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">En preparación</span>
                <span className="text-sm">1 campaña</span>
              </div>
            </div>
            
            <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
              <h3 className="font-medium text-lg mb-2">Campañas en Redes Sociales</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Gestione publicaciones y anuncios en redes sociales desde un solo lugar.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Programada</span>
                <span className="text-sm">2 campañas</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Campañas Recientes</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Fecha de inicio</th>
                    <th className="text-left p-3">Rendimiento</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">Descuentos de Verano</td>
                    <td className="p-3">Email</td>
                    <td className="p-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                    </td>
                    <td className="p-3">15/06/2023</td>
                    <td className="p-3">32% apertura</td>
                    <td className="p-3">
                      <button className="text-primary hover:underline">Ver detalles</button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Lanzamiento Producto</td>
                    <td className="p-3">SMS</td>
                    <td className="p-3">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">En preparación</span>
                    </td>
                    <td className="p-3">Pendiente</td>
                    <td className="p-3">-</td>
                    <td className="p-3">
                      <button className="text-primary hover:underline">Editar</button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Black Friday</td>
                    <td className="p-3">Redes Sociales</td>
                    <td className="p-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Programada</span>
                    </td>
                    <td className="p-3">25/11/2023</td>
                    <td className="p-3">-</td>
                    <td className="p-3">
                      <button className="text-primary hover:underline">Ver detalles</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default CampaignsPage;