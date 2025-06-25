import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Download, Printer, Receipt } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const PaymentDetailsPage = async ({ params }: { params: { agencyId: string; paymentId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const { agencyId, paymentId } = params
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener detalles del pago
    const payment = await db.payment.findUnique({
        where: {
            id: paymentId,
            agencyId: agencyId,
        },
        include: {
            Invoice: {
                include: {
                    Customer: true,
                    Items: true,
                },
            },
            SubAccount: true,
        },
    })

    if (!payment) {
        return redirect(`/agency/${agencyId}/finance?tab=payments`)
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href={`/agency/${agencyId}/finance?tab=payments`}>
                    <Button variant="ghost" className="flex items-center gap-2 px-0 sm:px-3">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Volver a Pagos</span>
                    </Button>
                </Link>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">Imprimir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Descargar Recibo</span>
                    </Button>
                    {payment.Invoice && (
                        <Link href={`/agency/${agencyId}/finance/invoices/${payment.Invoice.id}`}>
                            <Button size="sm" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                <span className="hidden sm:inline">Ver Factura</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl sm:text-2xl">Recibo de Pago</CardTitle>
                        <CardDescription>
                            Registrado el {new Date(payment.createdAt).toLocaleDateString()}
                            {payment.reference && <> · Referencia: {payment.reference}</>}
                        </CardDescription>
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${payment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "PENDING"
                                    ? "bg-amber-100 text-amber-800"
                                    : payment.status === "FAILED"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                            }`}
                    >
                        {payment.status === "PENDING"
                            ? "Pendiente"
                            : payment.status === "COMPLETED"
                                ? "Completado"
                                : payment.status === "FAILED"
                                    ? "Fallido"
                                    : "Reembolsado"}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Información del Pago</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Monto:</span>
                                    <span className="font-medium">{formatPrice(Number(payment.amount))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Método:</span>
                                    <span>
                                        {payment.method === "CASH"
                                            ? "Efectivo"
                                            : payment.method === "CREDIT_CARD"
                                                ? "Tarjeta de Crédito"
                                                : payment.method === "DEBIT_CARD"
                                                    ? "Tarjeta de Débito"
                                                    : payment.method === "BANK_TRANSFER"
                                                        ? "Transferencia Bancaria"
                                                        : payment.method === "CHECK"
                                                            ? "Cheque"
                                                            : payment.method === "ONLINE"
                                                                ? "Pago en Línea"
                                                                : "Otro"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estado:</span>
                                    <span
                                        className={`font-medium ${payment.status === "COMPLETED"
                                                ? "text-green-600"
                                                : payment.status === "PENDING"
                                                    ? "text-amber-600"
                                                    : payment.status === "FAILED"
                                                        ? "text-red-600"
                                                        : "text-blue-600"
                                            }`}
                                    >
                                        {payment.status === "PENDING"
                                            ? "Pendiente"
                                            : payment.status === "COMPLETED"
                                                ? "Completado"
                                                : payment.status === "FAILED"
                                                    ? "Fallido"
                                                    : "Reembolsado"}
                                    </span>
                                </div>
                                {payment.reference && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Referencia:</span>
                                        <span>{payment.reference}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tienda:</span>
                                    <span>{payment.SubAccount?.name || "Principal"}</span>
                                </div>
                            </div>
                        </div>

                        {payment.Invoice && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Información de la Factura</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Número de Factura:</span>
                                        <span>{payment.Invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span>{payment.Invoice.Customer?.name || "Sin cliente"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total de Factura:</span>
                                        <span>{formatPrice(Number(payment.Invoice.total))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Estado de Factura:</span>
                                        <span>
                                            {payment.Invoice.status === "DRAFT"
                                                ? "Borrador"
                                                : payment.Invoice.status === "PENDING"
                                                    ? "Pendiente"
                                                    : payment.Invoice.status === "PAID"
                                                        ? "Pagada"
                                                        : payment.Invoice.status === "CANCELLED"
                                                            ? "Cancelada"
                                                            : "Vencida"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fecha de Emisión:</span>
                                        <span>{new Date(payment.Invoice.issuedDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {payment.notes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-medium">Notas</h3>
                                <p className="text-muted-foreground">{payment.notes}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default PaymentDetailsPage
