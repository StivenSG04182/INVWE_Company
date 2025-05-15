"use client"

import { useState } from "react"
import { addDays, format, startOfWeek, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AssignScheduleDialog } from "./assign-schedule-dialog"
import { cn } from "@/lib/utils"

interface ScheduleCalendarProps {
    teamMembers: any[]
    schedules: any[]
    holidays: any[]
    agencyId: string
}

export function ScheduleCalendar({ teamMembers, schedules, holidays, agencyId }: ScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedEmployee, setSelectedEmployee] = useState("all")
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<string | null>(null)

    // Obtener el inicio de la semana (lunes)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })

    // Generar los días de la semana
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

    // Función para verificar si un día es festivo
    const isHoliday = (date: Date) => {
        return holidays.some((holiday) => isSameDay(new Date(holiday.date), date))
    }

    // Función para obtener los horarios de un día específico
    const getDaySchedules = (date: Date) => {
        return schedules.filter(
            (schedule) =>
                isSameDay(new Date(schedule.date), date) &&
                (selectedEmployee === "all" || schedule.userId === selectedEmployee),
        )
    }

    // Función para abrir el diálogo de asignación
    const openAssignDialog = (day: Date, employeeId: string | null = null) => {
        setSelectedDay(day)
        setSelectedEmployeeForAssign(employeeId)
        setIsAssignDialogOpen(true)
    }

    // Función para navegar a la semana anterior
    const goToPreviousWeek = () => {
        setCurrentDate(addDays(currentDate, -7))
    }

    // Función para navegar a la semana siguiente
    const goToNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7))
    }

    return (
        <Card className="col-span-2">
            <CardHeader className="space-y-1">
                <div className="flex justify-between items-center">
                    <CardTitle>Calendario de Turnos</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>
                                        {format(weekStart, "MMMM d", { locale: es })} -{" "}
                                        {format(addDays(weekStart, 6), "MMMM d, yyyy", { locale: es })}
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
                        <Button variant="outline" size="icon" onClick={goToNextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardDescription>Visualice y gestione los horarios semanales de sus empleados</CardDescription>
                <div className="flex justify-between items-center pt-2">
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
                    <Button onClick={() => openAssignDialog(new Date())}>
                        <Plus className="mr-2 h-4 w-4" /> Asignar Horario
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1">
                    {/* Encabezados de días */}
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className={cn("p-2 text-center font-medium border-b", isHoliday(day) ? "bg-red-50 text-red-600" : "")}
                        >
                            <div>{format(day, "EEEE", { locale: es })}</div>
                            <div className="text-sm">{format(day, "d MMM", { locale: es })}</div>
                            {isHoliday(day) && (
                                <Badge variant="destructive" className="mt-1">
                                    Festivo
                                </Badge>
                            )}
                        </div>
                    ))}

                    {/* Celdas de horarios */}
                    {weekDays.map((day, dayIndex) => (
                        <div
                            key={dayIndex}
                            className={cn(
                                "min-h-[150px] p-2 border border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors",
                                isHoliday(day) ? "bg-red-50/30" : "",
                            )}
                            onClick={() => openAssignDialog(day)}
                        >
                            {getDaySchedules(day).length > 0 ? (
                                <div className="space-y-2">
                                    {getDaySchedules(day).map((schedule, idx) => {
                                        const employee = teamMembers.find((m) => m.id === schedule.userId)
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 bg-primary/10 rounded-md text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openAssignDialog(day, schedule.userId)
                                                }}
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={employee?.avatarUrl || "/placeholder.svg"} alt={employee?.name} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {employee?.name?.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{employee?.name}</div>
                                                    <div>
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    <span>Sin turnos</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-muted-foreground">
                <div>Haga clic en cualquier celda para asignar un horario</div>
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
            />
        </Card>
    )
}
