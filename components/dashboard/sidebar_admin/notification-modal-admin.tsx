"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function NotificationBell({ hasNewNotification = false, hasNewMessage = false }) {
    return (
        <div className="relative">
            <Bell className="h-4 w-4" />
            {(hasNewNotification || hasNewMessage) && (
                <span className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                    hasNewMessage ? "bg-blue-500" : "bg-red-500"
                )} />
            )}
        </div>
    );
}

export function NotificationPanelAdmin() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch("/api/notifications?category=all");
                const data = await res.json();
                if (data.notifications) setNotifications(data.notifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
                    <NotificationBell hasNewNotification={notifications.length > 0} />
                </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-3xl p-4 h-auto min-h-[450px] overflow-y-auto" closeButton={false}>
                <DialogTitle className="sr-only">Notifications</DialogTitle>
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger value="all">Todo</TabsTrigger>
                        <TabsTrigger value="messages">Mensajes</TabsTrigger>
                        <TabsTrigger value="alerts">Empleados</TabsTrigger>
                        <TabsTrigger value="store">Inventario</TabsTrigger>
                        <TabsTrigger value="invoices">Facturación</TabsTrigger>
                        <TabsTrigger value="email">Correo</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow overflow-y-auto border-t pb-6 pt-2 mt-4">
                        <TabsContent value="all" className="space-y-4 h-full">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">Cargando notificaciones...</div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={(notif as { id: number }).id} className="p-2 border-b">
                                        <p className="font-medium">{(notif as { title: string }).title}</p>
                                        <p className="text-sm">{(notif as { message: string }).message}</p>
                                        <span className="text-xs text-gray-500">{new Date((notif as { created_at: string }).created_at).toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground">No hay notificaciones nuevas</div>
                            )}
                        </TabsContent>
                        {/* Puedes agregar lógicas similares en los otros TabsContent filtrando por categoría */}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
