# Guía de Pruebas para Pasarelas de Pago

Este documento describe cómo realizar pruebas de integración con las pasarelas de pago (PayPal y MercadoPago) en un entorno de desarrollo antes de pasar a producción.

## Entorno de Pruebas

El sistema incluye un módulo de simulación que permite probar el flujo completo de autenticación y registro sin necesidad de URLs HTTPS ni credenciales reales de producción.

### Características del Entorno de Pruebas

- Detección automática del entorno (desarrollo/producción)
- Uso de credenciales de sandbox/test para PayPal y MercadoPago
- Simulación de eventos de webhook para probar el flujo completo
- Simulación de respuestas OAuth para autenticación

## Configuración del Entorno

### Variables de Entorno

Para configurar el entorno de pruebas, asegúrate de tener las siguientes variables en tu archivo `.env`:

```
# Modo de Sandbox (true para usar sandbox incluso en producción)
USE_PAYMENT_SANDBOX=true

# PayPal Sandbox
PAYPAL_SANDBOX_CLIENT_ID=tu_client_id_de_sandbox
PAYPAL_SANDBOX_CLIENT_SECRET=tu_client_secret_de_sandbox

# MercadoPago Sandbox
MERCADOPAGO_SANDBOX_CLIENT_ID=tu_client_id_de_sandbox
MERCADOPAGO_SANDBOX_CLIENT_SECRET=tu_client_secret_de_sandbox
```

## Cómo Realizar Pruebas

### 1. Verificar el Entorno Actual

Para verificar si estás en modo de pruebas, puedes hacer una solicitud GET al endpoint de simulación:

```bash
curl http://localhost:3000/api/payment-gateways/simulate
```

Esto te devolverá información sobre el entorno actual y las opciones de simulación disponibles.

### 2. Probar la Autenticación OAuth

Para simular una respuesta de autenticación OAuth:

```bash
curl -X POST http://localhost:3000/api/payment-gateways/simulate \
  -H "Content-Type: application/json" \
  -d '{"action":"oauth","gatewayId":"paypal","agencyId":"tu_agency_id"}'
```

Esto generará una respuesta simulada con tokens de acceso y actualización que puedes usar para pruebas.

### 3. Simular Eventos de Webhook

Para simular un evento de webhook, como la finalización del proceso de onboarding:

```bash
curl -X POST http://localhost:3000/api/payment-gateways/simulate \
  -H "Content-Type: application/json" \
  -d '{"action":"webhook","gatewayId":"paypal","agencyId":"tu_agency_id","eventType":"MERCHANT.ONBOARDING.COMPLETED"}'
```

Eventos disponibles para PayPal:
- `MERCHANT.ONBOARDING.COMPLETED`: Onboarding completado exitosamente
- `MERCHANT.ONBOARDING.FAILED`: Onboarding fallido
- `PAYMENT.CAPTURE.COMPLETED`: Pago capturado
- `PAYMENT.REFUND.COMPLETED`: Reembolso completado

Eventos disponibles para MercadoPago:
- `merchant.created`: Comerciante creado
- `merchant.disabled`: Comerciante deshabilitado
- `payment.created`: Pago creado
- `payment.approved`: Pago aprobado

### 4. Validar Conexión

Para simular la validación de una conexión:

```bash
curl -X POST "http://localhost:3000/api/payment-gateways/simulate?connected=true" \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","gatewayId":"paypal","agencyId":"tu_agency_id"}'
```

Puedes cambiar el parámetro `connected` a `false` para simular una conexión no establecida.

## Flujo Completo de Prueba

Para probar el flujo completo de registro y autenticación de un usuario:

1. **Iniciar el proceso de autenticación**: Redirigir al usuario a la URL de autenticación de la pasarela (esto se puede simular en desarrollo)

2. **Procesar el código de autorización**: Simular la respuesta OAuth usando el endpoint de simulación

3. **Verificar la conexión**: Simular la validación de la conexión

4. **Recibir eventos de webhook**: Simular eventos de webhook para probar el procesamiento de eventos

## Ejemplo de Flujo Completo (PayPal)

```javascript
// 1. Obtener la URL de autenticación
const gateway = getGatewayById('paypal');
const authUrl = gateway.authUrl(agencyId);

// 2. Después de la redirección, simular la respuesta OAuth
const oauthResponse = await fetch('/api/payment-gateways/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'oauth',
    gatewayId: 'paypal',
    agencyId: agencyId
  })
});
const oauthData = await oauthResponse.json();

// 3. Guardar los tokens en la base de datos (esto lo hace automáticamente el endpoint de autenticación)

// 4. Simular un evento de onboarding completado
const webhookResponse = await fetch('/api/payment-gateways/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'webhook',
    gatewayId: 'paypal',
    agencyId: agencyId,
    eventType: 'MERCHANT.ONBOARDING.COMPLETED'
  })
});
```

