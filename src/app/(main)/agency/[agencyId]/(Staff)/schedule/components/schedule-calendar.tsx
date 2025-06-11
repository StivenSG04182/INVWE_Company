"use client"

import { useState, useEffect } from "react"
import { addDays, format, startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignScheduleDialog } from "./assign-schedule-dialog"
import { cn } from "@/lib/utils"
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from "@/lib/queries"
import { validateScheduleOverlap, generateComplianceAlerts, calculateHoursBetween } from "../utils/payroll-calculator"
import { isHoliday } from "../utils/holiday-utils"

interface ScheduleCalendarProps {
    teamMembers: any[]
    schedules: any[]
    holidays: any[]
    agencyId: string
}

export function ScheduleCalendar({
    teamMembers,
    schedules: initialSchedules,
    holidays,
    agencyId,
}: ScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedEmployee, setSelectedEmployee] = useState("all")
    const [viewMode, setViewMode] = useState<"week" | "month">("week")
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<string | null>(null)
    const [schedules, setSchedules] = useState(initialSchedules)
    const [alerts, setAlerts] = useState<any[]>([])

    // Cargar horarios y generar alertas
    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const loadedSchedules = await getSchedules(agencyId, selectedEmployee !== "all" ? selectedEmployee : undefined)
                setSchedules(loadedSchedules)

                // Generar alertas de cumplimiento
                const complianceAlerts = generateComplianceAlerts(loadedSchedules, holidays)
                setAlerts(complianceAlerts)
            } catch (error) {
                console.error("Error al cargar horarios:", error)
            }
        }

        loadSchedules()
    }, [agencyId, selectedEmployee, holidays])

    // Obtener el inicio de la semana (lunes) o mes
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Generar los días según el modo de vista
    const displayDays =
        viewMode === "week"
            ? Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
            : eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Función para obtener los horarios de un día específico
    const getDaySchedules = (date: Date) => {
        return schedules.filter((schedule) => {
            const currentDayName = format(date, "EEEE", { locale: es })
            const scheduleDays = JSON.parse(schedule.days || "[]")
            const isDayIncluded = scheduleDays.includes(currentDayName)

            return isDayIncluded && (selectedEmployee === "all" || schedule.userId === selectedEmployee)
        })
    }

    // Función para calcular la carga de trabajo del día
    const getDayWorkload = (date: Date) => {
        const daySchedules = getDaySchedules(date)
        const totalHours = daySchedules.reduce((sum, schedule) => {
            return sum + calculateHoursBetween(schedule.startTime, schedule.endTime, schedule.breakTime || "01:00")
        }, 0)

        if (totalHours === 0) return "none"
        if (totalHours <= 8) return "light"
        if (totalHours <= 16) return "medium"
        return "heavy"
    }

    // Función para abrir el diálogo de asignación
    const openAssignDialog = (day: Date, employeeId: string | null = null) => {
        setSelectedDay(day)
        setSelectedEmployeeForAssign(employeeId)
        setIsAssignDialogOpen(true)
    }

    // Navegación
    const goToPrevious = () => {
        const days = viewMode === "week" ? -7 : -30
        setCurrentDate(addDays(currentDate, days))
    }

    const goToNext = () => {
        const days = viewMode === "week" ? 7 : 30
        setCurrentDate(addDays(currentDate, days))
    }

    // Función mejorada para manejar la creación de un nuevo horario
    const handleCreateSchedule = async (scheduleData: {
        userId: string
        agencyId: string
        startTime: string
        endTime: string
        days: string
    }) => {
        try {
            // Validar solapamiento
            const daysArray = JSON.parse(scheduleData.days)
            const validation = validateScheduleOverlap(
                {
                    startTime: scheduleData.startTime,
                    endTime: scheduleData.endTime,
                    days: daysArray,
                },
                schedules,
                scheduleData.userId,
            )

            if (validation.hasOverlap) {
                throw new Error(`Conflicto de horarios detectado. El empleado ya tiene turnos asignados en estos horarios.`)
            }

            const newSchedule = await createSchedule({
                ...scheduleData,
                breakTime: "01:00",
                isOvertime: false,
                hourlyRate: 0
            })
            setSchedules((prev) => [...prev, newSchedule])

            // Regenerar alertas
            const complianceAlerts = generateComplianceAlerts([...schedules, newSchedule], holidays)
            setAlerts(complianceAlerts)
        } catch (error) {
            console.error("Error al crear horario:", error)
            throw error
        }
    }

    // Función para manejar la actualización de un horario
    const handleUpdateSchedule = async (
        scheduleId: string,
        scheduleData: Partial<{
            startTime: string
            endTime: string
            days: string
        }>,
    ) => {
        try {
            const updatedSchedule = await updateSchedule(scheduleId, scheduleData)
            setSchedules((prev) => prev.map((schedule) => (schedule.id === scheduleId ? updatedSchedule : schedule)))
            return updatedSchedule
        } catch (error) {
            console.error("Error al actualizar horario:", error)
            throw error
        }
    }

    // Función para manejar la eliminación de un horario
    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            await deleteSchedule(scheduleId)
            setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
        } catch (error) {
            console.error("Error al eliminar horario:", error)
            throw error
        }
    }

    return (
        <div className="space-y-4">
            {/* Alertas de cumplimiento */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.slice(0, 3).map((alert, index) => (
                        <Alert key={index} variant={alert.type === "error" ? "destructive" : "default"}>
                            {alert.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    ))}
                    {alerts.length > 3 && <p className="text-sm text-muted-foreground">+{alerts.length - 3} alertas más...</p>}
                </div>
            )}

            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex justify-between items-center">
                        <CardTitle>Calendario de Turnos</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={goToPrevious}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>
                                            {viewMode === "week"
                                                ? `${format(weekStart, "MMMM d", { locale: es })} - ${format(addDays(weekStart, 6), "MMMM d, yyyy", { locale: es })}`
                                                : format(currentDate, "MMMM yyyy", { locale: es })}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate}
                                        onSelect={(date) => date && setCurrentDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline" size="icon" onClick={goToNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription>
                        Visualice y gestione los horarios de sus empleados con indicadores de carga de trabajo
                    </CardDescription>
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger className="w-[200px]">
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
                            <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                                <TabsList>
                                    <TabsTrigger value="week">Semana</TabsTrigger>
                                    <TabsTrigger value="month">Mes</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <Button onClick={() => openAssignDialog(new Date())}>
                            <Plus className="mr-2 h-4 w-4" /> Asignar Horario
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className={cn("grid gap-1", viewMode === "week" ? "grid-cols-7" : "grid-cols-7")}>
                        {/* Encabezados de días para vista semanal */}
                        {viewMode === "week" &&
                            displayDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-2 text-center font-medium border-b",
                                        isHoliday(day).isHoliday ? "bg-red-50 text-red-600)" : "",
                                        isSameDay(day, new Date()) ? "bg-blue-50 text-blue-600" : "",
                                    )}
                                >
                                    <div>{format(day, "EEEE", { locale: es })}</div>
                                    <div className="text-sm">{format(day, "d MMM", { locale: es })}</div>
                                    {isHoliday(day).isHoliday && (
                                        <Badge variant="destructive" className="mt-1 text-xs">
                                            Festivo
                                        </Badge>
                                    )}
                                </div>
                            ))}

                        {/* Celdas de horarios */}
                        {displayDays.map((day, dayIndex) => {
                            const workload = getDayWorkload(day)
                            const daySchedules = getDaySchedules(day)

                            return (
                                <div
                                    key={dayIndex}
                                    className={cn(
                                        "min-h-[120px] p-2 border border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer relative",
                                        isHoliday(day).isHoliday ? "bg-red-100 text-red-700 border-red-200" : "",
                                        isSameDay(day, new Date()) ? "ring-2 ring-blue-200" : "",
                                        viewMode === "month" && "min-h-[80px]",
                                    )}
                                    onClick={() => openAssignDialog(day)}
                                >
                                    {/* Indicador de fecha para vista mensual */}
                                    {viewMode === "month" && <div className="text-xs font-medium mb-1">{format(day, "d")}</div>}

                                    {viewMode === "month" && isHoliday(day).isHoliday && (
                                        <Badge variant="destructive" className="mb-1 text-[10px]">
                                            Festivo
                                        </Badge>
                                    )}

                                    {/* Indicador de carga de trabajo */}
                                    <div
                                        className={cn(
                                            "absolute top-1 right-1 w-2 h-2 rounded-full",
                                            workload === "light" && "bg-green-400",
                                            workload === "medium" && "bg-yellow-400",
                                            workload === "heavy" && "bg-red-400",
                                            workload === "none" && "bg-gray-200",
                                        )}
                                    />

                                    {daySchedules.length > 0 ? (
                                        <div className="space-y-1">
                                            {daySchedules.slice(0, viewMode === "week" ? 3 : 2).map((schedule, idx) => {
                                                const employee = teamMembers.find((m) => m.id === schedule.userId)
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1 p-1 bg-primary/10 rounded-md text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openAssignDialog(day, schedule.userId)
                                                        }}
                                                    >
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={employee?.avatarUrl || "/placeholder.svg"} alt={employee?.name} />
                                                            <AvatarFallback className="text-[8px]">
                                                                {employee ? employee.name.slice(0, 2).toUpperCase() : "??"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{employee?.name || "Empleado"}</div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {schedule.startTime} - {schedule.endTime}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {daySchedules.length > (viewMode === "week" ? 3 : 2) && (
                                                <div className="text-xs text-muted-foreground text-center">
                                                    +{daySchedules.length - (viewMode === "week" ? 3 : 2)} más
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                                            <span>Sin turnos</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>Haga clic en cualquier celda para asignar un horario</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span>Carga ligera</span>
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span>Carga media</span>
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>Carga alta</span>
                        </div>
                    </div>
                    <div>Los días festivos se muestran en rojo</div>
                </CardFooter>

                {/* Diálogo para asignar horarios */}
                <AssignScheduleDialog
                    isOpen={isAssignDialogOpen}
                    onClose={() => setIsAssignDialogOpen(false)}
                    selectedDay={selectedDay}
                    selectedEmployee={selectedEmployeeForAssign}
                    teamMembers={teamMembers}
                    agencyId={agencyId}
                    onCreateSchedule={handleCreateSchedule}
                />
            </Card>
        </div>
    )
}
