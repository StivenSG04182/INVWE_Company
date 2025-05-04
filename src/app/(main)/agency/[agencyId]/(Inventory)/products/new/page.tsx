import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import ProductForm from '@/components/inventory/ProductForm';

const NewProductPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Producto</h1>
      <ProductForm agencyId={agencyId} />
    </div>
  );
};

export default NewProductPage;