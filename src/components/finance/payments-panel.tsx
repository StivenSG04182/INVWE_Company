"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Settings, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { getPayments } from "@/lib/queries3"
import { Payment, PaymentMethod, PaymentStatus } from "@prisma/client"

type PaymentWithRelations = Payment & {
    Invoice?: {
        invoiceNumber: string
        Customer?: {
            name: string
        } | null
    } | null
}

export const PaymentsPanel = ({ agencyId }: { agencyId: string }) => {
    const [payments, setPayments] = useState<PaymentWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [methodFilter, setMethodFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    
    // Estadísticas calculadas
    const totalPayments = payments.length
    const completedPayments = payments.filter(payment => payment.status === "COMPLETED").length
    const totalAmount = payments
        .filter(payment => payment.status === "COMPLETED")
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
    const subAccountsCount = new Set(payments.map(payment => payment.subAccountId).filter(Boolean)).size
    
    // Obtener los pagos al cargar el componente
    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true)
            try {
                const paymentsData = await getPayments({ agencyId })
                setPayments(paymentsData)
            } catch (error) {
                console.error("Error al cargar pagos:", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchPayments()
    }, [agencyId])
    
    // Filtrar pagos según los criterios de búsqueda
    const filteredPayments = payments.filter(payment => {
        // Filtro por término de búsqueda (referencia, factura o cliente)
        const searchMatch = searchTerm === "" || 
            (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.Invoice?.invoiceNumber && payment.Invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.Invoice?.Customer?.name && payment.Invoice.Customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        
        // Filtro por método de pago
        const methodMatch = methodFilter === "all" || payment.method === methodFilter
        
        // Filtro por fecha (pendiente de implementar con fechas reales)
        // Por ahora, si no hay fechas seleccionadas, mostramos todas
        const dateMatch = !startDate && !endDate ? true : true // Implementar lógica real aquí
        
        return searchMatch && methodMatch && dateMatch
    })

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestión de Pagos</h2>
                <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/finance/payments/new`}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Registrar Pago
                        </Button>
                    </Link>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar Métodos
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>
                        Gestione todos los pagos recibidos de clientes y realice seguimiento de su estado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Pagos Recibidos</h3>
                            <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Pagos Completados</h3>
                            <p className="text-2xl font-bold">
                                {completedPayments} de {totalPayments}
                            </p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Subcuentas</h3>
                            <p className="text-2xl font-bold">{subAccountsCount}</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input 
                                        placeholder="Buscar pago..." 
                                        className="w-full md:w-64" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Select 
                                        defaultValue="all"
                                        onValueChange={(value) => setMethodFilter(value)}
                                    >
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Método" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los métodos</SelectItem>
                                            <SelectItem value="CASH">Efectivo</SelectItem>
                                            <SelectItem value="CARD">Tarjeta</SelectItem>
                                            <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                            <SelectItem value="OTHER">Otro</SelectItem>
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
                                <p className="text-center text-muted-foreground py-8">Cargando pagos...</p>
                            ) : filteredPayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No hay pagos registrados en el sistema.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Referencia</th>
                                                <th className="px-4 py-2 text-left">Factura</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Monto</th>
                                                <th className="px-4 py-2 text-left">Método</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPayments.map((payment) => (
                                                <tr key={payment.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-2">{payment.reference || payment.id.substring(0, 8)}</td>
                                                    <td className="px-4 py-2">{payment.Invoice?.invoiceNumber || '-'}</td>
                                                    <td className="px-4 py-2">{payment.Invoice?.Customer?.name || 'Sin cliente'}</td>
                                                    <td className="px-4 py-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">${Number(payment.amount).toFixed(2)}</td>
                                                    <td className="px-4 py-2">{getMethodText(payment.method)}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                                                            {getStatusText(payment.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex space-x-1">
                                                            <Link href={`/agency/${agencyId}/finance/payments/${payment.id}`}>
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

// Funciones auxiliares para mostrar el método de pago y estado
const getMethodText = (method: PaymentMethod): string => {
    switch (method) {
        case "CASH": return "Efectivo"
        case "CARD": return "Tarjeta"
        case "TRANSFER": return "Transferencia"
        case "OTHER": return "Otro"
        default: return "Desconocido"
    }
}

const getStatusText = (status: PaymentStatus): string => {
    switch (status) {
        case "COMPLETED": return "Completado"
        case "PENDING": return "Pendiente"
        case "CANCELLED": return "Cancelado"
        case "FAILED": return "Fallido"
        default: return "Desconocido"
    }
}

const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
        case "COMPLETED": return "bg-green-100 text-green-800"
        case "PENDING": return "bg-yellow-100 text-yellow-800"
        case "CANCELLED": return "bg-gray-100 text-gray-800"
        case "FAILED": return "bg-red-100 text-red-800"
        default: return "bg-gray-100 text-gray-800"
    }
}

