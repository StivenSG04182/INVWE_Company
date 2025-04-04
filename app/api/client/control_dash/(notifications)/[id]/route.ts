import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * PATCH: Actualizar una notificación (marcar como leída)
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Autenticación del usuario vía Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Usuario no autenticado" },
                { status: 401 }
            );
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { error: "Bad request", message: "ID de notificación no proporcionado" },
                { status: 400 }
            );
        }

        // Obtener datos de la solicitud
        const body = await req.json();
        const { read } = body;

        // Verificar que la notificación existe y pertenece al usuario
        const { data: notification, error: fetchError } = await supabase
            .from("notifications")
            .select("*, users_companies!inner(user_id)")
            .eq("id", id)
            .single();

        if (fetchError || !notification) {
            return NextResponse.json(
                { error: "Not found", message: "Notificación no encontrada" },
                { status: 404 }
            );
        }

        // Verificar que el usuario tiene permiso para actualizar esta notificación
        const userCompany = notification.users_companies;
        if (userCompany.user_id !== userId) {
            return NextResponse.json(
                { error: "Forbidden", message: "No tienes permiso para actualizar esta notificación" },
                { status: 403 }
            );
        }

        // Actualizar la notificación
        const { data: updatedNotification, error: updateError } = await supabase
            .from("notifications")
            .update({ read, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: "Database error", message: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ notification: updatedNotification }, { status: 200 });
    } catch (error) {
        console.error("PATCH_NOTIFICATION_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error", message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * DELETE: Eliminar una notificación
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Autenticación del usuario vía Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Usuario no autenticado" },
                { status: 401 }
            );
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { error: "Bad request", message: "ID de notificación no proporcionado" },
                { status: 400 }
            );
        }

        // Verificar que la notificación existe y pertenece al usuario
        const { data: notification, error: fetchError } = await supabase
            .from("notifications")
            .select("*, users_companies!inner(user_id)")
            .eq("id", id)
            .single();

        if (fetchError || !notification) {
            return NextResponse.json(
                { error: "Not found", message: "Notificación no encontrada" },
                { status: 404 }
            );
        }

        // Verificar que el usuario tiene permiso para eliminar esta notificación
        const userCompany = notification.users_companies;
        if (userCompany.user_id !== userId) {
            return NextResponse.json(
                { error: "Forbidden", message: "No tienes permiso para eliminar esta notificación" },
                { status: 403 }
            );
        }

        // Eliminar la notificación
        const { error: deleteError } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return NextResponse.json(
                { error: "Database error", message: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("DELETE_NOTIFICATION_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error", message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}