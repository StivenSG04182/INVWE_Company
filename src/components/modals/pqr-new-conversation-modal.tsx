"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, User } from "lucide-react"

interface PqrNewConversationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clients: any[]
    onStartConversation: (clientId: string) => void
}

export default function PqrNewConversationModal({
    open,
    onOpenChange,
    clients,
    onStartConversation
}: PqrNewConversationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onClick={() => onStartConversation(client.id)}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}