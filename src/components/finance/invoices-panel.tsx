"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, FileDown, FileText, Search } from "lucide-react"
import Link from "next/link"
import { getInvoices } from "@/lib/queries3"
import type { Invoice, InvoiceStatus } from "@prisma/client"
import { InvoicePDFViewer } from "./invoice-pdf-viewer"
import { InvoiceActionsUpdated as InvoiceActions } from "./invoice-actions"
import { InvoiceDetailModal } from "./invoice-detail-modal"

type InvoiceWithRelations = Invoice & {
    Customer?: {
        name: string
        email?: string
        taxId?: string
        taxIdType?: string
    } | null
    Items: any[]
    Taxes: any[]
    Payments: any[]
    SubAccount?: {
        name: string
    } | null
}

export const InvoicesPanel = ({ agencyId }: { agencyId: string }) => {
    const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Estados para modales
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null)
    const [showPDFModal, setShowPDFModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // Estadísticas calculadas
    const totalInvoices = invoices.length
    const pendingInvoices = invoices.filter(
        (invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE",
    ).length
    const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0)
    const electronicInvoices = invoices.filter(
        (invoice) => invoice.invoiceType === "ELECTRONIC" || invoice.invoiceType === "BOTH",
    ).length

    // Obtener las facturas al cargar el componente
    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoading(true)
            try {
                const invoicesData = await getInvoices({ agencyId })
                setInvoices(invoicesData as InvoiceWithRelations[])
            } catch (error) {
                console.error("Error al cargar facturas:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchInvoices()
    }, [agencyId])

    // Filtrar facturas según los criterios de búsqueda
    const filteredInvoices = invoices.filter((invoice) => {
        const searchMatch =
            searchTerm === "" ||
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.Customer?.name && invoice.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (invoice.Customer?.taxId && invoice.Customer.taxId.toLowerCase().includes(searchTerm.toLowerCase()))

        const statusMatch = statusFilter === "all" || invoice.status === statusFilter
        const typeMatch = typeFilter === "all" || invoice.invoiceType === typeFilter

        // Filtro por fecha
        let dateMatch = true
        if (startDate && endDate) {
            const invoiceDate = new Date(invoice.createdAt)
            const start = new Date(startDate)
            const end = new Date(endDate)
            dateMatch = invoiceDate >= start && invoiceDate <= end
        }

        return searchMatch && statusMatch && typeMatch && dateMatch
    })

    const handleViewPDF = (invoice: InvoiceWithRelations) => {
        setSelectedInvoice(invoice)
        setShowPDFModal(true)
    }

    const handleViewDetails = (invoice: InvoiceWithRelations) => {
        setSelectedInvoice(invoice)
        setShowDetailModal(true)
    }

    const handleClosePDFModal = () => {
        setShowPDFModal(false)
        setSelectedInvoice(null)
    }

    const handleCloseDetailModal = () => {
        setShowDetailModal(false)
        setSelectedInvoice(null)
    }

    const handleViewPDFFromDetail = () => {
        setShowDetailModal(false)
        setShowPDFModal(true)
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestión de Facturas</h2>
                    <p className="text-muted-foreground">
                        Administre facturas electrónicas y físicas conforme a la normativa DIAN
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
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

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Facturas</p>
                                <p className="text-2xl font-bold">{totalInvoices}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                                <p className="text-2xl font-bold text-amber-600">{pendingInvoices}</p>
                            </div>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                {pendingInvoices}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Facturación Total</p>
                                <p className="text-2xl font-bold text-green-600">${totalAmount.toLocaleString("es-CO")}</p>
                            </div>
                            <div className="text-green-600">COP</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Electrónicas</p>
                                <p className="text-2xl font-bold text-blue-600">{electronicInvoices}</p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                DIAN
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Registro de Facturas</CardTitle>
                            <CardDescription>Gestione facturas electrónicas y físicas con cumplimiento DIAN</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            Normativa DIAN 2024
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filtros */}
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, cliente o NIT..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="PAID">Pagadas</SelectItem>
                                        <SelectItem value="PENDING">Pendientes</SelectItem>
                                        <SelectItem value="OVERDUE">Vencidas</SelectItem>
                                        <SelectItem value="CANCELLED">Anuladas</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ELECTRONIC">Electrónica</SelectItem>
                                        <SelectItem value="PHYSICAL">Física</SelectItem>
                                        <SelectItem value="BOTH">Ambas</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="date"
                                    className="w-auto"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder="Desde"
                                />
                                <Input
                                    type="date"
                                    className="w-auto"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder="Hasta"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-4" />

                    {/* Tabla */}
                    <div className="border rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Cargando facturas...</p>
                            </div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No hay facturas que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Factura</th>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Tipo</th>
                                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-4 py-3 text-right font-medium">Total</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-center font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b hover:bg-muted/25 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{invoice.invoiceNumber}</p>
                                                        <p className="text-sm text-muted-foreground">{invoice.SubAccount?.name || "Principal"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{invoice.Customer?.name || "Cliente general"}</p>
                                                        {invoice.Customer?.taxId && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {invoice.Customer.taxIdType}: {invoice.Customer.taxId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={invoice.invoiceType === "ELECTRONIC" ? "default" : "secondary"}
                                                        className={
                                                            invoice.invoiceType === "ELECTRONIC"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : invoice.invoiceType === "BOTH"
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                        }
                                                    >
                                                        {invoice.invoiceType === "ELECTRONIC"
                                                            ? "Electrónica"
                                                            : invoice.invoiceType === "BOTH"
                                                                ? "Ambas"
                                                                : "Física"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p>{new Date(invoice.createdAt).toLocaleDateString("es-CO")}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(invoice.createdAt).toLocaleTimeString("es-CO", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="font-medium">${Number(invoice.total).toLocaleString("es-CO")}</p>
                                                    <p className="text-sm text-muted-foreground">COP</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                                                        {getStatusText(invoice.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <InvoiceActions
                                                        invoice={invoice}
                                                        agencyId={agencyId}
                                                        onViewPDF={() => handleViewPDF(invoice)}
                                                        onViewDetails={() => handleViewDetails(invoice)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de visualización PDF */}
            <Dialog open={showPDFModal} onOpenChange={handleClosePDFModal}>
                <DialogContent className="max-w-5xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Vista PDF - Factura {selectedInvoice?.invoiceNumber}</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && <InvoicePDFViewer invoice={selectedInvoice} agencyId={agencyId} />}
                </DialogContent>
            </Dialog>

            {/* Modal de detalles */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                agencyId={agencyId}
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                onViewPDF={handleViewPDFFromDetail}
            />
        </>
    )
}

// Funciones auxiliares
const getStatusText = (status: InvoiceStatus): string => {
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

const getStatusColor = (status: InvoiceStatus): string => {
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
