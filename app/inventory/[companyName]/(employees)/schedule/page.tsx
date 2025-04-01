'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

// Datos de ejemplo - En una aplicación real, esto vendría de una API o base de datos
const employeesData = [
  { id: "emp1", name: "Juan Pérez" },
  { id: "emp2", name: "María García" },
  { id: "emp3", name: "Carlos López" },
  { id: "emp4", name: "Ana Rodríguez" },
]

const initialSchedules: Record<string, Record<string, { entrada: string; salida: string; descanso: string; notas: string }>> = {
  emp1: {
    "2025-03-31": { entrada: "8:00", salida: "17:00", descanso: "13:00-14:00", notas: "Reunión con clientes a las 10:00" },
    "2025-04-01": { entrada: "9:00", salida: "18:00", descanso: "14:00-15:00", notas: "" },
  },
  emp2: {
    "2025-03-31": { entrada: "7:30", salida: "16:30", descanso: "12:30-13:30", notas: "Capacitación nueva" },
    "2025-04-01": { entrada: "8:00", salida: "17:00", descanso: "13:00-14:00", notas: "" },
  },
  emp3: {
    "2025-03-31": { entrada: "10:00", salida: "19:00", descanso: "14:00-15:00", notas: "Trabajo desde casa" },
    "2025-04-02": { entrada: "8:00", salida: "17:00", descanso: "12:00-13:00", notas: "" },
  },
  emp4: {
    "2025-03-31": { entrada: "8:00", salida: "17:00", descanso: "13:00-14:00", notas: "" },
  }
}

type ScheduleData = {
  entrada: string;
  salida: string;
  descanso: string;
  notas: string;
};

