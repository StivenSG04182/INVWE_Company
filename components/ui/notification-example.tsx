'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationToast } from '@/hooks/use-notification-toast';
import { useNotifications } from '@/components/dashboard/contexts/notification-context';
import { NotificationBell } from '@/components/ui/notification-bell';

export function NotificationExample() {
    const { showNotification } = useNotificationToast();
    const { notifications } = useNotifications();
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [usersCompaniesId, setUsersCompaniesId] = useState('');

    // Ejemplo de ID de users_companies para pruebas
    // En una aplicación real, esto vendría de la sesión del usuario o de una consulta
    const handleFetchUserId = async () => {
        try {
            const response = await fetch('/api/client/control_dash/(notifications)');
            const data = await response.json();
            if (data.notifications && data.notifications.length > 0) {
                setUsersCompaniesId(data.notifications[0].users_companies_id);
            } else {
                showNotification({
                    message: 'No se encontró un ID de usuario válido',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sistema de Notificaciones</h2>
                <NotificationBell />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notificaciones Toast</CardTitle>
                        <CardDescription>
                            Notificaciones rápidas que desaparecen automáticamente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Mensaje"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => showNotification({ message, type: 'success' })}
                        >
                            Éxito
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showNotification({ message, type: 'error' })}
                        >
                            Error
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showNotification({ message, type: 'loading' })}
                        >
                            Cargando
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => showNotification({ message })}
                        >
                            Normal
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notificaciones Persistentes</CardTitle>
                        <CardDescription>
                            Notificaciones que se guardan en la base de datos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Título"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="ID de users_companies"
                                value={usersCompaniesId}
                                onChange={(e) => setUsersCompaniesId(e.target.value)}
                            />
                            <Button onClick={handleFetchUserId}>Obtener ID</Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            onClick={() => {
                                if (!usersCompaniesId) {
                                    showNotification({
                                        message: 'Se requiere un ID de users_companies',
                                        type: 'error'
                                    });
                                    return;
                                }
                                showNotification({
                                    message: title || 'Notificación persistente',
                                    description: description || 'Esta es una notificación persistente',
                                    type: 'success',
                                    persistent: true,
                                    usersCompaniesId,
                                    title
                                });
                            }}
                        >
                            Crear Notificación Persistente
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Notificaciones Actuales ({notifications.length})</CardTitle>
                    <CardDescription>
                        Lista de notificaciones persistentes en el sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <p className="text-muted-foreground">No hay notificaciones</p>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium">{notification.title}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm">{notification.message}</p>
                                    <div className="flex mt-2 text-xs">
                                        <span className="mr-2">
                                            Tipo: {notification.type}
                                        </span>
                                        <span>
                                            Leída: {notification.read ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}