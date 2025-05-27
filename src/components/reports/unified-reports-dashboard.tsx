"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Download,
    PieChart,
    Calendar,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import FinancialReports from "./financial-reports"
import InventoryReports from "./inventory-reports"
import PerformanceReports from "./performance-reports"
import ProductReports from "./product-reports"
import PosReports from "./pos-reports"
import SalesReports from "./sales-reports"
import { getReportStats, exportReportData } from "@/lib/reports-queries"

interface UnifiedReportsDashboardProps {
    agencyId: string
    user: any
}

export default function UnifiedReportsDashboard({ agencyId, user }: UnifiedReportsDashboardProps) {
    const [activeTab, setActiveTab] = useState("financial")
    const [dateRange, setDateRange] = useState("month")
    const [isExporting, setIsExporting] = useState(false)
    const [reportStats, setReportStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Formatos de exportación disponibles
    const exportFormats = [
        { name: "PDF", icon: "📄", format: "PDF", description: "Documento portable" },
        { name: "Excel", icon: "📊", format: "EXCEL", description: "Hoja de cálculo" },
        { name: "CSV", icon: "📝", format: "CSV", description: "Valores separados por comas" },
        { name: "JSON", icon: "🔢", format: "JSON", description: "Datos estructurados" },
    ]

    const tabConfig = {
        financial: {
            title: "Reportes Financieros",
            description: "Análisis de ingresos, gastos y rentabilidad",
            gradient: "from-green-600 to-teal-500",
            icon: DollarSign,
            color: "green",
        },
        inventory: {
            title: "Reportes de Inventario",
            description: "Control de stock y movimientos",
            gradient: "from-blue-600 to-cyan-500",
            icon: Package,
            color: "blue",
        },
        performance: {
            title: "Desempeño",
            description: "Métricas de rendimiento y KPIs",
            gradient: "from-violet-600 to-purple-500",
            icon: TrendingUp,
            color: "violet",
        },
        products: {
            title: "Reportes de Productos",
            description: "Análisis de productos y categorías",
            gradient: "from-blue-600 to-indigo-500",
            icon: Package,
            color: "indigo",
        },
        pos: {
            title: "Reportes POS",
            description: "Ventas en punto de venta",
            gradient: "from-orange-600 to-amber-500",
            icon: ShoppingCart,
            color: "orange",
        },
        sales: {
            title: "Reportes de Ventas",
            description: "Análisis de ventas y tendencias",
            gradient: "from-purple-600 to-pink-500",
            icon: BarChart3,
            color: "purple",
        },
    }

    const currentTab = tabConfig[activeTab as keyof typeof tabConfig]

    // Cargar estadísticas generales
    useEffect(() => {
        loadReportStats()
    }, [agencyId, dateRange])

    const loadReportStats = async () => {
        try {
            setIsLoading(true)
            const data = await getReportStats(agencyId, dateRange)
            setReportStats(data)
        } catch (error) {
            console.error("Error loading report stats:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las estadísticas",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = async (format: string) => {
        try {
            setIsExporting(true)
            await exportReportData(agencyId, activeTab, format, dateRange)

            toast({
                title: "Reporte exportado",
                description: `El reporte se ha exportado en formato ${format}`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo exportar el reporte. Inténtalo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsExporting(false)
        }
    }

    const generateReport = async () => {
        try {
            toast({
                title: "Reporte generado",
                description: "El reporte se ha generado exitosamente",
            })
            loadReportStats()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo generar el reporte",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header mejorado */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${currentTab.gradient}`}>
                            <currentTab.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1
                                className={`text-3xl font-bold bg-gradient-to-r ${currentTab.gradient} bg-clip-text text-transparent`}
                            >
                                {currentTab.title}
                            </h1>
                            <p className="text-muted-foreground">{currentTab.description}</p>
                        </div>
                    </div>

                    {reportStats && !isLoading && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {dateRange === "week"
                                    ? "Esta semana"
                                    : dateRange === "month"
                                        ? "Este mes"
                                        : dateRange === "quarter"
                                            ? "Este trimestre"
                                            : dateRange === "year"
                                                ? "Este año"
                                                : "Personalizado"}
                            </Badge>
                            <Badge variant="outline">{reportStats.totalRecords || 0} registros</Badge>
                            <Badge variant="outline">Actualizado: {new Date().toLocaleDateString()}</Badge>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={generateReport}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                        <PieChart className="h-4 w-4" />
                        <span>Generar Reporte</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="flex items-center gap-2" disabled={isExporting}>
                                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                <span>Exportar</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            {exportFormats.map((format, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    className="flex items-center gap-3 cursor-pointer p-3"
                                    onClick={() => handleExport(format.format)}
                                >
                                    <span className="text-xl">{format.icon}</span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{format.name}</span>
                                        <span className="text-xs text-muted-foreground">{format.description}</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {dateRange === "week"
                                        ? "Esta semana"
                                        : dateRange === "month"
                                            ? "Este mes"
                                            : dateRange === "quarter"
                                                ? "Este trimestre"
                                                : dateRange === "year"
                                                    ? "Este año"
                                                    : "Personalizado"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setDateRange("week")}>Esta semana</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRange("month")}>Este mes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRange("quarter")}>Este trimestre</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRange("year")}>Este año</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            {reportStats && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportStats.totalRecords?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">↑ {reportStats.growth || 0}%</span> vs. período anterior
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${reportStats.totalValue?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-500">↑ {reportStats.valueGrowth || 0}%</span> vs. período anterior
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Promedio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${reportStats.average?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Por registro</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tendencia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                                {reportStats.trend > 0 ? "↗" : reportStats.trend < 0 ? "↘" : "→"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {reportStats.trend > 0 ? "Creciendo" : reportStats.trend < 0 ? "Decreciendo" : "Estable"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Navegación principal mejorada */}
            <Card className="border-none shadow-lg">
                <CardContent className="p-0">
                    <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b bg-muted/30">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                <TabsList className="bg-transparent h-auto p-0 flex w-full justify-start">
                                    {Object.entries(tabConfig).map(([key, config]) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className={`flex items-center gap-2 px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-${config.color}-500 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-background transition-all duration-200`}
                                        >
                                            <config.icon className="h-4 w-4" />
                                            <span className="hidden sm:inline font-medium">{config.title.split(" ")[1] || config.title}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>

                        <div className="p-6">
                            <TabsContent value="financial" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <FinancialReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>

                            <TabsContent value="inventory" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <InventoryReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>

                            <TabsContent value="performance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <PerformanceReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>

                            <TabsContent value="products" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <ProductReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>

                            <TabsContent value="pos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <PosReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>

                            <TabsContent value="sales" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                <SalesReports agencyId={agencyId} user={user} dateRange={dateRange} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
