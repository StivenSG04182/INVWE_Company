"use server";

import { db } from "./db";
import { revalidatePath } from 'next/cache';
import { PaymentGatewayConnection } from "@prisma/client";
import { syncWithGateway } from "@/lib/payment/syncService";

// Crear o actualizar conexión de pasarela
export const upsertPaymentGateway = async (
    agencyId: string,
    gatewayData: Partial<PaymentGatewayConnection>
) => {
    try {
        const response = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: gatewayData.gatewayId!
                }
            },
            update: gatewayData,
            create: {
                ...gatewayData,
                agencyId,
                gatewayId: gatewayData.gatewayId!,
                status: gatewayData.status || 'PENDING'
            }
        });

        revalidatePath(`/agency/${agencyId}/settings/launchpad`);
        return response;
    } catch (error) {
        console.error('Error en upsertPaymentGateway:', error);
        throw error;
    }
}

// Obtener conexión de pasarela
export async function getPaymentGateway(agencyId: string, gatewayId: string) {
    try {
        return await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    gatewayId,
                    agencyId
                }
            }
        })
    } catch (error) {
        console.error('Error en getPaymentGateway:', error)
        throw error
    }
}

// Actualizar tokens de acceso
export const updatePaymentGatewayTokens = async (
    agencyId: string,
    gatewayId: string,
    tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresAt?: Date;
    }
) => {
    try {
        const response = await db.paymentGatewayConnection.update({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            },
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt,
            }
        });
        return response;
    } catch (error) {
        console.error('Error en updatePaymentGatewayTokens:', error);
        throw error;
    }
}

// Eliminar conexión de pasarela
export const deletePaymentGateway = async (agencyId: string, gatewayId: string) => {
    try {
        const response = await db.paymentGatewayConnection.delete({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            }
        });

        revalidatePath(`/agency/${agencyId}/settings/launchpad`);
        return response;
    } catch (error) {
        console.error('Error en deletePaymentGateway:', error);
        throw error;
    }
}

// Verificar estado de conexión
export const verifyPaymentGatewayStatus = async (agencyId: string, gatewayId: string) => {
    try {
        const connection = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            },
            select: {
                status: true,
                accessToken: true,
                expiresAt: true
            }
        });

        if (!connection) {
            return {
                isConnected: false,
                status: 'NOT_CONNECTED',
                needsReauth: false
            };
        }

        const needsReauth = connection.expiresAt ? new Date() > connection.expiresAt : false;

        return {
            isConnected: connection.status === 'ACTIVE' && !needsReauth,
            status: connection.status,
            needsReauth
        };
    } catch (error) {
        console.error('Error en verifyPaymentGatewayStatus:', error);
        return {
            isConnected: false,
            status: 'ERROR',
            needsReauth: false
        };
    }
}

// Obtener conexión de pasarela específica (ejemplo con PayPal)
export const getPaypalConnection = async (agencyId: string) => {
    try {
        const response = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    gatewayId: "paypal",
                    agencyId: agencyId // Este valor falta
                }
            }
        });
        return response;
    } catch (error) {
        console.error('Error en getPaypalConnection:', error);
        return null;
    }
}

// Verificar conexión con pasarela de pagos
export const checkPaymentGatewayConnection = async (agencyId: string) => {
    if (!agencyId) {
        console.error('agencyId es requerido para getPaymentGateway');
        throw new Error('agencyId es requerido');
    }
    
    const paymentGateway = await getPaymentGateway(agencyId, 'paypal');

    if (!paymentGateway) {
        return {
            isConnected: false,
            status: 'NOT_CONNECTED',
            needsReauth: false
        };
    }

    const needsReauth = paymentGateway.expiresAt ? new Date() > paymentGateway.expiresAt : false;

    return {
        isConnected: paymentGateway.status === 'ACTIVE' && !needsReauth,
        status: paymentGateway.status,
        needsReauth
    };
}

// Crear producto y sincronizar con pasarela
export const createProductAndSync = async (
    agencyId: string,
    productData: {
        name: string;
        sku: string;
        price: number;
        gatewayId: 'paypal' | 'mercadopago';
        description?: string;
        images?: string[];
        categoryId?: string;
        quantity?: number;
        cost?: number;
        minStock?: number;
        active?: boolean;
        subAccountId?: string;
        brand?: string;
        model?: string;
        tags?: string[];
        unit?: string;
        barcode?: string;
        taxRate?: number;
    }
) => {
    // Validar datos obligatorios
    if (!agencyId || !productData.name || !productData.sku || !productData.price || !productData.gatewayId) {
        throw new Error('Faltan campos obligatorios');
    }

    // Verificar que la agencia existe
    const agency = await db.agency.findUnique({ where: { id: agencyId } });
    if (!agency) throw new Error('Agencia no encontrada');

    // Verificar SKU duplicado
    const existing = await db.product.findFirst({ where: { agencyId, sku: productData.sku } });
    if (existing) throw new Error('SKU duplicado');

    // Crear producto en BD
    const product = await db.product.create({
        data: {
            ...productData,
            agencyId,
            externalIntegrations: { gatewayId: productData.gatewayId }
        }
    });

    // Sincronizar con pasarela
    const syncResult = await syncWithGateway(agencyId, 'CREATE', {
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        sku: product.sku,
        price: parseFloat(product.price.toString()),
        images: product.images,
        active: product.active,
        gatewayId: productData.gatewayId
    });

    // Actualizar IDs externos si corresponde
    if (syncResult.success && syncResult.gatewayProductId) {
        const externalIntegrations: any = { gatewayId: productData.gatewayId };
        if (productData.gatewayId === 'paypal') {
            externalIntegrations.paypalProdId = syncResult.gatewayProductId;
            externalIntegrations.paypalPriceId = syncResult.gatewayProductId;
        } else if (productData.gatewayId === 'mercadopago') {
            externalIntegrations.mpPrefId = syncResult.gatewayProductId;
        }
        await db.product.update({ where: { id: product.id }, data: { externalIntegrations } });
    }

    return {
        ...product,
        syncStatus: syncResult.success ? 'SUCCESS' : 'FAILED',
        syncError: syncResult.error
    };
};

