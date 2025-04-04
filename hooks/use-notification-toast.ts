'use client';

import toast from 'react-hot-toast';
import { useNotifications } from '@/contexts/notification-context';

// Tipos de notificaciones toast
export type ToastType = 'success' | 'error' | 'loading' | 'custom';

// Opciones para las notificaciones toast
interface ToastNotificationOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    title?: string;
    description?: string;
    persistent?: boolean;
    usersCompaniesId?: string;
}

/**
 * Hook personalizado para manejar notificaciones toast y persistentes
 */
export function useNotificationToast() {
    const { refreshNotifications } = useNotifications();

    /**
     * Muestra una notificación toast y opcionalmente la guarda como persistente
     */
    const showNotification = async ({
        message,
        type = 'custom',
        duration = 3000,
        title,
        description,
        persistent = false,
        usersCompaniesId
    }: ToastNotificationOptions) => {
        // Mostrar notificación toast
        switch (type) {
            case 'success':
                toast.success(message, { duration });
                break;
            case 'error':
                toast.error(message, { duration });
                break;
            case 'loading':
                toast.loading(message);
                break;
            case 'custom':
            default:
                toast(message, { duration });
                break;
        }

        // Si es persistente, guardarla en la base de datos
        if (persistent && usersCompaniesId) {
            try {
                const notificationType = type === 'error' ? 'alert' : 'message';
                const response = await fetch('/api/client/control_dash/(notifications)', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: notificationType,
                        title: title || message,
                        message: description || message,
                        users_companies_id: usersCompaniesId,
                    }),
                });

                if (response.ok) {
                    // Actualizar la lista de notificaciones
                    refreshNotifications();
                }
            } catch (error) {
                console.error('Error al guardar notificación persistente:', error);
            }
        }
    };

    return {
        showNotification,
    };
}