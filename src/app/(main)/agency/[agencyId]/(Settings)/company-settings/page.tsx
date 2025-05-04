import React from 'react';
import { getAuthUserDetails, getAgencyDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { db } from '@/lib/db';

const CompanySettingsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) return null;

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Ajustes de Empresa</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
              Guardar Cambios
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Configuración General</h2>
            <p className="text-muted-foreground">
              Configure los detalles básicos de su empresa y personalice su experiencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-md border" 
                  defaultValue={agencyDetails.name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="w-full p-2 rounded-md border" 
                  defaultValue={agencyDetails.companyEmail || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  className="w-full p-2 rounded-md border" 
                  defaultValue={agencyDetails.companyPhone || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-md border" 
                  defaultValue={agencyDetails.address || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded-md border" 
                    defaultValue={agencyDetails.city || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estado/Provincia</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded-md border" 
                    defaultValue={agencyDetails.state || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">País</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded-md border" 
                    defaultValue={agencyDetails.country || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Código Postal</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded-md border" 
                    defaultValue={agencyDetails.zipCode || ''}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo de la Empresa</label>
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                  {agencyDetails.agencyLogo ? (
                    <div className="relative w-32 h-32">
                      <img 
                        src={agencyDetails.agencyLogo} 
                        alt="Logo de la empresa" 
                        className="w-full h-full object-contain"
                      />
                      <button className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18"></path>
                          <path d="M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                        <path d="M12 12v9"></path>
                        <path d="m16 16-4-4-4 4"></path>
                      </svg>
                      <p className="mt-2 text-sm text-muted-foreground">Arrastre y suelte o haga clic para cargar</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Zona Horaria</label>
                <select className="w-full p-2 rounded-md border">
                  <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                  <option value="America/Mexico_City">América/Ciudad de México (UTC-6)</option>
                  <option value="America/Santiago">América/Santiago (UTC-4)</option>
                  <option value="America/Buenos_Aires">América/Buenos Aires (UTC-3)</option>
                  <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Moneda Predeterminada</label>
                <select className="w-full p-2 rounded-md border">
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select className="w-full p-2 rounded-md border">
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="pt">Portugués</option>
                  <option value="fr">Francés</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Formato de Fecha</label>
                <select className="w-full p-2 rounded-md border">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Configuración Fiscal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NIT / Identificación Fiscal</label>
                  <input type="text" className="w-full p-2 rounded-md border" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Régimen Fiscal</label>
                  <select className="w-full p-2 rounded-md border">
                    <option value="simplificado">Régimen Simplificado</option>
                    <option value="comun">Régimen Común</option>
                    <option value="especial">Régimen Especial</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Impuesto Predeterminado</label>
                  <input type="text" className="w-full p-2 rounded-md border" placeholder="19%" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="retencion" className="rounded" />
                  <label htmlFor="retencion" className="text-sm">Aplicar retención en la fuente</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Preferencias de Notificaciones</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-muted-foreground">Recibir notificaciones importantes por correo electrónico</p>
                </div>
                <div className="h-6 w-11 bg-muted rounded-full p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-primary ml-auto"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones de Inventario Bajo</p>
                  <p className="text-sm text-muted-foreground">Alertas cuando el inventario esté por debajo del mínimo</p>
                </div>
                <div className="h-6 w-11 bg-muted rounded-full p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-primary ml-auto"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Resumen Diario de Ventas</p>
                  <p className="text-sm text-muted-foreground">Recibir un resumen diario de las ventas realizadas</p>
                </div>
                <div className="h-6 w-11 bg-muted rounded-full p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-primary ml-auto"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones de Nuevos Clientes</p>
                  <p className="text-sm text-muted-foreground">Alertas cuando se registren nuevos clientes</p>
                </div>
                <div className="h-6 w-11 bg-muted rounded-full p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-muted"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-md hover:bg-muted">
                Cancelar
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

export default CompanySettingsPage;