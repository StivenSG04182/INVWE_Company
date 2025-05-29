"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, Settings, Send, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Notification {
    id: string
    type: "schedule_change" | "overtime_alert" | "compliance_warning" | "vacation_request" | "custom"
    title: string
    message: string
    recipients: string[]
    status: "pending" | "sent" | "failed"
    createdAt: Date
    sentAt?: Date
    priority: "low" | "medium" | "high"
}

interface NotificationTemplate {
    id: string
    name: string
    type: string
    subject: string
    body: string
    variables: string[]
}

interface NotificationSystemProps {
    teamMembers: any[]
    agencyId: string
}

export function NotificationSystem({ teamMembers, agencyId }: NotificationSystemProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [templates, setTemplates] = useState<NotificationTemplate[]>([
        {
            id: "template-1",
            name: "Cambio de Horario",
            type: "schedule_change",
            subject: "Cambio en tu horario de trabajo",
            body: "Hola {{employeeName}}, tu horario ha sido actualizado para el {{date}}. Nuevo horario: {{startTime}} - {{endTime}}. Por favor confirma la recepción de este mensaje.",
            variables: ["employeeName", "date", "startTime", "endTime"],
        },
        {
            id: "template-2",
            name: "Alerta de Horas Extras",
            type: "overtime_alert",
            subject: "Alerta: Horas extras programadas",
            body: "Estimado {{employeeName}}, tienes {{overtimeHours}} horas extras programadas para esta semana. Recuerda que el límite legal es de 44 horas semanales.",
            variables: ["employeeName", "overtimeHours"],
        },
        {
            id: "template-3",
            name: "Solicitud de Vacaciones",
            type: "vacation_request",
            subject: "Nueva solicitud de vacaciones",
            body: "{{employeeName}} ha solicitado vacaciones del {{startDate}} al {{endDate}} ({{totalDays}} días). Motivo: {{reason}}. Requiere aprobación.",
            variables: ["employeeName", "startDate", "endDate", "totalDays", "reason"],
        },
    ])

    const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState("")
    const [emailSettings, setEmailSettings] = useState({
        smtpServer: "smtp.gmail.com",
        smtpPort: "587",
        username: "",
        password: "",
        fromName: "Sistema de Horarios",
        fromEmail: "",
        enableNotifications: true,
        autoSendAlerts: true,
    })

    // Estado del formulario de composición
    const [composeForm, setComposeForm] = useState({
        recipients: [] as string[],
        subject: "",
        message: "",
        priority: "medium" as const,
        sendImmediately: true,
    })

    // Cargar configuración de email desde localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem(`email-settings-${agencyId}`)
        if (savedSettings) {
            setEmailSettings(JSON.parse(savedSettings))
        }
    }, [agencyId])

    // Guardar configuración de email
    const saveEmailSettings = () => {
        localStorage.setItem(`email-settings-${agencyId}`, JSON.stringify(emailSettings))
        toast({
            title: "Configuración guardada",
            description: "La configuración de email ha sido guardada exitosamente.",
        })
        setIsSettingsDialogOpen(false)
    }

    // Función para enviar notificación
    const sendNotification = async (notificationData: Partial<Notification>) => {
        try {
            // Simular envío de email
            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                type: notificationData.type || "custom",
                title: notificationData.title || composeForm.subject,
                message: notificationData.message || composeForm.message,
                recipients: notificationData.recipients || composeForm.recipients,
                status: "sent", // En producción, esto dependería del resultado del envío
                createdAt: new Date(),
                sentAt: new Date(),
                priority: notificationData.priority || composeForm.priority,
            }

            setNotifications((prev) => [newNotification, ...prev])

            toast({
                title: "Notificación enviada",
                description: `Mensaje enviado a ${newNotification.recipients.length} destinatario(s).`,
            })

            return newNotification
        } catch (error) {
            console.error("Error al enviar notificación:", error)
            throw error
        }
    }

    // Función para aplicar plantilla
    const applyTemplate = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId)
        if (template) {
            setComposeForm((prev) => ({
                ...prev,
                subject: template.subject,
                message: template.body,
            }))
        }
    }

    // Función para enviar notificación automática
    const sendAutomaticNotification = async (type: string, data: any) => {
        if (!emailSettings.autoSendAlerts) return

        const template = templates.find((t) => t.type === type)
        if (!template) return

        let processedMessage = template.body
        let processedSubject = template.subject

        // Reemplazar variables en la plantilla
        template.variables.forEach((variable) => {
            const value = data[variable] || `{{${variable}}}`
            processedMessage = processedMessage.replace(new RegExp(`{{${variable}}}`, "g"), value)
            processedSubject = processedSubject.replace(new RegExp(`{{${variable}}}`, "g"), value)
        })

        await sendNotification({
            type: type as any,
            title: processedSubject,
            message: processedMessage,
            recipients: data.recipients || [],
            priority: "medium",
        })
    }

    // Función para manejar el envío del formulario de composición
    const handleSendComposed = async () => {
        if (!composeForm.subject.trim() || !composeForm.message.trim() || composeForm.recipients.length === 0) {
            toast({
                title: "Error",
                description: "Por favor complete todos los campos requeridos.",
                variant: "destructive",
            })
            return
        }

        try {
            await sendNotification({
                type: "custom",
                title: composeForm.subject,
                message: composeForm.message,
                recipients: composeForm.recipients,
                priority: composeForm.priority,
            })

            // Resetear formulario
            setComposeForm({
                recipients: [],
                subject: "",
                message: "",
                priority: "medium",
                sendImmediately: true,
            })
            setIsComposeDialogOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo enviar la notificación. Inténtelo de nuevo.",
                variant: "destructive",
            })
        }
    }

    // Función para configurar Gmail
    const configureGmail = () => {
        setEmailSettings((prev) => ({
            ...prev,
            smtpServer: "smtp.gmail.com",
            smtpPort: "587",
            fromEmail: prev.fromEmail || "",
        }))
        toast({
            title: "Configuración Gmail",
            description: "Se han aplicado los ajustes para Gmail. Complete su email y contraseña de aplicación.",
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "sent":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "failed":
                return <AlertTriangle className="h-4 w-4 text-red-600" />
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800"
            case "medium":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-green-100 text-green-800"
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Sistema de Notificaciones
                            </CardTitle>
                            <CardDescription>Gestione notificaciones automáticas y manuales para su equipo</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Send className="h-4 w-4 mr-2" />
                                        Enviar Notificación
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Componer Notificación</DialogTitle>
                                        <DialogDescription>Envíe una notificación personalizada a su equipo</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Plantilla (opcional)</Label>
                                            <Select
                                                value={selectedTemplate}
                                                onValueChange={(value) => {
                                                    setSelectedTemplate(value)
                                                    if (value) applyTemplate(value)
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.id} value={template.id}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Destinatarios *</Label>
                                            <Select
                                                value={composeForm.recipients.join(",")}
                                                onValueChange={(value) => {
                                                    const recipients = value ? value.split(",") : []
                                                    setComposeForm((prev) => ({ ...prev, recipients }))
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar destinatarios" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los empleados</SelectItem>
                                                    {teamMembers.map((member) => (
                                                        <SelectItem key={member.id} value={member.id}>
                                                            {member.name} - {member.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {composeForm.recipients.length > 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    {composeForm.recipients.length} destinatario(s) seleccionado(s)
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Asunto *</Label>
                                            <Input
                                                id="subject"
                                                value={composeForm.subject}
                                                onChange={(e) => setComposeForm((prev) => ({ ...prev, subject: e.target.value }))}
                                                placeholder="Asunto del mensaje"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Mensaje *</Label>
                                            <Textarea
                                                id="message"
                                                value={composeForm.message}
                                                onChange={(e) => setComposeForm((prev) => ({ ...prev, message: e.target.value }))}
                                                placeholder="Escriba su mensaje aquí..."
                                                rows={6}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Prioridad</Label>
                                                <Select
                                                    value={composeForm.priority}
                                                    onValueChange={(value: any) => setComposeForm((prev) => ({ ...prev, priority: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Baja</SelectItem>
                                                        <SelectItem value="medium">Media</SelectItem>
                                                        <SelectItem value="high">Alta</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Opciones</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="sendImmediately"
                                                        checked={composeForm.sendImmediately}
                                                        onCheckedChange={(checked) =>
                                                            setComposeForm((prev) => ({ ...prev, sendImmediately: checked }))
                                                        }
                                                    />
                                                    <Label htmlFor="sendImmediately" className="text-sm">
                                                        Enviar inmediatamente
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleSendComposed}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Enviar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Configuración
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Configuración de Notificaciones</DialogTitle>
                                        <DialogDescription>Configure los ajustes de email y notificaciones automáticas</DialogDescription>
                                    </DialogHeader>

                                    <Tabs defaultValue="email" className="py-4">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="email">Email</TabsTrigger>
                                            <TabsTrigger value="automation">Automatización</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="email" className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label>Configuración rápida</Label>
                                                    <Button variant="outline" size="sm" onClick={configureGmail}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Configurar Gmail
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="smtpServer">Servidor SMTP</Label>
                                                        <Input
                                                            id="smtpServer"
                                                            value={emailSettings.smtpServer}
                                                            onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpServer: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="smtpPort">Puerto</Label>
                                                        <Input
                                                            id="smtpPort"
                                                            value={emailSettings.smtpPort}
                                                            onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpPort: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="fromEmail">Email remitente</Label>
                                                    <Input
                                                        id="fromEmail"
                                                        type="email"
                                                        value={emailSettings.fromEmail}
                                                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, fromEmail: e.target.value }))}
                                                        placeholder="tu-email@gmail.com"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="fromName">Nombre remitente</Label>
                                                    <Input
                                                        id="fromName"
                                                        value={emailSettings.fromName}
                                                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, fromName: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Contraseña de aplicación</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        value={emailSettings.password}
                                                        onChange={(e) => setEmailSettings((prev) => ({ ...prev, password: e.target.value }))}
                                                        placeholder="Contraseña de aplicación de Gmail"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Para Gmail, use una contraseña de aplicación, no su contraseña normal.
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="automation" className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Notificaciones automáticas</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Enviar alertas automáticas para eventos importantes
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={emailSettings.autoSendAlerts}
                                                        onCheckedChange={(checked) =>
                                                            setEmailSettings((prev) => ({ ...prev, autoSendAlerts: checked }))
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Sistema de notificaciones</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Habilitar el sistema completo de notificaciones
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={emailSettings.enableNotifications}
                                                        onCheckedChange={(checked) =>
                                                            setEmailSettings((prev) => ({ ...prev, enableNotifications: checked }))
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Plantillas disponibles</Label>
                                                    <div className="space-y-2">
                                                        {templates.map((template) => (
                                                            <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                                                                <div>
                                                                    <p className="font-medium text-sm">{template.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{template.type}</p>
                                                                </div>
                                                                <Badge variant="outline">Activa</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={saveEmailSettings}>Guardar Configuración</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Historial de Notificaciones</h4>
                            <Badge variant="outline">{notifications.length} enviadas</Badge>
                        </div>

                        {notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.slice(0, 10).map((notification) => (
                                    <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h5 className="font-medium">{notification.title}</h5>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(notification.priority)}>{notification.priority}</Badge>
                                                {getStatusIcon(notification.status)}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>
                                                <Users className="inline h-3 w-3 mr-1" />
                                                {notification.recipients.length} destinatario(s)
                                            </span>
                                            <span>
                                                {notification.sentAt
                                                    ? `Enviado ${format(notification.sentAt, "PPp", { locale: es })}`
                                                    : `Creado ${format(notification.createdAt, "PPp", { locale: es })}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay notificaciones enviadas</p>
                                <p className="text-sm">Las notificaciones aparecerán aquí una vez que las envíe</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Función expuesta para uso externo */}
            <div className="hidden">
                {/* Esta función puede ser llamada desde otros componentes */}
                <button
                    onClick={() =>
                        sendAutomaticNotification("schedule_change", {
                            employeeName: "Juan Pérez",
                            date: "2025-01-15",
                            startTime: "08:00",
                            endTime: "17:00",
                            recipients: ["employee-1"],
                        })
                    }
                >
                    Enviar notificación de prueba
                </button>
            </div>
        </div>
    )
}

// Exportar función para uso externo
export const useNotificationSystem = (agencyId: string) => {
    return {
        sendScheduleChangeNotification: (data: any) => {
            // Implementar lógica de envío
            console.log("Enviando notificación de cambio de horario:", data)
        },
        sendOvertimeAlert: (data: any) => {
            // Implementar lógica de envío
            console.log("Enviando alerta de horas extras:", data)
        },
        sendVacationRequest: (data: any) => {
            // Implementar lógica de envío
            console.log("Enviando solicitud de vacaciones:", data)
        },
    }
}
