"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, User } from "lucide-react"

interface NewConversationModalProps {
    clients: any[]
    onSelectClient: (clientId: string) => void
    onCancel: () => void
}

export default function NewConversationModal({
    clients,
    onSelectClient,
    onCancel
}: NewConversationModalProps) {
    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Nueva Conversación</DialogTitle>
                <DialogDescription>
                    Seleccione un cliente para iniciar una nueva conversación.
                </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto py-4">
                <div className="space-y-2">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => onSelectClient(client.id)}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {client.type === "empresa" ? (
                                        <Building2 className="h-5 w-5" />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-medium">{client.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {client.email || client.phone || "Sin información de contacto"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}