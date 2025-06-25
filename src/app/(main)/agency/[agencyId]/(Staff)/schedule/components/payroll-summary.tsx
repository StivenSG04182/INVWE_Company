"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, FileSpreadsheet, Info, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateEmployeePayroll, LEGAL_CONSTANTS } from "../utils/payroll-calculator"

interface PayrollSummaryProps {
    teamMembers: any[]
    schedules: any[]
    holidays: any[]
}

export function PayrollSummary({ teamMembers, schedules, holidays }: PayrollSummaryProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("current-month")
    const [selectedEmployee, setSelectedEmployee] = useState("all")

    // Calcular la nómina para cada empleado
    const payrollData = teamMembers.map((employee) => {
        const employeeSchedules = schedules.filter((s) => s.userId === employee.id)
        return {
            ...employee,
            payroll: calculateEmployeePayroll(employeeSchedules, holidays, selectedPeriod),
        }
    })

    // Filtrar por empleado seleccionado
    const filteredPayroll =
        selectedEmployee === "all" ? payrollData : payrollData.filter((p) => p.id === selectedEmployee)

    // Calcular totales
    const totalRegularHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.regularHours, 0)
    const totalOvertimeHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.overtimeHours, 0)
    const totalNightHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.nightHours, 0)
    const totalSundayHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.sundayHours, 0)
    const totalHolidayHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.holidayHours, 0)
    const totalAmount = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.totalAmount, 0)
    const totalWeeklyHours = filteredPayroll.reduce((sum, emp) => sum + emp.payroll.weeklyHours, 0)

    // Detectar empleados con problemas de cumplimiento
    const complianceIssues = filteredPayroll.filter(
        (emp) => emp.payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS || emp.payroll.dailyHoursExceeded > 0,
    )

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Resumen de Nómina</CardTitle>
                <CardDescription>Cálculo de pagos según la legislación colombiana 2025</CardDescription>
                <div className="flex flex-col gap-2 pt-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current-week">Semana actual</SelectItem>
                            <SelectItem value="current-month">Mes actual</SelectItem>
                            <SelectItem value="previous-month">Mes anterior</SelectItem>
                            <SelectItem value="custom">Período personalizado</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los empleados</SelectItem>
                            {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                {/* Alertas de cumplimiento */}
                {complianceIssues.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {complianceIssues.length} empleado(s) exceden los límites legales de jornada laboral
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Resumen</TabsTrigger>
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Horas normales:</span>
                                <span className="font-medium">{totalRegularHours.toFixed(1)} hrs</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center">
                                    <span className="text-muted-foreground">Horas extras:</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">
                                                    Recargo del {LEGAL_CONSTANTS.OVERTIME_SURCHARGE * 100}% sobre hora normal
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium">{totalOvertimeHours.toFixed(1)} hrs</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center">
                                    <span className="text-muted-foreground">Horas nocturnas:</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">
                                                    Recargo del {LEGAL_CONSTANTS.NIGHT_OVERTIME_SURCHARGE * 100}% (9 PM - 6 AM)
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium">{totalNightHours.toFixed(1)} hrs</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center">
                                    <span className="text-muted-foreground">Horas dominicales:</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">
                                                    Recargo del {LEGAL_CONSTANTS.SUNDAY_SURCHARGE * 100}% sobre hora normal
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium">{totalSundayHours.toFixed(1)} hrs</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center">
                                    <span className="text-muted-foreground">Horas festivas:</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">
                                                    Recargo del {LEGAL_CONSTANTS.HOLIDAY_SURCHARGE * 100}% sobre hora normal
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <span className="font-medium">{totalHolidayHours.toFixed(1)} hrs</span>
                            </div>

                            {/* Progreso de horas semanales */}
                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Horas semanales:</span>
                                    <span className="font-medium">
                                        {totalWeeklyHours.toFixed(1)} / {LEGAL_CONSTANTS.MAX_WEEKLY_HOURS} hrs
                                    </span>
                                </div>
                                <Progress value={(totalWeeklyHours / LEGAL_CONSTANTS.MAX_WEEKLY_HOURS) * 100} className="h-2" />
                            </div>

                            <div className="pt-2 mt-2 border-t flex justify-between font-semibold">
                                <span>Total a pagar:</span>
                                <span className="text-primary">${totalAmount.toLocaleString("es-CO")}</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="pt-4">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {filteredPayroll.length > 0 ? (
                                filteredPayroll.map((employee) => (
                                    <div key={employee.id} className="space-y-2 pb-3 border-b last:border-0">
                                        <div className="font-medium flex items-center justify-between">
                                            <span>{employee.name}</span>
                                            {(employee.payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS ||
                                                employee.payroll.dailyHoursExceeded > 0) && (
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            <div className="text-muted-foreground">Horas normales:</div>
                                            <div className="text-right">{employee.payroll.regularHours.toFixed(1)} hrs</div>

                                            <div className="text-muted-foreground">Valor hora:</div>
                                            <div className="text-right">${employee.payroll.hourlyRate.toLocaleString("es-CO")}</div>

                                            <div className="text-muted-foreground">Horas extras:</div>
                                            <div className="text-right">{employee.payroll.overtimeHours.toFixed(1)} hrs</div>

                                            <div className="text-muted-foreground">Horas nocturnas:</div>
                                            <div className="text-right">{employee.payroll.nightHours.toFixed(1)} hrs</div>

                                            <div className="text-muted-foreground">Recargo dominical:</div>
                                            <div className="text-right">${employee.payroll.sundaySurcharge.toLocaleString("es-CO")}</div>

                                            <div className="text-muted-foreground">Recargo festivo:</div>
                                            <div className="text-right">${employee.payroll.holidaySurcharge.toLocaleString("es-CO")}</div>

                                            <div className="font-medium col-span-2 pt-1 mt-1 border-t flex justify-between">
                                                <span>Total:</span>
                                                <span>${employee.payroll.totalAmount.toLocaleString("es-CO")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">No hay datos de nómina disponibles</div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="compliance" className="pt-4">
                        <div className="space-y-3">
                            <div className="text-sm font-medium">Límites legales colombianos:</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jornada máxima diaria:</span>
                                    <span>{LEGAL_CONSTANTS.MAX_DAILY_HOURS} horas</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jornada máxima semanal:</span>
                                    <span>{LEGAL_CONSTANTS.MAX_WEEKLY_HOURS} horas</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Salario mínimo 2025:</span>
                                    <span>${LEGAL_CONSTANTS.MINIMUM_WAGE.toLocaleString("es-CO")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Auxilio de transporte:</span>
                                    <span>${LEGAL_CONSTANTS.TRANSPORT_ALLOWANCE.toLocaleString("es-CO")}</span>
                                </div>
                            </div>

                            {complianceIssues.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-medium text-destructive mb-2">Empleados con incumplimientos:</div>
                                    <div className="space-y-2">
                                        {complianceIssues.map((employee) => (
                                            <div key={employee.id} className="text-sm p-2 bg-destructive/10 rounded">
                                                <div className="font-medium">{employee.name}</div>
                                                {employee.payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS && (
                                                    <div className="text-destructive">
                                                        • Excede {LEGAL_CONSTANTS.MAX_WEEKLY_HOURS}h semanales (
                                                        {employee.payroll.weeklyHours.toFixed(1)}h)
                                                    </div>
                                                )}
                                                {employee.payroll.dailyHoursExceeded > 0 && (
                                                    <div className="text-destructive">• Excede {LEGAL_CONSTANTS.MAX_DAILY_HOURS}h diarias</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Vista previa
                </Button>
                <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            </CardFooter>
        </Card>
    )
}
