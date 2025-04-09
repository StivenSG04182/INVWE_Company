'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

type NotificationContextType = {
    notifications: any[];
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    fetchNotifications: async () => { },
    markAsRead: async () => { },
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotifications(data);
        }
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            );
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();

            const channel = supabase
                .channel('notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_user_id=eq.${user.id}`
                }, () => {
                    fetchNotifications();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user?.id]);

    return (
        <NotificationContext.Provider
            value={{ notifications, fetchNotifications, markAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);