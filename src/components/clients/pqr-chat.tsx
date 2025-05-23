"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Building2, DollarSign, HelpCircle, MessageSquare, User } from "lucide-react"

// Componentes modulares
import PqrChatInterface from "./pqr-chat-interface"
import PqrTicketList from "./pqr-ticket-list"
import PqrNewConversationModal from "@/components/modals/pqr-new-conversation-modal"
import PqrNewTicketModal from "@/components/modals/pqr-new-ticket-modal"

export default function PqrChat({
    clients,
    selectedClient,
    isLoading,
}: {
    clients: any[] // Ahora recibe clientes reales de la base de datos
    selectedClient: any
    isLoading: boolean
}) {
    const [activeTab, setActiveTab] = useState("chat")
    const [filterStatus, setFilterStatus] = useState("all")
    const [message, setMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTicket, setSelectedTicket] = useState<any>(null)

    // Estados para controlar los modales
    const [newConversationOpen, setNewConversationOpen] = useState(false)
    const [newTicketOpen, setNewTicketOpen] = useState(false)
    const [selectedClientForChat, setSelectedClientForChat] = useState<any>(null)

    // Estado para el formulario de nuevo ticket
    const [newTicketForm, setNewTicketForm] = useState({
        subject: "",
        description: "",
        priority: "medium",
        category: "general",
        clientId: "",
        status: "open"
    })

    // Usar PQRs reales del cliente seleccionado
    // Transformamos los PQRs a un formato compatible con la interfaz de tickets
    const [tickets, setTickets] = useState<any[]>([])

    // Inicializar tickets con los PQRs del cliente seleccionado
    useEffect(() => {
        if (selectedClient?.PQRs && selectedClient.PQRs.length > 0) {
            // Transformar PQRs a formato de tickets
            const formattedTickets = selectedClient.PQRs.map((pqr: any) => ({
                id: pqr.id,
                clientId: pqr.clientId,
                subject: pqr.title,
                status: pqr.status.toLowerCase(),
                priority: pqr.priority.toLowerCase(),
                category: pqr.type.toLowerCase(),
                createdAt: pqr.createdAt,
                lastUpdated: pqr.updatedAt,
                assignedTo: pqr.AssignedUser?.name || 'Sin asignar',
                // Creamos un mensaje inicial con la descripción del PQR
                messages: [
                    {
                        id: `msg-${pqr.id}-1`,
                        sender: "client",
                        content: pqr.description,
                        timestamp: pqr.createdAt,
                        read: true,
                    }
                ],
            }))
            setTickets(formattedTickets)
        } else {
            // Si no hay PQRs, establecer tickets como array vacío
            setTickets([])
        }
    }, [selectedClient])

    // Filter tickets by status and search term
    // Ya no necesitamos filtrar por cliente, ya que tickets ya contiene solo los del cliente seleccionado
    const filteredTickets = tickets.filter((ticket) => {
        const matchesStatus = filterStatus === "all" ? true : ticket.status === filterStatus
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesStatus && matchesSearch
    })

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedTicket) return

        try {
            // Importar la función saveMessage de client-queries.ts
            const { saveMessage } = await import('@/lib/client-queries')

            // Guardar el mensaje en la base de datos
            await saveMessage({
                pqrId: selectedTicket.id,
                content: message,
                sender: "agent",
                agentName: "Usuario Actual",
            })

            const newMessage = {
                id: `msg${selectedTicket.messages.length + 1}`,
                sender: "agent",
                content: message,
                timestamp: new Date().toISOString(),
                read: true,
                agentName: "Usuario Actual",
            }

            const updatedTickets = tickets.map((ticket) => {
                if (ticket.id === selectedTicket.id) {
                    return {
                        ...ticket,
                        messages: [...ticket.messages, newMessage],
                        lastUpdated: new Date().toISOString(),
                    }
                }
                return ticket
            })

            setTickets(updatedTickets)
            setSelectedTicket({
                ...selectedTicket,
                messages: [...selectedTicket.messages, newMessage],
                lastUpdated: new Date().toISOString(),
            })
            setMessage("")
        } catch (error) {
            console.error("Error al enviar mensaje:", error)
            // Aquí podrías mostrar una notificación de error al usuario
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    const formatShortDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(date)
        } else if (diffDays === 1) {
            return "Ayer"
        } else if (diffDays < 7) {
            return new Intl.DateTimeFormat("es-CO", { weekday: "short" }).format(date)
        } else {
            return new Intl.DateTimeFormat("es-CO", { month: "short", day: "numeric" }).format(date)
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge variant="destructive">Alta</Badge>
            case "medium":
                return <Badge variant="default">Media</Badge>
            case "low":
                return <Badge variant="secondary">Baja</Badge>
            default:
                return <Badge variant="outline">Normal</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return (
                    <Badge variant="default" className="bg-green-500">
                        Abierto
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="default" className="bg-amber-500">
                        Pendiente
                    </Badge>
                )
            case "closed":
                return <Badge variant="secondary">Cerrado</Badge>
            default:
                return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "billing":
                return <DollarSign className="h-4 w-4 text-amber-500" />
            case "technical":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            case "information":
                return <HelpCircle className="h-4 w-4 text-blue-500" />
            default:
                return <MessageSquare className="h-4 w-4 text-gray-500" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Función para manejar cambios en el formulario de nuevo ticket
    const handleTicketFormChange = (field: string, value: string) => {
        setNewTicketForm(prev => ({ ...prev, [field]: value }))
    }

    // Función para crear un nuevo ticket
    const handleCreateTicket = async () => {
        try {
            // Importar la función createPQR de client-queries.ts
            const { createPQR } = await import('@/lib/client-queries')

            // Crear el PQR en la base de datos
            const newPQR = await createPQR({
                title: newTicketForm.subject,
                description: newTicketForm.description,
                clientId: newTicketForm.clientId,
                priority: newTicketForm.priority.toUpperCase(),
                status: newTicketForm.status.toUpperCase(),
                type: newTicketForm.category.toUpperCase(),
            })

            // Actualizar la lista de tickets
            const newTicket = {
                id: newPQR.id,
                clientId: newPQR.clientId,
                subject: newPQR.title,
                status: newPQR.status.toLowerCase(),
                priority: newPQR.priority.toLowerCase(),
                category: newPQR.type.toLowerCase(),
                createdAt: newPQR.createdAt,
                lastUpdated: newPQR.updatedAt,
                assignedTo: newPQR.AssignedUser?.name || 'Sin asignar',
                messages: [
                    {
                        id: `msg-${newPQR.id}-1`,
                        sender: "client",
                        content: newPQR.description,
                        timestamp: newPQR.createdAt,
                        read: true,
                    }
                ],
            }

            setTickets([...tickets, newTicket])
            setNewTicketOpen(false)
            setNewTicketForm({
                subject: "",
                description: "",
                priority: "medium",
                category: "general",
                clientId: "",
                status: "open"
            })

            // Seleccionar el nuevo ticket y cambiar a la pestaña de chat
            setSelectedTicket(newTicket)
            setActiveTab("chat")
        } catch (error) {
            console.error("Error al crear ticket:", error)
        }
    }

    // Función para iniciar una nueva conversación con un cliente
    const handleStartConversation = async (clientId: string) => {
        const client = clients.find(c => c.id === clientId)
        if (!client) return

        setSelectedClientForChat(client)

        // Si el cliente ya tiene tickets, seleccionar el primero
        if (client.PQRs && client.PQRs.length > 0) {
            const clientTickets = tickets.filter(t => t.clientId === clientId)
            if (clientTickets.length > 0) {
                setSelectedTicket(clientTickets[0])
            } else {
                // Si no hay tickets en el estado pero sí en el cliente, transformarlos
                const formattedTickets = client.PQRs.map((pqr: any) => ({
                    id: pqr.id,
                    clientId: pqr.clientId,
                    subject: pqr.title,
                    status: pqr.status.toLowerCase(),
                    priority: pqr.priority.toLowerCase(),
                    category: pqr.type.toLowerCase(),
                    createdAt: pqr.createdAt,
                    lastUpdated: pqr.updatedAt,
                    assignedTo: pqr.AssignedUser?.name || 'Sin asignar',
                    messages: [
                        {
                            id: `msg-${pqr.id}-1`,
                            sender: "client",
                            content: pqr.description,
                            timestamp: pqr.createdAt,
                            read: true,
                        }
                    ],
                }))

                if (formattedTickets.length > 0) {
                    setSelectedTicket(formattedTickets[0])
                }
            }
        } else {
            // Si no tiene tickets, abrir el modal para crear uno nuevo
            setNewTicketForm(prev => ({ ...prev, clientId: clientId }))
            setNewTicketOpen(true)
        }

        setNewConversationOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Modal para seleccionar cliente para nueva conversación */}
            <PqrNewConversationModal
                open={newConversationOpen}
                onOpenChange={setNewConversationOpen}
                clients={clients}
                onStartConversation={handleStartConversation}
            />

            {/* Modal para crear nuevo ticket */}
            <PqrNewTicketModal
                open={newTicketOpen}
                onOpenChange={setNewTicketOpen}
                clients={clients}
                formData={newTicketForm}
                onFormChange={handleTicketFormChange}
                onCreateTicket={handleCreateTicket}
            />

            <Card className="overflow-hidden">
                <CardHeader className="px-6 py-4">
                    <CardTitle>Gestión de PQRs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-12rem)]">
                        <div className="border-b px-6 py-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="chat">Chat</TabsTrigger>
                                <TabsTrigger value="info">Información</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="h-[calc(100%-3rem)] flex">
                            {/* Panel izquierdo: Lista de tickets */}
                            <div className="w-1/3 border-r h-full">
                                <PqrTicketList
                                    filteredTickets={filteredTickets}
                                    selectedTicket={selectedTicket}
                                    setSelectedTicket={setSelectedTicket}
                                    filterStatus={filterStatus}
                                    setFilterStatus={setFilterStatus}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    formatShortDate={formatShortDate}
                                    getPriorityBadge={getPriorityBadge}
                                    getCategoryIcon={getCategoryIcon}
                                    onNewConversation={() => setNewConversationOpen(true)}
                                />
                            </div>

                            {/* Panel derecho: Contenido de las pestañas */}
                            <div className="w-2/3 h-full">
                                <TabsContent value="chat" className="m-0 h-full">
                                    <PqrChatInterface
                                        selectedTicket={selectedTicket}
                                        message={message}
                                        setMessage={setMessage}
                                        handleSendMessage={handleSendMessage}
                                        formatDate={formatDate}
                                        getPriorityBadge={getPriorityBadge}
                                        getStatusBadge={getStatusBadge}
                                        getCategoryIcon={getCategoryIcon}
                                    />
                                </TabsContent>

                                <TabsContent value="info" className="m-0 h-full p-6">
                                    {selectedTicket ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Detalles del Ticket</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">ID</p>
                                                        <p>{selectedTicket.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                                        <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Creado</p>
                                                        <p>{formatDate(selectedTicket.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                                                        <p>{formatDate(selectedTicket.lastUpdated)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Prioridad</p>
                                                        <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {getCategoryIcon(selectedTicket.category)}
                                                            <span className="capitalize">
                                                                {selectedTicket.category === "billing"
                                                                    ? "Facturación"
                                                                    : selectedTicket.category === "technical"
                                                                    ? "Técnico"
                                                                    : selectedTicket.category === "information"
                                                                    ? "Información"
                                                                    : "General"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                                                        <p>{selectedTicket.assignedTo}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                            {selectedClient?.type === "empresa" ? (
                                                                <Building2 className="h-6 w-6" />
                                                            ) : (
                                                                <User className="h-6 w-6" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-medium">{selectedClient?.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedClient?.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">Seleccione un ticket para ver la información</h3>
                                            <p className="text-muted-foreground mt-2">
                                                Elija un ticket de la lista para ver sus detalles.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
