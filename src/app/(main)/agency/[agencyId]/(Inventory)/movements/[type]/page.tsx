import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import MovementForm from '@/components/inventory/MovementForm';

const MovementPage = async ({ 
  params 
}: { 
  params: { agencyId: string; type: string } 
}) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Validar que el tipo sea válido
  const type = params.type;
  if (type !== 'entrada' && type !== 'salida') {
    return redirect(`/agency/${agencyId}/movements`);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">
        {type === 'entrada' ? 'Registrar Entrada de Productos' : 'Registrar Salida de Productos'}
      </h1>
      <MovementForm 
        agencyId={agencyId} 
        type={type as 'entrada' | 'salida'} 
      />
    </div>
  );
};

export default MovementPage;