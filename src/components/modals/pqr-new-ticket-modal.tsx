"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PqrNewTicketModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clients: any[]
    formData: {
        subject: string
        description: string
        priority: string
        category: string
        clientId: string
        status: string
    }
    onFormChange: (field: string, value: string) => void
    onCreateTicket: () => Promise<void>
}

export default function PqrNewTicketModal({
    open,
    onOpenChange,
    clients,
    formData,
    onFormChange,
    onCreateTicket
}: PqrNewTicketModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Ticket</DialogTitle>
                    <DialogDescription>
                        Complete el formulario para crear un nuevo ticket de soporte.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="client">Cliente</Label>
                        <Select
                            value={formData.clientId}
                            onValueChange={(value) => onFormChange("clientId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Asunto</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => onFormChange("subject", e.target.value)}
                            placeholder="Asunto del ticket"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => onFormChange("description", e.target.value)}
                            placeholder="Describa el problema o solicitud"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Prioridad</Label>
                            <RadioGroup
                                value={formData.priority}
                                onValueChange={(value) => onFormChange("priority", value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="low" id="priority-low" />
                                    <Label htmlFor="priority-low">Baja</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="medium" id="priority-medium" />
                                    <Label htmlFor="priority-medium">Media</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="high" id="priority-high" />
                                    <Label htmlFor="priority-high">Alta</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid gap-2">
                            <Label>Categoría</Label>
                            <RadioGroup
                                value={formData.category}
                                onValueChange={(value) => onFormChange("category", value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="general" id="category-general" />
                                    <Label htmlFor="category-general">General</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="billing" id="category-billing" />
                                    <Label htmlFor="category-billing">Facturación</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="technical" id="category-technical" />
                                    <Label htmlFor="category-technical">Técnico</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="information" id="category-information" />
                                    <Label htmlFor="category-information">Información</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onCreateTicket}>Crear Ticket</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}