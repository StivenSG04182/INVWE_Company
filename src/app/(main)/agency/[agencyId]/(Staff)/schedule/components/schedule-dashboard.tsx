"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarClock, DollarSign, Users } from "lucide-react"
import { calculateTotalHours, calculateTotalPayroll } from "../utils/payroll-calculator"

interface ScheduleDashboardProps {
    teamMembers: any[]
    schedules: any[]
}

export function ScheduleDashboard({ teamMembers, schedules }: ScheduleDashboardProps) {
    const totalHours = calculateTotalHours(schedules)
    const totalPayroll = calculateTotalPayroll(schedules)

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Horarios & Nómina</h1>
                    <p className="text-muted-foreground">
                        Gestione los horarios y calcule la nómina de sus empleados según la regulación colombiana.
                    </p>
                </div>
                <Tabs defaultValue="week" className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                        <TabsTrigger value="week">Semana</TabsTrigger>
                        <TabsTrigger value="month">Mes</TabsTrigger>
                        <TabsTrigger value="year">Año</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {teamMembers.length === 1 ? "Empleado activo" : "Empleados activos"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Horas Programadas</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours} hrs</div>
                        <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nómina Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPayroll.toLocaleString("es-CO")}</div>
                        <p className="text-xs text-muted-foreground">Incluye recargos y horas extras</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
