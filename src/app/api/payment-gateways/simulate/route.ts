/**
 * Endpoint para simular webhooks y eventos de pasarelas de pago
 * Este endpoint solo está disponible en entorno de desarrollo
 * y permite probar el flujo completo de integración sin necesidad de URLs HTTPS
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleSimulationRequest } from '../utils/webhook-simulator';
import { simulateOAuthResponse, simulateConnectionValidation, shouldUseSandbox } from '../utils/test-utils';

/**
 * POST /api/payment-gateways/simulate
 * Simula eventos de webhook para pruebas
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verificar que estamos en entorno de desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Esta funcionalidad solo está disponible en entorno de desarrollo' },
        { status: 403 }
      );
    }

    // Obtener el tipo de simulación
    const { action, gatewayId, agencyId, eventType } = await req.json();

    // Validar los datos básicos
    if (!action || !gatewayId || !agencyId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Ejecutar la acción correspondiente
    switch (action) {
      case 'webhook':
        // Simular un evento de webhook
        if (!eventType) {
          return NextResponse.json(
            { success: false, error: 'Falta el tipo de evento' },
            { status: 400 }
          );
        }
        return await handleSimulationRequest(req);

      case 'oauth':
        // Simular una respuesta de autenticación OAuth
        const oauthResponse = simulateOAuthResponse(gatewayId, agencyId);
        return NextResponse.json({
          success: true,
          data: oauthResponse
        });

      case 'validate':
        // Simular una validación de conexión
        const isConnected = req.nextUrl.searchParams.get('connected') !== 'false';
        const validationResponse = simulateConnectionValidation(gatewayId, agencyId, isConnected);
        return NextResponse.json(validationResponse);

      case 'environment':
        // Verificar el entorno actual
        return NextResponse.json({
          success: true,
          environment: process.env.NODE_ENV,
          usingSandbox: shouldUseSandbox(),
          sandboxEnabled: process.env.USE_PAYMENT_SANDBOX === 'true'
        });

      default:
        return NextResponse.json(
          { success: false, error: `Acción no soportada: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error en la simulación:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment-gateways/simulate
 * Obtiene información sobre las opciones de simulación disponibles
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verificar que estamos en entorno de desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Esta funcionalidad solo está disponible en entorno de desarrollo' },
      { status: 403 }
    );
  }

  // Importar los tipos de eventos disponibles
  const { PAYPAL_EVENT_TYPES, MERCADOPAGO_EVENT_TYPES } = await import('../utils/webhook-simulator');

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    usingSandbox: shouldUseSandbox(),
    availableActions: [
      'webhook',  // Simular eventos de webhook
      'oauth',    // Simular respuesta de autenticación OAuth
      'validate', // Simular validación de conexión
      'environment' // Verificar entorno actual
    ],
    availableGateways: ['paypal', 'mercadopago'],
    eventTypes: {
      paypal: PAYPAL_EVENT_TYPES,
      mercadopago: MERCADOPAGO_EVENT_TYPES
    },
    usage: {
      webhook: {
        method: 'POST',
        params: {
          action: 'webhook',
          gatewayId: 'paypal|mercadopago',
          agencyId: 'id_de_la_agencia',
          eventType: 'tipo_de_evento'
        }
      },
      oauth: {
        method: 'POST',
        params: {
          action: 'oauth',
          gatewayId: 'paypal|mercadopago',
          agencyId: 'id_de_la_agencia'
        }
      },
      validate: {
        method: 'POST',
        params: {
          action: 'validate',
          gatewayId: 'paypal|mercadopago',
          agencyId: 'id_de_la_agencia'
        },
        query: {
          connected: 'true|false'
        }
      }
    }
  });
}