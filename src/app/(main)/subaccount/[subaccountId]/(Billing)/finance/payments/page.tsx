import React from 'react';
import { getAuthUserDetails, getAgencyDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { PaymentForm } from '@/components/forms/payment-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

const PaymentsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Obtener detalles de la agencia y tiendas
  const agency = await getAgencyDetails(agencyId);
  if (!agency) return redirect('/agency');

  // Obtener pagos de la agencia
  const payments = await db.payment.findMany({
    where: {
      agencyId: agencyId,
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
  const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <Link href={`/agency/${agencyId}/payments/new`}>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Registrar Pago
            </Button>
          </Link>
          <Button variant="outline">
            Configurar Métodos
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Historial de Pagos</h2>
          <p className="text-muted-foreground">
            Gestione todos los pagos recibidos de clientes y realice seguimiento de su estado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Pagos Recibidos</h3>
            <p className="text-2xl font-bold text-green-600">{formatPrice(totalAmount)}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Pagos Completados</h3>
            <p className="text-2xl font-bold text-amber-600">{completedPayments} de {totalPayments}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Tiendas</h3>
            <p className="text-2xl font-bold">0</p>
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
                  <option value="otro">Otro</option>
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
                      <th className="px-4 py-2 text-left">Referencia</th>
                      <th className="px-4 py-2 text-left">Factura</th>
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Tienda</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Monto</th>
                      <th className="px-4 py-2 text-left">Método</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const subAccount = null;
                      return (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2">{payment.reference || '-'}</td>
                          <td className="px-4 py-2">{payment.Invoice?.invoiceNumber || '-'}</td>
                          <td className="px-4 py-2">{payment.Invoice?.Customer?.name || 'Sin cliente'}</td>
                          <td className="px-4 py-2">Principal</td>
                          <td className="px-4 py-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{formatPrice(Number(payment.amount))}</td>
                          <td className="px-4 py-2">
                            {payment.method === 'CASH' ? 'Efectivo' :
                              payment.method === 'CREDIT_CARD' ? 'Tarjeta de Crédito' :
                                payment.method === 'DEBIT_CARD' ? 'Tarjeta de Débito' :
                                  payment.method === 'BANK_TRANSFER' ? 'Transferencia' :
                                    payment.method === 'CHECK' ? 'Cheque' :
                                      payment.method === 'ONLINE' ? 'En línea' : 'Otro'}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : payment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : payment.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {payment.status === 'PENDING' ? 'Pendiente' :
                                payment.status === 'COMPLETED' ? 'Completado' :
                                  payment.status === 'FAILED' ? 'Fallido' : 'Reembolsado'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <Link href={`/agency/${agencyId}/payments/${payment.id}`}>
                                <Button variant="ghost" size="sm">Ver</Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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