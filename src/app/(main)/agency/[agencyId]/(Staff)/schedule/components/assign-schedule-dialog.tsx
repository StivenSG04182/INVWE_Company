"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"

interface AssignScheduleDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedDay: Date | null
    selectedEmployee: string | null
    teamMembers: any[]
    agencyId: string
}

export function AssignScheduleDialog({
    isOpen,
    onClose,
    selectedDay,
    selectedEmployee,
    teamMembers,
    agencyId,
}: AssignScheduleDialogProps) {
    const [employeeId, setEmployeeId] = useState(selectedEmployee || "")
    const [startTime, setStartTime] = useState("08:00")
    const [endTime, setEndTime] = useState("17:00")
    const [breakTime, setBreakTime] = useState("01:00")
    const [isOvertime, setIsOvertime] = useState(false)
    const [hourlyRate, setHourlyRate] = useState("4500") // Valor por hora en pesos colombianos
    const [isLoading, setIsLoading] = useState(false)

    // Resetear el formulario cuando cambia el diálogo
    const resetForm = () => {
        setEmployeeId(selectedEmployee || "")
        setStartTime("08:00")
        setEndTime("17:00")
        setBreakTime("01:00")
        setIsOvertime(false)
        setHourlyRate("4500")
    }

    // Manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedDay || !employeeId) {
            toast({
                title: "Error",
                description: "Por favor seleccione un empleado y una fecha válida.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            // Aquí iría la lógica para guardar el horario en la base de datos
            // Por ahora simulamos una operación asíncrona
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Horario asignado",
                description: `Horario asignado correctamente para el ${format(selectedDay, "PPP", { locale: es })}.`,
            })

            onClose()
            resetForm()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo asignar el horario. Inténtelo de nuevo.",
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Asignar Horario de Trabajo</DialogTitle>
                    <DialogDescription>
                        {selectedDay
                            ? `Configurar horario para el ${format(selectedDay, "EEEE d 'de' MMMM, yyyy", { locale: es })}`
                            : "Seleccione un empleado y configure su horario"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee">Empleado</Label>
                        <Select value={employeeId} onValueChange={setEmployeeId} required>
                            <SelectTrigger id="employee">
                                <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {teamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Hora de entrada</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Hora de salida</Label>
                            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="breakTime">Tiempo de descanso (horas)</Label>
                            <Input
                                id="breakTime"
                                type="time"
                                value={breakTime}
                                onChange={(e) => setBreakTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Valor por hora (COP)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Horario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
