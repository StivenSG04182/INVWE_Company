import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';

const SchedulePage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Horarios & Nómina</h1>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Asignar Horario
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
            Generar Nómina
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Gestión de Horarios</h2>
          <p className="text-muted-foreground">
            Administre los horarios de trabajo del personal y genere nóminas de pago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total Empleados</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Horas Programadas</h3>
            <p className="text-2xl font-bold">0 hrs</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Nómina Mensual</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Calendario de Turnos</h3>
            <div className="flex gap-2">
              <select className="px-3 py-2 border rounded-md">
                <option value="">Todos los empleados</option>
              </select>
              <input 
                type="month" 
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-7 gap-0 border-b">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                <div key={day} className="p-2 text-center font-medium border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="p-4 text-center text-muted-foreground">
              No hay horarios programados. Asigne turnos a sus empleados para visualizarlos en el calendario.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;