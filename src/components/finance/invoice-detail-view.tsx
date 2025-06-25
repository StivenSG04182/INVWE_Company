"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, FileText, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import { InvoiceActionsUpdated as InvoiceActions } from "./invoice-actions"

interface InvoiceDetailViewProps {
    invoice: any
    agencyId: string
}

export const InvoiceDetailView = ({ invoice, agencyId }: InvoiceDetailViewProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-800 border-green-200"
            case "PENDING":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "OVERDUE":
                return "bg-red-100 text-red-800 border-red-200"
            case "CANCELLED":
                return "bg-gray-100 text-gray-800 border-gray-200"
            case "DRAFT":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "PAID":
                return "Pagada"
            case "PENDING":
                return "Pendiente"
            case "OVERDUE":
                return "Vencida"
            case "CANCELLED":
                return "Anulada"
            case "DRAFT":
                return "Borrador"
            default:
                return "Desconocido"
        }
    }

    const getInvoiceTypeText = (type: string) => {
        switch (type) {
            case "ELECTRONIC":
                return "Factura Electrónica"
            case "PHYSICAL":
                return "Factura Física"
            case "BOTH":
                return "Factura Electrónica y Física"
            default:
                return "Factura"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/agency/${agencyId}/finance?tab=invoices`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Factura {invoice.invoiceNumber}</h1>
                        <p className="text-muted-foreground">{getInvoiceTypeText(invoice.invoiceType)} - Detalles completos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                    </Badge>
                    <InvoiceActions invoice={invoice} agencyId={agencyId} onViewPDF={() => { }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalles de la factura */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Información de la Factura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Número de factura</p>
                                    <p className="font-medium">{invoice.invoiceNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de emisión</p>
                                    <p className="font-medium">{new Date(invoice.issuedDate).toLocaleDateString("es-CO")}</p>
                                </div>
                                {invoice.dueDate && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Fecha de vencimiento</p>
                                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("es-CO")}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tipo de factura</p>
                                    <p className="font-medium">{getInvoiceTypeText(invoice.invoiceType)}</p>
                                </div>
                            </div>
                            {invoice.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                                    <p className="font-medium">{invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items de la factura */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos y Servicios</CardTitle>
                            <CardDescription>Detalle de los items incluidos en esta factura</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {invoice.Items && invoice.Items.length > 0 ? (
                                    <>
                                        {invoice.Items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.Product?.name || item.description}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Cantidad: {item.quantity} × ${Number(item.unitPrice).toLocaleString("es-CO")}
                                                    </p>
                                                    {item.discount > 0 && <p className="text-sm text-green-600">Descuento: {item.discount}%</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${Number(item.total).toLocaleString("es-CO")}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>${Number(invoice.subtotal).toLocaleString("es-CO")}</span>
                                            </div>
                                            {Number(invoice.discount) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Descuento</span>
                                                    <span>-${Number(invoice.discount).toLocaleString("es-CO")}</span>
                                                </div>
                                            )}
                                            {Number(invoice.tax) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Impuestos</span>
                                                    <span>${Number(invoice.tax).toLocaleString("es-CO")}</span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between items-center font-medium text-lg">
                                                <span>Total</span>
                                                <span>${Number(invoice.total).toLocaleString("es-CO")} COP</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No hay productos registrados en esta factura</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagos */}
                    {invoice.Payments && invoice.Payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Pagos</CardTitle>
                                <CardDescription>Pagos recibidos para esta factura</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.Payments.map((payment: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">${Number(payment.amount).toLocaleString("es-CO")}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.createdAt).toLocaleDateString("es-CO")} - {payment.method}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Completado
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Información del cliente */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoice.Customer ? (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                        <p className="font-medium">{invoice.Customer.name}</p>
                                    </div>
                                    {invoice.Customer.email && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="font-medium">{invoice.Customer.email}</p>
                                        </div>
                                    )}
                                    {invoice.Customer.phone && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                            <p className="font-medium">{invoice.Customer.phone}</p>
                                        </div>
                                    )}
                                    {invoice.Customer.taxId && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{invoice.Customer.taxIdType || "NIT"}</p>
                                            <p className="font-medium">{invoice.Customer.taxId}</p>
                                        </div>
                                    )}
                                    {invoice.Customer.address && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                                            <p className="font-medium">{invoice.Customer.address}</p>
                                            {invoice.Customer.city && (
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.Customer.city}, {invoice.Customer.state} {invoice.Customer.zipCode}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Cliente general</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen financiero */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Resumen Financiero
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total facturado</span>
                                    <span>${Number(invoice.total).toLocaleString("es-CO")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total pagado</span>
                                    <span className="text-green-600">
                                        $
                                        {invoice.Payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toLocaleString(
                                            "es-CO",
                                        ) || "0"}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Saldo pendiente</span>
                                    <span
                                        className={
                                            Number(invoice.total) -
                                                (invoice.Payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0) >
                                                0
                                                ? "text-red-600"
                                                : "text-green-600"
                                        }
                                    >
                                        $
                                        {(
                                            Number(invoice.total) -
                                            (invoice.Payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0)
                                        ).toLocaleString("es-CO")}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información DIAN */}
                    {(invoice.invoiceType === "ELECTRONIC" || invoice.invoiceType === "BOTH") && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Información DIAN
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tipo de documento</p>
                                    <p className="font-medium">Factura Electrónica</p>
                                </div>
                                {invoice.cufe && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">CUFE</p>
                                        <p className="font-mono text-xs break-all">{invoice.cufe}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Estado DIAN</p>
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Válida
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
