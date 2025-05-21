import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const InvoicesPage = async ({ params }: { params: { subaccountId: string } }) => {
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

  // Obtener facturas de la subcuenta
  const invoices = await db.invoice.findMany({
    where: {
      subAccountId: subaccountId,
    },
    include: {
      Customer: true,
      Items: true,
      Payments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calcular estadísticas
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE').length;
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Facturas</h1>
        <div className="flex gap-2">
          <Link href={`/subaccount/${subaccountId}/invoices/new`}>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nueva Factura
            </Button>
          </Link>
          <Button variant="outline">
            Exportar Facturas
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Registro de Facturas</h2>
          <p className="text-muted-foreground">
            Gestione todas las facturas emitidas a clientes y controle su estado de pago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Facturas Emitidas</h3>
            <p className="text-2xl font-bold">{totalInvoices}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Pendientes de Pago</h3>
            <p className="text-2xl font-bold">{pendingInvoices}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total Facturado</h3>
            <p className="text-2xl font-bold">{formatPrice(totalAmount)}</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar factura..."
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los estados</option>
                  <option value="pagada">Pagada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="vencida">Vencida</option>
                  <option value="anulada">Anulada</option>
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
            {invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay facturas registradas en el sistema.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Nº Factura</th>
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-2">{invoice.Customer?.name || 'Sin cliente'}</td>
                        <td className="px-4 py-2">{new Date(invoice.issuedDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{formatPrice(Number(invoice.total))}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : invoice.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {invoice.status === 'DRAFT' ? 'Borrador' :
                              invoice.status === 'PENDING' ? 'Pendiente' :
                                invoice.status === 'PAID' ? 'Pagada' :
                                  invoice.status === 'CANCELLED' ? 'Cancelada' : 'Vencida'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <Link href={`/subaccount/${subaccountId}/invoices/${invoice.id}`}>
                              <Button variant="ghost" size="sm">Ver</Button>
                            </Link>
                            <Link href={`/subaccount/${subaccountId}/payments/new?invoiceId=${invoice.id}`}>
                              <Button variant="outline" size="sm">Pagar</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;