# Integración con WhatsApp Business Cloud API

## Descripción

Este documento describe la implementación de la integración con la API de WhatsApp Business Cloud de Meta en el proyecto INVWE_Company. Esta integración permite a las agencias configurar su propia cuenta de WhatsApp Business para enviar y recibir mensajes a través de la plataforma.

## Cambios realizados

1. Creación de un nuevo servicio `WhatsAppBusinessService` que reemplaza la implementación anterior
2. Actualización de las funciones de mensajería en `client-queries.ts`
3. Creación de un endpoint para webhooks de WhatsApp Business Cloud
4. Creación de una interfaz de usuario para configurar las credenciales de WhatsApp Business
5. Definición de nuevos modelos de Prisma para almacenar credenciales y registros de mensajes

## Pasos pendientes para completar la integración

### 1. Actualizar el esquema de Prisma

Es necesario incorporar los modelos definidos en `prisma/whatsapp-models.prisma` al archivo principal `prisma/schema.prisma`. Para ello:

1. Abrir el archivo `prisma/schema.prisma`
2. Copiar el contenido de `prisma/whatsapp-models.prisma` al final del archivo
3. Asegurarse de que las relaciones estén correctamente definidas
4. Ejecutar la migración de Prisma:

```bash
npx prisma migrate dev --name add_whatsapp_business_models
```

### 2. Configurar la cuenta de WhatsApp Business Cloud

1. Crear una cuenta de desarrollador en Meta: https://developers.facebook.com/
2. Crear una aplicación de tipo Business
3. Configurar la API de WhatsApp Business Cloud
4. Obtener las credenciales necesarias:
   - Access Token
   - Phone Number ID
   - Business Account ID
5. Configurar un número de teléfono para pruebas o solicitar un número de teléfono verificado

### 3. Configurar el webhook

1. En el panel de desarrollador de Meta, configurar el webhook para recibir mensajes
2. Utilizar la URL proporcionada en la página de configuración de WhatsApp Business en el panel de administración
3. Configurar el token de verificación del webhook
4. Seleccionar los eventos a recibir (messages, message_status, etc.)

### 4. Probar la integración

1. Configurar las credenciales en el panel de administración de la agencia
2. Enviar un mensaje de prueba desde la aplicación
3. Verificar que el mensaje se envía correctamente
4. Enviar un mensaje al número de WhatsApp Business desde un teléfono externo
5. Verificar que el mensaje se recibe correctamente en la aplicación

## Consideraciones de seguridad

- Las credenciales de WhatsApp Business Cloud son sensibles y deben almacenarse de forma segura
- El token de verificación del webhook debe ser único y difícil de adivinar
- Considerar la implementación de cifrado para las credenciales almacenadas en la base de datos

## Recursos adicionales

- [Documentación oficial de WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de inicio rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Referencia de la API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)