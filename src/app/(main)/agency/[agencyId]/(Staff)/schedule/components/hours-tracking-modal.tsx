"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Plus, Clock, Trash2, Calculator } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LEGAL_CONSTANTS } from "../utils/payroll-calculator"

interface HourEntry {
    id: string
    type: "regular" | "overtime" | "night" | "sunday" | "holiday" | "sick" | "vacation"
    hours: number
    date: Date
    description?: string
    rate: number
    amount: number
}

interface HoursTrackingModalProps {
    isOpen: boolean
    onClose: () => void
    employeeId: string
    employeeName: string
    onSave: (entries: HourEntry[]) => void
}

export function HoursTrackingModal({ isOpen, onClose, employeeId, employeeName, onSave }: HoursTrackingModalProps) {
    const [hourEntries, setHourEntries] = useState<HourEntry[]>([])
    const [newEntry, setNewEntry] = useState({
        type: "regular" as HourEntry["type"],
        hours: 0,
        date: new Date(),
        description: "",
        rate: LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS,
    })

    const hourTypes = {
        regular: {
            label: "Horas Regulares",
            multiplier: 1,
            color: "bg-blue-500",
            description: "Horas normales de trabajo",
        },
        overtime: {
            label: "Horas Extras",
            multiplier: 1 + LEGAL_CONSTANTS.OVERTIME_SURCHARGE,
            color: "bg-orange-500",
            description: "Horas adicionales con recargo del 25%",
        },
        night: {
            label: "Horas Nocturnas",
            multiplier: 1 + LEGAL_CONSTANTS.NIGHT_OVERTIME_SURCHARGE,
            color: "bg-purple-500",
            description: "Horas trabajadas entre 9 PM y 6 AM (75% recargo)",
        },
        sunday: {
            label: "Horas Dominicales",
            multiplier: 1 + LEGAL_CONSTANTS.SUNDAY_SURCHARGE,
            color: "bg-red-500",
            description: "Horas trabajadas en domingo (75% recargo)",
        },
        holiday: {
            label: "Horas Festivas",
            multiplier: 1 + LEGAL_CONSTANTS.HOLIDAY_SURCHARGE,
            color: "bg-green-500",
            description: "Horas trabajadas en días festivos (100% recargo)",
        },
        sick: {
            label: "Incapacidad",
            multiplier: 0.67,
            color: "bg-gray-500",
            description: "Horas de incapacidad (67% del salario)",
        },
        vacation: {
            label: "Vacaciones",
            multiplier: 1,
            color: "bg-cyan-500",
            description: "Horas de vacaciones pagadas",
        },
    }

    // Calcular el valor total de las entradas
    const totalAmount = hourEntries.reduce((sum, entry) => sum + entry.amount, 0)
    const totalHours = hourEntries.reduce((sum, entry) => sum + entry.hours, 0)

    // Agregar nueva entrada
    const addHourEntry = () => {
        if (newEntry.hours <= 0) {
            toast({
                title: "Error",
                description: "Las horas deben ser mayor a 0.",
                variant: "destructive",
            })
            return
        }

        const hourType = hourTypes[newEntry.type]
        const effectiveRate = newEntry.rate * hourType.multiplier
        const amount = newEntry.hours * effectiveRate

        const entry: HourEntry = {
            id: Date.now().toString(),
            type: newEntry.type,
            hours: newEntry.hours,
            date: newEntry.date,
            description: newEntry.description,
            rate: effectiveRate,
            amount,
        }

        setHourEntries((prev) => [...prev, entry])

        // Resetear formulario
        setNewEntry({
            type: "regular",
            hours: 0,
            date: new Date(),
            description: "",
            rate: LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS,
        })

        toast({
            title: "Entrada agregada",
            description: `Se agregaron ${entry.hours} horas de ${hourType.label}.`,
        })
    }

    // Eliminar entrada
    const removeEntry = (entryId: string) => {
        setHourEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    }

    // Guardar todas las entradas
    const handleSave = () => {
        if (hourEntries.length === 0) {
            toast({
                title: "Error",
                description: "Debe agregar al menos una entrada de horas.",
                variant: "destructive",
            })
            return
        }

        onSave(hourEntries)
        setHourEntries([])
        onClose()

        toast({
            title: "Horas registradas",
            description: `Se registraron ${totalHours} horas para ${employeeName}.`,
        })
    }

    // Calcular sugerencias automáticas
    const getSuggestions = () => {
        const suggestions: { type: HourEntry["type"]; hours: number; description: string }[] = []
        const today = new Date()
        const dayOfWeek = today.getDay()

        // Sugerir horas nocturnas si es tarde
        const currentHour = today.getHours()
        if (currentHour >= 21 || currentHour <= 6) {
            suggestions.push({
                type: "night" as const,
                hours: 8,
                description: "Turno nocturno estándar",
            })
        }

        // Sugerir horas dominicales si es domingo
        if (dayOfWeek === 0) {
            suggestions.push({
                type: "sunday" as const,
                hours: 8,
                description: "Trabajo dominical",
            })
        }

        // Sugerir horas regulares por defecto
        suggestions.push({
            type: "regular" as const,
            hours: 8,
            description: "Jornada laboral estándar",
        })

        return suggestions
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Horas Trabajadas</DialogTitle>
                    <DialogDescription>
                        Registre las horas trabajadas por {employeeName} con sus respectivos tipos y recargos
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Formulario para nueva entrada */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Nueva Entrada de Horas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Horas</Label>
                                    <Select
                                        value={newEntry.type}
                                        onValueChange={(value: any) => setNewEntry((prev) => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(hourTypes).map(([key, type]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">{hourTypes[newEntry.type].description}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cantidad de Horas</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={newEntry.hours}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, hours: Number(e.target.value) }))}
                                        placeholder="8.0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Fecha</Label>
                                    <Input
                                        type="date"
                                        value={format(newEntry.date, "yyyy-MM-dd")}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, date: new Date(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor por Hora Base (COP)</Label>
                                    <Input
                                        type="number"
                                        value={newEntry.rate}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, rate: Number(e.target.value) }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Con recargo: ${(newEntry.rate * hourTypes[newEntry.type].multiplier).toLocaleString("es-CO")}/hora
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción (opcional)</Label>
                                    <Input
                                        value={newEntry.description}
                                        onChange={(e) => setNewEntry((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descripción del trabajo realizado..."
                                    />
                                </div>
                            </div>

                            {/* Cálculo en tiempo real */}
                            {newEntry.hours > 0 && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calculator className="h-4 w-4" />
                                        <span className="font-medium">Cálculo:</span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div>
                                            {newEntry.hours} horas × $
                                            {(newEntry.rate * hourTypes[newEntry.type].multiplier).toLocaleString("es-CO")} =
                                            <span className="font-medium ml-1">
                                                $
                                                {(newEntry.hours * newEntry.rate * hourTypes[newEntry.type].multiplier).toLocaleString("es-CO")}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground">
                                            Recargo aplicado: {((hourTypes[newEntry.type].multiplier - 1) * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button onClick={addHourEntry} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Entrada
                            </Button>

                            {/* Sugerencias rápidas */}
                            <div className="space-y-2">
                                <Label className="text-sm">Sugerencias rápidas:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {getSuggestions().map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setNewEntry((prev) => ({
                                                    ...prev,
                                                    type: suggestion.type,
                                                    hours: suggestion.hours,
                                                    description: suggestion.description,
                                                }))
                                            }
                                        >
                                            {suggestion.hours}h {hourTypes[suggestion.type].label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de entradas agregadas */}
                    {hourEntries.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Entradas Registradas ({hourEntries.length})
                                </CardTitle>
                                <CardDescription>
                                    Total: {totalHours} horas • ${totalAmount.toLocaleString("es-CO")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {hourEntries.map((entry) => {
                                        const hourType = hourTypes[entry.type]
                                        return (
                                            <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${hourType.color}`} />
                                                    <div>
                                                        <div className="font-medium">
                                                            {entry.hours} hrs • {hourType.label}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {format(entry.date, "dd/MM/yyyy", { locale: es })}
                                                            {entry.description && ` • ${entry.description}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">${entry.amount.toLocaleString("es-CO")}</Badge>
                                                    <Button size="sm" variant="ghost" onClick={() => removeEntry(entry.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Resumen total */}
                                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total a pagar:</span>
                                        <span className="text-lg font-bold text-primary">${totalAmount.toLocaleString("es-CO")}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">{totalHours} horas totales registradas</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={hourEntries.length === 0}>
                        Guardar {hourEntries.length} Entrada(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
