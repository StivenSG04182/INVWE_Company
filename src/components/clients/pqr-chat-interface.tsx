"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    AlertCircle,
    Building2,
    CheckCheck,
    Clock,
    Download,
    File,
    HelpCircle,
    MessageSquare,
    Paperclip,
    Send,
    Smile,
    User,
    DollarSign,
    Mic,
    Image,
    Camera,
    FileText,
    Video,
    Info,
    MoreHorizontal
} from "lucide-react"

interface PqrChatInterfaceProps {
    selectedTicket: any
    message: string
    setMessage: (message: string) => void
    handleSendMessage: () => Promise<void>
    formatDate: (dateString: string) => string
    getPriorityBadge: (priority: string) => JSX.Element
    getStatusBadge: (status: string) => JSX.Element
    getCategoryIcon: (category: string) => JSX.Element
}

export default function PqrChatInterface({
    selectedTicket,
    message,
    setMessage,
    handleSendMessage,
    formatDate,
    getPriorityBadge,
    getStatusBadge,
    getCategoryIcon
}: PqrChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [selectedTicket])

    if (!selectedTicket) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Seleccione un ticket para ver la conversación</h3>
                <p className="text-muted-foreground mt-2">
                    Elija un ticket de la lista o cree uno nuevo para comenzar a chatear.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Encabezado del chat */}
            <div className="border-b p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>Ticket #{selectedTicket.id.substring(0, 8)}</span>
                            <span>•</span>
                            <span>Creado: {formatDate(selectedTicket.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getPriorityBadge(selectedTicket.priority)}
                        {getStatusBadge(selectedTicket.status)}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                        {getCategoryIcon(selectedTicket.category)}
                        <span className="text-sm capitalize">
                            {selectedTicket.category === "billing"
                                ? "Facturación"
                                : selectedTicket.category === "technical"
                                ? "Técnico"
                                : selectedTicket.category === "information"
                                ? "Información"
                                : "General"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Asignado a: {selectedTicket.assignedTo}</span>
                    </div>
                </div>
            </div>

            {/* Área de mensajes */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {selectedTicket.messages.map((msg: any) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === "client" ? "justify-start" : "justify-end"}`}
                        >
                            <div
                                className={`flex gap-3 max-w-[80%] ${msg.sender === "client" ? "" : "flex-row-reverse"}`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {msg.sender === "client" ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Building2 className="h-4 w-4" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div
                                        className={`rounded-lg p-3 ${msg.sender === "client" ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.attachments.map((attachment: any) => (
                                                    <div
                                                        key={attachment.id}
                                                        className="flex items-center gap-2 p-2 rounded bg-background/50"
                                                    >
                                                        <File className="h-4 w-4" />
                                                        <span className="text-xs flex-1 truncate">
                                                            {attachment.filename}
                                                        </span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`flex items-center text-xs text-muted-foreground mt-1 ${msg.sender === "client" ? "" : "justify-end"}`}
                                    >
                                        <span>
                                            {msg.sender === "client" ? "Cliente" : msg.agentName || "Agente"}
                                        </span>
                                        <span className="mx-1">•</span>
                                        <span>{formatDate(msg.timestamp)}</span>
                                        {msg.sender === "agent" && (
                                            <>
                                                <span className="mx-1">•</span>
                                                <span className="flex items-center">
                                                    <CheckCheck className="h-3 w-3 mr-1" />
                                                    Leído
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Área de entrada de mensajes */}
            <div className="border-t p-4">
                <div className="flex items-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Adjuntar archivo</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <Smile className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <div className="grid grid-cols-8 gap-2 p-4">
                                {["😀", "😂", "😍", "😎", "😢", "😡", "👍", "👎", "❤️", "🎉", "🔥", "💯", "🙏", "💪", "🤔", "👏"].map(
                                    (emoji) => (
                                        <button
                                            key={emoji}
                                            className="text-xl p-2 hover:bg-muted rounded"
                                            onClick={() => setMessage(message + emoji)}
                                        >
                                            {emoji}
                                        </button>
                                    )
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex-1 relative">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="pr-10"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Video className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Última actualización: {formatDate(selectedTicket.lastUpdated)}
                    </div>
                </div>
            </div>
        </div>
    )
}