import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const DIANConfigPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración DIAN</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md">
          Guardar Configuración
        </button>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Facturación Electrónica</h2>
          <p className="text-muted-foreground">
            Configure los parámetros necesarios para la emisión de facturas electrónicas según la normativa DIAN.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Información Básica</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">NIT</label>
              <input 
                type="text" 
                placeholder="NIT de la empresa" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Razón Social</label>
              <input 
                type="text" 
                placeholder="Razón social registrada" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Régimen Tributario</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option value="">Seleccione un régimen</option>
                <option value="comun">Régimen Común</option>
                <option value="simplificado">Régimen Simplificado</option>
                <option value="especial">Régimen Especial</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Certificados Digitales</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Certificado Digital (.p12)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".p12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Contraseña del Certificado</label>
              <input 
                type="password" 
                placeholder="Contraseña del certificado" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Fecha de Vencimiento</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <h3 className="font-medium text-lg">Resoluciones de Facturación</h3>
          
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Número de Resolución</label>
                <input 
                  type="text" 
                  placeholder="Ej: 18764020842" 
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Prefijo</label>
                <input 
                  type="text" 
                  placeholder="Ej: INVW" 
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fecha de Resolución</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Rango Desde</label>
                <input 
                  type="number" 
                  placeholder="Número inicial" 
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Rango Hasta</label>
                <input 
                  type="number" 
                  placeholder="Número final" 
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
          
          <button className="text-primary flex items-center gap-1">
            <span>+</span> Agregar otra resolución
          </button>
        </div>
      </div>
    </div>
  );
};

export default DIANConfigPage;