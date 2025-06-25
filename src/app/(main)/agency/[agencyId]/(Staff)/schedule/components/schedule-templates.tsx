"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Copy, Trash2, Clock, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { calculateHoursBetween } from "../utils/payroll-calculator"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ScheduleTemplate {
    id: string
    name: string
    description: string
    category: "security" | "cleaning" | "maintenance" | "reception" | "custom"
    shifts: {
        startTime: string
        endTime: string
        breakTime: string
        days: string[]
    }[]
    estimatedHours: number
    isActive: boolean
    createdAt: Date
}

interface ScheduleTemplatesProps {
    agencyId: string
    teamMembers: any[]
}

export function ScheduleTemplates({ agencyId, teamMembers }: ScheduleTemplatesProps) {
    const [templates, setTemplates] = useState<ScheduleTemplate[]>([
        {
            id: "template-1",
            name: "Vigilancia 24/7",
            description: "Turnos rotativos de seguridad las 24 horas",
            category: "security",
            shifts: [
                {
                    startTime: "06:00",
                    endTime: "14:00",
                    breakTime: "01:00",
                    days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
                },
                {
                    startTime: "14:00",
                    endTime: "22:00",
                    breakTime: "01:00",
                    days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
                },
                {
                    startTime: "22:00",
                    endTime: "06:00",
                    breakTime: "01:00",
                    days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
                },
            ],
            estimatedHours: 40,
            isActive: true,
            createdAt: new Date(),
        },
        {
            id: "template-2",
            name: "Aseo Oficinas",
            description: "Horario estándar de limpieza de oficinas",
            category: "cleaning",
            shifts: [
                {
                    startTime: "18:00",
                    endTime: "22:00",
                    breakTime: "00:30",
                    days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
                },
            ],
            estimatedHours: 17.5,
            isActive: true,
            createdAt: new Date(),
        },
        {
            id: "template-3",
            name: "Recepción Corporativa",
            description: "Atención al cliente en horario comercial",
            category: "reception",
            shifts: [
                {
                    startTime: "08:00",
                    endTime: "17:00",
                    breakTime: "01:00",
                    days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
                },
            ],
            estimatedHours: 40,
            isActive: true,
            createdAt: new Date(),
        },
    ])

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

    // Estado del formulario de creación
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "custom" as const,
        shifts: [
            {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: "01:00",
                days: [] as string[],
            },
        ],
    })

    const weekDays = [
        { value: "lunes", label: "Lunes" },
        { value: "martes", label: "Martes" },
        { value: "miércoles", label: "Miércoles" },
        { value: "jueves", label: "Jueves" },
        { value: "viernes", label: "Viernes" },
        { value: "sábado", label: "Sábado" },
        { value: "domingo", label: "Domingo" },
    ]

    const categories = [
        { value: "security", label: "Seguridad", color: "bg-red-100 text-red-800" },
        { value: "cleaning", label: "Aseo", color: "bg-blue-100 text-blue-800" },
        { value: "maintenance", label: "Mantenimiento", color: "bg-green-100 text-green-800" },
        { value: "reception", label: "Recepción", color: "bg-purple-100 text-purple-800" },
        { value: "custom", label: "Personalizado", color: "bg-gray-100 text-gray-800" },
    ]

    const getCategoryInfo = (category: string) => {
        return categories.find((c) => c.value === category) || categories[4]
    }

    const calculateTemplateHours = (shifts: any[]) => {
        return shifts.reduce((total, shift) => {
            const dailyHours = calculateHoursBetween(shift.startTime, shift.endTime, shift.breakTime)
            const daysPerWeek = shift.days.length
            return total + dailyHours * daysPerWeek
        }, 0)
    }

    const handleCreateTemplate = () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            toast({
                title: "Error",
                description: "Por favor complete todos los campos requeridos.",
                variant: "destructive",
            })
            return
        }

        const hasValidShifts = formData.shifts.every((shift) => shift.startTime && shift.endTime && shift.days.length > 0)

        if (!hasValidShifts) {
            toast({
                title: "Error",
                description: "Todos los turnos deben tener horarios y días válidos.",
                variant: "destructive",
            })
            return
        }

        const newTemplate: ScheduleTemplate = {
            id: `template-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            shifts: formData.shifts,
            estimatedHours: calculateTemplateHours(formData.shifts),
            isActive: true,
            createdAt: new Date(),
        }

        setTemplates((prev) => [...prev, newTemplate])

        toast({
            title: "Plantilla creada",
            description: `La plantilla "${formData.name}" ha sido creada exitosamente.`,
        })

        // Resetear formulario
        setFormData({
            name: "",
            description: "",
            category: "custom",
            shifts: [
                {
                    startTime: "08:00",
                    endTime: "17:00",
                    breakTime: "01:00",
                    days: [],
                },
            ],
        })
        setIsCreateDialogOpen(false)
    }

    const handleApplyTemplate = async (template: ScheduleTemplate, employeeId: string) => {
        try {
            // Aquí implementarías la lógica para aplicar la plantilla
            // Por ejemplo, crear los horarios en la base de datos
            toast({
                title: "Plantilla aplicada",
                description: `La plantilla "${template.name}" ha sido aplicada al empleado.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo aplicar la plantilla. Inténtelo de nuevo.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteTemplate = (templateId: string) => {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId))
        toast({
            title: "Plantilla eliminada",
            description: "La plantilla ha sido eliminada exitosamente.",
        })
    }

    const handleDuplicateTemplate = (template: ScheduleTemplate) => {
        const duplicatedTemplate: ScheduleTemplate = {
            ...template,
            id: `template-${Date.now()}`,
            name: `${template.name} (Copia)`,
            createdAt: new Date(),
        }
        setTemplates((prev) => [...prev, duplicatedTemplate])
        toast({
            title: "Plantilla duplicada",
            description: `Se ha creado una copia de "${template.name}".`,
        })
    }

    const addShift = () => {
        setFormData((prev) => ({
            ...prev,
            shifts: [
                ...prev.shifts,
                {
                    startTime: "08:00",
                    endTime: "17:00",
                    breakTime: "01:00",
                    days: [],
                },
            ],
        }))
    }

    const removeShift = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            shifts: prev.shifts.filter((_, i) => i !== index),
        }))
    }

    const updateShift = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            shifts: prev.shifts.map((shift, i) => (i === index ? { ...shift, [field]: value } : shift)),
        }))
    }

    const toggleShiftDay = (shiftIndex: number, day: string) => {
        setFormData((prev) => ({
            ...prev,
            shifts: prev.shifts.map((shift, i) =>
                i === shiftIndex
                    ? {
                        ...shift,
                        days: shift.days.includes(day) ? shift.days.filter((d) => d !== day) : [...shift.days, day],
                    }
                    : shift,
            ),
        }))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Plantillas de Horarios</CardTitle>
                            <CardDescription>
                                Cree y gestione plantillas reutilizables para diferentes tipos de trabajo
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nueva Plantilla
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Crear Plantilla de Horario</DialogTitle>
                                        <DialogDescription>Configure una plantilla reutilizable para asignar horarios</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nombre de la plantilla *</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Ej: Vigilancia nocturna"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Categoría</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.value} value={cat.value}>
                                                                {cat.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descripción</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                                placeholder="Describa el propósito de esta plantilla..."
                                                rows={2}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label>Turnos</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={addShift}>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Agregar Turno
                                                </Button>
                                            </div>

                                            {formData.shifts.map((shift, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium">Turno {index + 1}</h4>
                                                        {formData.shifts.length > 1 && (
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeShift(index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Hora inicio</Label>
                                                            <Input
                                                                type="time"
                                                                value={shift.startTime}
                                                                onChange={(e) => updateShift(index, "startTime", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Hora fin</Label>
                                                            <Input
                                                                type="time"
                                                                value={shift.endTime}
                                                                onChange={(e) => updateShift(index, "endTime", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Descanso</Label>
                                                            <Input
                                                                type="time"
                                                                value={shift.breakTime}
                                                                onChange={(e) => updateShift(index, "breakTime", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Días de la semana</Label>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {weekDays.map((day) => (
                                                                <div key={day.value} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`${index}-${day.value}`}
                                                                        checked={shift.days.includes(day.value)}
                                                                        onCheckedChange={() => toggleShiftDay(index, day.value)}
                                                                    />
                                                                    <Label htmlFor={`${index}-${day.value}`} className="text-sm">
                                                                        {day.label}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-muted-foreground">
                                                        Horas por semana:{" "}
                                                        {calculateHoursBetween(shift.startTime, shift.endTime, shift.breakTime) * shift.days.length}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm font-medium">
                                                Total estimado: {calculateTemplateHours(formData.shifts)} horas por semana
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleCreateTemplate}>Crear Plantilla</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Users className="h-4 w-4 mr-2" />
                                        Aplicar Plantilla
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Aplicar Plantilla</DialogTitle>
                                        <DialogDescription>
                                            Seleccione una plantilla y un empleado para aplicar los horarios
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Plantilla</Label>
                                            <Select
                                                value={selectedTemplate?.id || ""}
                                                onValueChange={(value) => {
                                                    const template = templates.find((t) => t.id === value)
                                                    setSelectedTemplate(template || null)
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates
                                                        .filter((t) => t.isActive)
                                                        .map((template) => (
                                                            <SelectItem key={template.id} value={template.id}>
                                                                {template.name} ({template.estimatedHours}h/semana)
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Empleado</Label>
                                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                                <SelectTrigger>
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

                                        {selectedTemplate && (
                                            <div className="p-3 bg-muted rounded-lg space-y-2">
                                                <h4 className="font-medium">{selectedTemplate.name}</h4>
                                                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    {selectedTemplate.estimatedHours} horas por semana
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={() => selectedTemplate && selectedEmployee && handleApplyTemplate(selectedTemplate, selectedEmployee)}>Aplicar Plantilla</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => {
                            const categoryInfo = getCategoryInfo(template.category)

                            return (
                                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-medium">{template.name}</h4>
                                            <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">{template.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4" />
                                            {template.estimatedHours} horas/semana
                                        </div>
                                        <div className="text-sm">
                                            <strong>{template.shifts.length}</strong> turno(s) configurado(s)
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => {
                                                setSelectedTemplate(template)
                                                setIsApplyDialogOpen(true)
                                            }}
                                        >
                                            Aplicar Plantilla
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {templates.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay plantillas creadas. Cree su primera plantilla para comenzar.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
