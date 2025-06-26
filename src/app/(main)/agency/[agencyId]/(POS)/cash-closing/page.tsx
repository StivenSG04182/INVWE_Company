"use client"

import { useState } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Plus,
  Search,
  Download,
  Printer,
  MoreHorizontal,
  FileText,
  BarChart3,
  Eye,
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

// Tipo para el cierre de caja
type CashClosingType = {
  id: string;
  date: string;
  openTime: string;
  closeTime: string;
  initialAmount: number;
  finalAmount: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  difference: number;
  status: string;
  cashier: string;
  cashierId: string;
  notes: string;
}

// Servicio ficticio para obtener datos de cierres de caja
const getCashClosings = async (agencyId: string) => {
  // Aquí se implementaría la lógica real para obtener datos de MongoDB
  // Por ahora, retornamos datos de ejemplo
  return [
    {
      id: "cc-001",
      date: "2023-10-15",
      openTime: "08:00",
      closeTime: "20:00",
      initialAmount: 100000,
      finalAmount: 350000,
      cashSales: 200000,
      cardSales: 150000,
      otherSales: 50000,
      totalSales: 400000,
      difference: 0,
      status: "closed",
      cashier: "Juan Pérez",
      cashierId: "user-001",
      notes: "Cierre normal sin incidencias",
    },
    {
      id: "cc-002",
      date: "2023-10-14",
      openTime: "08:00",
      closeTime: "20:00",
      initialAmount: 100000,
      finalAmount: 280000,
      cashSales: 150000,
      cardSales: 120000,
      otherSales: 30000,
      totalSales: 300000,
      difference: -20000,
      status: "closed",
      cashier: "María López",
      cashierId: "user-002",
      notes: "Faltante en caja. Se debe revisar.",
    },
    {
      id: "cc-003",
      date: "2023-10-13",
      openTime: "08:00",
      closeTime: "20:00",
      initialAmount: 100000,
      finalAmount: 420000,
      cashSales: 250000,
      cardSales: 180000,
      otherSales: 40000,
      totalSales: 470000,
      difference: 50000,
      status: "closed",
      cashier: "Carlos Rodríguez",
      cashierId: "user-003",
      notes: "Sobrante en caja. Revisar.",
    },
  ]
}

