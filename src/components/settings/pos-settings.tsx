"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HelpCircle, DollarSign, Building } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface PosSettingsProps {
    agencyId: string
}

const PosSettingsContent = ({ agencyId }: PosSettingsProps) => {
    const { toast } = useToast()
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)
    const [currentHelpTopic, setCurrentHelpTopic] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("general")

    // Estado inicial para la configuración del POS
    const [posSettings, setPosSettings] = useState({
        general: {
            storeName: "Mi Tienda",
            currency: "USD",
            taxRate: 19,
            address: "Calle Principal #123",
            logo: null,
        },
        receipt: {
            headerText: "Gracias por su compra",
            paperSize: "80mm",
            showLogo: true,
            showTaxDetails: true,
            showFooter: true,
            footerText: "Vuelva pronto",
            showQRCode: false,
            showBarcode: true,
            printAutomatically: true,
            receiptCopies: 1,
            printerName: "Impresora Térmica",
            fontSize: "medium",
        },
        payment: {
            acceptCash: true,
            acceptCard: true,
            acceptTransfer: true,
            acceptCredit: false,
            requireCustomerForCredit: true,
            defaultPaymentMethod: "cash",
            allowMultiplePaymentMethods: true,
            allowPartialPayments: false,
            allowRefunds: true,
            requireAuthForRefunds: true,
            cardProcessors: ["dataphone", "integrated"],
        },
        inventory: {
            updateStockAutomatically: true,
            allowNegativeStock: false,
            showLowStockAlert: true,
            lowStockThreshold: 5,
            trackInventoryByLocation: false,
            allowTransfers: false,
            requireStockCount: false,
            stockCountFrequency: "monthly",
            allowPurchaseOrders: true,
            autoGenerateBarcodes: false,
        },
        users: {
            requirePinForRefunds: true,
            requirePinForDiscounts: true,
            allowMultipleCashiers: true,
            requireCashierForSales: true,
            trackCashierActivity: true,
            allowCashierReports: true,
            cashierPermissions: "standard",
            managerPermissions: "extended",
            requirePasswordChange: false,
            passwordExpiryDays: 90,
        },
        notifications: {
            lowStockNotifications: true,
            salesSummaryNotifications: true,
            cashClosingReminders: true,
            notificationEmail: "admin@mitienda.com",
            sendDailyReports: true,
            sendWeeklyReports: false,
            notifyOnLargeRefunds: true,
            largeRefundThreshold: 100000,
        },
    })

    const handleChange = (section: string, field: string, value: any) => {
        setPosSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [field]: value,
            },
        }))
    }

    const saveChanges = () => {
        // Aquí iría la lógica para guardar los cambios en la base de datos
        toast({
            title: "Configuración guardada",
            description: "Los cambios han sido guardados correctamente.",
        })
    }

    const showHelp = (topic: string) => {
        setCurrentHelpTopic(topic)
        setIsHelpDialogOpen(true)
    }

    const helpContent: { [key: string]: { title: string; content: string } } = {
        general: {
            title: "Configuración General",
            content: "Aquí puedes configurar la información básica de tu negocio, como el nombre, la moneda y el logo.",
        },
        receipt: {
            title: "Configuración de Recibos",
            content: "Personaliza cómo se muestran e imprimen los recibos de venta.",
        },
        payment: {
            title: "Métodos de Pago",
            content: "Configura los métodos de pago aceptados en tu punto de venta.",
        },
        inventory: {
            title: "Configuración de Inventario",
            content: "Configura cómo se maneja el inventario en el punto de venta.",
        },
        users: {
            title: "Configuración de Usuarios",
            content: "Configura los permisos y restricciones para los usuarios del POS.",
        },
        notifications: {
            title: "Configuración de Notificaciones",
            content: "Configura las notificaciones y alertas del sistema.",
        },
    }

    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Configuración del POS</h2>
                        <p className="text-muted-foreground">Administra la configuración de tu punto de venta</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(true)}>
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
                <Separator />

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-64 space-y-4">
                        <div className="flex flex-col space-y-1">
                            <Button
                                variant={activeTab === "general" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("general")}
                            >
                                General
                            </Button>
                            <Button
                                variant={activeTab === "receipt" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("receipt")}
                            >
                                Recibos
                            </Button>
                            <Button
                                variant={activeTab === "payment" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("payment")}
                            >
                                Métodos de Pago
                            </Button>
                            <Button
                                variant={activeTab === "inventory" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("inventory")}
                            >
                                Inventario
                            </Button>
                            <Button
                                variant={activeTab === "users" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("users")}
                            >
                                Usuarios
                            </Button>
                            <Button
                                variant={activeTab === "notifications" ? "default" : "ghost"}
                                className="justify-start"
                                onClick={() => setActiveTab("notifications")}
                            >
                                Notificaciones
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <ScrollArea className="h-[70vh]">
                            {activeTab === "general" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Configuración General</CardTitle>
                                                <CardDescription>Configura la información básica de tu negocio</CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("general")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="storeName">Nombre de la Tienda</Label>
                                                <Input
                                                    id="storeName"
                                                    placeholder="Nombre de tu tienda"
                                                    value={posSettings.general.storeName}
                                                    onChange={(e) => handleChange("general", "storeName", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency">Moneda</Label>
                                                <Select
                                                    value={posSettings.general.currency}
                                                    onValueChange={(value) => handleChange("general", "currency", value)}
                                                >
                                                    <SelectTrigger id="currency">
                                                        <SelectValue placeholder="Selecciona una moneda" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="GBP">GBP - Libra Esterlina</SelectItem>
                                                        <SelectItem value="JPY">JPY - Yen Japonés</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                                                <Input
                                                    id="taxRate"
                                                    type="number"
                                                    placeholder="Tasa de impuesto"
                                                    value={posSettings.general.taxRate}
                                                    onChange={(e) => handleChange("general", "taxRate", Number.parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Dirección</Label>
                                                <Input
                                                    id="address"
                                                    placeholder="Dirección de la tienda"
                                                    value={posSettings.general.address}
                                                    onChange={(e) => handleChange("general", "address", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="logo">Logo</Label>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                                                    {posSettings.general.logo ? (
                                                        <img
                                                            src={posSettings.general.logo || "/placeholder.svg"}
                                                            alt="Logo"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Building className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        id="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        className="cursor-pointer"
                                                        onChange={(e) => {
                                                            // Aquí iría la lógica para manejar la carga de archivos
                                                            // Por ahora, solo simulamos el cambio
                                                            handleChange(
                                                                "general",
                                                                "logo",
                                                                e.target.files && e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null,
                                                            )
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Recomendado: PNG o JPG, máximo 1MB, dimensiones 200x200px
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "receipt" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Configuración de Recibos</CardTitle>
                                                <CardDescription>Personaliza cómo se muestran e imprimen los recibos de venta</CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("receipt")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contenido de la configuración de recibos */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="headerText">Texto de Encabezado</Label>
                                                <Input
                                                    id="headerText"
                                                    placeholder="Texto para el encabezado del recibo"
                                                    value={posSettings.receipt.headerText}
                                                    onChange={(e) => handleChange("receipt", "headerText", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="paperSize">Tamaño de Papel</Label>
                                                <Select
                                                    value={posSettings.receipt.paperSize}
                                                    onValueChange={(value) => handleChange("receipt", "paperSize", value)}
                                                >
                                                    <SelectTrigger id="paperSize">
                                                        <SelectValue placeholder="Selecciona un tamaño" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="58mm">58mm</SelectItem>
                                                        <SelectItem value="80mm">80mm</SelectItem>
                                                        <SelectItem value="A4">A4</SelectItem>
                                                        <SelectItem value="letter">Carta</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="showLogo">Mostrar Logo</Label>
                                                <p className="text-sm text-muted-foreground">Muestra el logo de la empresa en los recibos</p>
                                            </div>
                                            <Switch
                                                id="showLogo"
                                                checked={posSettings.receipt.showLogo}
                                                onCheckedChange={(checked) => handleChange("receipt", "showLogo", checked)}
                                            />
                                        </div>
                                        <Separator />

                                        {/* Más opciones de configuración de recibos */}
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t p-4">
                                        <Button variant="outline">Vista Previa</Button>
                                        <Button variant="outline">Imprimir Prueba</Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {activeTab === "payment" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Métodos de Pago</CardTitle>
                                                <CardDescription>Configura los métodos de pago aceptados en tu punto de venta</CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("payment")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contenido de la configuración de métodos de pago */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="acceptCash">Efectivo</Label>
                                                    <p className="text-sm text-muted-foreground">Aceptar pagos en efectivo</p>
                                                </div>
                                            </div>
                                            <Switch
                                                id="acceptCash"
                                                checked={posSettings.payment.acceptCash}
                                                onCheckedChange={(checked) => handleChange("payment", "acceptCash", checked)}
                                            />
                                        </div>
                                        <Separator />

                                        {/* Más opciones de configuración de métodos de pago */}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "inventory" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Configuración de Inventario</CardTitle>
                                                <CardDescription>Configura cómo se maneja el inventario en el punto de venta</CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("inventory")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contenido de la configuración de inventario */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="updateStockAutomatically">Actualizar Stock Automáticamente</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Reduce el stock automáticamente al realizar una venta
                                                </p>
                                            </div>
                                            <Switch
                                                id="updateStockAutomatically"
                                                checked={posSettings.inventory.updateStockAutomatically}
                                                onCheckedChange={(checked) => handleChange("inventory", "updateStockAutomatically", checked)}
                                            />
                                        </div>
                                        <Separator />

                                        {/* Más opciones de configuración de inventario */}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "users" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Configuración de Usuarios</CardTitle>
                                                <CardDescription>
                                                    Configura los permisos y restricciones para los usuarios del POS
                                                </CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("users")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contenido de la configuración de usuarios */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="requirePinForRefunds">Requerir PIN para Devoluciones</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Solicita PIN de administrador para procesar devoluciones
                                                </p>
                                            </div>
                                            <Switch
                                                id="requirePinForRefunds"
                                                checked={posSettings.users.requirePinForRefunds}
                                                onCheckedChange={(checked) => handleChange("users", "requirePinForRefunds", checked)}
                                            />
                                        </div>
                                        <Separator />

                                        {/* Más opciones de configuración de usuarios */}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "notifications" && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Notificaciones</CardTitle>
                                                <CardDescription>Configura las notificaciones y alertas del sistema</CardDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => showHelp("notifications")}>
                                                            <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Obtener ayuda</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Contenido de la configuración de notificaciones */}
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="lowStockNotifications">Alertas de Stock Bajo</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Notifica cuando el stock de productos está por debajo del umbral
                                                </p>
                                            </div>
                                            <Switch
                                                id="lowStockNotifications"
                                                checked={posSettings.notifications.lowStockNotifications}
                                                onCheckedChange={(checked) => handleChange("notifications", "lowStockNotifications", checked)}
                                            />
                                        </div>
                                        <Separator />

                                        {/* Más opciones de configuración de notificaciones */}
                                    </CardContent>
                                </Card>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Diálogo de confirmación para guardar cambios */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar Cambios</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas guardar los cambios realizados en la configuración?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                saveChanges()
                                setIsConfirmDialogOpen(false)
                            }}
                        >
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de ayuda */}
            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{helpContent[currentHelpTopic || ""]?.title || "Ayuda"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">
                            {helpContent[currentHelpTopic || ""]?.content || "No hay información de ayuda disponible para este tema."}
                        </p>

                        {currentHelpTopic === "general" && (
                            <div className="mt-4 space-y-4">
                                <h3 className="text-sm font-medium">Consejos:</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                    <li>Mantén actualizada la información de tu negocio para cumplir con requisitos legales.</li>
                                    <li>El nombre de la tienda aparecerá en los recibos y reportes.</li>
                                    <li>Configura correctamente la moneda y la tasa de impuesto según tu país.</li>
                                    <li>El logo debe tener un tamaño adecuado para que se vea bien en los recibos.</li>
                                </ul>
                            </div>
                        )}

                        {currentHelpTopic === "receipt" && (
                            <div className="mt-4 space-y-4">
                                <h3 className="text-sm font-medium">Consejos:</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                    <li>Incluye información fiscal obligatoria en tus recibos.</li>
                                    <li>Un mensaje personalizado en el pie de página puede mejorar la experiencia del cliente.</li>
                                    <li>Verifica que tu impresora sea compatible con el tamaño de papel seleccionado.</li>
                                    <li>Puedes incluir códigos QR para enlazar a tu sitio web o redes sociales.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsHelpDialogOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PosSettingsContent
