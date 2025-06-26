"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    ShoppingCart,
    DollarSign,
    BarChart3,
    Plus,
    Search,
    Download,
    Printer,
    MoreHorizontal,
    CreditCard,
    Receipt,
    Eye,
    FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Servicio ficticio para obtener datos de ventas
const getSalesData = async (agencyId: string) => {
    // Aquí se implementaría la lógica real para obtener datos de MongoDB
    // Por ahora, retornamos datos de ejemplo
    return [
        {
            id: "sale-001",
            date: "2023-10-15",
            time: "14:30",
            total: 85000,
            items: 5,
            paymentMethod: "efectivo",
            customer: "Cliente General",
            customerId: null,
            cashier: "Juan Pérez",
            cashierId: "user-001",
            status: "completed",
            products: [
                { id: "prod-001", name: "Producto 1", price: 15000, quantity: 2 },
                { id: "prod-002", name: "Producto 2", price: 25000, quantity: 1 },
                { id: "prod-003", name: "Producto 3", price: 10000, quantity: 3 },
            ],
        },
        {
            id: "sale-002",
            date: "2023-10-15",
            time: "16:45",
            total: 120000,
            items: 8,
            paymentMethod: "tarjeta",
            customer: "María González",
            customerId: "cust-001",
            cashier: "Ana Martínez",
            cashierId: "user-002",
            status: "completed",
            products: [
                { id: "prod-004", name: "Producto 4", price: 30000, quantity: 2 },
                { id: "prod-005", name: "Producto 5", price: 20000, quantity: 3 },
                { id: "prod-001", name: "Producto 1", price: 15000, quantity: 1 },
            ],
        },
        {
            id: "sale-003",
            date: "2023-10-14",
            time: "10:15",
            total: 45000,
            items: 3,
            paymentMethod: "efectivo",
            customer: "Cliente General",
            customerId: null,
            cashier: "Carlos Rodríguez",
            cashierId: "user-003",
            status: "completed",
            products: [
                { id: "prod-002", name: "Producto 2", price: 25000, quantity: 1 },
                { id: "prod-003", name: "Producto 3", price: 10000, quantity: 2 },
            ],
        },
        {
            id: "sale-004",
            date: "2023-10-14",
            time: "18:20",
            total: 95000,
            items: 6,
            paymentMethod: "tarjeta",
            customer: "Pedro Sánchez",
            customerId: "cust-002",
            cashier: "Juan Pérez",
            cashierId: "user-001",
            status: "completed",
            products: [
                { id: "prod-006", name: "Producto 6", price: 35000, quantity: 2 },
                { id: "prod-001", name: "Producto 1", price: 15000, quantity: 1 },
                { id: "prod-003", name: "Producto 3", price: 10000, quantity: 1 },
            ],
        },
        {
            id: "sale-005",
            date: "2023-10-13",
            time: "12:10",
            total: 35000,
            items: 2,
            paymentMethod: "efectivo",
            customer: "Cliente General",
            customerId: null,
            cashier: "Ana Martínez",
            cashierId: "user-002",
            status: "completed",
            products: [
                { id: "prod-001", name: "Producto 1", price: 15000, quantity: 1 },
                { id: "prod-003", name: "Producto 3", price: 10000, quantity: 2 },
            ],
        },
    ]
}