const CashClosingPage = ({ params }: { params: { agencyId: string } }) => {
  const [user, setUser] = useState({ Agency: true })
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClosing, setSelectedClosing] = useState<CashClosingType | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [cashClosings, setCashClosings] = useState<CashClosingType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simular carga de datos
  useState(() => {
    const loadData = async () => {
      try {
        const data = await getCashClosings(params.agencyId)
        setCashClosings(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading cash closings:", error)
        setIsLoading(false)
      }
    }

    loadData()
  })

  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Calcular estadísticas
  const totalClosings = cashClosings.length
  const totalSales = cashClosings.reduce((sum, closing) => sum + closing.totalSales, 0)
  const totalCashSales = cashClosings.reduce((sum, closing) => sum + closing.cashSales, 0)
  const totalCardSales = cashClosings.reduce((sum, closing) => sum + closing.cardSales, 0)
  const totalDifference = cashClosings.reduce((sum, closing) => sum + closing.difference, 0)

  // Filtrar cierres según el período seleccionado
  const filteredClosings = cashClosings
    .filter((closing) => {
      if (selectedPeriod === "all") return true
      if (selectedPeriod === "today") return closing.date === "2023-10-15" // Simulación
      if (selectedPeriod === "week") return ["2023-10-15", "2023-10-14", "2023-10-13"].includes(closing.date) // Simulación
      if (selectedPeriod === "month") return closing.date.startsWith("2023-10") // Simulación
      return true
    })
    .filter((closing) => {
      if (!searchQuery) return true
      return (
        closing.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        closing.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        closing.date.includes(searchQuery)
      )
    })

  // Función para ver detalles de un cierre
  const viewClosingDetails = (closing: CashClosingType) => {
    setSelectedClosing(closing)
    setIsDetailOpen(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cierre de Caja</h1>
          <p className="text-muted-foreground">Gestiona los cierres de caja de tu negocio</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cierres..."
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
              Nuevo Cierre
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cierres</p>
                <p className="text-2xl font-bold">{totalClosings}</p>
                <p className="text-xs text-muted-foreground mt-1">Último: {cashClosings[0]?.date || "N/A"}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
                <p className="text-2xl font-bold">${(totalSales / 1000).toFixed(3)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Ventas en Efectivo</p>
                <p className="text-2xl font-bold">${(totalCashSales / 1000).toFixed(3)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalCashSales / totalSales) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ventas con Tarjeta</p>
                <p className="text-2xl font-bold">${(totalCardSales / 1000).toFixed(3)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalCardSales / totalSales) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
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
                <CardTitle>Historial de Cierres</CardTitle>
                <CardDescription>{filteredClosings.length} cierres encontrados</CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Select defaultValue="date-desc">
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
            <ScrollArea className="h-[calc(100vh-22rem)] rounded-md">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Fecha</th>
                        <th className="py-3 px-4 text-left font-medium">Apertura</th>
                        <th className="py-3 px-4 text-left font-medium">Cierre</th>
                        <th className="py-3 px-4 text-left font-medium">Monto Inicial</th>
                        <th className="py-3 px-4 text-left font-medium">Monto Final</th>
                        <th className="py-3 px-4 text-left font-medium">Ventas Totales</th>
                        <th className="py-3 px-4 text-left font-medium">Diferencia</th>
                        <th className="py-3 px-4 text-left font-medium">Estado</th>
                        <th className="py-3 px-4 text-left font-medium">Cajero</th>
                        <th className="py-3 px-4 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                              <p className="text-muted-foreground">Cargando cierres de caja...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredClosings.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground/30 mb-2" />
                              <p className="text-lg font-medium">No se encontraron cierres</p>
                              <p className="text-muted-foreground">Intenta con otros filtros o crea un nuevo cierre</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredClosings.map((closing) => (
                          <tr key={closing.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{closing.date}</td>
                            <td className="py-3 px-4">{closing.openTime}</td>
                            <td className="py-3 px-4">{closing.closeTime}</td>
                            <td className="py-3 px-4">${(closing.initialAmount / 1000).toFixed(3)}</td>
                            <td className="py-3 px-4">${(closing.finalAmount / 1000).toFixed(3)}</td>
                            <td className="py-3 px-4 font-medium">${(closing.totalSales / 1000).toFixed(3)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-medium ${closing.difference < 0 ? "text-destructive" : closing.difference > 0 ? "text-amber-500" : "text-green-500"}`}
                              >
                                ${(closing.difference / 1000).toFixed(3)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={closing.status === "closed" ? "default" : "outline"}
                                className="capitalize"
                              >
                                {closing.status === "closed" ? "Cerrado" : "Abierto"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{closing.cashier.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{closing.cashier}</span>
                              </div>
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
                                        onClick={() => viewClosingDetails(closing)}
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
                                      <p>Imprimir</p>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Printer className="h-4 w-4 mr-2" />
                                      Imprimir
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

      {/* Modal de detalles de cierre */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cierre de Caja</DialogTitle>
            <DialogDescription>Información detallada del cierre #{selectedClosing?.id}</DialogDescription>
          </DialogHeader>

          {selectedClosing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha</h4>
                  <p className="font-medium">{selectedClosing.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Cajero</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{selectedClosing.cashier.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedClosing.cashier}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Hora de Apertura</h4>
                  <p className="font-medium">{selectedClosing.openTime}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Hora de Cierre</h4>
                  <p className="font-medium">{selectedClosing.closeTime}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Monto Inicial</h4>
                  <p className="font-medium">${(selectedClosing.initialAmount / 1000).toFixed(3)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Monto Final</h4>
                  <p className="font-medium">${(selectedClosing.finalAmount / 1000).toFixed(3)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Ventas en Efectivo</h4>
                  <p className="font-medium">${(selectedClosing.cashSales / 1000).toFixed(3)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Ventas con Tarjeta</h4>
                  <p className="font-medium">${(selectedClosing.cardSales / 1000).toFixed(3)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Otras Ventas</h4>
                  <p className="font-medium">${(selectedClosing.otherSales / 1000).toFixed(3)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Ventas Totales</h4>
                  <p className="text-lg font-bold">${(selectedClosing.totalSales / 1000).toFixed(3)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Diferencia</h4>
                  <p
                    className={`text-lg font-bold ${selectedClosing.difference < 0 ? "text-destructive" : selectedClosing.difference > 0 ? "text-amber-500" : "text-green-500"}`}
                  >
                    ${(selectedClosing.difference / 1000).toFixed(3)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notas</h4>
                <p className="text-sm p-3 bg-muted rounded-md">{selectedClosing.notes || "Sin notas adicionales."}</p>
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
                Imprimir
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

export default CashClosingPage
