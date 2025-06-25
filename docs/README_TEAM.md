# Módulo de Gestión de Equipo

## Descripción General
El módulo de gestión de equipo proporciona una solución completa para administrar los miembros del equipo, sus roles y permisos dentro de la agencia y sus tiendas asociadas. Este módulo permite un control granular de los accesos y responsabilidades de cada usuario en el sistema.

## Características Principales

### 1. Gestión de Usuarios
- **Vista de Equipo**:
  - Lista completa de miembros
  - Información detallada de cada usuario
  - Estado de acceso y permisos
  - Tiendas asignadas

- **Información del Usuario**:
  - Nombre y foto de perfil
  - Correo electrónico
  - Rol asignado
  - Tiendas con acceso
  - Estado de la cuenta

### 2. Roles y Permisos
- **Tipos de Roles**:
  - AGENCY_OWNER: Propietario de la agencia
  - AGENCY_ADMIN: Administrador de agencia
  - SUBACCOUNT_USER: Usuario de tienda
  - SUBACCOUNT_GUEST: Invitado de tienda

- **Niveles de Acceso**:
  - Acceso completo a la agencia
  - Acceso limitado a tiendas específicas
  - Permisos de solo lectura
  - Permisos administrativos

### 3. Invitaciones y Onboarding
- **Proceso de Invitación**:
  - Envío de invitaciones por correo
  - Selección de rol al invitar
  - Validación de correos duplicados
  - Seguimiento de invitaciones pendientes

- **Configuración Inicial**:
  - Asignación de tiendas
  - Definición de permisos
  - Configuración de preferencias
  - Activación de cuenta

## Interfaz de Usuario

### Panel de Equipo
- **Funcionalidades**:
  - Búsqueda de miembros
  - Filtrado por rol
  - Vista de tiendas asignadas
  - Acciones rápidas

- **Acciones Disponibles**:
  - Añadir nuevo miembro
  - Editar información
  - Copiar correo electrónico
  - Eliminar usuario
  - Gestionar permisos

### Formulario de Invitación
- **Campos Requeridos**:
  - Correo electrónico
  - Rol del usuario
  - Tiendas asignadas (opcional)

- **Validaciones**:
  - Formato de correo válido
  - Rol permitido
  - Invitaciones duplicadas
  - Permisos necesarios

## Gestión de Permisos

### Niveles de Acceso
1. **Agencia**:
   - Control total
   - Gestión de usuarios
   - Configuración general
   - Reportes completos

2. **Tienda**:
   - Operaciones diarias
   - Gestión de inventario
   - Ventas y facturación
   - Reportes de tienda

### Restricciones
- Propietarios no pueden ser eliminados
- Usuarios solo pueden acceder a tiendas asignadas
- Invitados tienen acceso de solo lectura
- Administradores pueden gestionar permisos

## Seguridad y Control

### Medidas de Seguridad
- Validación de roles
- Control de acceso basado en permisos
- Registro de actividades
- Confirmación para acciones críticas

### Proceso de Eliminación
- Confirmación requerida
- Eliminación permanente
- Revocación de accesos
- Registro de la acción

## Integración con Otros Módulos

### Módulo de Agencia
- Gestión de tiendas
- Configuración general
- Reportes consolidados

### Módulo de Tienda
- Operaciones diarias
- Gestión de inventario
- Ventas y facturación

## Mejores Prácticas

### Gestión de Usuarios
1. **Asignación de Roles**:
   - Asignar el nivel mínimo necesario
   - Revisar permisos periódicamente
   - Documentar cambios de rol

2. **Invitaciones**:
   - Verificar correos antes de enviar
   - Comunicar expectativas claramente
   - Seguimiento de aceptaciones

3. **Seguridad**:
   - Revisar accesos regularmente
   - Mantener registros actualizados
   - Reportar actividades sospechosas

## Soporte y Mantenimiento

### Actualizaciones
- Mejoras de funcionalidad
- Correcciones de seguridad
- Actualizaciones de permisos

### Soporte Técnico
- Asistencia en configuración
- Resolución de problemas
- Capacitación de usuarios

## Consideraciones Importantes

### Limitaciones
- Un usuario no puede tener múltiples roles principales
- Las invitaciones tienen tiempo de expiración
- Algunas acciones requieren confirmación
- Ciertos cambios son permanentes

### Recomendaciones
- Mantener la información actualizada
- Revisar permisos periódicamente
- Documentar cambios importantes
- Capacitar a nuevos usuarios 