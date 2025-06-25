import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: NextRequest, { params }: { params: { gatewayId: string } }) {
    try {
        const { gatewayId } = params;
        const { agencyId, code } = await req.json();

        if (!gatewayId || !agencyId) {
            return NextResponse.json(
                { success: false, error: 'Faltan parámetros requeridos' },
                { status: 400 }
            );
        }

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

        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            message: 'Conexión simulada exitosa',
            gatewayId,
            agencyId,
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