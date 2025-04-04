'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Definir el tipo para las notificaciones
export interface Notification {
    id: string;
    type: 'message' | 'alert';
    title: string;
    message: string;
    created_at: string;
    updated_at: string;
    read: boolean;
    users_companies_id: string;
    created_by?: string;
}

// Definir el tipo para el contexto
interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Proveedor del contexto
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Función para obtener notificaciones
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/client/control_dash/(notifications)?read=false');
            const data = await response.json();

            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Función para marcar una notificación como leída
    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/client/control_dash/(notifications)/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ read: true }),
            });

            if (response.ok) {
                // Actualizar el estado local
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === id ? { ...notif, read: true } : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Función para eliminar una notificación
    const deleteNotification = async (id: string) => {
        try {
            const response = await fetch(`/api/client/control_dash/(notifications)/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Actualizar el estado local
                const notifToDelete = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(notif => notif.id !== id));

                // Actualizar el contador de no leídos si la notificación no estaba leída
                if (notifToDelete && !notifToDelete.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Inicializar Socket.IO para notificaciones en tiempo real
    useEffect(() => {
        // Inicializar socket solo en el cliente
        if (typeof window !== 'undefined') {
            const newSocket = io();
            setSocket(newSocket);

            // Limpiar al desmontar
            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    // Escuchar eventos de notificaciones en tiempo real
    useEffect(() => {
        if (!socket) return;

        // Escuchar nuevas notificaciones
        socket.on('new-notification', (notification: Notification) => {
            // Actualizar el estado
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Mostrar toast para notificación en tiempo real
            toast(notification.title, {
                description: notification.message,
                icon: notification.type === 'alert' ? '🔔' : '📩',
            });
        });

        // Limpiar listeners al desmontar
        return () => {
            socket.off('new-notification');
        };
    }, [socket]);

    // Cargar notificaciones iniciales
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Valor del contexto
    const value = {
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook personalizado para usar el contexto
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}