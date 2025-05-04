import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const ReportsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Generar Reporte
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Exportar Datos
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Panel de Reportes</h2>
          <p className="text-muted-foreground">
            Genere informes detallados sobre ventas, inventario, clientes y más para análisis y toma de decisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
            <h3 className="font-medium text-lg mb-2">Reportes de Ventas</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Análisis de ventas por período, producto, cliente o vendedor.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Diario</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Semanal</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Mensual</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Anual</span>
            </div>
          </div>
          
          <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
            <h3 className="font-medium text-lg mb-2">Reportes de Inventario</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Estado actual del inventario, rotación de productos y valorización.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Stock</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Movimientos</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Valorización</span>
            </div>
          </div>
          
          <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
            <h3 className="font-medium text-lg mb-2">Reportes de Clientes</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Análisis de clientes, frecuencia de compra y valor del cliente.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Segmentación</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Fidelidad</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Valor</span>
            </div>
          </div>
          
          <div className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
            <h3 className="font-medium text-lg mb-2">Reportes Financieros</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Informes de ingresos, gastos, ganancias y flujo de caja.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Ingresos</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Gastos</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Ganancias</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Tipo de Reporte</option>
                  <option value="ventas">Ventas</option>
                  <option value="inventario">Inventario</option>
                  <option value="clientes">Clientes</option>
                  <option value="financiero">Financiero</option>
                </select>
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Período</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mes</option>
                  <option value="año">Este Año</option>
                  <option value="personalizado">Personalizado</option>
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
              Seleccione un tipo de reporte y período para generar su informe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;