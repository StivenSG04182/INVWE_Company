'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNotifications, type Notification } from '@/components/dashboard/contexts/notification-context';
import { cn } from '@/lib/utils';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Filtrar notificaciones según la pestaña activa
    const getFilteredNotifications = () => {
        if (activeTab === 'all') return notifications;
        if (activeTab === 'unread') return notifications.filter(n => !n.read);
        if (activeTab === 'message') return notifications.filter(n => n.type === 'message');
        if (activeTab === 'alert') return notifications.filter(n => n.type === 'alert');
        return notifications;
    };

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Manejar clic en una notificación
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogTitle className="text-xl font-semibold mb-4">Notificaciones</DialogTitle>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="unread">No leídas</TabsTrigger>
                        <TabsTrigger value="message">Mensajes</TabsTrigger>
                        <TabsTrigger value="alert">Alertas</TabsTrigger>
                    </TabsList>

                    <div className="overflow-y-auto flex-1 pr-2">
                        {getFilteredNotifications().length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay notificaciones
                            </div>
                        ) : (
                            getFilteredNotifications().map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "mb-3 p-3 rounded-lg border transition-colors",
                                        notification.read ? "bg-background" : "bg-muted"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-medium text-sm flex items-center">
                                            {notification.type === 'alert' ? '🔔' : '📩'} {notification.title}
                                            {!notification.read && (
                                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </h4>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                            >
                                                <span className="sr-only">Marcar como leída</span>
                                                ✓
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                            >
                                                <span className="sr-only">Eliminar</span>
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <span className="text-xs text-muted-foreground mt-2 block">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}