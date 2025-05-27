"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    Mail,
    MessageSquare,
    Phone,
    Loader2,
    X,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AlertSystemProps {
    agencyId: string
    type?: string
}

export function AlertSystem({ agencyId, type = "general" }: AlertSystemProps) {
    const [alerts, setAlerts] = useState<any[]>([])
    const [alertConfig, setAlertConfig] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConfiguring, setIsConfiguring] = useState(false)

    useEffect(() => {
        loadAlerts()
        loadAlertConfig()
    }, [agencyId, type])

    const loadAlerts = async () => {
        try {
            const response = await fetch(`/api/alerts/${agencyId}?type=${type}`)
            if (response.ok) {
                const data = await response.json()
                setAlerts(data.alerts || [])
            }
        } catch (error) {
            console.error("Error loading alerts:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadAlertConfig = async () => {
        try {
            const response = await fetch(`/api/alerts/${agencyId}/config`)
            if (response.ok) {
                const data = await response.json()
                setAlertConfig(data)
            }
        } catch (error) {
            console.error("Error loading alert config:", error)
        }
    }

    const dismissAlert = async (alertId: string) => {
        try {
            const response = await fetch(`/api/alerts/${agencyId}/${alertId}/dismiss`, {
                method: "POST",
            })

            if (response.ok) {
                setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
                toast({
                    title: "Alerta descartada",
                    description: "La alerta ha sido marcada como leída",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo descartar la alerta",
                variant: "destructive",
            })
        }
    }

    const updateAlertConfig = async (config: any) => {
        try {
            setIsConfiguring(true)
            const response = await fetch(`/api/alerts/${agencyId}/config`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })

            if (response.ok) {
                setAlertConfig(config)
                toast({
                    title: "Configuración actualizada",
                    description: "Las preferencias de alertas han sido guardadas",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar la configuración",
                variant: "destructive",
            })
        } finally {
            setIsConfiguring(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical":
                return "destructive"
            case "high":
                return "secondary"
            case "medium":
                return "outline"
            default:
                return "default"
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "critical":
                return <XCircle className="h-4 w-4" />
            case "high":
                return <AlertTriangle className="h-4 w-4" />
            case "medium":
                return <Bell className="h-4 w-4" />
            default:
                return <CheckCircle className="h-4 w-4" />
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Sistema de Alertas
                    {alerts.length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {alerts.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="alerts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="alerts">Alertas Activas</TabsTrigger>
                        <TabsTrigger value="config">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="alerts" className="space-y-4">
                        {alerts.length > 0 ? (
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1">{getPriorityIcon(alert.priority)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{alert.title}</h4>
                                                    <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <p className="text-muted-foreground">No hay alertas activas</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="config" className="space-y-6">
                        {alertConfig && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Tipos de Alertas</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="stock-alerts">Alertas de Stock Bajo</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Notificar cuando el stock esté por debajo del mínimo
                                                </p>
                                            </div>
                                            <Switch
                                                id="stock-alerts"
                                                checked={alertConfig.stockAlerts}
                                                onCheckedChange={(checked) => updateAlertConfig({ ...alertConfig, stockAlerts: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="sales-alerts">Alertas de Ventas</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Notificar sobre objetivos de ventas y rendimiento
                                                </p>
                                            </div>
                                            <Switch
                                                id="sales-alerts"
                                                checked={alertConfig.salesAlerts}
                                                onCheckedChange={(checked) => updateAlertConfig({ ...alertConfig, salesAlerts: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="system-alerts">Alertas del Sistema</Label>
                                                <p className="text-sm text-muted-foreground">Notificar sobre errores y mantenimiento</p>
                                            </div>
                                            <Switch
                                                id="system-alerts"
                                                checked={alertConfig.systemAlerts}
                                                onCheckedChange={(checked) => updateAlertConfig({ ...alertConfig, systemAlerts: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Canales de Notificación</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <Label htmlFor="email-notifications">Email</Label>
                                            </div>
                                            <Switch
                                                id="email-notifications"
                                                checked={alertConfig.emailNotifications}
                                                onCheckedChange={(checked) =>
                                                    updateAlertConfig({ ...alertConfig, emailNotifications: checked })
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <Label htmlFor="sms-notifications">SMS</Label>
                                            </div>
                                            <Switch
                                                id="sms-notifications"
                                                checked={alertConfig.smsNotifications}
                                                onCheckedChange={(checked) => updateAlertConfig({ ...alertConfig, smsNotifications: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <Label htmlFor="whatsapp-notifications">WhatsApp</Label>
                                            </div>
                                            <Switch
                                                id="whatsapp-notifications"
                                                checked={alertConfig.whatsappNotifications}
                                                onCheckedChange={(checked) =>
                                                    updateAlertConfig({ ...alertConfig, whatsappNotifications: checked })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Umbrales</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="stock-threshold">Umbral de Stock Bajo (%)</Label>
                                            <Input
                                                id="stock-threshold"
                                                type="number"
                                                value={alertConfig.stockThreshold || 20}
                                                onChange={(e) =>
                                                    updateAlertConfig({
                                                        ...alertConfig,
                                                        stockThreshold: Number.parseInt(e.target.value),
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="sales-threshold">Umbral de Ventas (%)</Label>
                                            <Input
                                                id="sales-threshold"
                                                type="number"
                                                value={alertConfig.salesThreshold || 80}
                                                onChange={(e) =>
                                                    updateAlertConfig({
                                                        ...alertConfig,
                                                        salesThreshold: Number.parseInt(e.target.value),
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={() => updateAlertConfig(alertConfig)} disabled={isConfiguring} className="w-full">
                                    {isConfiguring ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Settings className="h-4 w-4 mr-2" />
                                    )}
                                    Guardar Configuración
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
