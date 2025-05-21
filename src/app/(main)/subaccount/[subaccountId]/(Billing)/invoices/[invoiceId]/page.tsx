import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Download, CreditCard } from 'lucide-react';

const InvoiceDetailsPage = async ({ params }: { params: { subaccountId: string, invoiceId: string } }) => {
    const user = await getAuthUserDetails();
    if (!user) return redirect('/sign-in');

    const { subaccountId, invoiceId } = params;

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

    // Obtener detalles de la factura
    const invoice = await db.invoice.findUnique({
        where: {
            id: invoiceId,
            subAccountId: subaccountId,
        },
        include: {
            Customer: true,
            Items: true,
            Payments: true,
        },
    });

    if (!invoice) return redirect(`/subaccount/${subaccountId}/invoices`);

    // Calcular el total pagado
    const totalPaid = invoice.Payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingAmount = Number(invoice.total) - totalPaid;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center mb-6">
                <Link href={`/subaccount/${subaccountId}/invoices`}>
                    <Button variant="ghost" size="sm" className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a facturas
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Factura #{invoice.invoiceNumber}</h1>
                <Badge variant="outline" className="ml-4">
                    {invoice.status === 'DRAFT' ? 'Borrador' :
                        invoice.status === 'PENDING' ? 'Pendiente' :
                            invoice.status === 'PAID' ? 'Pagada' :
                                invoice.status === 'CANCELLED' ? 'Cancelada' : 'Vencida'}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal - Detalles de factura */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles de la factura</CardTitle>
                            <CardDescription>Información completa de la factura</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="font-medium mb-2">Información de facturación</h3>
                                    <p className="text-sm">Factura: #{invoice.invoiceNumber}</p>
                                    <p className="text-sm">Fecha de emisión: {new Date(invoice.issuedDate).toLocaleDateString()}</p>
                                    <p className="text-sm">Fecha de vencimiento: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Cliente</h3>
                                    <p className="text-sm">{invoice.Customer?.name || 'Sin cliente'}</p>
                                    <p className="text-sm">{invoice.Customer?.email || ''}</p>
                                    <p className="text-sm">{invoice.Customer?.address || ''}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-medium mb-2">Productos y servicios</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Descripción</th>
                                                <th className="px-4 py-2 text-right">Cantidad</th>
                                                <th className="px-4 py-2 text-right">Precio unitario</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.Items.map((item) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="px-4 py-2">
                                                        <p className="font-medium">{item.description}</p>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">{formatPrice(Number(item.unitPrice))}</td>
                                                    <td className="px-4 py-2 text-right">{formatPrice(Number(item.total))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-b">
                                                <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal</td>
                                                <td className="px-4 py-2 text-right">{formatPrice(Number(invoice.subtotal))}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td colSpan={3} className="px-4 py-2 text-right font-medium">Impuestos</td>
                                                <td className="px-4 py-2 text-right">{formatPrice(Number(invoice.tax))}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td>
                                                <td className="px-4 py-2 text-right font-bold">{formatPrice(Number(invoice.total))}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {invoice.Payments.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium mb-2">Pagos realizados</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 text-left">Fecha</th>
                                                    <th className="px-4 py-2 text-left">Método</th>
                                                    <th className="px-4 py-2 text-left">Referencia</th>
                                                    <th className="px-4 py-2 text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.Payments.map((payment) => (
                                                    <tr key={payment.id} className="border-b">
                                                        <td className="px-4 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{payment.paymentMethod}</td>
                                                        <td className="px-4 py-2">{payment.reference || '-'}</td>
                                                        <td className="px-4 py-2 text-right">{formatPrice(Number(payment.amount))}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-2 text-right font-bold">Total pagado</td>
                                                    <td className="px-4 py-2 text-right font-bold">{formatPrice(totalPaid)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {invoice.notes && (
                                <div className="mt-6">
                                    <h3 className="font-medium mb-2">Notas</h3>
                                    <p className="text-sm p-4 bg-muted rounded-md">{invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Printer className="h-4 w-4" />
                                    Imprimir
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Descargar PDF
                                </Button>
                            </div>
                            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                                <Link href={`/subaccount/${subaccountId}/payments/new?invoiceId=${invoice.id}`}>
                                    <Button className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Registrar pago
                                    </Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                {/* Columna lateral - Resumen */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de factura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Estado</span>
                                    <Badge className={`${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {invoice.status === 'DRAFT' ? 'Borrador' :
                                            invoice.status === 'PENDING' ? 'Pendiente' :
                                                invoice.status === 'PAID' ? 'Pagada' :
                                                    invoice.status === 'CANCELLED' ? 'Cancelada' : 'Vencida'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total facturado</span>
                                    <span className="font-bold">{formatPrice(Number(invoice.total))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total pagado</span>
                                    <span className="font-bold">{formatPrice(totalPaid)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Pendiente por pagar</span>
                                    <span className={pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                                        {formatPrice(pendingAmount)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                            <CardFooter>
                                <Link href={`/subaccount/${subaccountId}/payments/new?invoiceId=${invoice.id}`} className="w-full">
                                    <Button className="w-full">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pagar ahora
                                    </Button>
                                </Link>
                            </CardFooter>
                        )}
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Información de contacto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Empresa:</span> {subaccount.name}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Email:</span> {subaccount.companyEmail || 'No disponible'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Teléfono:</span> {subaccount.companyPhone || 'No disponible'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Dirección:</span> {subaccount.address || 'No disponible'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsPage;