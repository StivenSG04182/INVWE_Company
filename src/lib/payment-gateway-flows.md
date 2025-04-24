# Flujos de Autenticación de Pasarelas de Pago

Este documento describe los flujos de autenticación para cada pasarela de pago disponible en el sistema.

## PayPal

### Flujo de Autenticación
1. El usuario inicia el proceso de conexión desde el panel de control
2. Se genera una URL de autenticación usando `authUrl(agencyId)`
3. El usuario es redirigido a PayPal para autorizar la aplicación
4. PayPal redirige de vuelta a nuestro endpoint `/api/payment-gateways/paypal/auth`
5. El endpoint valida el código y obtiene los tokens de acceso
6. Se almacena la conexión en la base de datos
7. El usuario es redirigido de vuelta al panel de control

### Endpoints
- **Autenticación**: `/api/payment-gateways/paypal/auth`
- **Validación**: `/api/payment-gateways/paypal/validate`
- **Webhooks**: `/api/payment-gateways/paypal/webhook`

### Variables de Entorno Requeridas
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=your_app_url
```

## PayU Colombia

### Flujo de Autenticación
1. El usuario inicia el proceso de conexión desde el panel de control
2. Se genera una URL de autenticación usando `authUrl(agencyId)`
3. El usuario es redirigido a PayU para autorizar la aplicación
4. PayU redirige de vuelta a nuestro endpoint `/api/payment-gateways/payu/auth`
5. El endpoint valida el código y obtiene los tokens de acceso
6. Se almacena la conexión en la base de datos
7. El usuario es redirigido de vuelta al panel de control

### Endpoints
- **Autenticación**: `/api/payment-gateways/payu/auth`
- **Validación**: `/api/payment-gateways/payu/validate`
- **Webhooks**: `/api/payment-gateways/payu/webhook`

### Variables de Entorno Requeridas
```
PAYU_CLIENT_ID=your_client_id
PAYU_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=your_app_url
```

## Manejo de Errores

### Códigos de Error Comunes
- `CONFIGURATION_ERROR`: Error en la configuración de la pasarela
- `AUTHENTICATION_ERROR`: Error durante el proceso de autenticación
- `VALIDATION_ERROR`: Error al validar la conexión
- `WEBHOOK_ERROR`: Error al procesar un webhook

### Mejores Prácticas
1. Siempre validar las credenciales antes de iniciar el flujo de autenticación
2. Implementar reintentos para operaciones que pueden fallar
3. Registrar todos los errores para debugging
4. Mantener los tokens de acceso actualizados
5. Implementar webhooks para mantener el estado sincronizado

## Seguridad

### Consideraciones de Seguridad
1. Nunca almacenar tokens de acceso en el frontend
2. Usar HTTPS para todas las comunicaciones
3. Validar la firma de los webhooks
4. Implementar rate limiting en los endpoints
5. Mantener las credenciales en variables de entorno
6. Rotar las credenciales periódicamente

### Validación de Conexiones
1. Verificar el estado de la conexión antes de cada operación
2. Implementar un sistema de reconexión automática
3. Notificar al usuario cuando la conexión se pierde
4. Mantener un registro de intentos de reconexión 