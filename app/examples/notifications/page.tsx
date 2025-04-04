'use client';

import { NotificationExample } from '@/components/ui/notification-example';

export default function NotificationsExamplePage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Sistema de Notificaciones</h1>
            <p className="text-muted-foreground mb-8">
                Este ejemplo muestra las diferentes formas de utilizar el sistema de notificaciones:
                notificaciones toast, notificaciones persistentes y notificaciones en tiempo real.
            </p>

            <NotificationExample />
        </div>
    );
}