// Actualizar producto y sincronizar con pasarela
export const updateProductAndSync = async (
    agencyId: string,
    id: string,
    updateData: Partial<{
        name: string;
        sku: string;
        price: number;
        gatewayId: 'paypal' | 'mercadopago';
        description?: string;
        images?: string[];
        categoryId?: string;
        quantity?: number;
        cost?: number;
        minStock?: number;
        active?: boolean;
        subAccountId?: string;
        brand?: string;
        model?: string;
        tags?: string[];
        unit?: string;
        barcode?: string;
        taxRate?: number;
    }>
) => {
    if (!agencyId || !id) throw new Error('Faltan agencyId o id');

    const existing = await db.product.findFirst({ where: { id, agencyId } });
    if (!existing) throw new Error('Producto no encontrado');

    // Actualizar externalIntegrations si cambia la pasarela
    if (updateData.gatewayId !== undefined) {
        updateData.externalIntegrations = { ...(existing.externalIntegrations || {}), gatewayId: updateData.gatewayId };
    }

    const updatedProduct = await db.product.update({ where: { id }, data: updateData });
    const syncGatewayId = (updateData.gatewayId || (existing.externalIntegrations as any)?.gatewayId || 'paypal') as 'paypal' | 'mercadopago';
    const externalIntegrations = updatedProduct.externalIntegrations as any || {};

    const syncResult = await syncWithGateway(agencyId, 'UPDATE', {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description || undefined,
        sku: updatedProduct.sku,
        price: parseFloat(updatedProduct.price.toString()),
        paypalProdId: externalIntegrations.paypalProdId,
        paypalPriceId: externalIntegrations.paypalPriceId,
        mpPrefId: externalIntegrations.mpPrefId,
        images: updatedProduct.images as string[],
        active: updatedProduct.active,
        gatewayId: syncGatewayId
    });

    // Actualizar IDs externos si corresponde
    if (syncResult.success && syncResult.gatewayProductId) {
        const updatedExternalIntegrations: any = { ...externalIntegrations, gatewayId: syncGatewayId };
        if (syncGatewayId === 'paypal') {
            updatedExternalIntegrations.paypalProdId = syncResult.gatewayProductId;
            if (!updatedExternalIntegrations.paypalPriceId) {
                updatedExternalIntegrations.paypalPriceId = syncResult.gatewayProductId;
            }
        } else if (syncGatewayId === 'mercadopago') {
            updatedExternalIntegrations.mpPrefId = syncResult.gatewayProductId;
        }
        await db.product.update({ where: { id: updatedProduct.id }, data: { externalIntegrations: updatedExternalIntegrations } });
    }

    return {
        ...updatedProduct,
        syncStatus: syncResult.success ? 'SUCCESS' : 'FAILED',
        syncError: syncResult.error
    };
};

// Eliminar producto y sincronizar con pasarela
export const deleteProductAndSync = async (
    agencyId: string,
    id: string
) => {
    if (!agencyId || !id) throw new Error('Faltan agencyId o id');

    const existing = await db.product.findFirst({ where: { id, agencyId } });
    if (!existing) throw new Error('Producto no encontrado');

    const externalIntegrations = existing.externalIntegrations as any || {};
    const gatewayId = externalIntegrations.gatewayId as 'paypal' | 'mercadopago';
    let syncResult = { success: true };

    if (gatewayId) {
        syncResult = await syncWithGateway(agencyId, 'DELETE', {
            id: existing.id,
            name: existing.name,
            sku: existing.sku,
            price: parseFloat(existing.price.toString()),
            paypalProdId: externalIntegrations.paypalProdId,
            paypalPriceId: externalIntegrations.paypalPriceId,
            mpPrefId: externalIntegrations.mpPrefId,
            gatewayId
        });
    }

    await db.product.delete({ where: { id } });

    return {
        success: true,
        syncStatus: syncResult.success ? 'SUCCESS' : 'FAILED',
        syncError: syncResult.error
    };
};
