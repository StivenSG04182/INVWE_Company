'use client';

import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Tipos de notificaciones toast
export type ToastType = 'success' | 'error' | 'loading' | 'custom';

// Opciones para las notificaciones toast
interface ToastNotificationOptions extends Partial<ToastOptions> {
  message: string;
  type?: ToastType;
  duration?: number;
}

// Función para mostrar notificaciones toast
export const showToast = ({
  message,
  type = 'custom',
  duration = 3000,
  ...options
}: ToastNotificationOptions) => {
  switch (type) {
    case 'success':
      return toast.success(message, { duration, ...options });
    case 'error':
      return toast.error(message, { duration, ...options });
    case 'loading':
      return toast.loading(message, { ...options });
    case 'custom':
    default:
      return toast(message, { duration, ...options });
  }
};

// Componente Toaster para renderizar las notificaciones
export function ToastNotifications() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Estilos por defecto para todos los toasts
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        // Estilos específicos por tipo
        success: {
          style: {
            background: '#10B981',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        },
      }}
    />
  );
}