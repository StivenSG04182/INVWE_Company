import React from 'react';
import { getAuthUserDetails, getAgencyDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { InvoiceForm } from '@/components/forms/invoice-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NewInvoicePage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails();
    if (!user) return redirect('/sign-in');

    const agencyId = params.agencyId;
    if (!user.Agency) {
        return redirect('/agency');
    }

    // Obtener detalles de la agencia y subcuentas
    const agency = await getAgencyDetails(agencyId);
    if (!agency) return redirect('/agency');

    // Obtener clientes
    const customers = await db.contact.findMany({
        where: {
            subAccountId: {
                in: agency.SubAccount.map(sa => sa.id),
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    // Obtener productos
    const products = await db.product.findMany({
        where: {
            agencyId: agencyId,
            active: true,
        },
        select: {
            id: true,
            name: true,
            price: true,
            description: true,
        },
    });

    // Obtener impuestos
    const taxes = await db.tax.findMany({
        where: {
            agencyId: agencyId,
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
                        Cree una nueva factura para un cliente. Seleccione la subcuenta, productos y servicios a facturar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvoiceForm
                        agencyId={agencyId}
                        subAccounts={agency.SubAccount.map(sa => ({ id: sa.id, name: sa.name }))}
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
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewInvoicePage;