"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from "recharts"
import { Users, Clock, DollarSign, AlertTriangle } from "lucide-react"
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { calculateEmployeePayroll, calculateTotalHours, LEGAL_CONSTANTS } from "../utils/payroll-calculator"

interface AnalyticsDashboardProps {
    teamMembers: any[]
    schedules: any[]
    holidays: any[]
    agencyId: string
}

export function AnalyticsDashboard({ teamMembers, schedules, holidays, agencyId }: AnalyticsDashboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("current-month")
    const [selectedMetric, setSelectedMetric] = useState("hours")

    // Colores para gráficos
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

    // Calcular métricas principales
    const metrics = useMemo(() => {
        const totalHours = calculateTotalHours(schedules)
        const totalEmployees = teamMembers.length
        const activeSchedules = schedules.filter((s) => s.isActive !== false).length

        // Calcular nómina total
        const totalPayroll = teamMembers.reduce((sum, employee) => {
            const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
            const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)
            return sum + payroll.totalAmount
        }, 0)

        // Calcular horas extras
        const totalOvertimeHours = teamMembers.reduce((sum, employee) => {
            const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
            const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)
            return sum + payroll.overtimeHours
        }, 0)

        // Empleados con problemas de cumplimiento
        const complianceIssues = teamMembers.filter((employee) => {
            const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
            const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)
            return payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS || payroll.dailyHoursExceeded > 0
        }).length

        return {
            totalHours,
            totalEmployees,
            activeSchedules,
            totalPayroll,
            totalOvertimeHours,
            complianceIssues,
            averageHoursPerEmployee: totalEmployees > 0 ? totalHours / totalEmployees : 0,
        }
    }, [schedules, teamMembers, holidays, selectedPeriod])

    // Datos para gráfico de horas por empleado
    const employeeHoursData = useMemo(() => {
        return teamMembers
            .map((employee) => {
                const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
                const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)

                return {
                    name: employee.name.split(" ")[0], // Solo primer nombre para el gráfico
                    fullName: employee.name,
                    regularHours: payroll.regularHours,
                    overtimeHours: payroll.overtimeHours,
                    nightHours: payroll.nightHours,
                    totalHours: payroll.regularHours + payroll.overtimeHours,
                    totalAmount: payroll.totalAmount,
                }
            })
            .sort((a, b) => b.totalHours - a.totalHours)
    }, [teamMembers, schedules, holidays, selectedPeriod])

    // Datos para gráfico de evolución semanal
    const weeklyEvolutionData = useMemo(() => {
        const weeks: { week: string; hours: number; payroll: number; employees: number }[] = []
        const currentDate = new Date()

        for (let i = 7; i >= 0; i--) {
            const weekStart = startOfWeek(subWeeks(currentDate, i), { weekStartsOn: 1 })
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

            const weekSchedules = schedules.filter((schedule) => {
                // Simplificado: asumimos que los horarios están activos en esas semanas
                return true
            })

            const weekHours = calculateTotalHours(weekSchedules) / 8 // Dividir por número de semanas simuladas
            const weekPayroll = teamMembers.reduce((sum, employee) => {
                const employeeSchedules = weekSchedules.filter((s) => s.userId === employee.id)
                const payroll = calculateEmployeePayroll(employeeSchedules, holidays, "current-week")
                return sum + payroll.totalAmount / 8 // Dividir por número de semanas simuladas
            }, 0)

            weeks.push({
                week: format(weekStart, "MMM d", { locale: es }),
                hours: Math.round(weekHours),
                payroll: Math.round(weekPayroll),
                employees: teamMembers.length,
            })
        }

        return weeks
    }, [schedules, teamMembers, holidays])

    // Datos para gráfico de distribución de tipos de horas
    const hoursDistributionData = useMemo(() => {
        const totals = teamMembers.reduce(
            (acc, employee) => {
                const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
                const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)

                acc.regular += payroll.regularHours
                acc.overtime += payroll.overtimeHours
                acc.night += payroll.nightHours
                acc.sunday += payroll.sundayHours
                acc.holiday += payroll.holidayHours

                return acc
            },
            { regular: 0, overtime: 0, night: 0, sunday: 0, holiday: 0 },
        )

        return [
            { name: "Horas Normales", value: totals.regular, color: "#0088FE" },
            { name: "Horas Extras", value: totals.overtime, color: "#00C49F" },
            { name: "Horas Nocturnas", value: totals.night, color: "#FFBB28" },
            { name: "Horas Dominicales", value: totals.sunday, color: "#FF8042" },
            { name: "Horas Festivas", value: totals.holiday, color: "#8884D8" },
        ].filter((item) => item.value > 0)
    }, [teamMembers, schedules, holidays, selectedPeriod])

    // Datos para análisis de cumplimiento
    const complianceData = useMemo(() => {
        return teamMembers.map((employee) => {
            const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
            const payroll = calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod)

            const weeklyCompliance = (payroll.weeklyHours / LEGAL_CONSTANTS.MAX_WEEKLY_HOURS) * 100
            const hasIssues = payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS || payroll.dailyHoursExceeded > 0

            return {
                name: employee.name,
                weeklyHours: payroll.weeklyHours,
                weeklyCompliance: Math.min(weeklyCompliance, 100),
                hasIssues,
                dailyExcess: payroll.dailyHoursExceeded,
                status: hasIssues ? "warning" : weeklyCompliance > 90 ? "high" : "normal",
            }
        })
    }, [teamMembers, schedules, holidays, selectedPeriod])

    return (
        <div className="space-y-6">
            {/* Controles */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Dashboard Analítico</h2>
                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current-week">Semana actual</SelectItem>
                            <SelectItem value="current-month">Mes actual</SelectItem>
                            <SelectItem value="previous-month">Mes anterior</SelectItem>
                            <SelectItem value="quarter">Último trimestre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Horas</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalHours.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.averageHoursPerEmployee.toFixed(1)} promedio por empleado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nómina Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalPayroll.toLocaleString("es-CO")}</div>
                        <p className="text-xs text-muted-foreground">{metrics.totalOvertimeHours.toFixed(1)} horas extras</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">{metrics.activeSchedules} horarios asignados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.complianceIssues === 0 ? (
                                <span className="text-green-600">✓</span>
                            ) : (
                                <span className="text-red-600">{metrics.complianceIssues}</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.complianceIssues === 0 ? "Sin problemas" : "Empleados con alertas"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos principales */}
            <Tabs defaultValue="hours" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hours">Análisis de Horas</TabsTrigger>
                    <TabsTrigger value="payroll">Análisis de Nómina</TabsTrigger>
                    <TabsTrigger value="compliance">Cumplimiento Legal</TabsTrigger>
                    <TabsTrigger value="trends">Tendencias</TabsTrigger>
                </TabsList>

                <TabsContent value="hours" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Horas por Empleado</CardTitle>
                                <CardDescription>Distribución de horas trabajadas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={employeeHoursData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} horas`,
                                                name === "regularHours"
                                                    ? "Horas Normales"
                                                    : name === "overtimeHours"
                                                        ? "Horas Extras"
                                                        : "Horas Nocturnas",
                                            ]}
                                        />
                                        <Bar dataKey="regularHours" stackId="a" fill="#0088FE" />
                                        <Bar dataKey="overtimeHours" stackId="a" fill="#00C49F" />
                                        <Bar dataKey="nightHours" stackId="a" fill="#FFBB28" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución de Tipos de Horas</CardTitle>
                                <CardDescription>Proporción de diferentes tipos de horas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={hoursDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {hoursDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payroll" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Costos por Empleado</CardTitle>
                            <CardDescription>Análisis de costos de nómina</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={employeeHoursData} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip formatter={(value) => [`$${value.toLocaleString("es-CO")}`, "Costo Total"]} />
                                    <Bar dataKey="totalAmount" fill="#0088FE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado de Cumplimiento Legal</CardTitle>
                            <CardDescription>Monitoreo de límites de jornada laboral</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {complianceData.map((employee, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{employee.name}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        employee.hasIssues ? "destructive" : employee.status === "high" ? "secondary" : "default"
                                                    }
                                                >
                                                    {employee.hasIssues ? "Excede límites" : employee.status === "high" ? "Carga alta" : "Normal"}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {employee.weeklyHours.toFixed(1)}h / {LEGAL_CONSTANTS.MAX_WEEKLY_HOURS}h
                                                </span>
                                            </div>
                                        </div>
                                        <Progress
                                            value={employee.weeklyCompliance}
                                            className={`h-2 ${employee.hasIssues ? "bg-red-100" : ""}`}
                                        />
                                        {employee.hasIssues && (
                                            <p className="text-xs text-red-600">⚠️ Excede límites legales de jornada laboral</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolución Semanal</CardTitle>
                            <CardDescription>Tendencias de horas y costos en las últimas 8 semanas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={weeklyEvolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="hours"
                                        stackId="1"
                                        stroke="#0088FE"
                                        fill="#0088FE"
                                        fillOpacity={0.6}
                                    />
                                    <Line yAxisId="right" type="monotone" dataKey="payroll" stroke="#00C49F" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
