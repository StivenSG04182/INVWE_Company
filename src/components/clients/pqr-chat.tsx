"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    AlertCircle,
    Building2,
    ChevronRight,
    Clock,
    File,
    HelpCircle,
    Mail,
    MessageSquare,
    Paperclip,
    Phone,
    PlusCircle,
    Search,
    Send,
    Smile,
    ThumbsUp,
    User,
    DollarSign,
} from "lucide-react"


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
    const messagesEndRef = useRef<HTMLDivElement>(null)

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

    // Auto scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [selectedTicket])

    const handleSendMessage = () => {
        if (!message.trim() || !selectedTicket) return

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

    return (
        <div className="space-y-6">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="calls">Llamadas</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                            <div className="p-4 border-b bg-muted/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">Conversaciones</h3>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar conversación..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="open">Abiertos</SelectItem>
                                            <SelectItem value="pending">Pendientes</SelectItem>
                                            <SelectItem value="closed">Cerrados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto">
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => {
                                        const client = clients.find((c) => c.id === ticket.clientId)
                                        const lastMessage = ticket.messages[ticket.messages.length - 1]

                                        return (
                                            <div
                                                key={ticket.id}
                                                className={`p-4 border-b cursor-pointer hover:bg-muted/30 transition-colors ${selectedTicket?.id === ticket.id ? "bg-muted/50" : ""}`}
                                                onClick={() => setSelectedTicket(ticket)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>
                                                            {client?.type === "empresa" ? (
                                                                <Building2 className="h-5 w-5" />
                                                            ) : (
                                                                <User className="h-5 w-5" />
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium truncate">{client?.name || "Cliente desconocido"}</h4>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {formatShortDate(ticket.lastUpdated)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium truncate">{ticket.subject}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{lastMessage?.content}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getStatusBadge(ticket.status)}
                                                            {getPriorityBadge(ticket.priority)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 px-4">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Sin conversaciones</h3>
                                        <p className="text-muted-foreground text-center mt-2">
                                            No hay conversaciones que coincidan con los filtros actuales.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col">
                            {selectedTicket ? (
                                <>
                                    <div className="p-4 border-b bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{selectedTicket.subject}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-muted-foreground">
                                                        Ticket #{selectedTicket.id.replace("ticket", "")}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Creado: {formatDate(selectedTicket.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(selectedTicket.status)}
                                                {getPriorityBadge(selectedTicket.priority)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">Asignado a: {selectedTicket.assignedTo}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {getCategoryIcon(selectedTicket.category)}
                                                <span className="text-sm">
                                                    Categoría:{" "}
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
                                    </div>

                                    <div className="flex-1 p-4 overflow-y-auto max-h-[400px] bg-muted/10">
                                        <div className="space-y-4">
                                            {selectedTicket.messages.map((msg: any) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-3 ${msg.sender === "agent" ? "bg-primary text-primary-foreground" : "bg-muted"
                                                            }`}
                                                    >
                                                        {msg.sender === "agent" && msg.agentName && (
                                                            <p className="text-xs font-medium mb-1">{msg.agentName}</p>
                                                        )}
                                                        <p className="text-sm">{msg.content}</p>
                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {msg.attachments.map((attachment: any, index: number) => (
                                                                    <div
                                                                        key={index}
                                                                        className={`flex items-center gap-2 p-2 rounded ${msg.sender === "agent" ? "bg-primary-foreground/10" : "bg-background"
                                                                            }`}
                                                                    >
                                                                        <File className="h-4 w-4" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium truncate">{attachment.name}</p>
                                                                            <p className="text-xs opacity-70">{attachment.size}</p>
                                                                        </div>
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>

                                    <div className="p-4 border-t">
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Escribe un mensaje..."
                                                    className="min-h-[80px] py-2"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSendMessage()
                                                        }
                                                    }}
                                                    multiline
                                                />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <Paperclip className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <Smile className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    className="h-10 w-10 rounded-full p-0"
                                                    onClick={handleSendMessage}
                                                    disabled={!message.trim()}
                                                >
                                                    <Send className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12">
                                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-medium">Seleccione una conversación</h3>
                                    <p className="text-muted-foreground text-center max-w-md mt-2">
                                        Seleccione una conversación de la lista o inicie una nueva para comenzar a chatear.
                                    </p>
                                    <Button className="mt-4">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Nueva Conversación
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tickets de Soporte</CardTitle>
                            <CardDescription>Gestione las solicitudes, quejas y reclamos de sus clientes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar ticket..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-full sm:w-40">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="open">Abiertos</SelectItem>
                                            <SelectItem value="pending">Pendientes</SelectItem>
                                            <SelectItem value="closed">Cerrados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="flex items-center gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Nuevo Ticket</span>
                                </Button>
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 font-medium">Ticket</th>
                                                <th className="text-left py-3 px-4 font-medium">Cliente</th>
                                                <th className="text-left py-3 px-4 font-medium">Estado</th>
                                                <th className="text-left py-3 px-4 font-medium">Prioridad</th>
                                                <th className="text-left py-3 px-4 font-medium">Última Actualización</th>
                                                <th className="text-left py-3 px-4 font-medium">Asignado a</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTickets.length > 0 ? (
                                                filteredTickets.map((ticket) => {
                                                    const client = clients.find((c) => c.id === ticket.clientId)

                                                    return (
                                                        <tr
                                                            key={ticket.id}
                                                            className="border-b hover:bg-muted/30 cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedTicket(ticket)
                                                                setActiveTab("chat")
                                                            }}
                                                        >
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    {getCategoryIcon(ticket.category)}
                                                                    <div>
                                                                        <div className="font-medium">{ticket.subject}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            #{ticket.id.replace("ticket", "")} • Creado: {formatShortDate(ticket.createdAt)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs">
                                                                            {client?.type === "empresa" ? (
                                                                                <Building2 className="h-3 w-3" />
                                                                            ) : (
                                                                                <User className="h-3 w-3" />
                                                                            )}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span>{client?.name || "Cliente desconocido"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                                                            <td className="py-3 px-4">{getPriorityBadge(ticket.priority)}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{formatDate(ticket.lastUpdated)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4">{ticket.assignedTo}</td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                        No hay tickets que coincidan con los filtros actuales
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comunicación por Email</CardTitle>
                            <CardDescription>Gestione la comunicación por correo electrónico con sus clientes</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium">Comunicación por Email</h3>
                                <p className="text-muted-foreground text-center max-w-md mt-2">
                                    Esta funcionalidad estará disponible próximamente. Podrá gestionar toda la comunicación por correo
                                    electrónico con sus clientes desde aquí.
                                </p>
                                <Button className="mt-4">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Configurar Email
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calls" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Llamadas</CardTitle>
                            <CardDescription>Gestione y registre las llamadas con sus clientes</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <Phone className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium">Registro de Llamadas</h3>
                                <p className="text-muted-foreground text-center max-w-md mt-2">
                                    Esta funcionalidad estará disponible próximamente. Podrá registrar y gestionar todas las llamadas con
                                    sus clientes desde aquí.
                                </p>
                                <Button className="mt-4">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Registrar Llamada
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Estadísticas de comunicación */}
            {activeTab === "chat" && !selectedTicket && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                    <p className="text-2xl font-bold">{tickets.length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tickets Abiertos</p>
                                    <p className="text-2xl font-bold">{tickets.filter((t) => t.status === "open").length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tiempo Respuesta</p>
                                    <p className="text-2xl font-bold">1.5h</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                                    <p className="text-2xl font-bold">95%</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <ThumbsUp className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Resumen de tickets por categoría */}
            {activeTab === "tickets" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen por Categoría</CardTitle>
                        <CardDescription>Distribución de tickets por categoría y estado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-4 rounded-full bg-red-500"></div>
                                    <h4 className="font-medium">Técnicos</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Abiertos</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "technical" && t.status === "open").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Cerrados</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "technical" && t.status === "closed").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Total</span>
                                        <span>{tickets.filter((t) => t.category === "technical").length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                                    <h4 className="font-medium">Facturación</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Abiertos</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "billing" && t.status === "open").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Cerrados</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "billing" && t.status === "closed").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Total</span>
                                        <span>{tickets.filter((t) => t.category === "billing").length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                                    <h4 className="font-medium">Información</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Abiertos</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "information" && t.status === "open").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Cerrados</span>
                                        <span className="font-medium">
                                            {tickets.filter((t) => t.category === "information" && t.status === "closed").length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Total</span>
                                        <span>{tickets.filter((t) => t.category === "information").length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
