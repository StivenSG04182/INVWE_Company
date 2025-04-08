'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCompany } from '@/hooks/use-company';

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
    const { currentInventoryId } = useCompany();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(
    notifications.filter((n) => !n.read).length
  );
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const fetchNotifications = async () => {
        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*, users_companies(*)')
                .eq('inventory_id', currentInventoryId)
                .eq('users_companies.role', 'ADMINISTRADOR')
                .order('created_at', { ascending: false });

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.read).length);
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
        if (typeof window === 'undefined') return;

        const newSocket = io();
        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.off('new-notification');
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Escuchar eventos de notificaciones en tiempo real
    useEffect(() => {
        if (!socketRef.current) return;

        // Escuchar nuevas notificaciones
        socketRef.current.on('new-notification', (notification: Notification) => {
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
            socketRef.current?.off('new-notification');
        };
    }, [socket]);

    // Cargar notificaciones iniciales
    useEffect(() => {
        fetchNotifications();
    }, [currentInventoryId]);

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