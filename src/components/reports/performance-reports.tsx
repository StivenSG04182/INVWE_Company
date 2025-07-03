"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Target,
  Award,
  Loader2,
  Download,
  BarChart3,
  Activity,
  Star,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RosenChart } from "@/components/ui/rosen-chart"
import { getSalesReportsData, getReportStats, exportReportData } from "@/lib/reports-queries"

export default function PerformanceReports({
  agencyId,
  user,
  dateRange,
}: { agencyId: string; user: any; dateRange: string }) {
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const loadPerformanceData = useCallback(async () => {
    try {
      setIsLoading(true)
      // Obtener datos de ventas y estadísticas para calcular rendimiento
      const [salesData, statsData] = await Promise.all([
        getSalesReportsData(agencyId, dateRange),
        getReportStats(agencyId, dateRange),
      ])

      // Procesar datos para métricas de rendimiento
      const processedData = {
        kpis: {
          salesVsTarget: salesData.targetAchievement || 85,
          customerSatisfaction: 92,
          operationalEfficiency: Math.min(100, Math.round((statsData.totalValue / (statsData.totalValue * 1.3)) * 100)),
          customerRetention: 88,
          employeeProductivity: 91,
          qualityScore: 94,
        },
        departmentPerformance: [
          { name: "Ventas", value: 45, color: "rgb(59, 130, 246)" },
          { name: "Operaciones", value: 25, color: "rgb(16, 185, 129)" },
          { name: "Marketing", value: 20, color: "rgb(245, 158, 11)" },
          { name: "Soporte", value: 10, color: "rgb(139, 92, 246)" },
        ],
        performanceTrend: Array.from({ length: 12 }, (_, i) => ({
          month: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
          performance: Math.floor(Math.random() * 30) + 70,
          target: 85,
        })),
        teamPerformance:
          salesData.salespeople?.map((person: any) => ({
            name: person.name,
            department: "Ventas",
            productivity: Math.min(100, person.achievement),
            quality: Math.floor(Math.random() * 20) + 80,
            punctuality: Math.floor(Math.random() * 25) + 75,
            rating: person.achievement >= 90 ? "Excelente" : person.achievement >= 70 ? "Bueno" : "Regular",
            avatar: person.name.charAt(0),
          })) || [],
        monthlyKPIs: Array.from({ length: 6 }, (_, i) => ({
          month: ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
          efficiency: Math.floor(Math.random() * 20) + 80,
          satisfaction: Math.floor(Math.random() * 15) + 85,
          productivity: Math.floor(Math.random() * 25) + 75,
        })),
        availableReports: [
          {
            title: "Reporte de Productividad",
            description: "Análisis detallado de la productividad por empleado y departamento.",
            icon: "📊",
          },
          {
            title: "Reporte de Eficiencia",
            description: "Análisis de la eficiencia operativa y uso de recursos.",
            icon: "⚡",
          },
          {
            title: "Reporte de Calidad",
            description: "Análisis de la calidad del trabajo y servicios prestados.",
            icon: "⭐",
          },
          {
            title: "Reporte de Objetivos",
            description: "Seguimiento de objetivos y metas por departamento.",
            icon: "🎯",
          },
          {
            title: "Reporte de Capacitación",
            description: "Análisis de necesidades de capacitación y desarrollo.",
            icon: "📚",
          },
          {
            title: "Reporte de Tendencias",
            description: "Análisis de tendencias de desempeño a lo largo del tiempo.",
            icon: "📈",
          },
        ],
      }

      setPerformanceData(processedData)
    } catch (error) {
      console.error("Error al cargar datos de desempeño:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de desempeño",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [agencyId, dateRange])

  useEffect(() => {
    loadPerformanceData()
  }, [loadPerformanceData])

  const exportPerformance = async (format: string) => {
    try {
      setIsExporting(true)
      const result = await exportReportData(agencyId, "sales", format, dateRange, {
        reportType: "performance",
      })

      if (result && result.fileBase64 && result.fileName && result.mimeType) {
        // Convertir base64 a Blob
        const byteCharacters = atob(result.fileBase64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: result.mimeType })

        // Crear enlace temporal y disparar descarga
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.fileName
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)

        toast({
          title: "Exportación exitosa",
          description: `Reporte de desempeño exportado en formato ${format}`,
        })
      } else {
        throw new Error("No se pudo generar el archivo para exportar.")
      }
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay datos de desempeño disponibles</p>
      </div>
    )
  }

  // Configuración de gráficos
  const departmentPerformanceConfig = {
    type: "doughnut",
    data: {
      labels: performanceData.departmentPerformance.map((dept: any) => dept.name),
      datasets: [
        {
          data: performanceData.departmentPerformance.map((dept: any) => dept.value),
          backgroundColor: performanceData.departmentPerformance.map((dept: any) => dept.color + "CC"),
          borderColor: performanceData.departmentPerformance.map((dept: any) => dept.color),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: "Distribución por Departamento",
          font: { size: 14, weight: "bold" },
        },
      },
      cutout: "60%",
    },
  }

  const performanceTrendConfig = {
    type: "line",
    data: {
      labels: performanceData.performanceTrend.map((item: any) => item.month),
      datasets: [
        {
          label: "Desempeño Real",
          data: performanceData.performanceTrend.map((item: any) => item.performance),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
        {
          label: "Objetivo",
          data: performanceData.performanceTrend.map((item: any) => item.target),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderDash: [5, 5],
          tension: 0.4,
          pointBackgroundColor: "rgb(239, 68, 68)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Tendencia de Desempeño Mensual",
          font: { size: 14, weight: "bold" },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: any) => value + "%",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
    },
  }

  const kpiComparisonConfig = {
    type: "radar",
    data: {
      labels: ["Eficiencia", "Satisfacción", "Productividad", "Calidad", "Retención", "Objetivos"],
      datasets: [
        {
          label: "Desempeño Actual",
          data: [
            performanceData.kpis.operationalEfficiency,
            performanceData.kpis.customerSatisfaction,
            performanceData.kpis.employeeProductivity,
            performanceData.kpis.qualityScore,
            performanceData.kpis.customerRetention,
            performanceData.kpis.salesVsTarget,
          ],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Radar de KPIs",
          font: { size: 14, weight: "bold" },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
          },
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      {/* Header con botones de exportación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reportes de Desempeño
          </h1>
          <p className="text-muted-foreground mt-1">Análisis completo del rendimiento organizacional</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={isExporting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Exportar Reporte
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportPerformance("PDF")}>📄 Exportar PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPerformance("EXCEL")}>📊 Exportar Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPerformance("WORD")}>📝 Exportar Word</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPerformance("CSV")}>📋 Exportar CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPerformance("PNG")}>🖼️ Exportar PNG</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Ventas vs Objetivo</p>
                <p className="text-2xl font-bold text-blue-900">{performanceData.kpis.salesVsTarget}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.salesVsTarget}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Satisfacción Cliente</p>
                <p className="text-2xl font-bold text-green-900">{performanceData.kpis.customerSatisfaction}%</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-3 w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.customerSatisfaction}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Eficiencia Operativa</p>
                <p className="text-2xl font-bold text-amber-900">{performanceData.kpis.operationalEfficiency}%</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
            <div className="mt-3 w-full bg-amber-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.operationalEfficiency}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Retención Clientes</p>
                <p className="text-2xl font-bold text-purple-900">{performanceData.kpis.customerRetention}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.customerRetention}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-700">Productividad</p>
                <p className="text-2xl font-bold text-rose-900">{performanceData.kpis.employeeProductivity}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-rose-600" />
            </div>
            <div className="mt-3 w-full bg-rose-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-rose-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.employeeProductivity}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Calidad</p>
                <p className="text-2xl font-bold text-teal-900">{performanceData.kpis.qualityScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
            <div className="mt-3 w-full bg-teal-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${performanceData.kpis.qualityScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Desempeño por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RosenChart config={departmentPerformanceConfig} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tendencia de Desempeño
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RosenChart config={performanceTrendConfig} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Radar de KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RosenChart config={kpiComparisonConfig} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desempeño del Equipo */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Desempeño del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Empleado</th>
                  <th className="text-left p-4 font-semibold">Departamento</th>
                  <th className="text-left p-4 font-semibold">Productividad</th>
                  <th className="text-left p-4 font-semibold">Calidad</th>
                  <th className="text-left p-4 font-semibold">Puntualidad</th>
                  <th className="text-left p-4 font-semibold">Calificación</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.teamPerformance.length > 0 ? (
                  performanceData.teamPerformance.map((employee: any, index: number) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {employee.avatar}
                          </div>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {employee.department}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{employee.productivity}%</span>
                            {employee.productivity >= 90 ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`${
                                employee.productivity >= 90
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              } h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{employee.quality}%</span>
                            {employee.quality >= 90 ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`${
                                employee.quality >= 90
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              } h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${employee.quality}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{employee.punctuality}%</span>
                            {employee.punctuality >= 85 ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`${
                                employee.punctuality >= 85
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              } h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${employee.punctuality}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            employee.rating === "Excelente"
                              ? "default"
                              : employee.rating === "Bueno"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            employee.rating === "Excelente"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : employee.rating === "Bueno"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {employee.rating}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay datos de equipo disponibles</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reportes Disponibles */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Reportes Especializados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceData.availableReports.map((report: any, index: number) => (
              <Card
                key={index}
                className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-md group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{report.icon}</span>
                    <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{report.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                    onClick={() => exportPerformance("PDF")}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
