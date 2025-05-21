"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function FinancialReports({
    agencyId,
    user,
    dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
    const [financialData, setFinancialData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [availableReports, setAvailableReports] = useState<any[]>([])

    useEffect(() => {
        // Simulación de carga de datos
        const loadData = async () => {
            try {
                // En una implementación real, aquí se llamaría a la API
                // await FinancialReportService.getFinancialStats(agencyId)

                // Datos de ejemplo
                setFinancialData({
                    totalRevenue: 245890,
                    totalExpenses: 156720,
                    netProfit: 89170,
                    profitMargin: 36.3,
                    monthlyFinancials: [
                        { month: "Ene", revenue: 18500, expenses: 12300 },
                        { month: "Feb", revenue: 19200, expenses: 12800 },
                        { month: "Mar", revenue: 20500, expenses: 13200 },
                        { month: "Abr", revenue: 19800, expenses: 12900 },
                        { month: "May", revenue: 21200, expenses: 13500 },
                        { month: "Jun", revenue: 22500, expenses: 14200 },
                        { month: "Jul", revenue: 21800, expenses: 13800 },
                        { month: "Ago", revenue: 22800, expenses: 14500 },
                        { month: "Sep", revenue: 23500, expenses: 14900 },
                        { month: "Oct", revenue: 24200, expenses: 15300 },
                        { month: "Nov", revenue: 25800, expenses: 16200 },
                        { month: "Dic", revenue: 27500, expenses: 17200 },
                    ],
                    expenseCategories: [
                        { name: "Personal", amount: 78360, percentage: 50 },
                        { name: "Operaciones", amount: 31344, percentage: 20 },
                        { name: "Marketing", amount: 23508, percentage: 15 },
                        { name: "Tecnología", amount: 15672, percentage: 10 },
                        { name: "Otros", amount: 7836, percentage: 5 },
                    ],
                    recentTransactions: [
                        { id: 1, description: "Venta mayorista", type: "ingreso", amount: 12500, date: "2023-10-15" },
                        { id: 2, description: "Pago de nómina", type: "gasto", amount: 8450, date: "2023-10-14" },
                        { id: 3, description: "Venta minorista", type: "ingreso", amount: 3500, date: "2023-10-13" },
                        { id: 4, description: "Servicios públicos", type: "gasto", amount: 1250, date: "2023-10-12" },
                        { id: 5, description: "Venta en línea", type: "ingreso", amount: 4750, date: "2023-10-11" },
                    ],
                })

                setAvailableReports([
                    {
                        id: "income-statement",
                        title: "Estado de Resultados",
                        description: "Reporte detallado de ingresos y gastos del período.",
                    },
                    {
                        id: "balance-sheet",
                        title: "Balance General",
                        description: "Estado financiero que muestra activos, pasivos y patrimonio.",
                    },
                    {
                        id: "cash-flow",
                        title: "Flujo de Efectivo",
                        description: "Análisis de entradas y salidas de efectivo.",
                    },
                    {
                        id: "tax-report",
                        title: "Reporte de Impuestos",
                        description: "Resumen de impuestos pagados y por pagar.",
                    },
                    {
                        id: "expense-analysis",
                        title: "Análisis de Gastos",
                        description: "Desglose detallado de gastos por categoría.",
                    },
                    {
                        id: "profit-loss",
                        title: "Ganancias y Pérdidas",
                        description: "Análisis comparativo de ganancias y pérdidas.",
                    },
                ])

                setIsLoading(false)
            } catch (error) {
                console.error("Error al cargar datos financieros:", error)
                setIsLoading(false)
            }
        }

        loadData()
    }, [agencyId, dateRange])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Panel de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                    <h3 className="text-lg font-medium mb-2">Ingresos Totales</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">${financialData?.totalRevenue?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+8.5% vs. período anterior</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
                    <h3 className="text-lg font-medium mb-2">Gastos Totales</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">${financialData.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+5.2% vs. período anterior</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <h3 className="text-lg font-medium mb-2">Beneficio Neto</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">${financialData.netProfit.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+12.8% vs. período anterior</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                    <h3 className="text-lg font-medium mb-2">Margen de Beneficio</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{financialData.profitMargin}%</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+1.5% vs. período anterior</span>
                    </div>
                </div>
            </div>

            {/* Visualizaciones estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Histograma - Ingresos vs Gastos */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Ingresos vs Gastos</h3>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>2023</span>
                            </button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-1 p-4 bg-muted/30 rounded-md relative">
                        {/* Eje Y */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between items-start pr-2">
                            <span className="text-xs text-muted-foreground">$30k</span>
                            <span className="text-xs text-muted-foreground">$20k</span>
                            <span className="text-xs text-muted-foreground">$10k</span>
                            <span className="text-xs text-muted-foreground">$0</span>
                        </div>

                        {/* Barras del histograma */}
                        <div className="flex-1 h-full flex items-end justify-between pl-6">
                            {financialData.monthlyFinancials.map((month: any, index: number) => {
                                const revenueHeight = (month.revenue / 30000) * 100
                                const expenseHeight = (month.expenses / 30000) * 100
                                return (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="flex items-end h-full">
                                            <div
                                                className="w-4 bg-gradient-to-t from-green-500 to-teal-400 rounded-t-sm mr-1"
                                                style={{ height: `${revenueHeight}%` }}
                                            />
                                            <div
                                                className="w-4 bg-gradient-to-t from-red-500 to-rose-400 rounded-t-sm"
                                                style={{ height: `${expenseHeight}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1">{month.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-center gap-6">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-teal-400 rounded-sm mr-2"></div>
                            <span className="text-xs text-muted-foreground">Ingresos</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-t from-red-500 to-rose-400 rounded-sm mr-2"></div>
                            <span className="text-xs text-muted-foreground">Gastos</span>
                        </div>
                    </div>
                </div>

                {/* Gráfico Radial - Distribución de Gastos */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Distribución de Gastos</h3>
                        <button className="text-sm text-primary hover:underline">Ver detalles</button>
                    </div>

                    <div className="flex">
                        <div className="w-1/2">
                            <div className="aspect-square relative">
                                {/* Simulación de gráfico radial */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-8 border-red-500/20 relative">
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-red-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 0% 0%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-amber-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 100% 0%, 100% 40%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-blue-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 100% 40%, 100% 70%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-green-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 100% 70%, 100% 100%)" }}
                                        ></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-purple-500/30"
                                            style={{ clipPath: "polygon(50% 50%, 0% 100%, 100% 100%)" }}
                                        ></div>

                                        {/* Líneas radiales */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full h-[1px] bg-border origin-center"
                                                style={{ transform: `rotate(${i * 72}deg)` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 flex flex-col justify-center">
                            {financialData.expenseCategories.map((category: any, index: number) => (
                                <div key={index} className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{
                                                backgroundColor: [
                                                    "rgb(239, 68, 68)",
                                                    "rgb(245, 158, 11)",
                                                    "rgb(59, 130, 246)",
                                                    "rgb(16, 185, 129)",
                                                    "rgb(139, 92, 246)",
                                                ][index % 5],
                                            }}
                                        ></div>
                                        <span className="text-sm">{category.name}</span>
                                    </div>
                                    <span className="text-sm font-medium">{category.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabla de transacciones recientes */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 md:col-span-2 mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Transacciones Recientes</h3>
                        <Link href="#" className="text-sm text-primary hover:underline">
                            Ver todas
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium">Descripción</th>
                                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                                    <th className="text-left py-3 px-4 font-medium">Monto</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData.recentTransactions.length > 0 ? (
                                    financialData.recentTransactions.map((transaction: any) => (
                                        <tr key={transaction.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">{transaction.description}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${transaction.type === "ingreso" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
                                                >
                                                    {transaction.type === "ingreso" ? "↑ Ingreso" : "↓ Gasto"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={
                                                        transaction.type === "ingreso"
                                                            ? "text-green-600 dark:text-green-400"
                                                            : "text-red-600 dark:text-red-400"
                                                    }
                                                >
                                                    {transaction.type === "ingreso" ? "+" : "-"}${transaction.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{transaction.date}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-primary hover:text-primary/80 transition-colors">
                                                    <ArrowDownToLine className="h-4 w-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                            No hay transacciones recientes disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reportes Disponibles */}
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 md:col-span-2 mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Reportes Disponibles</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableReports.length > 0 ? (
                            availableReports.map((report: any, index: number) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
                                >
                                    <h4 className="font-medium">{report.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                                    <Button variant="link" className="mt-4 p-0 h-auto text-primary text-sm hover:underline">
                                        Generar Reporte
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-muted-foreground p-4 border rounded-md">
                                No hay reportes disponibles en este momento
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
