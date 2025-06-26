import { db } from "@/lib/db";

// Interfaces para la API de WhatsApp Business Cloud
interface WhatsAppCredentials {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken?: string;
}

interface WhatsAppMessagePayload {
  to: string;
  text: string;
  pqrId?: string;
  agentName?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Servicio para integración con la API de WhatsApp Business Cloud de Meta
 */
export const WhatsAppBusinessService = {
  /**
   * Obtiene las credenciales de WhatsApp Business para una agencia
   */
  async getCredentials(agencyId: string): Promise<WhatsAppResponse> {
    try {
      const credentials = await db.whatsAppCredentials.findUnique({
        where: { agencyId },
      });

      if (!credentials) {
        return {
          success: false,
          message: "No se encontraron credenciales de WhatsApp Business para esta agencia",
        };
      }

      return {
        success: true,
        message: "Credenciales obtenidas correctamente",
        data: credentials,
      };
    } catch (error) {
      console.error("Error al obtener credenciales de WhatsApp:", error);
      return {
        success: false,
        message: "Error al obtener credenciales de WhatsApp",
        error,
      };
    }
  },

  /**
   * Guarda o actualiza las credenciales de WhatsApp Business para una agencia
   */
  async saveCredentials(
    agencyId: string,
    credentials: WhatsAppCredentials
  ): Promise<WhatsAppResponse> {
    try {
      const existingCredentials = await db.whatsAppCredentials.findUnique({
        where: { agencyId },
      });

      let result;
      if (existingCredentials) {
        result = await db.whatsAppCredentials.update({
          where: { agencyId },
          data: credentials,
        });
      } else {
        result = await db.whatsAppCredentials.create({
          data: {
            agencyId,
            ...credentials,
          },
        });
      }

      return {
        success: true,
        message: "Credenciales guardadas correctamente",
        data: result,
      };
    } catch (error) {
      console.error("Error al guardar credenciales de WhatsApp:", error);
      return {
        success: false,
        message: "Error al guardar credenciales de WhatsApp",
        error,
      };
    }
  },

  /**
   * Verifica si un cliente puede recibir mensajes de WhatsApp
   */
  async canReceiveWhatsApp(clientId: string): Promise<{
    success: boolean;
    canReceive: boolean;
    phone?: string;
    message: string;
  }> {
    try {
      const client = await db.client.findUnique({
        where: { id: clientId },
        include: {
          Agency: true,
        },
      });

      if (!client) {
        return {
          success: false,
          canReceive: false,
          message: "Cliente no encontrado",
        };
      }

      if (!client.phone) {
        return {
          success: false,
          canReceive: false,
          message: "El cliente no tiene número de teléfono registrado",
        };
      }

      // Verificar si la agencia tiene credenciales de WhatsApp configuradas
      const credentialsResponse = await this.getCredentials(client.agencyId);
      if (!credentialsResponse.success) {
        return {
          success: false,
          canReceive: false,
          message: "La agencia no tiene configurada la integración con WhatsApp Business",
        };
      }

      // Formatear el número de teléfono para WhatsApp (eliminar espacios, guiones, etc.)
      const formattedPhone = this.formatPhoneNumber(client.phone);

      return {
        success: true,
        canReceive: true,
        phone: formattedPhone,
        message: "El cliente puede recibir mensajes de WhatsApp",
      };
    } catch (error) {
      console.error("Error al verificar WhatsApp:", error);
      return {
        success: false,
        canReceive: false,
        message: "Error al verificar capacidad de WhatsApp",
      };
    }
  },

  /**
   * Envía un mensaje a través de la API de WhatsApp Business Cloud
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppResponse> {
    try {
      // Extraer el ID de la agencia del PQR si está disponible
      let agencyId: string | undefined;
      
      if (payload.pqrId) {
        const pqr = await db.pQR.findUnique({
          where: { id: payload.pqrId },
          select: { agencyId: true },
        });
        agencyId = pqr?.agencyId;
      }

      if (!agencyId) {
        return {
          success: false,
          message: "No se pudo determinar la agencia para enviar el mensaje",
        };
      }

      // Obtener credenciales de WhatsApp para la agencia
      const credentialsResponse = await this.getCredentials(agencyId);
      if (!credentialsResponse.success) {
        return credentialsResponse;
      }

      const credentials = credentialsResponse.data;

      // Formatear el número de teléfono
      const formattedPhone = this.formatPhoneNumber(payload.to);

      // Construir el cuerpo del mensaje según sea un mensaje de texto o una plantilla
      let requestBody: any;

      if (payload.templateName) {
        // Mensaje con plantilla
        requestBody = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "template",
          template: {
            name: payload.templateName,
            language: {
              code: "es", // Código de idioma (español por defecto)
            },
            components: [],
          },
        };

        // Agregar parámetros de la plantilla si existen
        if (payload.templateParams && Object.keys(payload.templateParams).length > 0) {
          const components: any[] = [];
          // Componente de cuerpo con parámetros
          const bodyComponent: any = {
            type: "body",
            parameters: Object.entries(payload.templateParams).map(([_, value]) => ({
              type: "text",
              text: value,
            })),
          };
          components.push(bodyComponent);
          requestBody.template.components = components;
        }
      } else {
        // Mensaje de texto simple
        requestBody = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "text",
          text: {
            body: payload.text,
          },
        };
      }

      // Realizar la solicitud a la API de WhatsApp Business Cloud
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${credentials.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error en la API de WhatsApp:", responseData);
        return {
          success: false,
          message: "Error al enviar mensaje de WhatsApp",
          error: responseData,
        };
      }

      // Registrar el mensaje enviado en la base de datos
      await db.whatsAppMessageLog.create({
        data: {
          agencyId,
          phoneNumber: formattedPhone,
          message: payload.text,
          direction: "OUTBOUND",
          status: "SENT",
          pqrId: payload.pqrId,
          metadata: JSON.stringify(responseData),
        },
      });

      return {
        success: true,
        message: "Mensaje enviado correctamente",
        data: responseData,
      };
    } catch (error) {
      console.error("Error al enviar mensaje de WhatsApp:", error);
      return {
        success: false,
        message: "Error al enviar mensaje de WhatsApp",
        error,
      };
    }
  },

  /**
   * Procesa un webhook de WhatsApp Business Cloud
   */
  async processWebhook(body: any, agencyId: string): Promise<WhatsAppResponse> {
    try {
      // Verificar si es un mensaje entrante
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages.length > 0
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número de teléfono del remitente
        let messageText = "";

        // Extraer el texto del mensaje según el tipo
        if (message.type === "text" && message.text) {
          messageText = message.text.body;
        } else if (message.type === "interactive" && message.interactive) {
          // Manejar mensajes interactivos
          if (message.interactive.type === "button_reply") {
            messageText = message.interactive.button_reply.title;
          } else if (message.interactive.type === "list_reply") {
            messageText = message.interactive.list_reply.title;
          }
        }

        if (messageText) {
          // Buscar cliente por número de teléfono
          const formattedPhone = this.formatPhoneNumber(from);
          const client = await db.client.findFirst({
            where: {
              phone: {
                contains: formattedPhone.substring(formattedPhone.length - 8), // Buscar por los últimos 8 dígitos
              },
              agencyId,
            },
            include: {
              PQRs: {
                orderBy: {
                  updatedAt: "desc",
                },
                take: 1,
              },
            },
          });

          if (client && client.PQRs.length > 0) {
            const pqrId = client.PQRs[0].id;

            // Registrar el mensaje en la base de datos
            await db.whatsAppMessageLog.create({
              data: {
                agencyId,
                phoneNumber: from,
                message: messageText,
                direction: "INBOUND",
                status: "RECEIVED",
                pqrId,
                metadata: JSON.stringify(message),
              },
            });

            // Actualizar la fecha de última actualización del PQR
            await db.pQR.update({
              where: { id: pqrId },
              data: {
                updatedAt: new Date(),
              },
            });

            return {
              success: true,
              message: "Mensaje de WhatsApp procesado correctamente",
              data: { pqrId, clientId: client.id },
            };
          } else {
            // Registrar el mensaje aunque no se haya encontrado un cliente o PQR
            await db.whatsAppMessageLog.create({
              data: {
                agencyId,
                phoneNumber: from,
                message: messageText,
                direction: "INBOUND",
                status: "UNMATCHED", // No se encontró un cliente o PQR asociado
                metadata: JSON.stringify(message),
              },
            });

            return {
              success: false,
              message: "No se encontró un cliente o PQR asociado al número de teléfono",
            };
          }
        }
      }

      return {
        success: true,
        message: "Webhook procesado pero no contiene mensajes",
      };
    } catch (error) {
      console.error("Error al procesar webhook de WhatsApp:", error);
      return {
        success: false,
        message: "Error al procesar webhook de WhatsApp",
        error,
      };
    }
  },