## Pruebas con MercadoPago

A diferencia de PayPal, MercadoPago puede presentar desafíos adicionales durante las pruebas. Aquí se describe cómo realizar pruebas efectivas con esta pasarela.

### Preparación del Entorno para MercadoPago

1. **Obtener Credenciales de Prueba**:
   - Regístrate en [MercadoPago Developers](https://developers.mercadopago.com/)
   - Crea una aplicación de prueba
   - Obtén las credenciales de sandbox (Client ID y Client Secret)

2. **Configurar Webhooks**:
   - En el panel de desarrollador, configura la URL de webhook: `https://tu-dominio.com/api/payment-gateways/mercadopago/webhook`
   - Para desarrollo local, considera usar servicios como ngrok para exponer tu servidor local

### Estrategias para Evitar Problemas de Autenticación

1. **Uso de Tokens Estáticos durante Desarrollo**:

```javascript
// Configuración para desarrollo local con tokens estáticos
if (process.env.NODE_ENV === 'development') {
  // Usar tokens predefinidos para evitar problemas de OAuth
  app.use('/api/payment-gateways/mercadopago/callback', (req, res) => {
    // Simular respuesta de autenticación exitosa
    const mockTokens = {
      access_token: 'TEST_ACCESS_TOKEN',
      refresh_token: 'TEST_REFRESH_TOKEN',
      expires_in: 15552000
    };
    
    // Procesar como si fuera una respuesta real
    processMercadoPagoAuth(req.query.agency_id, mockTokens);
    
    res.redirect('/dashboard?auth=success');
  });
}
```

2. **Implementación de Reintentos Automáticos**:

```javascript
// Función con reintentos para autenticación OAuth
async function authenticateWithRetry(code, agencyId, maxRetries = 3) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const tokens = await mercadopago.getTokens(code);
      await saveTokens('mercadopago', agencyId, tokens);
      return tokens;
    } catch (error) {
      attempts++;
      console.log(`Intento ${attempts} fallido: ${error.message}`);
      
      if (attempts >= maxRetries) throw error;
      
      // Esperar antes de reintentar (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
    }
  }
}
```

### Verificación de Integración

Para verificar que la integración con MercadoPago está funcionando correctamente:

```bash
# Verificar estado de la conexión
curl -X POST http://localhost:3000/api/payment-gateways/simulate \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","gatewayId":"mercadopago","agencyId":"tu_agency_id"}'

# Simular evento de webhook para merchant creado
curl -X POST http://localhost:3000/api/payment-gateways/simulate \
  -H "Content-Type: application/json" \
  -d '{"action":"webhook","gatewayId":"mercadopago","agencyId":"tu_agency_id","eventType":"merchant.created"}'
```

## Transición a Producción

Cuando estés listo para pasar a producción:

1. Configura las credenciales reales de producción en las variables de entorno:
   ```
   PAYPAL_CLIENT_ID=tu_client_id_real
   PAYPAL_CLIENT_SECRET=tu_client_secret_real
   MERCADOPAGO_CLIENT_ID=tu_client_id_real
   MERCADOPAGO_CLIENT_SECRET=tu_client_secret_real
   ```

2. Asegúrate de que `USE_PAYMENT_SANDBOX=false` o elimina esta variable

3. Configura las URLs de webhook en los paneles de desarrollador de cada pasarela:
   - PayPal: https://tu-dominio.com/api/payment-gateways/paypal/webhook
   - MercadoPago: https://tu-dominio.com/api/payment-gateways/mercadopago/webhook

4. Realiza pruebas en el entorno de producción con cuentas reales pero montos pequeños

## Solución de Problemas

### Problemas Comunes

1. **Error de autenticación OAuth**: Verifica que las credenciales de sandbox sean correctas

2. **Webhooks no procesados**: Asegúrate de que la simulación de webhooks esté funcionando correctamente

3. **Tokens expirados**: Prueba el flujo de actualización de tokens usando el endpoint de simulación

## Documentación Específica de MercadoPago

### Problemas Conocidos con MercadoPago

#### Problemas de Inicio de Sesión

1. **Error de autenticación OAuth**: MercadoPago puede presentar errores intermitentes durante el proceso de autenticación OAuth. Posibles soluciones:
   - Verifica que estés utilizando las credenciales correctas del entorno de pruebas
   - Asegúrate de que la URL de redirección esté correctamente configurada en el panel de desarrollador de MercadoPago
   - Limpia las cookies y caché del navegador antes de intentar nuevamente
   - Utiliza el modo incógnito para evitar problemas con sesiones anteriores

2. **Errores de CORS**: MercadoPago puede presentar errores de CORS durante el desarrollo local:
   - Utiliza un proxy CORS durante el desarrollo
   - Configura correctamente los headers de CORS en tu servidor
   - Considera usar extensiones de navegador para deshabilitar CORS durante pruebas locales

3. **Tokens de acceso inválidos**: Los tokens pueden invalidarse inesperadamente:
   - Implementa un sistema robusto de renovación automática de tokens
   - Almacena tanto el token de acceso como el de actualización
   - Verifica la fecha de expiración antes de cada operación

### Configuración Recomendada para MercadoPago

Para minimizar los problemas de inicio de sesión con MercadoPago, se recomienda la siguiente configuración:

```
# Variables adicionales para MercadoPago
MERCADOPAGO_REDIRECT_URI=https://tu-dominio.com/api/payment-gateways/mercadopago/callback
MERCADOPAGO_WEBHOOK_URI=https://tu-dominio.com/api/payment-gateways/mercadopago/webhook
MERCADOPAGO_TOKEN_REFRESH_INTERVAL=86400000  # Refrescar token cada 24 horas
```

### Flujo Alternativo para MercadoPago

Si continúas experimentando problemas con MercadoPago, puedes implementar un flujo alternativo:

1. **Autenticación Manual**: Obtén los tokens manualmente desde el panel de desarrollador
2. **Configuración Estática**: Configura los tokens estáticamente durante el desarrollo
3. **Simulación de Webhooks**: Utiliza el endpoint de simulación para probar el flujo completo sin depender de la autenticación OAuth

```javascript
// Ejemplo de configuración manual de tokens para desarrollo
const manualTokens = {
  access_token: 'TOKEN_ACCESO_MANUAL',
  refresh_token: 'TOKEN_REFRESCO_MANUAL',
  expires_in: 15552000 // 180 días en segundos
};

// Guardar tokens manualmente
await saveTokens('mercadopago', agencyId, manualTokens);
```

### Logs de Depuración

Para habilitar logs detallados durante las pruebas, puedes añadir esta variable de entorno:

```
DEBUG_PAYMENT_GATEWAYS=true
```

Esto generará logs más detallados en la consola durante las operaciones con las pasarelas de pago.

### Diagnóstico de Problemas con MercadoPago

Si experimentas problemas específicos con MercadoPago, puedes utilizar las siguientes herramientas de diagnóstico:

#### Verificación de Estado de API

```bash
# Verificar estado de la API de MercadoPago
curl -X GET https://api.mercadopago.com/v1/ping \
  -H "Authorization: Bearer TEST_ACCESS_TOKEN"
```

Si la respuesta es `{"message":"pong"}`, la API está funcionando correctamente.

#### Códigos de Error Comunes de MercadoPago

| Código | Descripción | Solución |
|--------|-------------|----------|
| 401    | Unauthorized - Token inválido | Verificar credenciales y regenerar token |
| 403    | Forbidden - Permisos insuficientes | Verificar permisos de la aplicación en el panel de desarrollador |
| 404    | Not Found - Recurso no encontrado | Verificar IDs y URLs |
| 429    | Too Many Requests - Límite de tasa excedido | Implementar backoff exponencial entre solicitudes |

#### Herramienta de Depuración para Tokens

```javascript
// Función para verificar estado de tokens
async function checkMercadoPagoTokenStatus(agencyId) {
  try {
    // Obtener tokens almacenados
    const tokens = await getStoredTokens('mercadopago', agencyId);
    
    if (!tokens) {
      console.error('No hay tokens almacenados para esta agencia');
      return false;
    }
    
    // Verificar expiración
    const now = Date.now();
    const expirationDate = new Date(tokens.created_at).getTime() + (tokens.expires_in * 1000);
    const isExpired = now > expirationDate;
    
    console.log('Estado de tokens MercadoPago:');
    console.log(`- Access Token: ${tokens.access_token.substring(0, 10)}...`);
    console.log(`- Refresh Token: ${tokens.refresh_token.substring(0, 10)}...`);
    console.log(`- Expiración: ${new Date(expirationDate).toLocaleString()}`);
    console.log(`- Estado: ${isExpired ? 'EXPIRADO' : 'VÁLIDO'}`);
    
    return !isExpired;
  } catch (error) {
    console.error('Error al verificar tokens:', error);
    return false;
  }
}
```

Puedes ejecutar esta función desde la consola de desarrollo o crear un endpoint de diagnóstico para verificar el estado de los tokens.