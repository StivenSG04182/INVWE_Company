'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Edit, EditIcon, Icon } from 'lucide-react'

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
    const [employeesWithSchedule, setEmployeesWithSchedule] = useState<Array<{id: string, name: string, schedule: ScheduleData}>>([])
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
    const [activeTab, setActiveTab] = useState<string>('details')

    // Formatear fecha como YYYY-MM-DD para buscar en los datos
    function formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Cargar datos de horario según empleado y fecha seleccionados
    useEffect(() => {
        const dateStr = formatDate(date)
        
        // Buscar todos los empleados que tienen horario para la fecha seleccionada
        const employeesScheduled = []
        for (const empId in allSchedules) {
            if (allSchedules[empId][dateStr]) {
                const employee = employeesData.find(emp => emp.id === empId)
                if (employee) {
                    employeesScheduled.push({
                        id: empId,
                        name: employee.name,
                        schedule: allSchedules[empId][dateStr]
                    })
                }
            }
        }
        setEmployeesWithSchedule(employeesScheduled)
        
        // Si hay un empleado específico seleccionado, mostramos su horario
        if (selectedEmployee && selectedEmployee !== 'all') {
            const employeeSchedules = allSchedules[selectedEmployee] || {}
            setScheduleData(employeeSchedules[dateStr] || null)
        } else {
            // Si no hay empleado seleccionado o se seleccionó "Todos", no mostrar un horario específico
            setScheduleData(null)
        }
    }, [selectedEmployee, date, allSchedules])

    // Calcular días que tienen horarios asignados
    useEffect(() => {
        const scheduledDays: Record<string, boolean> = {}
        
        // Si hay un empleado seleccionado y no es "todos", solo mostramos sus días con horario
        if (selectedEmployee && selectedEmployee !== 'all') {
            const employeeSchedules = allSchedules[selectedEmployee] || {}
            Object.keys(employeeSchedules).forEach(dateStr => {
                scheduledDays[dateStr] = true
            })
        } else {
            // Si no hay empleado seleccionado o es "todos", mostramos todos los días que tienen algún horario
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
        if (!selectedEmployee || !date || selectedEmployee === 'all') return
        
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
        if (!selectedEmployee || !date || selectedEmployee === 'all') return
        
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
        if (!selectedEmployee || !date || selectedEmployee === 'all') return
        
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
        if (id === 'all') return "Todos los empleados"
        const employee = employeesData.find(emp => emp.id === id)
        return employee ? employee.name : "Desconocido"
    }

    return (
        <div className="p-6 ">
            <h1 className="text-2xl font-bold mb-6">Horarios</h1>

            <div className="flex gap-6 overflow-y-auto">
                <Card className='flex-none h-full'>
                    <CardHeader>
                        <CardTitle>Calendario</CardTitle>
                        
                        <p className="text-sm text-gray-500 ">
                            Los días en <span className="text-blue-600 font-bold">azul</span> tienen horarios asignados
                        </p>
                    </CardHeader>
                    <CardContent className=''>
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

                <Card className='flex-1 overflow-auto'>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detalles del Horario</CardTitle>
                        {selectedEmployee && selectedEmployee !== 'all' && (
                            <div className="flex space-x-2 ">
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
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Empleado</label>
                                <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los empleados</SelectItem>
                                        {employeesData.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                            {selectedEmployee && selectedEmployee !== 'all' ? (
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
                                employeesWithSchedule.length > 0 ? (
                                    <div>
                                        <h3 className="text-sm font-medium mb-4">Horarios para el {date.toLocaleDateString()}</h3>
                                        <div className="space-y-6 grid grid-cols-1">
                                            {employeesWithSchedule.map((employeeWithSchedule) => (
                                                <Button variant='outline' 
                                                className='w-full h-full flex flex-items'
                                                endIcon={Edit}>
                                                    <div key={employeeWithSchedule.id} className="border border-rose-600 rounded-lg p-4 w-full">
                                                        <h4 className="font-medium text-lg mb-3 underline">{employeeWithSchedule.name}</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-gray-500">Entrada:</span>
                                                                <p className="font-medium">{employeeWithSchedule.schedule.entrada}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-gray-500">Salida:</span>
                                                                <p className="font-medium">{employeeWithSchedule.schedule.salida}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-sm text-gray-500">Descanso:</span>
                                                                <p className="font-medium">{employeeWithSchedule.schedule.descanso || "No especificado"}</p>
                                                            </div>
                                                            {employeeWithSchedule.schedule.notas && (
                                                                <div className="col-span-2">
                                                                    <span className="text-sm text-gray-500">Notas:</span>
                                                                    <p className="font-medium">{employeeWithSchedule.schedule.notas}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">No hay horarios asignados para esta fecha.</p>
                                        <p className="text-sm text-gray-400 mt-2">Selecciona un empleado específico para asignar un horario.</p>
                                    </div>
                                )
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