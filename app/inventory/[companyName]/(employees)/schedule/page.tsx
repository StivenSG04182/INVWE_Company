'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedEmployee, setSelectedEmployee] = useState('')

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Horarios</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Horario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Empleado</label>
                                <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="emp1">Juan Pérez</SelectItem>
                                        <SelectItem value="emp2">María García</SelectItem>
                                        <SelectItem value="emp3">Carlos López</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Horario del día</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Entrada:</span>
                                        <p className="font-medium">8:00 AM</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Salida:</span>
                                        <p className="font-medium">5:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
