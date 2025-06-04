"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getCustomers, sendInvoiceEmail, sendTransactionEmailById } from "@/lib/queries3" // Actualizamos imports

interface EmailModalProps {
    isOpen: boolean
    onClose: () => void
    documentType: "invoice" | "transaction"
    documentId: string
    agencyId: string
    defaultCustomer?: {
        name: string
        email?: string
    } | null
}

export const EmailModal = ({
    isOpen,
    onClose,
    documentType,
    documentId,
    agencyId,
    defaultCustomer,
}: EmailModalProps) => {
    const [sendType, setSendType] = useState<"existing" | "custom">("existing")
    const [selectedCustomerId, setSelectedCustomerId] = useState("")
    const [customName, setCustomName] = useState("")
    const [customEmail, setCustomEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [customers, setCustomers] = useState<any[]>([])
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Cargar clientes al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadCustomers()
            setDefaultValues()
        }
    }, [isOpen])

    const loadCustomers = async () => {
        setIsLoadingCustomers(true)
        try {
            const result = await getCustomers({ agencyId })
            if (result.success) {
                setCustomers(result.data)
            }
        } catch (error) {
            console.error("Error al cargar clientes:", error)
        } finally {
            setIsLoadingCustomers(false)
        }
    }

    const setDefaultValues = () => {
        // Configurar valores por defecto
        if (defaultCustomer?.email) {
            setSendType("existing")
            setCustomName(defaultCustomer.name)
            setCustomEmail(defaultCustomer.email)
        }

        // Configurar asunto por defecto
        const defaultSubject =
            documentType === "invoice"
                ? `Factura ${documentId.substring(0, 8)} - Su factura está lista`
                : `Recibo de transacción ${documentId.substring(0, 8)}`
        setSubject(defaultSubject)

        // Configurar mensaje por defecto
        const defaultMessage =
            documentType === "invoice"
                ? `Estimado cliente,\n\nAdjunto encontrará su factura. Si tiene alguna pregunta, no dude en contactarnos.\n\nGracias por su preferencia.`
                : `Estimado cliente,\n\nAdjunto encontrará el recibo de su transacción. Gracias por su compra.\n\nSaludos cordiales.`
        setMessage(defaultMessage)
    }

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    const handleSend = async () => {
        // Validaciones permanecen igual
        if (sendType === "existing" && !selectedCustomerId) {
            toast.error("Por favor seleccione un cliente")
            return
        }

        if (sendType === "custom") {
            if (!customName.trim()) {
                toast.error("Por favor ingrese el nombre del cliente")
                return
            }
            if (!customEmail.trim()) {
                toast.error("Por favor ingrese un email válido")
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)) {
                toast.error("Por favor ingrese un email válido")
                return
            }
        }

        setIsSending(true)
        try {
            let recipientEmail = ""
            let recipientName = ""

            if (sendType === "existing") {
                const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
                recipientEmail = selectedCustomer?.email || ""
                recipientName = selectedCustomer?.name || ""
            } else {
                recipientEmail = customEmail
                recipientName = customName
            }

            // Usar las funciones correspondientes según el tipo de documento
            if (documentType === "invoice") {
                const result = await sendInvoiceEmail({
                    invoiceId: documentId,
                    agencyId,
                    recipientEmail,
                    templateId: undefined, // opcional
                })

                if (!result.success) {
                    throw new Error(result.error || "Error al enviar el correo")
                }
            } else {
                const result = await sendTransactionEmailById({
                    transactionId: documentId,
                    agencyId,
                    emailData: {
                        recipientEmail,
                        recipientName,
                        subject,
                        message,
                    },
                })

                if (!result.success) {
                    throw new Error(result.error || "Error al enviar el correo")
                }
            }

            toast.success("Correo enviado exitosamente")
            onClose()
        } catch (error) {
            toast.error("Error al enviar el correo")
            console.error(error)
        } finally {
            setIsSending(false)
        }
    }

    const handleClose = () => {
        // Resetear formulario
        setSendType("existing")
        setSelectedCustomerId("")
        setCustomName("")
        setCustomEmail("")
        setSubject("")
        setMessage("")
        setSearchTerm("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Enviar {documentType === "invoice" ? "Factura" : "Recibo"} por Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Tipo de envío */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">¿Cómo desea enviar el documento?</Label>
                        <RadioGroup value={sendType} onValueChange={(value: "existing" | "custom") => setSendType(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="existing" id="existing" />
                                <Label htmlFor="existing">Seleccionar cliente existente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="custom" />
                                <Label htmlFor="custom">Enviar a correo específico</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Selección de cliente existente */}
                    {sendType === "existing" && (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Buscar cliente</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o email..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Seleccionar cliente</Label>
                                    {isLoadingCustomers ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Cargando clientes...
                                        </div>
                                    ) : (
                                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un cliente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCustomers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{customer.name}</span>
                                                            {customer.email && (
                                                                <span className="text-sm text-muted-foreground">{customer.email}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Datos personalizados */}
                    {sendType === "custom" && (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customName">Nombre del cliente *</Label>
                                        <Input
                                            id="customName"
                                            placeholder="Nombre completo"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customEmail">Email del cliente *</Label>
                                        <Input
                                            id="customEmail"
                                            type="email"
                                            placeholder="cliente@ejemplo.com"
                                            value={customEmail}
                                            onChange={(e) => setCustomEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Configuración del email */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Asunto del correo</Label>
                            <Input
                                id="subject"
                                placeholder="Asunto del correo"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Mensaje personalizado</Label>
                            <Textarea
                                id="message"
                                placeholder="Mensaje que acompañará al documento..."
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-800">Información del envío:</p>
                                <ul className="text-blue-700 mt-1 space-y-1">
                                    <li>• El documento se adjuntará automáticamente en formato PDF</li>
                                    <li>• Se enviará desde la dirección de correo configurada de la empresa</li>
                                    <li>• El cliente recibirá una copia del documento para sus registros</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose} disabled={isSending}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSend} disabled={isSending} className="flex items-center gap-2">
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    Enviar Email
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
