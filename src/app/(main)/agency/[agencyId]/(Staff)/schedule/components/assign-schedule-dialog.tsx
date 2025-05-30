"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, Clock } from "lucide-react"
import { calculateHoursBetween, LEGAL_CONSTANTS } from "../utils/payroll-calculator"

interface AssignScheduleDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedDay: Date | null
    selectedEmployee: string | null
    teamMembers: any[]
    agencyId: string
    onCreateSchedule: (scheduleData: any) => Promise<void>
}

export function AssignScheduleDialog({
    isOpen,
    onClose,
    selectedDay,
    selectedEmployee,
    teamMembers,
    agencyId,
    onCreateSchedule,
}: AssignScheduleDialogProps) {
    const [employeeId, setEmployeeId] = useState(selectedEmployee || "")
    const [startTime, setStartTime] = useState("08:00")
    const [endTime, setEndTime] = useState("17:00")
    const [breakTime, setBreakTime] = useState("01:00")
    const [isOvertime, setIsOvertime] = useState(false)
    const [hourlyRate, setHourlyRate] = useState(
        String(Math.round(LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS)),
    )
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    // Días de la semana
    const weekDays = [
        { value: "lunes", label: "Lunes" },
        { value: "martes", label: "Martes" },
        { value: "miércoles", label: "Miércoles" },
        { value: "jueves", label: "Jueves" },
        { value: "viernes", label: "Viernes" },
        { value: "sábado", label: "Sábado" },
        { value: "domingo", label: "Domingo" },
    ]

    // Calcular horas diarias y totales
    const dailyHours = calculateHoursBetween(startTime, endTime, breakTime)
    const totalWeeklyHours = dailyHours * selectedDays.length
    const estimatedDailyCost = dailyHours * Number.parseFloat(hourlyRate || "0")
    const estimatedTotalCost = estimatedDailyCost * selectedDays.length
    const isExcessiveHours = dailyHours > LEGAL_CONSTANTS.MAX_DAILY_HOURS

    // Inicializar días seleccionados basado en el día seleccionado
    useEffect(() => {
        if (selectedDay && isOpen) {
            const dayName = format(selectedDay, "EEEE", { locale: es }).toLowerCase()
            setSelectedDays([dayName])
        }
    }, [selectedDay, isOpen])

    // Validar formulario
    useEffect(() => {
        const errors: string[] = []

        if (!employeeId) {
            errors.push("Debe seleccionar un empleado")
        }

        if (selectedDays.length === 0) {
            errors.push("Debe seleccionar al menos un día")
        }

        if (startTime >= endTime) {
            errors.push("La hora de entrada debe ser anterior a la hora de salida")
        }

        // Validación modificada para el tiempo de descanso
        if (dailyHours === -1) {
            errors.push("El tiempo de descanso debe estar dentro del horario de trabajo")
        }

        if (isExcessiveHours && !isOvertime) {
            errors.push("El turno excede 8 horas diarias. Active 'Autorizar horas extras' para continuar")
        }

        if (dailyHours > 12) {
            errors.push("El turno no puede exceder 12 horas por razones de seguridad")
        }

        setValidationErrors(errors)
    }, [employeeId, selectedDays, startTime, endTime, dailyHours, isExcessiveHours, isOvertime])

    // Resetear el formulario
    const resetForm = () => {
        setEmployeeId(selectedEmployee || "")
        setStartTime("08:00")
        setEndTime("17:00")
        setBreakTime("01:00")
        setIsOvertime(false)
        setHourlyRate(String(Math.round(LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS)))
        setSelectedDays([])
        setValidationErrors([])
    }

    // Manejar cambio de días seleccionados
    const handleDayToggle = (day: string) => {
        setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
    }

    // Manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validationErrors.length > 0) {
            toast({
                title: "Errores de validación",
                description: "Por favor corrija los errores antes de continuar.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const scheduleData = {
                userId: employeeId,
                agencyId: agencyId,
                startTime: startTime,
                endTime: endTime,
                breakTime: breakTime,
                isOvertime: isOvertime,
                hourlyRate: Number.parseFloat(hourlyRate),
                days: JSON.stringify(selectedDays),
            }

            await onCreateSchedule(scheduleData)

            toast({
                title: "Horario asignado",
                description: `Horario asignado correctamente para ${selectedDays.join(", ")}.`,
            })

            onClose()
            resetForm()
        } catch (error: any) {
            console.error("Error al guardar el horario:", error)
            toast({
                title: "Error",
                description: error.message || "No se pudo asignar el horario. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                    resetForm()
                }
            }}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Asignar Horario de Trabajo</DialogTitle>
                    <DialogDescription>Configure el horario de trabajo para el empleado seleccionado</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Alertas de validación */}
                    {validationErrors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Selección de empleado */}
                    <div className="space-y-2">
                        <Label htmlFor="employee">Empleado *</Label>
                        <Select value={employeeId} onValueChange={setEmployeeId} required>
                            <SelectTrigger id="employee">
                                <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name} - {member.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selección de días */}
                    <div className="space-y-2">
                        <Label>Días de la semana *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {weekDays.map((day) => (
                                <div key={day.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={day.value}
                                        checked={selectedDays.includes(day.value)}
                                        onCheckedChange={() => handleDayToggle(day.value)}
                                    />
                                    <Label htmlFor={day.value} className="text-sm">
                                        {day.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Horarios */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Hora de entrada *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Hora de salida *</Label>
                            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="breakTime">Tiempo de descanso</Label>
                            <Input
                                id="breakTime"
                                type="time"
                                value={breakTime}
                                onChange={(e) => setBreakTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Valor por hora */}
                    <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Valor por hora (COP) *</Label>
                        <Input
                            id="hourlyRate"
                            type="text" // Cambiado de "number" a "text"
                            value={Number(hourlyRate).toLocaleString('es-CO')}
                            onChange={(e) => {
                                // Eliminar cualquier carácter que no sea número
                                const value = e.target.value.replace(/[^\d]/g, '')
                                setHourlyRate(value)
                            }}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Salario mínimo por hora: $
                            {Math.round(LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS).toLocaleString("es-CO")}
                        </p>
                    </div>

                    {/* Resumen del turno */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Resumen del turno
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Horas por día:</span>
                                <span className="ml-2 font-medium">{dailyHours.toFixed(1)} horas</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Costo diario:</span>
                                <span className="ml-2 font-medium">${estimatedDailyCost.toLocaleString("es-CO")}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total días seleccionados:</span>
                                <span className="ml-2 font-medium">{selectedDays.length} días</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total horas semanales:</span>
                                <span className="ml-2 font-medium">{totalWeeklyHours.toFixed(1)} horas</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground">Costo total estimado:</span>
                                <span className="ml-2 font-medium text-lg text-primary">
                                    ${estimatedTotalCost.toLocaleString("es-CO")}
                                </span>
                            </div>
                            {isExcessiveHours && (
                                <div className="col-span-2">
                                    <span className="text-amber-600">
                                        ⚠️ Excede {LEGAL_CONSTANTS.MAX_DAILY_HOURS} horas diarias (+
                                        {(dailyHours - LEGAL_CONSTANTS.MAX_DAILY_HOURS).toFixed(1)} hrs extras)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Opciones adicionales */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="overtime"
                            checked={isOvertime}
                            onCheckedChange={(checked) => setIsOvertime(checked === true)}
                        />
                        <Label htmlFor="overtime" className="text-sm">
                            Autorizar horas extras si es necesario
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || validationErrors.length > 0}>
                            {isLoading ? "Guardando..." : "Guardar Horario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
