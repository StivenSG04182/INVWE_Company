import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * API para simular la autenticación de pasarelas de pago
 * Esta ruta genera tokens aleatorios y datos de merchant para pruebas
 */
export async function POST(req: NextRequest, { params }: { params: { gatewayId: string } }) {
    try {
        const { gatewayId } = params;
        const { agencyId, code } = await req.json();

        // Validar que tenemos los datos necesarios
        if (!gatewayId || !agencyId) {
            return NextResponse.json(
                { success: false, error: 'Faltan parámetros requeridos' },
                { status: 400 }
            );
        }

        // Generar datos aleatorios para simular la respuesta de la pasarela
        const mockData = {
            accessToken: `access_${uuidv4()}`,
            refreshToken: `refresh_${uuidv4()}`,
            merchantId: `merchant_${uuidv4()}`,
            expiresIn: 3600,
            tokenType: 'Bearer',
            metadata: {
                businessName: 'Empresa de Prueba',
                email: 'test@example.com',
                country: 'ES',
                currency: 'EUR',
                accountStatus: 'VERIFIED'
            }
        };

        // En un entorno real, aquí guardaríamos los tokens en la base de datos
        // asociados al agencyId y gatewayId
        console.log(`Simulando conexión para agencia ${agencyId} con pasarela ${gatewayId}`);
        console.log('Datos generados:', mockData);

        // Simular un pequeño retraso para que parezca una llamada real
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            message: 'Conexión simulada exitosa',
            gatewayId,
            agencyId,
            // Normalmente no enviaríamos todos estos datos al frontend por seguridad
            // pero para propósitos de prueba los incluimos
            connectionData: mockData
        });
    } catch (error) {
        console.error('Error en simulación de autenticación:', error);
        return NextResponse.json(
            { success: false, error: 'Error en el servidor' },
            { status: 500 }
        );
    }
}