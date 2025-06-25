"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationService } from "@/lib/services/notification-service"
import { EventEmitter, NotificationEvents } from "@/lib/event-emitter"

interface NotificationBellProps {
    userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    // Cargar notificaciones desde la API
    const loadNotifications = useCallback(async () => {
        try {
            const notificationsData = await NotificationService.getUserNotifications(userId, { limit: 10 })
            setNotifications(notificationsData)

            const count = await NotificationService.getUnreadCount(userId)
            setUnreadCount(count)
        } catch (error) {
            console.error("Error al cargar notificaciones:", error)
        }
    }, [userId])

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        loadNotifications()

        // Suscribirse a eventos de nuevas notificaciones
        const unsubscribe = EventEmitter.on(NotificationEvents.NOTIFICATION_CREATED, (notification) => {
            if (notification.userId === userId) {
                setNotifications((prev) => [notification, ...prev])
                setUnreadCount((prev) => prev + 1)
            }
        })

        // Limpiar suscripción al desmontar
        return () => {
            EventEmitter.off(NotificationEvents.NOTIFICATION_CREATED, unsubscribe)
        }
    }, [userId, loadNotifications])

    // Marcar una notificación como leída
    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-read`, {
                method: "POST",
            })

            // Actualizar estado local
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, isRead: true } : notification,
                ),
            )

            // Actualizar contador de no leídas
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error al marcar notificación como leída:", error)
        }
    }

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        try {
            // Marcar cada notificación como leída
            for (const notification of notifications.filter((n) => !n.isRead)) {
                await fetch(`/api/notifications/${notification.id}/mark-read`, {
                    method: "POST",
                })
            }

            // Actualizar estado local
            setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

            // Resetear contador
            setUnreadCount(0)
        } catch (error) {
            console.error("Error al marcar todas las notificaciones como leídas:", error)
        }
    }

    // Formatear fecha de notificación
    const formatNotificationDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Obtener icono según tipo de notificación
    const getNotificationIcon = (type) => {
        switch (type) {
            case "LOW_STOCK":
                return "🔻"
            case "EXPIRATION_WARNING":
                return "⏱️"
            case "DISCOUNT_APPLIED":
                return "💰"
            case "SALE_COMPLETED":
                return "💵"
            default:
                return "🔔"
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                            variant="destructive"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                            <p className="text-muted-foreground">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notification.isRead ? "bg-muted/20" : ""
                                        }`}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">{notification.notification}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatNotificationDate(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1"></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
