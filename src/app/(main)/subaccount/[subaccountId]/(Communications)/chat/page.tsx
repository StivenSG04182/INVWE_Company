import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';

const ChatPage = async ({ params }: { params: { agencyId: string } }) => {
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
          <h1 className="text-2xl font-bold">Chat</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md">
              Nueva Conversación
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-md">
              Configurar Notificaciones
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Centro de Comunicación</h2>
            <p className="text-muted-foreground">
              Comuníquese en tiempo real con su equipo, clientes y proveedores para una colaboración eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="md:col-span-1 border rounded-md p-4">
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Buscar conversaciones..." 
                  className="w-full p-2 rounded-md border"
                />
              </div>
              
              <h3 className="font-medium text-lg mb-4">Conversaciones</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 p-2 bg-primary/10 rounded-md cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                    JD
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Juan Díaz</p>
                    <p className="text-xs text-muted-foreground truncate">¿Cuándo llega el pedido?</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">10:23</span>
                    <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">2</span>
                  </div>
                </li>
                
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                    ML
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">María López</p>
                    <p className="text-xs text-muted-foreground truncate">Gracias por la información</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Ayer</span>
                  </div>
                </li>
                
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xs">
                    EV
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Equipo de Ventas</p>
                    <p className="text-xs text-muted-foreground truncate">Reunión a las 15:00</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">Lun</span>
                  </div>
                </li>
                
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                    PR
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Proveedor Rápido</p>
                    <p className="text-xs text-muted-foreground truncate">Envío confirmado</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">28/05</span>
                  </div>
                </li>
              </ul>
              
              <h3 className="font-medium text-lg mt-6 mb-4">Canales</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="text-xl">#</span>
                  <span>general</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="text-xl">#</span>
                  <span>ventas</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="text-xl">#</span>
                  <span>soporte</span>
                </li>
                <li className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <span className="text-xl">#</span>
                  <span>inventario</span>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-3 border rounded-md overflow-hidden flex flex-col">
              <div className="bg-muted p-3 flex items-center gap-2 border-b">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                  JD
                </div>
                <div>
                  <p className="font-medium">Juan Díaz</p>
                  <p className="text-xs text-muted-foreground">En línea</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="p-2 rounded-md hover:bg-muted-foreground/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>
                  <button className="p-2 rounded-md hover:bg-muted-foreground/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z"></path>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </button>
                  <button className="p-2 rounded-md hover:bg-muted-foreground/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ minHeight: '400px' }}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center text-green-500 font-bold text-xs">
                    JD
                  </div>
                  <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <p>Hola, quisiera saber cuándo llegará mi pedido #1234</p>
                    <span className="text-xs text-muted-foreground">10:15 AM</span>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none max-w-[80%]">
                    <p>Buenos días Juan, déjame verificar el estado de su pedido.</p>
                    <span className="text-xs text-muted-foreground">10:18 AM</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                    YO
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none max-w-[80%]">
                    <p>Su pedido #1234 está en tránsito y será entregado mañana entre las 10:00 y 14:00 horas.</p>
                    <span className="text-xs text-muted-foreground">10:20 AM</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                    YO
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center text-green-500 font-bold text-xs">
                    JD
                  </div>
                  <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <p>Perfecto, muchas gracias por la información. ¿Recibiré alguna notificación cuando esté por llegar?</p>
                    <span className="text-xs text-muted-foreground">10:23 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <button className="p-2 rounded-md hover:bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                  </button>
                  <input 
                    type="text" 
                    placeholder="Escriba un mensaje..." 
                    className="flex-1 p-2 rounded-md border"
                  />
                  <button className="p-2 rounded-md hover:bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </button>
                  <button className="bg-primary text-white p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default ChatPage;