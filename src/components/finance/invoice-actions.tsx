"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Download, Printer, Mail, MoreHorizontal, FileText, CreditCard, Copy, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { sendInvoiceEmail, generateInvoicePDFById } from "@/lib/queries3"

interface InvoiceActionsProps {
    invoice: any
    agencyId: string
    onViewPDF: () => void
}

export const InvoiceActions = ({ invoice, agencyId, onViewPDF }: InvoiceActionsProps) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [isSendingEmail, setIsSendingEmail] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const result = await generateInvoicePDFById({
                invoiceId: invoice.id,
                agencyId,
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            // Crear el blob a partir del buffer
            const blob = new Blob([result.data], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = result.filename || `Factura-${invoice.invoiceNumber}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("PDF descargado exitosamente")
        } catch (error) {
            toast.error("Error al generar el PDF")
            console.error(error)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const handlePrint = async () => {
        try {
            const result = await generateInvoicePDFById({
                invoiceId: invoice.id,
                agencyId,
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            // Crear el blob a partir del buffer
            const blob = new Blob([result.data], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const printWindow = window.open(url)
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print()
                }
            }
        } catch (error) {
            toast.error("Error al imprimir la factura")
            console.error(error)
        }
    }

    const handleSendEmail = async () => {
        if (!invoice.Customer?.email) {
            toast.error("El cliente no tiene email registrado")
            return
        }

        setIsSendingEmail(true)
        try {
            const result = await sendInvoiceEmail({
                invoiceId: invoice.id,
                agencyId: agencyId,
                recipientEmail: invoice.Customer.email,
            })

            if (result.success) {
                toast.success("Factura enviada por email exitosamente")
            } else {
                throw new Error(result.error || "Error al enviar el email")
            }
        } catch (error) {
            toast.error("Error al enviar el email")
            console.error(error)
        } finally {
            setIsSendingEmail(false)
        }
    }

    const handleCopyLink = () => {
        const link = `${window.location.origin}/agency/${agencyId}/finance/invoices/${invoice.id}`
        navigator.clipboard.writeText(link)
        toast.success("Enlace copiado al portapapeles")
    }

    return (
        <div className="flex items-center gap-1">
            {/* Acciones rápidas */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onViewPDF} title="Ver factura">
                <Eye className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                title="Descargar PDF"
            >
                <Download className="h-4 w-4" />
            </Button>

            {/* Menú de más acciones */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onViewPDF}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver factura
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleSendEmail} disabled={!invoice.Customer?.email || isSendingEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        {isSendingEmail ? "Enviando..." : "Enviar por email"}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar enlace
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={`/agency/${agencyId}/finance/invoices/${invoice.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver detalles
                        </Link>
                    </DropdownMenuItem>

                    {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
                        <DropdownMenuItem asChild>
                            <Link href={`/agency/${agencyId}/finance/payments/new?invoiceId=${invoice.id}`}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Registrar pago
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {invoice.status === "DRAFT" && (
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar borrador
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
