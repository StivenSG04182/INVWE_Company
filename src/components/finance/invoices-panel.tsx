"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, FileDown, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { getInvoices } from "@/lib/queries3"
import { Invoice, InvoiceStatus } from "@prisma/client"

type InvoiceWithRelations = Invoice & {
    Customer?: {
        name: string
    } | null
    Items: any[]
    Taxes: any[]
    Payments: any[]
}

export const InvoicesPanel = ({ agencyId }: { agencyId: string }) => {
    const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    
    // Estadísticas calculadas
    const totalInvoices = invoices.length
    const pendingInvoices = invoices.filter(invoice => invoice.status === "PENDING" || invoice.status === "OVERDUE").length
    const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0)
    
    // Obtener las facturas al cargar el componente
    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoading(true)
            try {
                const invoicesData = await getInvoices({ agencyId })
                setInvoices(invoicesData)
            } catch (error) {
                console.error("Error al cargar facturas:", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchInvoices()
    }, [agencyId])
    
    // Filtrar facturas según los criterios de búsqueda
    const filteredInvoices = invoices.filter(invoice => {
        // Filtro por término de búsqueda (número de factura o cliente)
        const searchMatch = searchTerm === "" || 
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.Customer?.name && invoice.Customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        
        // Filtro por estado
        const statusMatch = statusFilter === "all" || invoice.status === statusFilter
        
        // Filtro por fecha (pendiente de implementar con fechas reales)
        // Por ahora, si no hay fechas seleccionadas, mostramos todas
        const dateMatch = !startDate && !endDate ? true : true // Implementar lógica real aquí
        
        return searchMatch && statusMatch && dateMatch
    })

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
                                    <Input 
                                        placeholder="Buscar factura..." 
                                        className="w-full md:w-64" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Select 
                                        defaultValue="all"
                                        onValueChange={(value) => setStatusFilter(value)}
                                    >
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="PAID">Pagada</SelectItem>
                                            <SelectItem value="PENDING">Pendiente</SelectItem>
                                            <SelectItem value="OVERDUE">Vencida</SelectItem>
                                            <SelectItem value="CANCELLED">Anulada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        type="date" 
                                        className="w-full md:w-auto" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <Input 
                                        type="date" 
                                        className="w-full md:w-auto" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {isLoading ? (
                                <p className="text-center text-muted-foreground py-8">Cargando facturas...</p>
                            ) : filteredInvoices.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No hay facturas registradas en el sistema.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Nº Factura</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Tienda</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Total</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInvoices.map((invoice) => (
                                                <tr key={invoice.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-2">{invoice.invoiceNumber}</td>
                                                    <td className="px-4 py-2">{invoice.Customer?.name || 'Sin cliente'}</td>
                                                    <td className="px-4 py-2">{invoice.subAccountId ? 'Sí' : 'No'}</td>
                                                    <td className="px-4 py-2">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">${Number(invoice.total).toFixed(2)}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                                                            {getStatusText(invoice.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex space-x-1">
                                                            <Link href={`/agency/${agencyId}/finance/invoices/${invoice.id}`}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
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

// Funciones auxiliares para mostrar el estado de la factura
const getStatusText = (status: InvoiceStatus): string => {
    switch (status) {
        case "PAID": return "Pagada"
        case "PENDING": return "Pendiente"
        case "OVERDUE": return "Vencida"
        case "CANCELLED": return "Anulada"
        default: return "Desconocido"
    }
}

const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
        case "PAID": return "bg-green-100 text-green-800"
        case "PENDING": return "bg-yellow-100 text-yellow-800"
        case "OVERDUE": return "bg-red-100 text-red-800"
        case "CANCELLED": return "bg-gray-100 text-gray-800"
        default: return "bg-gray-100 text-gray-800"
    }
}
