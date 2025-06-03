import { getPaymentGateway } from "../payment-queries";

// Simulaciones de servicios específicos (debes implementar la lógica real)
async function paypalSyncService(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    producto: any,
    accessToken: string
) {
    // Aquí va la integración real con la API de PayPal
    // Simulación de respuesta:
    return {
        success: true,
        gatewayProductId: producto.paypalProdId || "paypal-prod-id-mock",
        error: null
    };
}

async function mpSyncService(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    producto: any,
    accessToken: string
) {
    // Aquí va la integración real con la API de MercadoPago
    // Simulación de respuesta:
    return {
        success: true,
        gatewayProductId: producto.mpPrefId || "mp-prod-id-mock",
        error: null
    };
}

// Función central de sincronización
export async function syncWithGateway(
    agencyId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    producto: {
        id: string;
        name: string;
        description?: string;
        sku: string;
        price: number;
        paypalProdId?: string;
        paypalPriceId?: string;
        mpPrefId?: string;
        images?: string[];
        active?: boolean;
        gatewayId: 'paypal' | 'mercadopago';
    }
): Promise<{ success: boolean; gatewayProductId?: string; error?: string | null }> {
    // 1. Obtener conexión de pasarela desde la base de datos
    const gatewayConn = await getPaymentGateway(agencyId, producto.gatewayId);
    if (
        !gatewayConn ||
        gatewayConn.status !== 'ACTIVE' ||
        (gatewayConn.expiresAt && new Date() > gatewayConn.expiresAt)
    ) {
        return { success: false, error: "Pasarela no conectada o token expirado" };
    }
    const accessToken = gatewayConn.accessToken!;

    // 2. Delegar a servicio específico según gatewayId
    if (producto.gatewayId === 'paypal') {
        return await paypalSyncService(action, producto, accessToken);
    } else if (producto.gatewayId === 'mercadopago') {
        return await mpSyncService(action, producto, accessToken);
    } else {
        return { success: false, error: "Pasarela no soportada" };
    }
}