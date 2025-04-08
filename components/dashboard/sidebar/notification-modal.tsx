"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSidebarColor } from "@/hooks/use-sidebar-color";
import { useNotifications } from "@/components/dashboard/contexts/notification-context";
import { useCompany } from '@/hooks/use-company';


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

export function NotificationPanel() {
    const { notifications, unreadCount, refreshNotifications } = useNotifications();
    const { currentInventoryId } = useCompany();
    const [, setLoading] = useState(true);
    const { sidebarColor } = useSidebarColor();
    const [activeTab, setActiveTab] = useState("all");

    // Cargar notificaciones iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await refreshNotifications();
            setLoading(false);
        };

        loadInitialData();

        const intervalId = setInterval(() => {
            refreshNotifications();
        }, 30000);

        return () => {
            clearInterval(intervalId);
        };
    }, [refreshNotifications]);




    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className={`flex h-10 w-10 items-center justify-center rounded-lg ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <div className="relative">
                        <Bell className={`h-4 w-4 ${sidebarColor.toLowerCase() === '#ffffff' ? 'text-gray-900' : sidebarColor.toLowerCase() === '#1f2937' ? 'group-hover:text-gray-900 hover:text-gray-900 text-white active:text-gray-900' : 'text-white'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-3xl p-4 h-auto min-h-[450px]" closeButton={false}>
                <DialogTitle className="sr-only">Notifications</DialogTitle>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                    <TabsList className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger value="all">Todo</TabsTrigger>
                        <TabsTrigger value="messages">Mensajes</TabsTrigger>
                        <TabsTrigger value="employee">Empleados</TabsTrigger>
                        <TabsTrigger value="store">Inventario</TabsTrigger>
                        <TabsTrigger value="invoices">Facturación</TabsTrigger>
                        <TabsTrigger value="email">Correo</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow border-t pb-6 pt-2 mt-4">
                        <TabsContent value={activeTab} className="space-y-4 h-full">
                            {notifications
                                .filter(n => n.type.toLowerCase() === activeTab)
                                .map((notification) => (
                                    <div key={notification.id} className="p-3 border rounded-lg">
                                        <h4 className="font-medium">{notification.title}</h4>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                ))}
                        </TabsContent>
                        <TabsContent value="employee" className="space-y-4 h-full">
                            {notifications
                                .filter(n => n.users_companies?.role === 'ADMINISTRADOR' && n.inventory_id === currentInventoryId && n.type === 'join_request')
                                .map((notification) => (
                                    <div key={notification.id} className="p-3 border rounded-lg bg-muted">
                                        <h4 className="font-medium">🔐 {notification.title}</h4>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Permiso requerido: Administrador
                                        </div>
                                    </div>
                                ))}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
