# Sistema de Notificaciones

Este documento describe el sistema de notificaciones implementado en la aplicación INVWE. El sistema incluye tres tipos de notificaciones:

1. **Notificaciones Toast**: Para mensajes rápidos y temporales
2. **Notificaciones Persistentes**: Almacenadas en la base de datos y accesibles mediante la campana de notificaciones
3. **Notificaciones en Tiempo Real**: Utilizando Socket.IO para actualizaciones instantáneas

## Estructura del Sistema

### Componentes Principales

- **NotificationProvider**: Proveedor global que integra todos los tipos de notificaciones
- **NotificationBell**: Componente UI para mostrar y gestionar notificaciones persistentes
- **ToastNotifications**: Componente para mostrar notificaciones toast personalizadas
- **Socket.IO**: Implementación para notificaciones en tiempo real

### API Endpoints

- `GET /api/client/control_dash/(notifications)`: Obtener notificaciones del usuario
- `POST /api/client/control_dash/(notifications)`: Crear una nueva notificación
- `PATCH /api/client/control_dash/(notifications)/[id]`: Actualizar una notificación (marcar como leída)
- `DELETE /api/client/control_dash/(notifications)/[id]`: Eliminar una notificación
- `GET /api/socket-io`: Inicializar y gestionar conexiones Socket.IO

## Uso del Sistema

### Notificaciones Toast

```tsx
// Importar el hook
import { useNotificationToast } from '@/hooks/use-notification-toast';

// Usar en un componente
function MyComponent() {
  const { showNotification } = useNotificationToast();
  
  // Mostrar una notificación toast simple
  showNotification({
    message: 'Operación completada',
    type: 'success' // 'success', 'error', 'loading', 'custom'
  });
  
  return <div>Mi componente</div>;
}
```

### Notificaciones Persistentes

```tsx
// Importar el hook
import { useNotificationToast } from '@/hooks/use-notification-toast';

// Usar en un componente
function MyComponent() {
  const { showNotification } = useNotificationToast();
  
  // Crear una notificación persistente
  showNotification({
    message: 'Nuevo mensaje recibido',
    title: 'Mensaje importante',
    description: 'Detalles del mensaje...',
    type: 'success',
    persistent: true, // Guardar en la base de datos
    usersCompaniesId: 'id-del-usuario' // ID de la relación users_companies
  });
  
  return <div>Mi componente</div>;
}
```

### Acceder a las Notificaciones

```tsx
// Importar el hook
import { useNotifications } from '@/contexts/notification-context';

// Usar en un componente
function MyComponent() {
  const { 
    notifications, // Lista de notificaciones
    unreadCount, // Contador de no leídas
    markAsRead, // Función para marcar como leída
    deleteNotification, // Función para eliminar
    refreshNotifications // Función para actualizar la lista
  } = useNotifications();
  
  return <div>Mi componente</div>;
}
```

### Componente de Campana de Notificaciones

Para mostrar la campana de notificaciones en cualquier parte de la aplicación:

```tsx
import { NotificationBell } from '@/components/ui/notification-bell';

function MyHeader() {
  return (
    <header>
      <div className="flex items-center">
        <h1>Mi Aplicación</h1>
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
```

## Ejemplo Completo

Se ha creado una página de ejemplo que muestra todas las funcionalidades del sistema de notificaciones:

- Ruta: `/examples/notifications`
- Componente: `NotificationExample`

## Estructura de la Base de Datos

Las notificaciones persistentes se almacenan en la tabla `notifications` con la siguiente estructura:

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  type                 text         NOT NULL CHECK (type IN ('message', 'alert')),
  title                text         NOT NULL,
  message              text         NOT NULL,
  created_at           timestamptz  DEFAULT timezone('utc', now()) NOT NULL,
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  read                 boolean      DEFAULT false NOT NULL,
  users_companies_id   uuid         NOT NULL REFERENCES users_companies(id) ON DELETE CASCADE,
  created_by           text         REFERENCES auth.users(id) ON DELETE SET NULL
);
```

## Notificaciones en Tiempo Real

El sistema utiliza Socket.IO para proporcionar notificaciones en tiempo real. Cuando se crea una nueva notificación en la base de datos, se emite un evento a todos los clientes conectados.

La configuración de Socket.IO se realiza en:
- `/app/api/socket-io/route.ts`

La escucha de eventos se implementa en el contexto de notificaciones:
- `/contexts/notification-context.tsx`