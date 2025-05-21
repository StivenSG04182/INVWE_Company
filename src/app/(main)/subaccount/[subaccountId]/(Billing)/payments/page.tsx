import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const PaymentsPage = async ({ params }: { params: { subaccountId: string } }) => {
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

  // Obtener pagos de la subcuenta
  const payments = await db.payment.findMany({
    where: {
      Invoice: {
        subAccountId: subaccountId,
      },
    },
    include: {
      Invoice: {
        include: {
          Customer: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calcular estadísticas
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <Link href={`/subaccount/${subaccountId}/payments/new`}>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nuevo Pago
            </Button>
          </Link>
          <Button variant="outline">
            Exportar Pagos
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Registro de Pagos</h2>
          <p className="text-muted-foreground">
            Gestione todos los pagos recibidos por facturas emitidas a clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total de Pagos</h3>
            <p className="text-2xl font-bold">{totalPayments}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total Recaudado</h3>
            <p className="text-2xl font-bold">{formatPrice(totalAmount)}</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar pago..."
                  className="px-3 py-2 border rounded-md w-64"
                />
                <select className="px-3 py-2 border rounded-md">
                  <option value="">Todos los métodos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
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
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay pagos registrados en el sistema.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">ID Pago</th>
                      <th className="px-4 py-2 text-left">Factura</th>
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Método</th>
                      <th className="px-4 py-2 text-left">Monto</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2">{payment.id.substring(0, 8)}</td>
                        <td className="px-4 py-2">{payment.Invoice?.invoiceNumber}</td>
                        <td className="px-4 py-2">{payment.Invoice?.Customer?.name || 'Sin cliente'}</td>
                        <td className="px-4 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{payment.paymentMethod}</td>
                        <td className="px-4 py-2">{formatPrice(Number(payment.amount))}</td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <Link href={`/subaccount/${subaccountId}/payments/${payment.id}`}>
                              <Button variant="ghost" size="sm">Ver</Button>
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

export default PaymentsPage;