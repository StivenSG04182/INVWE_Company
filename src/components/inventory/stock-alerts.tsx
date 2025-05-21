"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Bell, BellOff, Package, Settings, Mail } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StockAlertsProps {
    agencyId: string
    products: any[]
    stocks: any[]
}

export default function StockAlerts({ agencyId, products, stocks }: StockAlertsProps) {
    const { toast } = useToast()
    const [alertsEnabled, setAlertsEnabled] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [pushNotifications, setPushNotifications] = useState(true)
    const [lowStockThreshold, setLowStockThreshold] = useState(10) // Porcentaje
    const [highStockThreshold, setHighStockThreshold] = useState(75) // Porcentaje
    const [activeAlerts, setActiveAlerts] = useState<any[]>([])
    const [alertHistory, setAlertHistory] = useState<any[]>([])

    // Agrupar stocks por producto
    const stocksByProduct = stocks.reduce((acc, stock) => {
        const productId = stock.productId
        if (!acc[productId]) {
            acc[productId] = []
        }
        acc[productId].push(stock)
        return acc
    }, {})

    // Calcular alertas basadas en los niveles de stock
    useEffect(() => {
        if (!alertsEnabled) {
            setActiveAlerts([])
            return
        }

        const newAlerts = []

        // Procesar cada producto
        for (const productId in stocksByProduct) {
            const product = products.find((p) => p.id === productId || p._id === productId)
            if (!product) continue

            const productStocks = stocksByProduct[productId]
            const totalQuantity = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)

            // Calcular porcentaje de stock
            let stockPercentage = 0
            if (product.maxStock && product.maxStock > 0) {
                stockPercentage = (totalQuantity / product.maxStock) * 100
            } else if (product.minStock) {
                // Estimación basada en minStock
                stockPercentage = product.minStock > 0 ? (totalQuantity / (product.minStock * 5)) * 100 : 0
            }

            // Verificar si el stock está bajo o alto
            if (stockPercentage <= lowStockThreshold) {
                newAlerts.push({
                    id: `low-${productId}`,
                    productId,
                    productName: product.name,
                    type: "low",
                    message: `Stock bajo para ${product.name}: ${totalQuantity} unidades (${Math.round(stockPercentage)}%)`,
                    percentage: stockPercentage,
                    quantity: totalQuantity,
                    timestamp: new Date(),
                    status: "active",
                })
            } else if (stockPercentage >= highStockThreshold) {
                newAlerts.push({
                    id: `high-${productId}`,
                    productId,
                    productName: product.name,
                    type: "high",
                    message: `Stock alto para ${product.name}: ${totalQuantity} unidades (${Math.round(stockPercentage)}%)`,
                    percentage: stockPercentage,
                    quantity: totalQuantity,
                    timestamp: new Date(),
                    status: "active",
                })
            }

            // Verificar si el stock está próximo a agotarse (menos de 5 unidades)
            if (totalQuantity > 0 && totalQuantity < 5) {
                newAlerts.push({
                    id: `critical-${productId}`,
                    productId,
                    productName: product.name,
                    type: "critical",
                    message: `¡Stock crítico para ${product.name}! Solo quedan ${totalQuantity} unidades.`,
                    percentage: stockPercentage,
                    quantity: totalQuantity,
                    timestamp: new Date(),
                    status: "active",
                })
            }

            // Verificar si hay productos sin stock
            if (totalQuantity === 0) {
                newAlerts.push({
                    id: `out-${productId}`,
                    productId,
                    productName: product.name,
                    type: "out",
                    message: `Sin stock para ${product.name}. Requiere reposición urgente.`,
                    percentage: 0,
                    quantity: 0,
                    timestamp: new Date(),
                    status: "active",
                })
            }
        }

        setActiveAlerts(newAlerts)
    }, [alertsEnabled, lowStockThreshold, highStockThreshold, products, stocks, stocksByProduct])

    // Función para descartar una alerta
    const dismissAlert = (alertId: string) => {
        const alert = activeAlerts.find((a) => a.id === alertId)
        if (alert) {
            // Mover la alerta al historial
            setAlertHistory((prev) => [{ ...alert, dismissedAt: new Date(), status: "dismissed" }, ...prev])
            // Eliminar la alerta de las activas
            setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId))

            toast({
                title: "Alerta descartada",
                description: "La alerta ha sido movida al historial",
            })
        }
    }

    // Función para guardar la configuración de alertas
    const saveAlertSettings = () => {
        // Aquí iría la lógica para guardar la configuración en la base de datos
        toast({
            title: "Configuración guardada",
            description: "La configuración de alertas ha sido actualizada",
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <CardTitle>Alertas de Stock</CardTitle>
                            <CardDescription>Monitoreo y notificaciones de niveles de stock</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="alerts-enabled" className="text-sm">
                            {alertsEnabled ? "Alertas activadas" : "Alertas desactivadas"}
                        </Label>
                        <Switch id="alerts-enabled" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="active">
                    <TabsList className="mb-4">
                        <TabsTrigger value="active" className="relative">
                            Alertas Activas
                            {activeAlerts.length > 0 && <Badge className="ml-2 bg-red-500">{activeAlerts.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                        <TabsTrigger value="settings">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active">
                        {activeAlerts.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No hay alertas activas</h3>
                                <p className="text-muted-foreground mb-6">
                                    {alertsEnabled
                                        ? "Todos los productos tienen niveles de stock adecuados."
                                        : "Las alertas están desactivadas actualmente."}
                                </p>
                                {!alertsEnabled && (
                                    <Button onClick={() => setAlertsEnabled(true)}>
                                        <Bell className="h-4 w-4 mr-2" />
                                        Activar Alertas
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeAlerts.map((alert) => (
                                    <Card
                                        key={alert.id}
                                        className={`border-l-4 ${alert.type === "critical" || alert.type === "out"
                                                ? "border-l-red-500"
                                                : alert.type === "low"
                                                    ? "border-l-amber-500"
                                                    : "border-l-blue-500"
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${alert.type === "critical" || alert.type === "out"
                                                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                                : alert.type === "low"
                                                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                            }`}
                                                    >
                                                        {alert.type === "critical" || alert.type === "out" ? (
                                                            <AlertTriangle className="h-5 w-5" />
                                                        ) : (
                                                            <Package className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{alert.productName}</h4>
                                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant={
                                                                    alert.type === "critical" || alert.type === "out"
                                                                        ? "destructive"
                                                                        : alert.type === "low"
                                                                            ? "secondary"
                                                                            : "default"
                                                                }
                                                            >
                                                                {alert.type === "critical"
                                                                    ? "Crítico"
                                                                    : alert.type === "out"
                                                                        ? "Sin stock"
                                                                        : alert.type === "low"
                                                                            ? "Stock bajo"
                                                                            : "Stock alto"}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">{alert.timestamp.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                                                    Descartar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history">
                        {alertHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <BellOff className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No hay historial de alertas</h3>
                                <p className="text-muted-foreground">Las alertas descartadas aparecerán aquí.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Mensaje</TableHead>
                                            <TableHead>Creada</TableHead>
                                            <TableHead>Descartada</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alertHistory.map((alert) => (
                                            <TableRow key={alert.id}>
                                                <TableCell className="font-medium">{alert.productName}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            alert.type === "critical" || alert.type === "out"
                                                                ? "destructive"
                                                                : alert.type === "low"
                                                                    ? "secondary"
                                                                    : "default"
                                                        }
                                                    >
                                                        {alert.type === "critical"
                                                            ? "Crítico"
                                                            : alert.type === "out"
                                                                ? "Sin stock"
                                                                : alert.type === "low"
                                                                    ? "Stock bajo"
                                                                    : "Stock alto"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{alert.message}</TableCell>
                                                <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                                                <TableCell>{alert.dismissedAt.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Umbrales de Alerta</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="low-stock-threshold">Umbral de Stock Bajo (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="low-stock-threshold"
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={lowStockThreshold}
                                                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Se generará una alerta cuando el stock esté por debajo de este porcentaje de la capacidad máxima.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="high-stock-threshold">Umbral de Stock Alto (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="high-stock-threshold"
                                                type="number"
                                                min="50"
                                                max="100"
                                                value={highStockThreshold}
                                                onChange={(e) => setHighStockThreshold(Number(e.target.value))}
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Se generará una alerta cuando el stock supere este porcentaje de la capacidad máxima.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Notificaciones</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                                            <p className="text-xs text-muted-foreground">Recibir alertas de stock por correo electrónico</p>
                                        </div>
                                        <Switch
                                            id="email-notifications"
                                            checked={emailNotifications}
                                            onCheckedChange={setEmailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-notifications">Notificaciones Push</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Recibir alertas de stock como notificaciones en el navegador
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-notifications"
                                            checked={pushNotifications}
                                            onCheckedChange={setPushNotifications}
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <h4 className="text-sm font-medium mb-2">Destinatarios de Alertas</h4>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">admin@example.com</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">inventario@example.com</span>
                                        </div>
                                        <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                                            Administrar destinatarios
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancelar</Button>
                                <Button onClick={saveAlertSettings}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Guardar Configuración
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
