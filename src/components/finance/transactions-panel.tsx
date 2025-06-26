"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, FileDown, Search, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getSales } from "@/lib/queries3"
import type { Sale, SaleStatus } from "@prisma/client"
import { TransactionActions } from "./transaction-actions"

type SaleWithRelations = Sale & {
    Customer?: {
        name: string
        email?: string
    } | null
    Cashier?: {
        name: string
    } | null
    Area?: {
        name: string
    } | null
    Items: any[]
}

export const TransactionsPanel = ({ agencyId }: { agencyId: string }) => {
    const [transactions, setTransactions] = useState<SaleWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Estadísticas calculadas
    const totalTransactions = transactions.length
    const completedTransactions = transactions.filter((t) => t.status === "COMPLETED").length
    const totalIncome = transactions.filter((t) => t.status === "COMPLETED").reduce((sum, t) => sum + Number(t.total), 0)
    const averageTransaction = completedTransactions > 0 ? totalIncome / completedTransactions : 0

    // Obtener las transacciones al cargar el componente
    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true)
            try {
                const salesData = await getSales({ agencyId })
                setTransactions(salesData)
            } catch (error) {
                console.error("Error al cargar transacciones:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTransactions()
    }, [agencyId])

    // Filtrar transacciones según los criterios de búsqueda
    const filteredTransactions = transactions.filter((transaction) => {
        const searchMatch =
            searchTerm === "" ||
            transaction.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.Customer?.name && transaction.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction.Cashier?.name && transaction.Cashier.name.toLowerCase().includes(searchTerm.toLowerCase()))

        const statusMatch = statusFilter === "all" || transaction.status === statusFilter
        const typeMatch = typeFilter === "all" || typeFilter === "venta"

        // Filtro por fecha
        let dateMatch = true
        if (startDate && endDate) {
            const transactionDate = new Date(transaction.saleDate)
            const start = new Date(startDate)
            const end = new Date(endDate)
            dateMatch = transactionDate >= start && transactionDate <= end
        }

        return searchMatch && statusMatch && typeMatch && dateMatch
    })

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transacciones</h2>
                    <p className="text-muted-foreground">Registro completo de ventas y operaciones comerciales</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/agency/${agencyId}/finance/transactions/new`}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Nueva Transacción
                        </Button>
                    </Link>
                    <Button variant="outline" className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Estadísticas mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transacciones</p>
                                <p className="text-2xl font-bold">{totalTransactions}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                                <p className="text-2xl font-bold text-green-600">{completedTransactions}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString("es-CO")}</p>
                            </div>
                            <div className="text-green-600">COP</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Promedio por Venta</p>
                                <p className="text-2xl font-bold text-blue-600">${averageTransaction.toLocaleString("es-CO")}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Historial de Transacciones</CardTitle>
                            <CardDescription>Registro de todas las operaciones financieras y ventas realizadas</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {filteredTransactions.length} registros
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
                                    placeholder="Buscar por referencia, cliente o cajero..."
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
                                        <SelectItem value="COMPLETED">Completadas</SelectItem>
                                        <SelectItem value="DRAFT">Borrador</SelectItem>
                                        <SelectItem value="CANCELLED">Canceladas</SelectItem>
                                        <SelectItem value="SENT">Enviadas</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="venta">Ventas</SelectItem>
                                        <SelectItem value="devolucion">Devoluciones</SelectItem>
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
                                <p className="text-muted-foreground">Cargando transacciones...</p>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="p-8 text-center">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No hay transacciones que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Referencia</th>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Cajero</th>
                                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-4 py-3 text-right font-medium">Total</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-center font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-b hover:bg-muted/25 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{transaction.saleNumber || transaction.id.substring(0, 8)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {transaction.Area?.name || "Área principal"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{transaction.Customer?.name || "Cliente general"}</p>
                                                        {transaction.Customer?.email && (
                                                            <p className="text-sm text-muted-foreground">{transaction.Customer.email}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{transaction.Cashier?.name || "Sistema"}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p>{new Date(transaction.saleDate).toLocaleDateString("es-CO")}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(transaction.saleDate).toLocaleTimeString("es-CO", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="font-medium">${Number(transaction.total).toLocaleString("es-CO")}</p>
                                                    <p className="text-sm text-muted-foreground">COP</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                                                        {getStatusText(transaction.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <TransactionActions transaction={transaction} agencyId={agencyId} />
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
const getStatusText = (status: SaleStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "Completada"
        case "DRAFT":
            return "Borrador"
        case "CANCELLED":
            return "Cancelada"
        case "SENT":
            return "Enviada"
        default:
            return "Desconocido"
    }
}

const getStatusColor = (status: SaleStatus): string => {
    switch (status) {
        case "COMPLETED":
            return "bg-green-100 text-green-800 border-green-200"
        case "DRAFT":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "CANCELLED":
            return "bg-red-100 text-red-800 border-red-200"
        case "SENT":
            return "bg-blue-100 text-blue-800 border-blue-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}
