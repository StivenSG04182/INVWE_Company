"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

interface NewTicketFormProps {
    clients: any[]
    newTicketForm: {
        subject: string
        description: string
        priority: string
        category: string
        clientId: string
        status: string
    }
    setNewTicketForm: (form: any) => void
    handleCreateTicket: () => Promise<void>
    onCancel: () => void
}

export default function NewTicketForm({
    clients,
    newTicketForm,
    setNewTicketForm,
    handleCreateTicket,
    onCancel
}: NewTicketFormProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                    value={newTicketForm.clientId}
                    onValueChange={(value) => setNewTicketForm({ ...newTicketForm, clientId: value })}
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
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    placeholder="Asunto del ticket"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    placeholder="Describa el problema o solicitud"
                    rows={4}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Prioridad</Label>
                    <RadioGroup
                        value={newTicketForm.priority}
                        onValueChange={(value) => setNewTicketForm({ ...newTicketForm, priority: value })}
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
                        value={newTicketForm.category}
                        onValueChange={(value) => setNewTicketForm({ ...newTicketForm, category: value })}
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

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" onClick={handleCreateTicket}>
                    Crear Ticket
                </Button>
            </DialogFooter>
        </div>
    )
}