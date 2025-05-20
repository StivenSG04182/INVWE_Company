"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, FileDown, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { getSales } from "@/lib/queries3"
import { Sale, SaleStatus } from "@prisma/client"

type SaleWithRelations = Sale & {
    Customer?: {
        name: string
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
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    
    // Estadísticas calculadas
    const totalIncome = transactions
        .filter(t => t.status === "COMPLETED")
        .reduce((sum, t) => sum + Number(t.total), 0)
    
    const totalExpenses = 0 // En una implementación real, obtendríamos los gastos de otra fuente
    const balance = totalIncome - totalExpenses
    
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
    const filteredTransactions = transactions.filter(transaction => {
        // Filtro por término de búsqueda
        const searchMatch = searchTerm === "" || 
            transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.Customer?.name && transaction.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction.Cashier?.name && transaction.Cashier.name.toLowerCase().includes(searchTerm.toLowerCase()))
        
        // Filtro por tipo (en este caso, todas son ventas, pero podríamos filtrar por otros criterios)
        const typeMatch = typeFilter === "all" || typeFilter === "venta"
        
        // Filtro por fecha (pendiente de implementar con fechas reales)
        // Por ahora, si no hay fechas seleccionadas, mostramos todas
        const dateMatch = !startDate && !endDate ? true : true // Implementar lógica real aquí
        
        return searchMatch && typeMatch && dateMatch
    })

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Transacciones</h2>
                <div className="flex gap-2">
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

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de Transacciones</CardTitle>
                    <CardDescription>
                        Registro de todas las operaciones financieras relacionadas con ventas, compras y ajustes de inventario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Ingresos (Este Mes)</h3>
                            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Gastos (Este Mes)</h3>
                            <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
                            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input 
                                        placeholder="Buscar transacción..." 
                                        className="w-full md:w-64" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Select 
                                        defaultValue="all"
                                        onValueChange={(value) => setTypeFilter(value)}
                                    >
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            <SelectItem value="venta">Ventas</SelectItem>
                                            <SelectItem value="compra">Compras</SelectItem>
                                            <SelectItem value="ajuste">Ajustes</SelectItem>
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
                                <p className="text-center text-muted-foreground py-8">Cargando transacciones...</p>
                            ) : filteredTransactions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No hay transacciones registradas en el sistema.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Referencia</th>
                                                <th className="px-4 py-2 text-left">Tipo</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Monto</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction) => (
                                                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-2">{transaction.reference || transaction.id.substring(0, 8)}</td>
                                                    <td className="px-4 py-2">Venta</td>
                                                    <td className="px-4 py-2">{transaction.Customer?.name || 'Sin cliente'}</td>
                                                    <td className="px-4 py-2">{new Date(transaction.saleDate).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2">${Number(transaction.total).toFixed(2)}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {transaction.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex space-x-1">
                                                            <Link href={`/agency/${agencyId}/finance/transactions/${transaction.id}`}>
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