export default function SchedulePage() {
    const [date, setDate] = useState<Date>(new Date())
    const [selectedEmployee, setSelectedEmployee] = useState<string>('')
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<ScheduleData>({
        entrada: "",
        salida: "",
        descanso: "",
        notas: ""
    })
    const [allSchedules, setAllSchedules] = useState<Record<string, Record<string, ScheduleData>>>(initialSchedules)
    const [isAddingSchedule, setIsAddingSchedule] = useState(false)
    const [daysWithSchedules, setDaysWithSchedules] = useState<Record<string, boolean>>({})

    // Formatear fecha como YYYY-MM-DD para buscar en los datos
    function formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Cargar datos de horario según empleado y fecha seleccionados
    useEffect(() => {
        if (selectedEmployee && date) {
            const dateStr = formatDate(date)
            const employeeSchedules = allSchedules[selectedEmployee] || {}
            setScheduleData(employeeSchedules[dateStr] || null)
        } else {
            setScheduleData(null)
        }
    }, [selectedEmployee, date, allSchedules])

    // Calcular días que tienen horarios asignados
    useEffect(() => {
        const scheduledDays: Record<string, boolean> = {}
        
        // Si hay un empleado seleccionado, solo mostramos sus días con horario
        if (selectedEmployee) {
            const employeeSchedules = allSchedules[selectedEmployee] || {}
            Object.keys(employeeSchedules).forEach(dateStr => {
                scheduledDays[dateStr] = true
            })
        } else {
            // Si no hay empleado seleccionado, mostramos todos los días que tienen algún horario
            Object.values(allSchedules).forEach(employeeSchedules => {
                Object.keys(employeeSchedules).forEach(dateStr => {
                    scheduledDays[dateStr] = true
                })
            })
        }
        
        setDaysWithSchedules(scheduledDays)
    }, [selectedEmployee, allSchedules])

    // Iniciar edición de horario
    const handleEdit = () => {
        if (scheduleData) {
            setEditData({
                entrada: scheduleData.entrada,
                salida: scheduleData.salida,
                descanso: scheduleData.descanso,
                notas: scheduleData.notas
            })
        } else {
            setEditData({
                entrada: "8:00",
                salida: "17:00",
                descanso: "13:00-14:00",
                notas: ""
            })
        }
        setIsEditing(true)
    }

    // Guardar cambios de horario
    const handleSaveChanges = () => {
        if (!selectedEmployee || !date) return
        
        const dateStr = formatDate(date)
        const newSchedules = { ...allSchedules }
        
        if (!newSchedules[selectedEmployee]) {
            newSchedules[selectedEmployee] = {}
        }
        
        newSchedules[selectedEmployee][dateStr] = editData
        setAllSchedules(newSchedules)
        setScheduleData(editData)
        setIsEditing(false)
        
        toast({
            title: "Horario actualizado",
            description: `Se actualizó el horario de ${getEmployeeName(selectedEmployee)} para el ${date.toLocaleDateString()}`
        })
    }

    // Agregar nuevo horario
    const handleAddSchedule = () => {
        setIsAddingSchedule(true)
        setEditData({
            entrada: "8:00",
            salida: "17:00",
            descanso: "13:00-14:00",
            notas: ""
        })
    }

    // Guardar nuevo horario
    const handleSaveNewSchedule = () => {
        if (!selectedEmployee || !date) return
        
        const dateStr = formatDate(date)
        const newSchedules = { ...allSchedules }
        
        if (!newSchedules[selectedEmployee]) {
            newSchedules[selectedEmployee] = {}
        }
        
        newSchedules[selectedEmployee][dateStr] = editData
        setAllSchedules(newSchedules)
        setScheduleData(editData)
        setIsAddingSchedule(false)
        
        toast({
            title: "Horario creado",
            description: `Se creó un nuevo horario para ${getEmployeeName(selectedEmployee)} el ${date.toLocaleDateString()}`
        })
    }

    // Eliminar horario
    const handleDeleteSchedule = () => {
        if (!selectedEmployee || !date) return
        
        const dateStr = formatDate(date)
        const newSchedules = { ...allSchedules }
        
        if (newSchedules[selectedEmployee] && newSchedules[selectedEmployee][dateStr]) {
            delete newSchedules[selectedEmployee][dateStr]
            setAllSchedules(newSchedules)
            setScheduleData(null)
            
            toast({
                title: "Horario eliminado",
                description: `Se eliminó el horario de ${getEmployeeName(selectedEmployee)} para el ${date.toLocaleDateString()}`
            })
        }
    }

    // Obtener nombre de empleado por ID
    const getEmployeeName = (id: string) => {
        const employee = employeesData.find(emp => emp.id === id)
        return employee ? employee.name : "Desconocido"
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Horarios</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario</CardTitle>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Empleado</label>
                                <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employeesData.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 ">
                            Los días en <span className="text-blue-600 font-bold">azul</span> tienen horarios asignados
                        </p>
                    </CardHeader>
                    <CardContent>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate: Date | undefined) => {
                            if (newDate) setDate(newDate)
                        }}
                        className="rounded-md border"
                        modifiers={{
                            scheduled: (day: Date) => !!daysWithSchedules[formatDate(day)],
                            selected: (day: Date) => formatDate(day) === formatDate(date)
                        }}
                        modifiersClassNames={{
                            scheduled: "text-blue-600 font-bold",
                            selected: "bg-blue-100 rounded-full"
                        }}
                        />
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">
                                Fecha seleccionada: <span className="font-medium">{date.toLocaleDateString()}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detalles del Horario</CardTitle>
                        {selectedEmployee && (
                            <div className="flex space-x-2">
                                {scheduleData ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleEdit}>
                                            Editar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={handleDeleteSchedule}>
                                            Eliminar
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="default" size="sm" onClick={handleAddSchedule}>
                                        Agregar Horario
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div>
                            {selectedEmployee ? (
                                scheduleData ? (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Horario del día</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm text-gray-500">Entrada:</span>
                                                <p className="font-medium">{scheduleData.entrada}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">Salida:</span>
                                                <p className="font-medium">{scheduleData.salida}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-sm text-gray-500">Descanso:</span>
                                                <p className="font-medium">{scheduleData.descanso || "No especificado"}</p>
                                            </div>
                                            {scheduleData.notas && (
                                                <div className="col-span-2">
                                                    <span className="text-sm text-gray-500">Notas:</span>
                                                    <p className="font-medium">{scheduleData.notas}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">No hay horario asignado para esta fecha.</p>
                                        <Button variant="outline" className="mt-4" onClick={handleAddSchedule}>
                                            Asignar horario
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-gray-500">Selecciona un empleado para ver su horario.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Diálogo para editar horario */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Horario</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="entrada" className="text-sm font-medium">Hora de entrada</label>
                                <Input 
                                    id="entrada"
                                    value={editData.entrada} 
                                    onChange={(e) => setEditData({...editData, entrada: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="salida" className="text-sm font-medium">Hora de salida</label>
                                <Input 
                                    id="salida"
                                    value={editData.salida} 
                                    onChange={(e) => setEditData({...editData, salida: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="descanso" className="text-sm font-medium">Horario de descanso</label>
                            <Input 
                                id="descanso"
                                value={editData.descanso} 
                                onChange={(e) => setEditData({...editData, descanso: e.target.value})}
                                placeholder="Ej: 13:00-14:00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="notas" className="text-sm font-medium">Notas</label>
                            <Input 
                                id="notas"
                                value={editData.notas} 
                                onChange={(e) => setEditData({...editData, notas: e.target.value})}
                                placeholder="Observaciones o información adicional"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSaveChanges}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo para agregar nuevo horario */}
            <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Nuevo Horario</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="entrada-new" className="text-sm font-medium">Hora de entrada</label>
                                <Input 
                                    id="entrada-new"
                                    value={editData.entrada} 
                                    onChange={(e) => setEditData({...editData, entrada: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="salida-new" className="text-sm font-medium">Hora de salida</label>
                                <Input 
                                    id="salida-new"
                                    value={editData.salida} 
                                    onChange={(e) => setEditData({...editData, salida: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="descanso-new" className="text-sm font-medium">Horario de descanso</label>
                            <Input 
                                id="descanso-new"
                                value={editData.descanso} 
                                onChange={(e) => setEditData({...editData, descanso: e.target.value})}
                                placeholder="Ej: 13:00-14:00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="notas-new" className="text-sm font-medium">Notas</label>
                            <Input 
                                id="notas-new"
                                value={editData.notas} 
                                onChange={(e) => setEditData({...editData, notas: e.target.value})}
                                placeholder="Observaciones o información adicional"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSaveNewSchedule}>Guardar horario</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}