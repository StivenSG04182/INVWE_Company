import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, FileDown } from "lucide-react"
import Link from "next/link"

export const InvoicesPanel = ({ agencyId }: { agencyId: string }) => {
    // Simulación de datos para la demostración
    const invoices = []
    const totalInvoices = 0
    const pendingInvoices = 0
    const totalAmount = 0

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Facturas</h2>
                <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/finance/invoices/new`}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Nueva Factura
                        </Button>
                    </Link>
                    <Button variant="outline" className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Registro de Facturas</CardTitle>
                    <CardDescription>
                        Gestione todas las facturas emitidas a clientes y controle su estado de pago.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Facturas Emitidas</h3>
                            <p className="text-2xl font-bold">{totalInvoices}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Pendientes de Pago</h3>
                            <p className="text-2xl font-bold">{pendingInvoices}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Facturado</h3>
                            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input placeholder="Buscar factura..." className="w-full md:w-64" />
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="paid">Pagada</SelectItem>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="overdue">Vencida</SelectItem>
                                            <SelectItem value="cancelled">Anulada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input type="date" className="w-full md:w-auto" />
                                    <Input type="date" className="w-full md:w-auto" />
                                </div>
                            </div>

                            {invoices.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No hay facturas registradas en el sistema.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Nº Factura</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Subcuenta</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Total</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>{/* Aquí irían las filas de facturas */}</tbody>
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
