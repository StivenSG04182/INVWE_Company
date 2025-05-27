import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';

const InboxPage = async ({ params }: { params: { agencyId: string } }) => {
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
          <h1 className="text-2xl font-bold">Bandeja de Entrada</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Nuevo Mensaje
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-md">
              Configurar Filtros
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Centro de Mensajería</h2>
            <p className="text-muted-foreground">
              Gestione todas sus comunicaciones con clientes, proveedores y equipo desde un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="md:col-span-1 border rounded-md p-4">
              <h3 className="font-medium text-lg mb-4">Carpetas</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>Recibidos</span>
                  <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">12</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Enviados</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span>Borradores</span>
                  <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  <span>Spam</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  <span>Papelera</span>
                </li>
              </ul>
              
              <h3 className="font-medium text-lg mt-6 mb-4">Etiquetas</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Clientes</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Proveedores</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Equipo</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>Urgente</span>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-3 border rounded-md overflow-hidden">
              <div className="bg-muted p-3 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar mensajes..." 
                  className="flex-1 p-2 rounded-md border"
                />
                <button className="bg-primary text-white p-2 rounded-md">
                  Buscar
                </button>
              </div>
              
              <div className="divide-y">
                <div className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    JD
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">Juan Díaz</h4>
                      <span className="text-xs text-muted-foreground">10:23 AM</span>
                    </div>
                    <p className="font-medium">Actualización de pedido #1234</p>
                    <p className="text-sm text-muted-foreground truncate">Le informamos que su pedido ha sido procesado y será enviado en las próximas 24 horas...</p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3 bg-primary/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                    ML
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">María López</h4>
                      <span className="text-xs text-muted-foreground">Ayer</span>
                    </div>
                    <p className="font-medium">Consulta sobre disponibilidad</p>
                    <p className="text-sm text-muted-foreground truncate">Buenas tardes, quisiera saber si tienen disponible el producto XYZ en color azul...</p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                    PR
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">Proveedor Rápido S.A.</h4>
                      <span className="text-xs text-muted-foreground">Lun, 12 Jun</span>
                    </div>
                    <p className="font-medium">Catálogo actualizado 2023</p>
                    <p className="text-sm text-muted-foreground truncate">Adjunto encontrará nuestro catálogo actualizado con los nuevos productos y precios para este año...</p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-muted cursor-pointer flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                    AC
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">Ana Castillo</h4>
                      <span className="text-xs text-muted-foreground">Vie, 9 Jun</span>
                    </div>
                    <p className="font-medium">Reunión de equipo</p>
                    <p className="text-sm text-muted-foreground truncate">Recordatorio: Tenemos reunión de equipo mañana a las 9:00 AM para revisar los objetivos del mes...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default InboxPage;