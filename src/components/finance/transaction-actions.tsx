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
import { Eye, Download, Printer, Mail, MoreHorizontal, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EmailModal } from "./email-modal"
import { generateTransactionPDFById } from "@/lib/queries3"

interface TransactionActionsProps {
    transaction: any
    agencyId: string
}

export const TransactionActions = ({ transaction, agencyId }: TransactionActionsProps) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const result = await generateTransactionPDFById({
                transactionId: transaction.id,
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
            a.download = result.filename || `Transaccion-${transaction.reference || transaction.id}.pdf`
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
            const result = await generateTransactionPDFById({
                transactionId: transaction.id,
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
            toast.error("Error al imprimir la transacción")
            console.error(error)
        }
    }

    return (
        <>
            <div className="flex items-center gap-1">
                {/* Acción rápida de ver */}
                <Link href={`/agency/${agencyId}/finance/transactions/${transaction.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalles">
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
                            <Link href={`/agency/${agencyId}/finance/transactions/${transaction.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
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

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link href={`/agency/${agencyId}/finance/transactions/${transaction.id}/receipt`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver recibo
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Modal de envío de email */}
            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                documentType="transaction"
                documentId={transaction.id}
                agencyId={agencyId}
                defaultCustomer={transaction.Customer}
            />
        </>
    )
}
