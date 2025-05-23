"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    AlertCircle,
    Building2,
    ChevronRight,
    Clock,
    HelpCircle,
    MessageSquare,
    PlusCircle,
    Search,
    User,
    DollarSign
} from "lucide-react"

interface PqrTicketListProps {
    filteredTickets: any[]
    selectedTicket: any
    setSelectedTicket: (ticket: any) => void
    filterStatus: string
    setFilterStatus: (status: string) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    formatShortDate: (dateString: string) => string
    getPriorityBadge: (priority: string) => JSX.Element
    getCategoryIcon: (category: string) => JSX.Element
    onNewConversation: () => void
}

export default function PqrTicketList({
    filteredTickets,
    selectedTicket,
    setSelectedTicket,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    formatShortDate,
    getPriorityBadge,
    getCategoryIcon,
    onNewConversation
}: PqrTicketListProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Encabezado y filtros */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Tickets</h3>
                    <Button size="sm" onClick={onNewConversation}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nuevo
                    </Button>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tickets..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Filtrar por" />
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

            {/* Lista de tickets */}
            <ScrollArea className="flex-1">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                        <h4 className="font-medium">No hay tickets</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            No se encontraron tickets con los filtros actuales.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? "bg-muted" : ""}`}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium truncate flex-1">{ticket.subject}</h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatShortDate(ticket.lastUpdated)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(ticket.category)}
                                        <span className="text-sm text-muted-foreground">
                                            {ticket.messages.length} mensaje{ticket.messages.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getPriorityBadge(ticket.priority)}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}