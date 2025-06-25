import { NextRequest, NextResponse } from "next/server";
import { processWhatsAppWebhook, verifyWhatsAppWebhook } from "@/lib/client-queries";

/**
 * Maneja las solicitudes GET para verificar el webhook de WhatsApp Business Cloud
 * Esta ruta es utilizada por Meta para verificar la propiedad del webhook
 */
export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de consulta para la verificación del webhook
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    const agencyId = searchParams.get("agency");

    // Validar parámetros requeridos
    if (!mode || !token || !challenge || !agencyId) {
      return new NextResponse("Parámetros de verificación incompletos", { status: 400 });
    }

    // Verificar el webhook con el servicio de WhatsApp Business
    const result = await verifyWhatsAppWebhook(
      mode,
      token,
      challenge,
      agencyId
    );

    if (result.success) {
      // Devolver el desafío para confirmar la verificación
      return new NextResponse(result.challenge, { status: 200 });
    } else {
      return new NextResponse(result.message, { status: 403 });
    }
  } catch (error) {
    console.error("Error en la verificación del webhook de WhatsApp:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

/**
 * Maneja las solicitudes POST para recibir mensajes y eventos de WhatsApp Business Cloud
 * Esta ruta recibe las notificaciones de mensajes entrantes y otros eventos
 */
export async function POST(req: NextRequest) {
  try {
    // Obtener el ID de la agencia desde los parámetros de consulta
    const agencyId = req.nextUrl.searchParams.get("agency");

    if (!agencyId) {
      return new NextResponse("ID de agencia no proporcionado", { status: 400 });
    }

    // Obtener el cuerpo de la solicitud
    const body = await req.json();

    // Procesar el webhook con el servicio de WhatsApp Business
    const result = await processWhatsAppWebhook(body, agencyId);

    // Devolver una respuesta exitosa para confirmar la recepción
    // WhatsApp Business Cloud espera un código 200 para confirmar que el webhook fue recibido
    return NextResponse.json(
      { success: true, message: "Webhook recibido correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al procesar webhook de WhatsApp:", error);
    // Aún devolvemos 200 para que Meta no reintente el envío
    return NextResponse.json(
      { success: false, message: "Error al procesar webhook" },
      { status: 200 }
    );
  }
}