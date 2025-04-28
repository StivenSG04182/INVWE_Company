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

        // Obtener token de acceso de Mercado Pago
        const clientId = process.env.MERCADOPAGO_CLIENT_ID!
        const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET!

        const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: `${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`
            })
        })

        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to get Mercado Pago access token', details: tokenData },
                { status: 400 }
            )
        }

        // Obtener información del usuario de Mercado Pago
        const userInfoResponse = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        })

        const userInfo = await userInfoResponse.json()

        if (!userInfoResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to get Mercado Pago user info', details: userInfo },
                { status: 400 }
            )
        }

        // Guardar o actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: 'mercadopago'
                }
            },
            create: {
                agencyId,
                gatewayId: 'mercadopago',
                status: 'connected',
                accountId: userInfo.id.toString(),
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                metadata: {
                    email: userInfo.email,
                    nickname: userInfo.nickname
                }
            },
            update: {
                status: 'connected',
                accountId: userInfo.id.toString(),
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                metadata: {
                    email: userInfo.email,
                    nickname: userInfo.nickname
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
        console.error('Mercado Pago auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 