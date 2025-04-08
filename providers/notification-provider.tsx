'use client';

import { Toaster } from 'react-hot-toast';
import { NotificationProvider as PersistentNotificationProvider } from '@/components/dashboard/contexts/notification-context';
import { ToastNotifications } from '@/components/ui/toast-notification';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    return (
        <PersistentNotificationProvider>
            {/* Proveedor para notificaciones toast rápidas */}
            <Toaster position="top-right" />

            {/* Proveedor para notificaciones toast personalizadas */}
            <ToastNotifications />

            {children}
        </PersistentNotificationProvider>
    );
}