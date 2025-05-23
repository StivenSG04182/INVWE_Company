"use client"

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NewTicketForm from "@/components/forms/new-ticket-form"

interface NewTicketModalProps {
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

export default function NewTicketModal({
    clients,
    newTicketForm,
    setNewTicketForm,
    handleCreateTicket,
    onCancel
}: NewTicketModalProps) {
    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Nuevo Ticket</DialogTitle>
                <DialogDescription>
                    Complete el formulario para crear un nuevo ticket de soporte.
                </DialogDescription>
            </DialogHeader>

            <NewTicketForm 
                clients={clients}
                newTicketForm={newTicketForm}
                setNewTicketForm={setNewTicketForm}
                handleCreateTicket={handleCreateTicket}
                onCancel={onCancel}
            />
        </DialogContent>
    )
}