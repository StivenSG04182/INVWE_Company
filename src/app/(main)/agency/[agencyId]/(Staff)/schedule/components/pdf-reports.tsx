"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, Download, FileText, Printer, Eye } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import { calculateEmployeePayroll, calculateTotalHours } from "../utils/payroll-calculator"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface PDFReportsProps {
    teamMembers: any[]
    schedules: any[]
    holidays: any[]
    agencyId: string
}

export function PDFReports({ teamMembers, schedules, holidays = [], agencyId }: PDFReportsProps) {
    const [selectedReport, setSelectedReport] = useState("payroll")
    const [selectedPeriod, setSelectedPeriod] = useState("current-month")
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
    const [customStartDate, setCustomStartDate] = useState<Date>()
    const [customEndDate, setCustomEndDate] = useState<Date>()
    const [isGenerating, setIsGenerating] = useState(false)
    const [includeCharts, setIncludeCharts] = useState(true)
    const [includeDetails, setIncludeDetails] = useState(true)
    const [includeCompliance, setIncludeCompliance] = useState(true)

    const reportTypes = [
        {
            id: "payroll",
            name: "Reporte de Nómina",
            description: "Cálculo detallado de pagos y horas trabajadas",
            icon: "💰",
        },
        {
            id: "attendance",
            name: "Reporte de Asistencia",
            description: "Registro de horarios y cumplimiento",
            icon: "📅",
        },
        {
            id: "overtime",
            name: "Reporte de Horas Extras",
            description: "Análisis de horas extras y recargos",
            icon: "⏰",
        },
        {
            id: "compliance",
            name: "Reporte de Cumplimiento",
            description: "Verificación de límites legales laborales",
            icon: "⚖️",
        },
        {
            id: "vacation",
            name: "Reporte de Vacaciones",
            description: "Estado de vacaciones y permisos",
            icon: "🏖️",
        },
        {
            id: "summary",
            name: "Resumen Ejecutivo",
            description: "Resumen general de la operación",
            icon: "📊",
        },
    ]

    // Función para generar el contenido del PDF
    const generatePDFContent = () => {
        const selectedEmployeeData =
            selectedEmployees.length > 0 ? teamMembers.filter((member) => selectedEmployees.includes(member.id)) : teamMembers

        const reportData = selectedEmployeeData.map((employee) => {
            const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
            const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)

            return {
                employee,
                schedules: employeeSchedules,
                payroll,
                totalHours: calculateTotalHours(employeeSchedules),
            }
        })

        return {
            reportType: selectedReport,
            period: selectedPeriod,
            generatedAt: new Date(),
            employees: reportData,
            summary: {
                totalEmployees: selectedEmployeeData.length,
                totalHours: reportData.reduce((sum, emp) => sum + emp.totalHours, 0),
                totalPayroll: reportData.reduce((sum, emp) => sum + emp.payroll.totalAmount, 0),
                totalOvertimeHours: reportData.reduce((sum, emp) => sum + emp.payroll.overtimeHours, 0),
            },
        }
    }

    // Función para generar PDF (simulada)
    const generatePDF = async () => {
        setIsGenerating(true)

        try {
            const reportData = generatePDFContent()
            const reportType = reportTypes.find((r) => r.id === selectedReport)

            if (!reportType) {
                toast({
                    title: "Error",
                    description: "Tipo de reporte no válido.",
                    variant: "destructive",
                })
                setIsGenerating(false)
                return
            }

            if (!reportData.employees || reportData.employees.length === 0) {
                toast({
                    title: "Error",
                    description: "No hay empleados seleccionados para el reporte.",
                    variant: "destructive",
                })
                setIsGenerating(false)
                return
            }

            const doc = new jsPDF()

            // Título
            doc.setFontSize(18)
            doc.text(`${reportType?.icon} ${reportType?.name}`, 14, 18)

            // Resumen
            doc.setFontSize(12)
            doc.text(`Período: ${selectedPeriod}`, 14, 28)
            doc.text(`Generado: ${format(new Date(), "PPP", { locale: es })}`, 14, 36)

            doc.text("Resumen:", 14, 48)
            doc.text(`- Empleados: ${reportData.summary.totalEmployees}`, 14, 56)
            doc.text(`- Horas totales: ${reportData.summary.totalHours.toFixed(1)}`, 14, 64)
            doc.text(`- Nómina total: $${reportData.summary.totalPayroll.toLocaleString("es-CO")}`, 14, 72)
            doc.text(`- Horas extras: ${reportData.summary.totalOvertimeHours.toFixed(1)}`, 14, 80)

            // Detalle por empleado (usando autoTable para mejor formato)
            const tableData = reportData.employees.map(emp => [
                String(emp.employee.name ?? ""),
                String(emp.payroll.regularHours?.toFixed(1) ?? "0.0"),
                String(emp.payroll.overtimeHours?.toFixed(1) ?? "0.0"),
                String(emp.payroll.nightHours?.toFixed(1) ?? "0.0"),
                `$${emp.payroll.totalAmount?.toLocaleString("es-CO") ?? "0"}`
            ])

            console.log("tableData", tableData);

            try {
                doc.autoTable({
                    head: [["Col1", "Col2"]],
                    body: [["A", "B"], ["C", "D"]],
                    startY: 90,
                });
            } catch (err) {
                console.error("Error en autoTable:", err);
                toast({
                    title: "Error",
                    description: "Error al generar la tabla del PDF.",
                    variant: "destructive",
                });
                setIsGenerating(false);
                return;
            }

            // Descargar PDF
            doc.save(`${reportType?.name.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`)

            toast({
                title: "Reporte generado",
                description: `El reporte "${reportType?.name}" ha sido descargado exitosamente.`,
            })
        } catch (error) {
            console.error("Error al generar PDF:", error)
            toast({
                title: "Error",
                description: "No se pudo generar el reporte. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    // Función para vista previa
    const previewReport = () => {
        const reportData = generatePDFContent()
        const reportType = reportTypes.find((r) => r.id === selectedReport)

        // Abrir modal o nueva ventana con vista previa
        const previewWindow = window.open("", "_blank")
        if (previewWindow) {
            previewWindow.document.write(`
        <html>
          <head>
            <title>Vista Previa - ${reportType?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
              .employee { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
              .employee h3 { margin-top: 0; color: #333; }
              .metric { display: inline-block; margin-right: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportType?.icon} ${reportType?.name}</h1>
              <p><strong>Período:</strong> ${selectedPeriod}</p>
              <p><strong>Generado:</strong> ${format(new Date(), "PPP", { locale: es })}</p>
            </div>
            
            <div class="summary">
              <h2>Resumen General</h2>
              <div class="metric"><strong>Empleados:</strong> ${reportData.summary.totalEmployees}</div>
              <div class="metric"><strong>Horas totales:</strong> ${reportData.summary.totalHours.toFixed(1)}</div>
              <div class="metric"><strong>Nómina total:</strong> $${reportData.summary.totalPayroll.toLocaleString("es-CO")}</div>
              <div class="metric"><strong>Horas extras:</strong> ${reportData.summary.totalOvertimeHours.toFixed(1)}</div>
            </div>
            
            <h2>Detalle por Empleado</h2>
            ${reportData.employees
                    .map(
                        (emp) => `
              <div class="employee">
                <h3>${emp.employee.name}</h3>
                <div class="metric"><strong>Horas normales:</strong> ${emp.payroll.regularHours.toFixed(1)}</div>
                <div class="metric"><strong>Horas extras:</strong> ${emp.payroll.overtimeHours.toFixed(1)}</div>
                <div class="metric"><strong>Horas nocturnas:</strong> ${emp.payroll.nightHours.toFixed(1)}</div>
                <div class="metric"><strong>Total a pagar:</strong> $${emp.payroll.totalAmount.toLocaleString("es-CO")}</div>
              </div>
            `,
                    )
                    .join("")}
          </body>
        </html>
      `)
            previewWindow.document.close()
        }
    }

    const handleEmployeeToggle = (employeeId: string) => {
        setSelectedEmployees((prev) =>
            prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
        )
    }

    const selectAllEmployees = () => {
        setSelectedEmployees(teamMembers.map((member) => member.id))
    }

    const clearEmployeeSelection = () => {
        setSelectedEmployees([])
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generador de Reportes PDF
                    </CardTitle>
                    <CardDescription>Genere reportes detallados en formato PDF para análisis y archivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Selección de tipo de reporte */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Tipo de Reporte</Label>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {reportTypes.map((report) => (
                                <div
                                    key={report.id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedReport === report.id
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                    onClick={() => setSelectedReport(report.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{report.icon}</span>
                                        <div>
                                            <h4 className="font-medium">{report.name}</h4>
                                            <p className="text-sm text-muted-foreground">{report.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selección de período */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Período del Reporte</Label>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Período predefinido</Label>
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="current-week">Semana actual</SelectItem>
                                        <SelectItem value="current-month">Mes actual</SelectItem>
                                        <SelectItem value="previous-month">Mes anterior</SelectItem>
                                        <SelectItem value="quarter">Último trimestre</SelectItem>
                                        <SelectItem value="year">Año actual</SelectItem>
                                        <SelectItem value="custom">Período personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPeriod === "custom" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Fecha inicio</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {customStartDate ? format(customStartDate, "PPP", { locale: es }) : "Seleccionar"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fecha fin</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {customEndDate ? format(customEndDate, "PPP", { locale: es }) : "Seleccionar"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selección de empleados */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">Empleados a Incluir</Label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAllEmployees}>
                                    Seleccionar todos
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearEmployeeSelection}>
                                    Limpiar selección
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={member.id}
                                        checked={selectedEmployees.includes(member.id)}
                                        onCheckedChange={() => handleEmployeeToggle(member.id)}
                                    />
                                    <Label htmlFor={member.id} className="text-sm font-normal">
                                        {member.name}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        {selectedEmployees.length > 0 && (
                            <Badge variant="outline">{selectedEmployees.length} empleado(s) seleccionado(s)</Badge>
                        )}
                    </div>

                    {/* Opciones del reporte */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Opciones del Reporte</Label>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="includeCharts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
                                <Label htmlFor="includeCharts" className="text-sm">
                                    Incluir gráficos
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="includeDetails" checked={includeDetails} onCheckedChange={setIncludeDetails} />
                                <Label htmlFor="includeDetails" className="text-sm">
                                    Incluir detalles
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="includeCompliance" checked={includeCompliance} onCheckedChange={setIncludeCompliance} />
                                <Label htmlFor="includeCompliance" className="text-sm">
                                    Incluir cumplimiento legal
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Vista previa del reporte */}
                    {selectedEmployees.length > 0 && (
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <h4 className="font-medium">Vista Previa del Reporte</h4>
                            <div className="grid gap-2 text-sm">
                                <div>
                                    <strong>Tipo:</strong> {reportTypes.find((r) => r.id === selectedReport)?.name}
                                </div>
                                <div>
                                    <strong>Período:</strong> {selectedPeriod}
                                </div>
                                <div>
                                    <strong>Empleados:</strong> {selectedEmployees.length} de {teamMembers.length}
                                </div>
                                <div>
                                    <strong>Opciones:</strong>
                                    {includeCharts && " Gráficos"}
                                    {includeDetails && " Detalles"}
                                    {includeCompliance && " Cumplimiento"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={previewReport} disabled={selectedEmployees.length === 0}>
                            <Eye className="h-4 w-4 mr-2" />
                            Vista Previa
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={generatePDF} disabled={isGenerating || selectedEmployees.length === 0}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>

                            <Button onClick={generatePDF} disabled={isGenerating || selectedEmployees.length === 0}>
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Descargar PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Generando reporte...</span>
                                <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
