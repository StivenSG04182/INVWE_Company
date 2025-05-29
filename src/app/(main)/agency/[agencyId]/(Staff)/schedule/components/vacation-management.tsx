"use client"

import { useState, useEffect } from "react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Plus, Plane, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { calculateWorkingDays } from "../utils/holiday-utils"

interface VacationRequest {
    id: string
    employeeId: string
    employeeName: string
    startDate: Date
    endDate: Date
    days: number
    workingDays: number
    reason: string
    status: "pending" | "approved" | "rejected"
    requestDate: Date
    approvedBy?: string
    comments?: string
}

interface VacationManagementProps {
    teamMembers: any[]
    agencyId: string
}

export function VacationManagement({ teamMembers, agencyId }: VacationManagementProps) {
    const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Datos simulados de vacaciones acumuladas por empleado
    const [employeeVacationData, setEmployeeVacationData] = useState<
        Record<
            string,
            {
                totalDays: number
                usedDays: number
                pendingDays: number
                availableDays: number
            }
        >
    >({})

    useEffect(() => {
        // Simular carga de datos de vacaciones
        const vacationData: Record<string, any> = {}
        teamMembers.forEach((member) => {
            const usedDays = vacationRequests
                .filter((req) => req.employeeId === member.id && req.status === "approved")
                .reduce((sum, req) => sum + req.workingDays, 0)

            const pendingDays = vacationRequests
                .filter((req) => req.employeeId === member.id && req.status === "pending")
                .reduce((sum, req) => sum + req.workingDays, 0)

            vacationData[member.id] = {
                totalDays: 15, // 15 días hábiles por año en Colombia
                usedDays,
                pendingDays,
                availableDays: 15 - usedDays - pendingDays,
            }
        })
        setEmployeeVacationData(vacationData)
    }, [vacationRequests, teamMembers])

    const handleCreateRequest = async () => {
        if (!selectedEmployee || !startDate || !endDate || !reason.trim()) {
            toast({
                title: "Error",
                description: "Por favor complete todos los campos requeridos.",
                variant: "destructive",
            })
            return
        }

        if (startDate >= endDate) {
            toast({
                title: "Error",
                description: "La fecha de fin debe ser posterior a la fecha de inicio.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const totalDays = differenceInDays(endDate, startDate) + 1
            const workingDays = calculateWorkingDays(startDate, endDate)
            const employee = teamMembers.find((m) => m.id === selectedEmployee)

            // Verificar días disponibles
            const employeeData = employeeVacationData[selectedEmployee]
            if (employeeData && workingDays > employeeData.availableDays) {
                toast({
                    title: "Error",
                    description: `El empleado solo tiene ${employeeData.availableDays} días disponibles.`,
                    variant: "destructive",
                })
                return
            }

            const newRequest: VacationRequest = {
                id: `vac-${Date.now()}`,
                employeeId: selectedEmployee,
                employeeName: employee?.name || "Empleado",
                startDate,
                endDate,
                days: totalDays,
                workingDays,
                reason,
                status: "pending",
                requestDate: new Date(),
            }

            setVacationRequests((prev) => [...prev, newRequest])

            toast({
                title: "Solicitud creada",
                description: `Solicitud de vacaciones para ${workingDays} días hábiles creada exitosamente.`,
            })

            // Resetear formulario
            setSelectedEmployee("")
            setStartDate(undefined)
            setEndDate(undefined)
            setReason("")
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Error al crear solicitud:", error)
            toast({
                title: "Error",
                description: "No se pudo crear la solicitud. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApproveRequest = (requestId: string) => {
        setVacationRequests((prev) =>
            prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const, approvedBy: "Admin" } : req)),
        )
        toast({
            title: "Solicitud aprobada",
            description: "La solicitud de vacaciones ha sido aprobada.",
        })
    }

    const handleRejectRequest = (requestId: string) => {
        setVacationRequests((prev) =>
            prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const, approvedBy: "Admin" } : req)),
        )
        toast({
            title: "Solicitud rechazada",
            description: "La solicitud de vacaciones ha sido rechazada.",
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-yellow-100 text-yellow-800"
        }
    }

    return (
        <div className="space-y-6">
            {/* Resumen de vacaciones por empleado */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Resumen de Vacaciones
                    </CardTitle>
                    <CardDescription>Estado actual de días de vacaciones por empleado</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {teamMembers.map((member) => {
                            const data = employeeVacationData[member.id] || {
                                totalDays: 15,
                                usedDays: 0,
                                pendingDays: 0,
                                availableDays: 15,
                            }
                            const usagePercentage = (data.usedDays / data.totalDays) * 100

                            return (
                                <div key={member.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{member.name}</h4>
                                        <Badge variant="outline">{data.availableDays} disponibles</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Usados: {data.usedDays} días</span>
                                            <span>Total: {data.totalDays} días</span>
                                        </div>
                                        <Progress value={usagePercentage} className="h-2" />
                                        {data.pendingDays > 0 && (
                                            <p className="text-sm text-amber-600">{data.pendingDays} días pendientes de aprobación</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Solicitudes de vacaciones */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Solicitudes de Vacaciones</CardTitle>
                            <CardDescription>Gestione las solicitudes de vacaciones del equipo</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Solicitud
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Solicitar Vacaciones</DialogTitle>
                                    <DialogDescription>Complete los detalles para la solicitud de vacaciones</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee">Empleado *</Label>
                                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar empleado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teamMembers.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.name} ({employeeVacationData[member.id]?.availableDays || 15} días disponibles)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Fecha de inicio *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Fecha de fin *</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {startDate && endDate && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="text-sm space-y-1">
                                                <p>
                                                    <strong>Días totales:</strong> {differenceInDays(endDate, startDate) + 1}
                                                </p>
                                                <p>
                                                    <strong>Días hábiles:</strong> {calculateWorkingDays(startDate, endDate)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Motivo *</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Describa el motivo de las vacaciones..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreateRequest} disabled={isLoading}>
                                        {isLoading ? "Creando..." : "Crear Solicitud"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {vacationRequests.length > 0 ? (
                            vacationRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-medium">{request.employeeName}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {format(request.startDate, "PPP", { locale: es })} -{" "}
                                                {format(request.endDate, "PPP", { locale: es })}
                                            </p>
                                            <p className="text-sm">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                {request.workingDays} días hábiles
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusColor(request.status)}>
                                                {getStatusIcon(request.status)}
                                                <span className="ml-1 capitalize">
                                                    {request.status === "pending"
                                                        ? "Pendiente"
                                                        : request.status === "approved"
                                                            ? "Aprobada"
                                                            : "Rechazada"}
                                                </span>
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-sm">{request.reason}</p>

                                    {request.status === "pending" && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveRequest(request.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Aprobar
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                                                Rechazar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">No hay solicitudes de vacaciones</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
