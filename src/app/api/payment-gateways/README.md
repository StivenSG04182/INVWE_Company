# Sistema de Pasarelas de Pago Multi-Merchant

Este sistema permite la integración con las pasarelas de pago PayPal y MercadoPago utilizando OAuth2 para un onboarding automático de comerciantes.

## Características

- Integración con 2 pasarelas de pago populares
- Autenticación OAuth2 para conexión sin datos técnicos
- Almacenamiento seguro de tokens de acceso y actualización
- Manejo de webhooks para eventos de pago
- Validación de estado de conexión
- Desconexión de pasarelas

## Estructura de Archivos

```
/api/payment-gateways/
  ├── payment-gateways.ts         # Configuración principal de pasarelas
  ├── payment-gateway-types.ts    # Tipos y interfaces
  ├── utils/
  │   └── auth-utils.ts           # Funciones de autenticación
  ├── [gatewayId]/
  │   ├── auth/                   # Endpoint de autenticación OAuth2
  │   ├── validate/               # Endpoint para validar conexión
  │   ├── disconnect/             # Endpoint para desconectar pasarela
  │   └── webhook/                # Endpoint para recibir webhooks
```

## Modelo de Datos

El sistema utiliza los siguientes modelos en Prisma:

- `PaymentGatewayConnection`: Almacena la conexión con cada pasarela
- `PaymentGatewayWebhookEvent`: Registra eventos recibidos por webhooks

## Flujo de Integración

1. El usuario selecciona una pasarela en la página de launchpad
2. Se redirige al usuario a la página de autenticación de la pasarela
3. Después de autenticarse, la pasarela redirige de vuelta a la aplicación
4. La aplicación intercambia el código de autorización por tokens de acceso
5. Los tokens se almacenan de forma segura en la base de datos

## Configuración

Para configurar las pasarelas, se deben definir las siguientes variables de entorno:

```
# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# MercadoPago
MERCADOPAGO_CLIENT_ID=
MERCADOPAGO_CLIENT_SECRET=
```

## Uso

### Validar Conexión

```typescript
// Verificar si una pasarela está conectada
const response = await fetch(`/api/payment-gateways/${gatewayId}/validate?agencyId=${agencyId}`);
const data = await response.json();

if (data.success && data.isConnected) {
  // La pasarela está conectada
}
```

### Autenticar Pasarela

```typescript
// Procesar código de autorización después de OAuth
const response = await fetch(`/api/payment-gateways/${gatewayId}/auth`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: authorizationCode,
    agencyId: agencyId,
  }),
});

const data = await response.json();

if (data.success) {
  // Autenticación exitosa
}
```

### Desconectar Pasarela

```typescript
// Desconectar una pasarela
const response = await fetch(`/api/payment-gateways/${gatewayId}/disconnect?agencyId=${agencyId}`, {
  method: 'DELETE',
});

const data = await response.json();

if (data.success) {
  // Desconexión exitosa
}
```

## Webhooks

Cada pasarela puede enviar notificaciones a través de webhooks. Para configurar los webhooks, se debe proporcionar la siguiente URL a cada pasarela:

```
https://tu-dominio.com/api/payment-gateways/{gatewayId}/webhook
```

Reemplaza `{gatewayId}` con el ID de la pasarela correspondiente (paypal, mercadopago).

## Notas de Seguridad

- Los tokens de acceso y actualización se almacenan de forma segura en la base de datos
- Las firmas de los webhooks se validan para garantizar la autenticidad
- Se utilizan HTTPS para todas las comunicaciones
- Los tokens expirados se actualizan automáticamente cuando es necesario

## Próximos Pasos

- Implementar manejo de pagos específicos para cada pasarela
- Añadir panel de administración para gestionar pasarelas
- Implementar notificaciones de eventos de pago
- Añadir soporte para más pasarelas de pago