import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NotificationService } from "@/lib/services/notification-service"

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { userId } = params
        const { searchParams } = new URL(req.url)
        const unreadOnly = searchParams.get("unreadOnly") === "true"
        const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")) : undefined

        // Verificar que el usuario solicitando las notificaciones sea el mismo o un administrador
        if (session.user.id !== userId && session.user.role !== "AGENCY_ADMIN") {
            return NextResponse.json(
                { success: false, error: "No autorizado para ver estas notificaciones" },
                { status: 403 },
            )
        }

        const notifications = await NotificationService.getUserNotifications(userId, {
            unreadOnly,
            limit,
        })

        return NextResponse.json({ success: true, data: notifications })
    } catch (error: any) {
        console.error("Error en API de notificaciones:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { userId } = params
        const body = await req.json()
        const { notificationId, action } = body

        // Verificar que el usuario actualizando las notificaciones sea el mismo o un administrador
        if (session.user.id !== userId && session.user.role !== "AGENCY_ADMIN") {
            return NextResponse.json(
                { success: false, error: "No autorizado para actualizar estas notificaciones" },
                { status: 403 },
            )
        }

        if (action === "mark-read" && notificationId) {
            const notification = await NotificationService.markAsRead(notificationId)
            return NextResponse.json({ success: true, data: notification })
        }

        return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    } catch (error: any) {
        console.error("Error en API de notificaciones:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}
