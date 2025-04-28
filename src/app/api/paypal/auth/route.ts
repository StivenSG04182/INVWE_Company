import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentGatewayAuthResponse } from '@/app/api/payment-gateways/payment-gateway-types'

export async function POST(req: Request) {
    try {
        const { code, agencyId } = await req.json()

        if (!code || !agencyId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Obtener token de acceso de PayPal
        const clientId = process.env.PAYPAL_CLIENT_ID!
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        
        const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&code=${code}`,
        })
        
        const tokenData = await tokenResponse.json()
        
        if (!tokenResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to get PayPal access token', details: tokenData },
                { status: 400 }
            )
        }

        // Obtener información del usuario de PayPal
        const userInfoResponse = await fetch('https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        })
        
        const userInfo = await userInfoResponse.json()

        if (!userInfoResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to get PayPal user info', details: userInfo },
                { status: 400 }
            )
        }

        // Guardar o actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'paypal'
                }
            },
            create: {
                agencyId,
                gatewayId: 'paypal',
                status: 'connected',
                accountId: userInfo.payer_id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                metadata: {
                    email: userInfo.email,
                    name: userInfo.name
                }
            },
            update: {
                status: 'connected',
                accountId: userInfo.payer_id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                metadata: {
                    email: userInfo.email,
                    name: userInfo.name
                }
            }
        })

        const response: PaymentGatewayAuthResponse = {
            success: true,
            accountId: connection.accountId,
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken,
            expiresAt: connection.expiresAt,
            metadata: connection.metadata
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('PayPal auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 