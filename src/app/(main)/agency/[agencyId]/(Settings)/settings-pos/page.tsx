"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HelpCircle, DollarSign, CreditCard, Building, Receipt } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TabsContent } from "@/components/ui/tabs"

interface SettingsPosPageProps {
    posSettings: any
    handleChange: (section: string, field: string, value: any) => void
    saveChanges: () => void
}

const SettingsPosPage: React.FC<SettingsPosPageProps> = ({ posSettings, handleChange, saveChanges }) => {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)
    const [currentHelpTopic, setCurrentHelpTopic] = useState<string | null>(null)

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
            <div className="md:grid lg:grid-cols-[220px_1fr] gap-4">
                <aside className="hidden lg:block">
                    <div className="space-y-1">
                        <h4 className="font-medium leading-none">Configuración del POS</h4>
                        <p className="text-sm text-muted-foreground">Administra la configuración de tu punto de venta</p>
                    </div>
                    <Separator className="my-2" />
                </aside>
                <ScrollArea className="h-[80vh] space-y-6">
                    <TabsContent value="general" className="mt-0">
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
                                                        e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null,
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
                    </TabsContent>

                    <TabsContent value="receipt" className="mt-0">
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="showTaxDetails">Mostrar Detalles de Impuestos</Label>
                                        <p className="text-sm text-muted-foreground">Muestra el desglose de impuestos en los recibos</p>
                                    </div>
                                    <Switch
                                        id="showTaxDetails"
                                        checked={posSettings.receipt.showTaxDetails}
                                        onCheckedChange={(checked) => handleChange("receipt", "showTaxDetails", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="showFooter">Mostrar Pie de Página</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Incluye un mensaje personalizado al final del recibo
                                        </p>
                                    </div>
                                    <Switch
                                        id="showFooter"
                                        checked={posSettings.receipt.showFooter}
                                        onCheckedChange={(checked) => handleChange("receipt", "showFooter", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="footerText">Texto del Pie de Página</Label>
                                    <Textarea
                                        id="footerText"
                                        placeholder="Mensaje para el pie de página"
                                        value={posSettings.receipt.footerText}
                                        onChange={(e) => handleChange("receipt", "footerText", e.target.value)}
                                        disabled={!posSettings.receipt.showFooter}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="showQRCode">Mostrar Código QR</Label>
                                            <p className="text-sm text-muted-foreground">Incluye un código QR en el recibo</p>
                                        </div>
                                        <Switch
                                            id="showQRCode"
                                            checked={posSettings.receipt.showQRCode}
                                            onCheckedChange={(checked) => handleChange("receipt", "showQRCode", checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="showBarcode">Mostrar Código de Barras</Label>
                                            <p className="text-sm text-muted-foreground">Incluye un código de barras en el recibo</p>
                                        </div>
                                        <Switch
                                            id="showBarcode"
                                            checked={posSettings.receipt.showBarcode}
                                            onCheckedChange={(checked) => handleChange("receipt", "showBarcode", checked)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="printAutomatically">Imprimir Automáticamente</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Imprime el recibo automáticamente al finalizar la venta
                                        </p>
                                    </div>
                                    <Switch
                                        id="printAutomatically"
                                        checked={posSettings.receipt.printAutomatically}
                                        onCheckedChange={(checked) => handleChange("receipt", "printAutomatically", checked)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="receiptCopies">Número de Copias</Label>
                                        <Input
                                            id="receiptCopies"
                                            type="number"
                                            min="1"
                                            max="3"
                                            value={posSettings.receipt.receiptCopies}
                                            onChange={(e) => handleChange("receipt", "receiptCopies", Number.parseInt(e.target.value))}
                                            disabled={!posSettings.receipt.printAutomatically}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="printerName">Impresora Predeterminada</Label>
                                        <Input
                                            id="printerName"
                                            placeholder="Nombre de la impresora"
                                            value={posSettings.receipt.printerName}
                                            onChange={(e) => handleChange("receipt", "printerName", e.target.value)}
                                            disabled={!posSettings.receipt.printAutomatically}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fontSize">Tamaño de Fuente</Label>
                                    <Select
                                        value={posSettings.receipt.fontSize}
                                        onValueChange={(value) => handleChange("receipt", "fontSize", value)}
                                    >
                                        <SelectTrigger id="fontSize">
                                            <SelectValue placeholder="Selecciona un tamaño" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">Pequeño</SelectItem>
                                            <SelectItem value="medium">Mediano</SelectItem>
                                            <SelectItem value="large">Grande</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-4">
                                <Button variant="outline">Vista Previa</Button>
                                <Button variant="outline">Imprimir Prueba</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment" className="mt-0">
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

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="acceptCard">Tarjeta</Label>
                                            <p className="text-sm text-muted-foreground">Aceptar pagos con tarjeta de crédito/débito</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="acceptCard"
                                        checked={posSettings.payment.acceptCard}
                                        onCheckedChange={(checked) => handleChange("payment", "acceptCard", checked)}
                                    />
                                </div>

                                {posSettings.payment.acceptCard && (
                                    <div className="ml-7 p-3 bg-muted/30 rounded-md">
                                        <div className="text-sm font-medium mb-2">Procesadores de Tarjeta</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="dataphone"
                                                    checked={posSettings.payment.cardProcessors.includes("dataphone")}
                                                    onChange={(e) => {
                                                        const newProcessors = e.target.checked
                                                            ? [...posSettings.payment.cardProcessors, "dataphone"]
                                                            : posSettings.payment.cardProcessors.filter((p) => p !== "dataphone")
                                                        handleChange("payment", "cardProcessors", newProcessors)
                                                    }}
                                                />
                                                <label htmlFor="dataphone" className="text-sm">
                                                    Datáfono Físico
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="integrated"
                                                    checked={posSettings.payment.cardProcessors.includes("integrated")}
                                                    onChange={(e) => {
                                                        const newProcessors = e.target.checked
                                                            ? [...posSettings.payment.cardProcessors, "integrated"]
                                                            : posSettings.payment.cardProcessors.filter((p) => p !== "integrated")
                                                        handleChange("payment", "cardProcessors", newProcessors)
                                                    }}
                                                />
                                                <label htmlFor="integrated" className="text-sm">
                                                    Procesador Integrado
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="mobile"
                                                    checked={posSettings.payment.cardProcessors.includes("mobile")}
                                                    onChange={(e) => {
                                                        const newProcessors = e.target.checked
                                                            ? [...posSettings.payment.cardProcessors, "mobile"]
                                                            : posSettings.payment.cardProcessors.filter((p) => p !== "mobile")
                                                        handleChange("payment", "cardProcessors", newProcessors)
                                                    }}
                                                />
                                                <label htmlFor="mobile" className="text-sm">
                                                    Lector Móvil
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="acceptTransfer">Transferencia</Label>
                                            <p className="text-sm text-muted-foreground">Aceptar pagos por transferencia bancaria</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="acceptTransfer"
                                        checked={posSettings.payment.acceptTransfer}
                                        onCheckedChange={(checked) => handleChange("payment", "acceptTransfer", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Receipt className="h-5 w-5 text-muted-foreground" />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="acceptCredit">Crédito</Label>
                                            <p className="text-sm text-muted-foreground">Permitir ventas a crédito</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="acceptCredit"
                                        checked={posSettings.payment.acceptCredit}
                                        onCheckedChange={(checked) => handleChange("payment", "acceptCredit", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between pl-7">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireCustomerForCredit">Requerir Cliente para Crédito</Label>
                                        <p className="text-sm text-muted-foreground">Exigir seleccionar un cliente para ventas a crédito</p>
                                    </div>
                                    <Switch
                                        id="requireCustomerForCredit"
                                        checked={posSettings.payment.requireCustomerForCredit}
                                        onCheckedChange={(checked) => handleChange("payment", "requireCustomerForCredit", checked)}
                                        disabled={!posSettings.payment.acceptCredit}
                                    />
                                </div>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultPaymentMethod">Método de Pago Predeterminado</Label>
                                        <Select
                                            value={posSettings.payment.defaultPaymentMethod}
                                            onValueChange={(value) => handleChange("payment", "defaultPaymentMethod", value)}
                                        >
                                            <SelectTrigger id="defaultPaymentMethod">
                                                <SelectValue placeholder="Selecciona un método" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash" disabled={!posSettings.payment.acceptCash}>
                                                    Efectivo
                                                </SelectItem>
                                                <SelectItem value="card" disabled={!posSettings.payment.acceptCard}>
                                                    Tarjeta
                                                </SelectItem>
                                                <SelectItem value="transfer" disabled={!posSettings.payment.acceptTransfer}>
                                                    Transferencia
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowMultiplePaymentMethods">Permitir Pagos Mixtos</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permite pagar una venta con múltiples métodos de pago
                                        </p>
                                    </div>
                                    <Switch
                                        id="allowMultiplePaymentMethods"
                                        checked={posSettings.payment.allowMultiplePaymentMethods}
                                        onCheckedChange={(checked) => handleChange("payment", "allowMultiplePaymentMethods", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowPartialPayments">Permitir Pagos Parciales</Label>
                                        <p className="text-sm text-muted-foreground">Permite pagos parciales y saldos pendientes</p>
                                    </div>
                                    <Switch
                                        id="allowPartialPayments"
                                        checked={posSettings.payment.allowPartialPayments}
                                        onCheckedChange={(checked) => handleChange("payment", "allowPartialPayments", checked)}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowRefunds">Permitir Devoluciones</Label>
                                        <p className="text-sm text-muted-foreground">Permite procesar devoluciones de ventas</p>
                                    </div>
                                    <Switch
                                        id="allowRefunds"
                                        checked={posSettings.payment.allowRefunds}
                                        onCheckedChange={(checked) => handleChange("payment", "allowRefunds", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between pl-7">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireAuthForRefunds">Requerir Autorización para Devoluciones</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Exige autorización de administrador para devoluciones
                                        </p>
                                    </div>
                                    <Switch
                                        id="requireAuthForRefunds"
                                        checked={posSettings.payment.requireAuthForRefunds}
                                        onCheckedChange={(checked) => handleChange("payment", "requireAuthForRefunds", checked)}
                                        disabled={!posSettings.payment.allowRefunds}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory" className="mt-0">
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowNegativeStock">Permitir Stock Negativo</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permite vender productos aunque no haya stock disponible
                                        </p>
                                    </div>
                                    <Switch
                                        id="allowNegativeStock"
                                        checked={posSettings.inventory.allowNegativeStock}
                                        onCheckedChange={(checked) => handleChange("inventory", "allowNegativeStock", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="showLowStockAlert">Mostrar Alerta de Stock Bajo</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Muestra una alerta cuando el stock está por debajo del umbral
                                        </p>
                                    </div>
                                    <Switch
                                        id="showLowStockAlert"
                                        checked={posSettings.inventory.showLowStockAlert}
                                        onCheckedChange={(checked) => handleChange("inventory", "showLowStockAlert", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lowStockThreshold">Umbral de Stock Bajo</Label>
                                    <Input
                                        id="lowStockThreshold"
                                        type="number"
                                        min="1"
                                        value={posSettings.inventory.lowStockThreshold}
                                        onChange={(e) => handleChange("inventory", "lowStockThreshold", Number.parseInt(e.target.value))}
                                        disabled={!posSettings.inventory.showLowStockAlert}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="trackInventoryByLocation">Seguimiento por Ubicación</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permite rastrear el inventario por ubicación o almacén
                                        </p>
                                    </div>
                                    <Switch
                                        id="trackInventoryByLocation"
                                        checked={posSettings.inventory.trackInventoryByLocation}
                                        onCheckedChange={(checked) => handleChange("inventory", "trackInventoryByLocation", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowTransfers">Permitir Transferencias</Label>
                                        <p className="text-sm text-muted-foreground">Permite transferir inventario entre ubicaciones</p>
                                    </div>
                                    <Switch
                                        id="allowTransfers"
                                        checked={posSettings.inventory.allowTransfers}
                                        onCheckedChange={(checked) => handleChange("inventory", "allowTransfers", checked)}
                                        disabled={!posSettings.inventory.trackInventoryByLocation}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireStockCount">Requerir Conteo de Inventario</Label>
                                        <p className="text-sm text-muted-foreground">Exige realizar conteos periódicos de inventario</p>
                                    </div>
                                    <Switch
                                        id="requireStockCount"
                                        checked={posSettings.inventory.requireStockCount}
                                        onCheckedChange={(checked) => handleChange("inventory", "requireStockCount", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stockCountFrequency">Frecuencia de Conteo</Label>
                                    <Select
                                        value={posSettings.inventory.stockCountFrequency}
                                        onValueChange={(value) => handleChange("inventory", "stockCountFrequency", value)}
                                        disabled={!posSettings.inventory.requireStockCount}
                                    >
                                        <SelectTrigger id="stockCountFrequency">
                                            <SelectValue placeholder="Selecciona una frecuencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="biweekly">Quincenal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                            <SelectItem value="quarterly">Trimestral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowPurchaseOrders">Permitir Órdenes de Compra</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Habilita la creación de órdenes de compra a proveedores
                                        </p>
                                    </div>
                                    <Switch
                                        id="allowPurchaseOrders"
                                        checked={posSettings.inventory.allowPurchaseOrders}
                                        onCheckedChange={(checked) => handleChange("inventory", "allowPurchaseOrders", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="autoGenerateBarcodes">Generar Códigos de Barras</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Genera códigos de barras automáticamente para nuevos productos
                                        </p>
                                    </div>
                                    <Switch
                                        id="autoGenerateBarcodes"
                                        checked={posSettings.inventory.autoGenerateBarcodes}
                                        onCheckedChange={(checked) => handleChange("inventory", "autoGenerateBarcodes", checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="mt-0">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Configuración de Usuarios</CardTitle>
                                        <CardDescription>Configura los permisos y restricciones para los usuarios del POS</CardDescription>
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requirePinForDiscounts">Requerir PIN para Descuentos</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Solicita PIN de administrador para aplicar descuentos
                                        </p>
                                    </div>
                                    <Switch
                                        id="requirePinForDiscounts"
                                        checked={posSettings.users.requirePinForDiscounts}
                                        onCheckedChange={(checked) => handleChange("users", "requirePinForDiscounts", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowMultipleCashiers">Permitir Múltiples Cajeros</Label>
                                        <p className="text-sm text-muted-foreground">Permite que varios cajeros trabajen simultáneamente</p>
                                    </div>
                                    <Switch
                                        id="allowMultipleCashiers"
                                        checked={posSettings.users.allowMultipleCashiers}
                                        onCheckedChange={(checked) => handleChange("users", "allowMultipleCashiers", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireCashierForSales">Requerir Selección de Cajero</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Exige seleccionar un cajero antes de iniciar una venta
                                        </p>
                                    </div>
                                    <Switch
                                        id="requireCashierForSales"
                                        checked={posSettings.users.requireCashierForSales}
                                        onCheckedChange={(checked) => handleChange("users", "requireCashierForSales", checked)}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="trackCashierActivity">Seguimiento de Actividad</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Registra todas las acciones realizadas por los cajeros
                                        </p>
                                    </div>
                                    <Switch
                                        id="trackCashierActivity"
                                        checked={posSettings.users.trackCashierActivity}
                                        onCheckedChange={(checked) => handleChange("users", "trackCashierActivity", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowCashierReports">Permitir Reportes de Cajero</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permite a los cajeros ver sus propios reportes de ventas
                                        </p>
                                    </div>
                                    <Switch
                                        id="allowCashierReports"
                                        checked={posSettings.users.allowCashierReports}
                                        onCheckedChange={(checked) => handleChange("users", "allowCashierReports", checked)}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cashierPermissions">Permisos de Cajero</Label>
                                        <Select
                                            value={posSettings.users.cashierPermissions}
                                            onValueChange={(value) => handleChange("users", "cashierPermissions", value)}
                                        >
                                            <SelectTrigger id="cashierPermissions">
                                                <SelectValue placeholder="Selecciona un nivel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="minimal">Mínimo (solo ventas)</SelectItem>
                                                <SelectItem value="restricted">Restringido (ventas y consultas)</SelectItem>
                                                <SelectItem value="standard">Estándar (ventas, consultas y devoluciones)</SelectItem>
                                                <SelectItem value="extended">Extendido (casi todo excepto configuración)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="managerPermissions">Permisos de Gerente</Label>
                                        <Select
                                            value={posSettings.users.managerPermissions}
                                            onValueChange={(value) => handleChange("users", "managerPermissions", value)}
                                        >
                                            <SelectTrigger id="managerPermissions">
                                                <SelectValue placeholder="Selecciona un nivel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Estándar (sin configuración avanzada)</SelectItem>
                                                <SelectItem value="extended">Extendido (sin configuración fiscal)</SelectItem>
                                                <SelectItem value="full">Completo (acceso total)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requirePasswordChange">Requerir Cambio de Contraseña</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Exige a los usuarios cambiar su contraseña periódicamente
                                        </p>
                                    </div>
                                    <Switch
                                        id="requirePasswordChange"
                                        checked={posSettings.users.requirePasswordChange}
                                        onCheckedChange={(checked) => handleChange("users", "requirePasswordChange", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="passwordExpiryDays">Días para Expiración de Contraseña</Label>
                                    <Input
                                        id="passwordExpiryDays"
                                        type="number"
                                        min="30"
                                        max="365"
                                        value={posSettings.users.passwordExpiryDays}
                                        onChange={(e) => handleChange("users", "passwordExpiryDays", Number.parseInt(e.target.value))}
                                        disabled={!posSettings.users.requirePasswordChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="salesSummaryNotifications">Resumen de Ventas</Label>
                                        <p className="text-sm text-muted-foreground">Envía un resumen de las ventas del día</p>
                                    </div>
                                    <Switch
                                        id="salesSummaryNotifications"
                                        checked={posSettings.notifications.salesSummaryNotifications}
                                        onCheckedChange={(checked) => handleChange("notifications", "salesSummaryNotifications", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="cashClosingReminders">Recordatorios de Cierre de Caja</Label>
                                        <p className="text-sm text-muted-foreground">Envía recordatorios para realizar el cierre de caja</p>
                                    </div>
                                    <Switch
                                        id="cashClosingReminders"
                                        checked={posSettings.notifications.cashClosingReminders}
                                        onCheckedChange={(checked) => handleChange("notifications", "cashClosingReminders", checked)}
                                    />
                                </div>
                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="notificationEmail">Correo para Notificaciones</Label>
                                    <Input
                                        id="notificationEmail"
                                        type="email"
                                        placeholder="Correo electrónico para notificaciones"
                                        value={posSettings.notifications.notificationEmail}
                                        onChange={(e) => handleChange("notifications", "notificationEmail", e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="sendDailyReports">Reportes Diarios</Label>
                                            <p className="text-sm text-muted-foreground">Envía reportes diarios por correo</p>
                                        </div>
                                        <Switch
                                            id="sendDailyReports"
                                            checked={posSettings.notifications.sendDailyReports}
                                            onCheckedChange={(checked) => handleChange("notifications", "sendDailyReports", checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="sendWeeklyReports">Reportes Semanales</Label>
                                            <p className="text-sm text-muted-foreground">Envía reportes semanales por correo</p>
                                        </div>
                                        <Switch
                                            id="sendWeeklyReports"
                                            checked={posSettings.notifications.sendWeeklyReports}
                                            onCheckedChange={(checked) => handleChange("notifications", "sendWeeklyReports", checked)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifyOnLargeRefunds">Alertas de Devoluciones Grandes</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifica cuando se realiza una devolución por un monto elevado
                                        </p>
                                    </div>
                                    <Switch
                                        id="notifyOnLargeRefunds"
                                        checked={posSettings.notifications.notifyOnLargeRefunds}
                                        onCheckedChange={(checked) => handleChange("notifications", "notifyOnLargeRefunds", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="largeRefundThreshold">Umbral para Devoluciones Grandes</Label>
                                    <Input
                                        id="largeRefundThreshold"
                                        type="number"
                                        min="10000"
                                        value={posSettings.notifications.largeRefundThreshold}
                                        onChange={(e) =>
                                            handleChange("notifications", "largeRefundThreshold", Number.parseInt(e.target.value))
                                        }
                                        disabled={!posSettings.notifications.notifyOnLargeRefunds}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Monto a partir del cual se considera una devolución como grande
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </ScrollArea>
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
                        <DialogTitle>{helpContent[currentHelpTopic]?.title || "Ayuda"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">
                            {helpContent[currentHelpTopic]?.content || "No hay información de ayuda disponible para este tema."}
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

export default SettingsPosPage