const SalesPosPage = ({ params }: { params: { agencyId: string } }) => {
    const [user, setUser] = useState({ Agency: true })
    const [selectedPeriod, setSelectedPeriod] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSale, setSelectedSale] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [sales, setSales] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [paymentFilter, setPaymentFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("date-desc")

    // Simular carga de datos
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getSalesData(params.agencyId)
                setSales(data)
                setIsLoading(false)
            } catch (error) {
                console.error("Error loading sales data:", error)
                setIsLoading(false)
            }
        }

        loadData()
    }, [params.agencyId])

    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Calcular estadísticas
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const cashSales = sales.filter((sale) => sale.paymentMethod === "efectivo").length
    const cardSales = sales.filter((sale) => sale.paymentMethod === "tarjeta").length
    const cashRevenue = sales
        .filter((sale) => sale.paymentMethod === "efectivo")
        .reduce((sum, sale) => sum + sale.total, 0)
    const cardRevenue = sales
        .filter((sale) => sale.paymentMethod === "tarjeta")
        .reduce((sum, sale) => sum + sale.total, 0)
    const totalItems = sales.reduce((sum, sale) => sum + sale.items, 0)
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    // Filtrar ventas según los criterios seleccionados
    const filteredSales = sales
        .filter((sale) => {
            // Filtro por período
            if (selectedPeriod === "all") return true
            if (selectedPeriod === "today") return sale.date === "2023-10-15" // Simulación
            if (selectedPeriod === "week") return ["2023-10-15", "2023-10-14", "2023-10-13"].includes(sale.date) // Simulación
            if (selectedPeriod === "month") return sale.date.startsWith("2023-10") // Simulación
            return true
        })
        .filter((sale) => {
            // Filtro por método de pago
            if (paymentFilter === "all") return true
            return sale.paymentMethod === paymentFilter
        })
        .filter((sale) => {
            // Filtro por búsqueda
            if (!searchQuery) return true
            return (
                sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.date.includes(searchQuery)
            )
        })

    // Ordenar ventas
    const sortedSales = [...filteredSales].sort((a, b) => {
        if (sortOrder === "date-desc") {
            return new Date((b as any).date + "T" + (b as any).time).getTime() - new Date((a as any).date + "T" + (a as any).time).getTime()
        } else if (sortOrder === "date-asc") {
            return new Date((a as any).date + "T" + (a as any).time).getTime() - new Date((b as any).date + "T" + (b as any).time).getTime()
        } else if (sortOrder === "amount-desc") {
            return (b as any).total - (a as any).total
        } else if (sortOrder === "amount-asc") {
            return (a as any).total - (b as any).total
        }
        return 0
    })

    // Función para ver detalles de una venta
    const viewSaleDetails = (sale) => {
        setSelectedSale(sale)
        setIsDetailOpen(true)
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Ventas POS</h1>
                    <p className="text-muted-foreground">Gestiona y visualiza todas las ventas realizadas en el punto de venta</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar ventas..."
                            className="pl-8 w-full md:w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select onValueChange={(value) => setSelectedPeriod(value)} defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los períodos</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="week">Esta semana</SelectItem>
                            <SelectItem value="month">Este mes</SelectItem>
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Acciones
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar a Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar a PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir reporte
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver estadísticas avanzadas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href={`/agency/${agencyId}/terminal`}>
                        <Button size="sm" className="whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Venta
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Ventas</p>
                                <p className="text-2xl font-bold">{totalSales}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 8%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 12%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ticket Promedio</p>
                                <p className="text-2xl font-bold">${(averageTicket / 1000).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 5%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Receipt className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Productos Vendidos</p>
                                <p className="text-2xl font-bold">{totalItems}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-green-500">↑ 10%</span> vs. período anterior
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <CardTitle>Historial de Ventas</CardTitle>
                                <CardDescription>{filteredSales.length} ventas encontradas</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <Select onValueChange={(value) => setPaymentFilter(value)} defaultValue="all">
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Método de pago" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los métodos</SelectItem>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select onValueChange={(value) => setSortOrder(value)} defaultValue="date-desc">
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                                        <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
                                        <SelectItem value="amount-desc">Monto (mayor a menor)</SelectItem>
                                        <SelectItem value="amount-asc">Monto (menor a mayor)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-36rem)] rounded-md">
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="py-3 px-4 text-left font-medium">ID</th>
                                                <th className="py-3 px-4 text-left font-medium">Fecha</th>
                                                <th className="py-3 px-4 text-left font-medium">Hora</th>
                                                <th className="py-3 px-4 text-left font-medium">Cliente</th>
                                                <th className="py-3 px-4 text-left font-medium">Productos</th>
                                                <th className="py-3 px-4 text-left font-medium">Método de Pago</th>
                                                <th className="py-3 px-4 text-left font-medium">Total</th>
                                                <th className="py-3 px-4 text-left font-medium">Cajero</th>
                                                <th className="py-3 px-4 text-left font-medium">Estado</th>
                                                <th className="py-3 px-4 text-left font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={10} className="py-10 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                                            <p className="text-muted-foreground">Cargando ventas...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : sortedSales.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="py-10 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
                                                            <p className="text-lg font-medium">No se encontraron ventas</p>
                                                            <p className="text-muted-foreground">Intenta con otros filtros o crea una nueva venta</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                sortedSales.map((sale) => (
                                                    <tr key={sale.id} className="border-b hover:bg-muted/50">
                                                        <td className="py-3 px-4 font-medium">{sale.id}</td>
                                                        <td className="py-3 px-4">{sale.date}</td>
                                                        <td className="py-3 px-4">{sale.time}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback>{sale.customer.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{sale.customer}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">{sale.items}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant={sale.paymentMethod === "efectivo" ? "outline" : "default"}
                                                                className="flex items-center gap-1"
                                                            >
                                                                {sale.paymentMethod === "efectivo" ? (
                                                                    <DollarSign className="h-3 w-3" />
                                                                ) : (
                                                                    <CreditCard className="h-3 w-3" />
                                                                )}
                                                                {sale.paymentMethod === "efectivo" ? "Efectivo" : "Tarjeta"}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium">${(sale.total / 1000).toFixed(3)}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback>{sale.cashier.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{sale.cashier}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge variant="success" className="bg-green-500">
                                                                {sale.status === "completed" ? "Completada" : "Pendiente"}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-1">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => viewSaleDetails(sale)}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Ver detalles</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <Printer className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Imprimir recibo</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => viewSaleDetails(sale)}>
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver detalles
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Printer className="h-4 w-4 mr-2" />
                                                                            Imprimir recibo
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Download className="h-4 w-4 mr-2" />
                                                                            Exportar
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de detalles de venta */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Venta</DialogTitle>
                        <DialogDescription>Información detallada de la venta #{selectedSale?.id}</DialogDescription>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha y Hora</h4>
                                    <p className="font-medium">
                                        {selectedSale.date} - {selectedSale.time}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Cajero</h4>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback>{selectedSale.cashier.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{selectedSale.cashier}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback>{selectedSale.customer.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{selectedSale.customer}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Método de Pago</h4>
                                    <Badge
                                        variant={selectedSale.paymentMethod === "efectivo" ? "outline" : "default"}
                                        className="flex items-center gap-1"
                                    >
                                        {selectedSale.paymentMethod === "efectivo" ? (
                                            <DollarSign className="h-3 w-3" />
                                        ) : (
                                            <CreditCard className="h-3 w-3" />
                                        )}
                                        {selectedSale.paymentMethod === "efectivo" ? "Efectivo" : "Tarjeta"}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Productos</h4>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="py-2 px-4 text-left font-medium">Producto</th>
                                                <th className="py-2 px-4 text-left font-medium">Precio</th>
                                                <th className="py-2 px-4 text-left font-medium">Cantidad</th>
                                                <th className="py-2 px-4 text-left font-medium">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSale.products.map((product, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-2 px-4">{product.name}</td>
                                                    <td className="py-2 px-4">${(product.price / 1000).toFixed(3)}</td>
                                                    <td className="py-2 px-4">{product.quantity}</td>
                                                    <td className="py-2 px-4">${((product.price * product.quantity) / 1000).toFixed(3)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Productos</h4>
                                    <p className="font-medium">{selectedSale.items} productos</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Venta</h4>
                                    <p className="text-xl font-bold">${(selectedSale.total / 1000).toFixed(3)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                            Cerrar
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir Recibo
                            </Button>
                            <Button>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SalesPosPage
