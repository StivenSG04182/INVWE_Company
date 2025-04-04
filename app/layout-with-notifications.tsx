import { NotificationProvider } from '@/providers/notification-provider';

export default function LayoutWithNotifications({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
}