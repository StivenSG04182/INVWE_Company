"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer, Mail, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { sendInvoiceEmail, generateInvoicePDFById } from "@/lib/queries3"
import Link from "next/link"

interface InvoicePDFViewerProps {
    invoice: any
    agencyId: string
}

export const InvoicePDFViewer = ({ invoice, agencyId }: InvoicePDFViewerProps) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSendingEmail, setIsSendingEmail] = useState(false)

    useEffect(() => {
        const generatePDF = async () => {
            setIsLoading(true)
            try {
                console.log("[PDF] Solicitando PDF para factura", invoice.id, "de agencia", agencyId)
                const result = await generateInvoicePDFById({
                    invoiceId: invoice.id,
                    agencyId,
                })

                console.log("[PDF] Resultado de generateInvoicePDFById:", result)

                if (!result.success || !result.data) {
                    throw new Error(result.error || "Error al generar el PDF")
                }

                // Crear el blob a partir del buffer
                const blob = new Blob([result.data], { type: "application/pdf" })
                const url = URL.createObjectURL(blob)
                setPdfUrl(url)
                console.log("[PDF] Blob y URL creados para visor PDF")
            } catch (error) {
                console.log("[PDF] Error en generatePDF:", error)
                toast.error("Error al generar el PDF")
            } finally {
                setIsLoading(false)
            }
        }

        generatePDF()

        // Cleanup
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl)
            }
        }
    }, [invoice.id, agencyId, pdfUrl])

    const handleDownload = async () => {
        if (!pdfUrl) return

        try {
            const a = document.createElement("a")
            a.href = pdfUrl
            a.download = `Factura-${invoice.invoiceNumber}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            toast.success("PDF descargado exitosamente")
        } catch (error) {
            toast.error("Error al descargar el PDF")
        }
    }

    const handlePrint = () => {
        if (!pdfUrl) return

        const printWindow = window.open(pdfUrl)
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print()
            }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Generando vista previa...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Barra de herramientas */}
            <div className="flex justify-between items-center p-4 border-b bg-muted/50">
                <div>
                    <h3 className="font-semibold">Factura {invoice.invoiceNumber}</h3>
                    <p className="text-sm text-muted-foreground">{invoice.Customer?.name || "Cliente general"}</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                    </Button>

                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendEmail}
                        disabled={!invoice.Customer?.email || isSendingEmail}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        {isSendingEmail ? "Enviando..." : "Enviar"}
                    </Button>

                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/agency/${agencyId}/finance/invoices/${invoice.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Detalles
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Visor PDF */}
            <div className="flex-1 p-4">
                {pdfUrl ? (
                    <iframe src={pdfUrl} className="w-full h-full border rounded-lg" title={`Factura ${invoice.invoiceNumber}`} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Error al cargar el PDF</p>
                    </div>
                )}
            </div>
        </div>
    )
}
