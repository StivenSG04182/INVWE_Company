import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceForm from '@/components/forms/InvoiceForm';

const NewInvoicePage = async ({ params }: { params: { subaccountId: string } }) => {
    const user = await getAuthUserDetails();
    if (!user) return redirect('/sign-in');

    const subaccountId = params.subaccountId;
    
    // Verificar que el usuario tenga acceso a esta subcuenta
    const subaccount = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
        include: {
            Agency: true,
        },
    });

    if (!subaccount) return redirect('/subaccount');

    // Obtener clientes de esta subcuenta
    const customers = await db.contact.findMany({
        where: {
            subAccountId: subaccountId,
        },
        select: {
            id: true,
            name: true,
        },
    });

    // Obtener productos específicos de esta subcuenta
    const products = await db.product.findMany({
        where: {
            subaccountId: subaccountId,
            active: true,
        },
        select: {
            id: true,
            name: true,
            price: true,
            description: true,
        },
    });

    // Obtener impuestos de la agencia asociada
    const taxes = await db.tax.findMany({
        where: {
            agencyId: subaccount.Agency.id,
        },
        select: {
            id: true,
            name: true,
            rate: true,
        },
    });

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Nueva Factura</CardTitle>
                    <CardDescription>
                        Cree una nueva factura para un cliente. Seleccione productos y servicios a facturar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvoiceForm
                        agencyId={subaccount.Agency.id}
                        subAccounts={[{ id: subaccountId, name: subaccount.name }]}
                        customers={customers}
                        products={products.map(p => ({
                            id: p.id,
                            name: p.name,
                            price: Number(p.price),
                            description: p.description || undefined
                        }))}
                        taxes={taxes.map(t => ({
                            id: t.id,
                            name: t.name,
                            rate: Number(t.rate)
                        }))}
                        defaultValues={{ subAccountId: subaccountId }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewInvoicePage;