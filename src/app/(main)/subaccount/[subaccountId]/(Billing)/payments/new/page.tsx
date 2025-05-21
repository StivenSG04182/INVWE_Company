import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentForm from '@/components/forms/PaymentForm';

const NewPaymentPage = async ({ params, searchParams }: {
    params: { subaccountId: string },
    searchParams: { invoiceId?: string }
}) => {
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

    // Obtener facturas pendientes específicas de esta subcuenta
    const invoices = await db.invoice.findMany({
        where: {
            subAccountId: subaccountId,
            status: {
                in: ['PENDING', 'OVERDUE']
            },
            ...(searchParams.invoiceId ? { id: searchParams.invoiceId } : {})
        },
        include: {
            Customer: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Valores por defecto si se proporciona un ID de factura
    const defaultValues = searchParams.invoiceId ? {
        invoiceId: searchParams.invoiceId,
        subAccountId: subaccountId,
    } : {
        subAccountId: subaccountId
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Pago</CardTitle>
                    <CardDescription>
                        Registre un nuevo pago para una factura pendiente de esta subcuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentForm
                        agencyId={subaccount.Agency.id}
                        subAccounts={[{ id: subaccountId, name: subaccount.name }]}
                        invoices={invoices.map(inv => ({
                            id: inv.id,
                            invoiceNumber: inv.invoiceNumber,
                            total: Number(inv.total),
                            status: inv.status,
                            customerName: inv.Customer?.name
                        }))}
                        defaultValues={defaultValues}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewPaymentPage;