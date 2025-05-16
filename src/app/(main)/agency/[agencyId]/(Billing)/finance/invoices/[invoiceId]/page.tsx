import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Download, Printer, CreditCard } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const InvoiceDetailsPage = async ({ params }: { params: { agencyId: string; invoiceId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const { agencyId, invoiceId } = params
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener detalles de la factura
    const invoice = await db.invoice.findUnique({
        where: {
            id: invoiceId,
            agencyId: agencyId,
        },
        include: {
            Customer: true,
            Items: {
                include: {
                    Product: true,
                },
            },
            Payments: true,
            Taxes: {
                include: {
                    Tax: true,
                },
            },
            SubAccount: true,
        },
    })

    if (!invoice) {
        return redirect(`/agency/${agencyId}/finance?tab=invoices`)
    }

    // Calcular el total pagado
    const totalPaid = invoice.Payments.reduce((sum, payment) => {
        if (payment.status === "COMPLETED") {
            return sum + Number(payment.amount)
        }
        return sum
    }, 0)

    // Calcular el saldo pendiente
    const balance = Number(invoice.total) - totalPaid

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href={`/agency/${agencyId}/finance?tab=invoices`}>
                    <Button variant="ghost" className="flex items-center gap-2 px-0 sm:px-3">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Volver a Facturas</span>
                    </Button>
                </Link>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">Imprimir</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                    </Button>
                    {balance > 0 && (
                        <Link href={`/agency/${agencyId}/finance/payments/new?invoiceId=${invoice.id}`}>
                            <Button size="sm" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">Registrar Pago</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl sm:text-2xl">Factura #{invoice.invoiceNumber}</CardTitle>
                        <CardDescription>
                            Emitida el {new Date(invoice.issuedDate).toLocaleDateString()}
                            {invoice.dueDate && <> · Vence el {new Date(invoice.dueDate).toLocaleDateString()}</>}
                        </CardDescription>
                    </div>
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${invoice.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "PENDING"
                                    ? "bg-amber-100 text-amber-800"
                                    : invoice.status === "OVERDUE"
                                        ? "bg-red-100 text-red-800"
                                        : invoice.status === "CANCELLED"
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-blue-100 text-blue-800"
                            }`}
                    >
                        {invoice.status === "DRAFT"
                            ? "Borrador"
                            : invoice.status === "PENDING"
                                ? "Pendiente"
                                : invoice.status === "PAID"
                                    ? "Pagada"
                                    : invoice.status === "CANCELLED"
                                        ? "Cancelada"
                                        : "Vencida"}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Facturado a</h3>
                            <div>
                                <p className="font-medium">{invoice.Customer?.name || "Cliente no especificado"}</p>
                                <p>{invoice.Customer?.email || ""}</p>
                                <p>{invoice.Customer?.phone || ""}</p>
                                <p>{invoice.Customer?.address || ""}</p>
                                {invoice.Customer?.city && (
                                    <p>
                                        {invoice.Customer.city}, {invoice.Customer.state} {invoice.Customer.zipCode}
                                    </p>
                                )}
                                <p>{invoice.Customer?.country || ""}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Detalles</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subcuenta:</span>
                                    <span>{invoice.SubAccount?.name || "Principal"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estado:</span>
                                    <span>
                                        {invoice.status === "DRAFT"
                                            ? "Borrador"
                                            : invoice.status === "PENDING"
                                                ? "Pendiente"
                                                : invoice.status === "PAID"
                                                    ? "Pagada"
                                                    : invoice.status === "CANCELLED"
                                                        ? "Cancelada"
                                                        : "Vencida"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fecha de emisión:</span>
                                    <span>{new Date(invoice.issuedDate).toLocaleDateString()}</span>
                                </div>
                                {invoice.dueDate && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fecha de vencimiento:</span>
                                        <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-medium">Productos y Servicios</h3>

                        <div className="border rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="px-4 py-2 text-left">Producto</th>
                                            <th className="px-4 py-2 text-right">Cantidad</th>
                                            <th className="px-4 py-2 text-right">Precio</th>
                                            <th className="px-4 py-2 text-right">Descuento</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.Items.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="px-4 py-2">
                                                    <div>
                                                        <p className="font-medium">{item.Product.name}</p>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-right">{item.quantity}</td>
                                                <td className="px-4 py-2 text-right">{formatPrice(Number(item.unitPrice))}</td>
                                                <td className="px-4 py-2 text-right">
                                                    {Number(item.discount) > 0 ? `${item.discount}%` : "-"}
                                                </td>
                                                <td className="px-4 py-2 text-right">{formatPrice(Number(item.total))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>{formatPrice(Number(invoice.subtotal))}</span>
                                </div>
                                {Number(invoice.discount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Descuento:</span>
                                        <span>-{formatPrice(Number(invoice.discount))}</span>
                                    </div>
                                )}
                                {Number(invoice.tax) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impuestos:</span>
                                        <span>{formatPrice(Number(invoice.tax))}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>{formatPrice(Number(invoice.total))}</span>
                                </div>
                                {invoice.Payments.length > 0 && (
                                    <>
                                        <div className="flex justify-between text-green-600">
                                            <span>Pagado:</span>
                                            <span>{formatPrice(totalPaid)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-amber-600">
                                            <span>Saldo pendiente:</span>
                                            <span>{formatPrice(balance)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-medium">Notas</h3>
                                <p className="text-muted-foreground">{invoice.notes}</p>
                            </div>
                        </>
                    )}

                    {invoice.Payments.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-medium">Historial de Pagos</h3>

                                <div className="border rounded-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/40">
                                                    <th className="px-4 py-2 text-left">Fecha</th>
                                                    <th className="px-4 py-2 text-left">Referencia</th>
                                                    <th className="px-4 py-2 text-left">Método</th>
                                                    <th className="px-4 py-2 text-right">Monto</th>
                                                    <th className="px-4 py-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.Payments.map((payment) => (
                                                    <tr key={payment.id} className="border-b">
                                                        <td className="px-4 py-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{payment.reference || "-"}</td>
                                                        <td className="px-4 py-2">
                                                            {payment.method === "CASH"
                                                                ? "Efectivo"
                                                                : payment.method === "CREDIT_CARD"
                                                                    ? "Tarjeta de Crédito"
                                                                    : payment.method === "DEBIT_CARD"
                                                                        ? "Tarjeta de Débito"
                                                                        : payment.method === "BANK_TRANSFER"
                                                                            ? "Transferencia"
                                                                            : payment.method === "CHECK"
                                                                                ? "Cheque"
                                                                                : payment.method === "ONLINE"
                                                                                    ? "En línea"
                                                                                    : "Otro"}
                                                        </td>
                                                        <td className="px-4 py-2 text-right">{formatPrice(Number(payment.amount))}</td>
                                                        <td className="px-4 py-2">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "COMPLETED" ? "bg-green-100 text-green-800" : payment.status === "PENDING" ? "bg-amber-100 text-amber-800" : payment.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                                                            >
                                                                {payment.status === "PENDING"
                                                                    ? "Pendiente"
                                                                    : payment.status === "COMPLETED"
                                                                        ? "Completado"
                                                                        : payment.status === "FAILED"
                                                                            ? "Fallido"
                                                                            : "Reembolsado"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default InvoiceDetailsPage
