import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Settings } from "lucide-react"
import Link from "next/link"

export const PaymentsPanel = ({ agencyId }: { agencyId: string }) => {
    // Simulación de datos para la demostración
    const payments = []
    const totalPayments = 0
    const completedPayments = 0
    const totalAmount = 0
    const subAccountsCount = 0

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Pagos</h2>
                <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/finance/payments/new`}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Registrar Pago
                        </Button>
                    </Link>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar Métodos
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>
                        Gestione todos los pagos recibidos de clientes y realice seguimiento de su estado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Pagos Recibidos</h3>
                            <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Pagos Completados</h3>
                            <p className="text-2xl font-bold">
                                {completedPayments} de {totalPayments}
                            </p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Subcuentas</h3>
                            <p className="text-2xl font-bold">{subAccountsCount}</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input placeholder="Buscar pago..." className="w-full md:w-64" />
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Método" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los métodos</SelectItem>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input type="date" className="w-full md:w-auto" />
                                    <Input type="date" className="w-full md:w-auto" />
                                </div>
                            </div>

                            {payments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No hay pagos registrados en el sistema.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Referencia</th>
                                                <th className="px-4 py-2 text-left">Factura</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Monto</th>
                                                <th className="px-4 py-2 text-left">Método</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>{/* Aquí irían las filas de pagos */}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

