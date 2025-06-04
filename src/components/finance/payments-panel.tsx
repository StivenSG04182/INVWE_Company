"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Settings, Eye, FileText, Search, CreditCard, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"
import { getPayments } from "@/lib/queries3"
import type { Payment, PaymentMethod, PaymentStatus } from "@prisma/client"

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
    const [statusFilter, setStatusFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Estadísticas calculadas
    const totalPayments = payments.length
    const completedPayments = payments.filter((payment) => payment.status === "COMPLETED").length
    const totalAmount = payments
        .filter((payment) => payment.status === "COMPLETED")
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
    const pendingAmount = payments
        .filter((payment) => payment.status === "PENDING")
        .reduce((sum, payment) => sum + Number(payment.amount), 0)

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
    const filteredPayments = payments.filter((payment) => {
        const searchMatch =
            searchTerm === "" ||
            (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.Invoice?.invoiceNumber &&
                payment.Invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.Invoice?.Customer?.name &&
                payment.Invoice.Customer.name.toLowerCase().includes(searchTerm.toLowerCase()))

        const methodMatch = methodFilter === "all" || payment.method === methodFilter
        const statusMatch = statusFilter === "all" || payment.status === statusFilter

        // Filtro por fecha
        let dateMatch = true
        if (startDate && endDate) {
            const paymentDate = new Date(payment.createdAt)
            const start = new Date(startDate)
            const end = new Date(endDate)
            dateMatch = paymentDate >= start && paymentDate <= end
        }

        return searchMatch && methodMatch && statusMatch && dateMatch
    })

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestión de Pagos</h2>
                    <p className="text-muted-foreground">Control de pagos recibidos y métodos de pago utilizados</p>
                </div>
                <div className="flex flex-wrap gap-2">
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

            {/* Estadísticas mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pagos Recibidos</p>
                                <p className="text-2xl font-bold text-green-600">${totalAmount.toLocaleString("es-CO")}</p>
                            </div>
                            <CreditCard className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pagos Completados</p>
                                <p className="text-2xl font-bold">{completedPayments}</p>
                                <p className="text-sm text-muted-foreground">de {totalPayments} total</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {totalPayments > 0 ? Math.round((completedPayments / totalPayments) * 100) : 0}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pagos Pendientes</p>
                                <p className="text-2xl font-bold text-amber-600">${pendingAmount.toLocaleString("es-CO")}</p>
                            </div>
                            <Banknote className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Promedio por Pago</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ${completedPayments > 0 ? (totalAmount / completedPayments).toLocaleString("es-CO") : "0"}
                                </p>
                            </div>
                            <Smartphone className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Historial de Pagos</CardTitle>
                            <CardDescription>Registro de todos los pagos recibidos de clientes</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {filteredPayments.length} registros
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filtros mejorados */}
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por referencia, factura o cliente..."
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
                                        <SelectItem value="COMPLETED">Completados</SelectItem>
                                        <SelectItem value="PENDING">Pendientes</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelados</SelectItem>
                                        <SelectItem value="FAILED">Fallidos</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={methodFilter} onValueChange={setMethodFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="CASH">Efectivo</SelectItem>
                                        <SelectItem value="CARD">Tarjeta</SelectItem>
                                        <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                        <SelectItem value="OTHER">Otro</SelectItem>
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

                    {/* Tabla mejorada */}
                    <div className="border rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Cargando pagos...</p>
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="p-8 text-center">
                                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No hay pagos que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Referencia</th>
                                            <th className="px-4 py-3 text-left font-medium">Factura</th>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-4 py-3 text-right font-medium">Monto</th>
                                            <th className="px-4 py-3 text-left font-medium">Método</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-center font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="border-b hover:bg-muted/25 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{payment.reference || payment.id.substring(0, 8)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{payment.Invoice?.invoiceNumber || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{payment.Invoice?.Customer?.name || "Cliente general"}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p>{new Date(payment.createdAt).toLocaleDateString("es-CO")}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(payment.createdAt).toLocaleTimeString("es-CO", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="font-medium">${Number(payment.amount).toLocaleString("es-CO")}</p>
                                                    <p className="text-sm text-muted-foreground">COP</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className={getMethodColor(payment.method)}>
                                                        {getMethodIcon(payment.method)}
                                                        {getMethodText(payment.method)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary" className={getStatusColor(payment.status)}>
                                                        {getStatusText(payment.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
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
                </CardContent>
            </Card>
        </>
    )
}

// Funciones auxiliares
const getMethodText = (method: PaymentMethod): string => {
    switch (method) {
        case "CASH":
            return "Efectivo"
        case "CARD":
            return "Tarjeta"
        case "TRANSFER":
            return "Transferencia"
        case "OTHER":
            return "Otro"
        default:
            return "Desconocido"
    }
}

const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
        case "CASH":
            return <Banknote className="h-3 w-3 mr-1" />
        case "CARD":
            return <CreditCard className="h-3 w-3 mr-1" />
        case "TRANSFER":
            return <Smartphone className="h-3 w-3 mr-1" />
        default:
            return null
    }
}

const getMethodColor = (method: PaymentMethod): string => {
    switch (method) {
        case "CASH":
            return "border-green-200 text-green-800"
        case "CARD":
            return "border-blue-200 text-blue-800"
        case "TRANSFER":
            return "border-purple-200 text-purple-800"
        case "OTHER":
            return "border-gray-200 text-gray-800"
        default:
            return "border-gray-200 text-gray-800"
    }
}

const getStatusText = (status: PaymentStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "Completado"
        case "PENDING":
            return "Pendiente"
        case "CANCELLED":
            return "Cancelado"
        case "FAILED":
            return "Fallido"
        default:
            return "Desconocido"
    }
}

const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "bg-green-100 text-green-800 border-green-200"
        case "PENDING":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "CANCELLED":
            return "bg-gray-100 text-gray-800 border-gray-200"
        case "FAILED":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}