  /**
   * Verifica un webhook de WhatsApp Business Cloud
   */
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
    agencyId: string
  ): Promise<{ success: boolean; challenge?: string; message: string }> {
    return new Promise(async (resolve) => {
      try {
        // Obtener el token de verificación configurado para la agencia
        const credentialsResponse = await this.getCredentials(agencyId);
        if (!credentialsResponse.success) {
          return resolve({
            success: false,
            message: "No se encontraron credenciales de WhatsApp para esta agencia",
          });
        }

        const credentials = credentialsResponse.data;
        const verifyToken = credentials.webhookVerifyToken;

        // Verificar que el modo sea 'subscribe' y el token coincida
        if (mode === "subscribe" && token === verifyToken) {
          return resolve({
            success: true,
            challenge,
            message: "Webhook verificado correctamente",
          });
        } else {
          return resolve({
            success: false,
            message: "Verificación de webhook fallida: token inválido",
          });
        }
      } catch (error) {
        console.error("Error al verificar webhook de WhatsApp:", error);
        return resolve({
          success: false,
          message: "Error al verificar webhook de WhatsApp",
        });
      }
    });
  },

  /**
   * Formatea un número de teléfono para WhatsApp
   * Elimina caracteres no numéricos y asegura el formato internacional
   */
  formatPhoneNumber(phone: string): string {
    // Eliminar todos los caracteres no numéricos
    let cleaned = phone.replace(/\D/g, "");

    // Si el número no comienza con '+', agregar el código de país por defecto (México: +52)
    if (!phone.startsWith("+")) {
      // Si el número ya comienza con el código de país (52), agregar solo el '+'
      if (cleaned.startsWith("52") && cleaned.length >= 12) {
        cleaned = "+" + cleaned;
      } else {
        // Agregar el código de país completo
        cleaned = "+52" + cleaned;
      }
    } else {
      // Si ya tiene el '+', asegurarse de mantenerlo
      cleaned = "+" + cleaned;
    }

    return cleaned;
  },
};