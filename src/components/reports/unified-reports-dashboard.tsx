"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Download,
    Filter,
    PieChart,
    Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import FinancialReports from "./financial-reports"
import InventoryReports from "./inventory-reports"
import PerformanceReports from "./performance-reports"
import ProductReports from "./product-reports"
import PosReports from "./pos-reports"
import SalesReports from "./sales-reports"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ReportFormat } from "@prisma/client"

export default function UnifiedReportsDashboard({ agencyId, user }: { agencyId: string; user: any }) {
    const [activeTab, setActiveTab] = useState("financial")
    const [dateRange, setDateRange] = useState("month")

    // Formatos de exportación disponibles
    const exportFormats = [
        { name: "PDF", icon: "📄", format: "PDF" as ReportFormat },
        { name: "Excel", icon: "📊", format: "EXCEL" as ReportFormat },
        { name: "CSV", icon: "📝", format: "CSV" as ReportFormat },
        { name: "JSON", icon: "🔢", format: "JSON" as ReportFormat },
    ]

    const tabTitles = {
        financial: "Reportes Financieros",
        inventory: "Reportes de Inventario",
        performance: "Desempeño",
        products: "Reportes de Productos",
        pos: "Reportes POS",
        sales: "Reportes de Ventas",
    }

    const tabGradients = {
        financial: "from-green-600 to-teal-500",
        inventory: "from-blue-600 to-cyan-500",
        performance: "from-violet-600 to-purple-500",
        products: "from-blue-600 to-indigo-500",
        pos: "from-orange-600 to-amber-500",
        sales: "from-purple-600 to-pink-500",
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Encabezado con título y acciones */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1
                        className={`text-3xl font-bold bg-gradient-to-r ${tabGradients[activeTab as keyof typeof tabGradients]} bg-clip-text text-transparent`}
                    >
                        {tabTitles[activeTab as keyof typeof tabTitles]}
                    </h1>
                    <p className="text-muted-foreground mt-1">Análisis detallado y visualización de datos</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span>Generar Reporte</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span>Exportar</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            {exportFormats.map((format, index) => (
                                <DropdownMenuItem key={index} className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-xl">{format.icon}</span>
                                    <span>{format.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filtrar</span>
                    </Button>

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
                            <DropdownMenuItem onClick={() => setDateRange("custom")}>Personalizado</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Navegación principal */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                <TabsList className="bg-transparent h-auto p-0 flex w-full justify-start">
                                    <TabsTrigger
                                        value="financial"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        <span className="hidden sm:inline">Financieros</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="inventory"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span className="hidden sm:inline">Inventario</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="performance"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="hidden sm:inline">Desempeño</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="products"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span className="hidden sm:inline">Productos</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pos"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        <span className="hidden sm:inline">POS</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sales"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Ventas</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <TabsContent value="financial" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <FinancialReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>

                        <TabsContent value="inventory" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <InventoryReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>

                        <TabsContent value="performance" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <PerformanceReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>

                        <TabsContent value="products" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <ProductReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>

                        <TabsContent value="pos" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <PosReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>

                        <TabsContent value="sales" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <SalesReports agencyId={agencyId} user={user} dateRange={dateRange} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
