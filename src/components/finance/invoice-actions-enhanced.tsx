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
import { Eye, Download, Printer, Mail, MoreHorizontal, FileText, CreditCard, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EmailModal } from "./email-modal"
import { generateInvoicePDFById } from "@/lib/queries3"

interface InvoiceActionsEnhancedProps {
    invoice: any
    agencyId: string
}

export const InvoiceActionsEnhanced = ({ invoice, agencyId }: InvoiceActionsEnhancedProps) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const result = await generateInvoicePDFById({
                invoiceId: invoice.id,
                agencyId,
            })

            if (!result.success || !result.data) {
                throw new Error(result.error || "Error al descargar el PDF")
            }

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

            if (!result.success || !result.data) {
                throw new Error(result.error || "Error al obtener el PDF")
            }

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

    const handleCopyLink = () => {
        const link = `${window.location.origin}/agency/${agencyId}/finance/invoices/${invoice.id}`
        navigator.clipboard.writeText(link)
        toast.success("Enlace copiado al portapapeles")
    }

    return (
        <>
            <div className="flex items-center gap-1">
                {/* Acción rápida de ver */}
                <Link href={`/agency/${agencyId}/finance/invoices/${invoice.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver factura">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>

                {/* Menú de más acciones */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href={`/agency/${agencyId}/finance/invoices/${invoice.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver factura
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar por email
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Modal de envío de email */}
            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                documentType="invoice"
                documentId={invoice.id}
                agencyId={agencyId}
                defaultCustomer={invoice.Customer}
            />
        </>
    )
}
