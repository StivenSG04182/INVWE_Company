import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        // Validar la autenticación del usuario (se espera que sea un administrador)
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json(
                { error: "Unauthorized", message: "No se encontró un usuario autenticado" },
                { status: 401 }
            );
        }
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { error: "User not found", message: "No se encontró el usuario en Clerk" },
                { status: 401 }
            );
        }

        // Leer datos enviados en el body: se requiere joinRequestId y action
        const body = await req.json();
        const { joinRequestId, action } = body;
        if (!joinRequestId || !action) {
            return NextResponse.json(
                { error: "Missing required fields", message: "Se requieren joinRequestId y action" },
                { status: 400 }
            );
        }

        // Obtener la solicitud de unión desde la tabla inventory_join_requests
        const { data: joinRequest, error: joinRequestError } = await supabase
            .from("inventory_join_requests")
            .select("*")
            .eq("id", joinRequestId)
            .single();

        if (joinRequestError || !joinRequest) {
            return NextResponse.json(
                { error: "Join Request not found", message: "No se encontró la solicitud de unión" },
                { status: 404 }
            );
        }

        // Verificar que el usuario autenticado sea administrador de la compañía asociada a la solicitud.
        const { data: mapping, error: mappingError } = await supabase
            .from("users_companies")
            .select("*")
            .eq("user_id", clerkUserId)
            .eq("company_id", joinRequest.company_id)
            .in("role", ["ADMIN", "ADMINISTRATOR"])
            .single();

        if (mappingError || !mapping) {
            return NextResponse.json(
                { error: "Unauthorized", message: "No tienes permisos para aprobar o rechazar esta solicitud" },
                { status: 403 }
            );
        }

        // Determinar el nuevo estado basado en la acción enviada
        let newStatus: "approved" | "rejected";
        if (action === "approve") {
            newStatus = "approved";
        } else if (action === "reject") {
            newStatus = "rejected";
        } else {
            return NextResponse.json(
                { error: "Invalid action", message: "La acción debe ser 'approve' o 'reject'" },
                { status: 400 }
            );
        }

        // Actualizar el estado de la solicitud en inventory_join_requests
        const { error: updateError } = await supabase
            .from("inventory_join_requests")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", joinRequestId);

        if (updateError) {
            return NextResponse.json(
                { error: "Update failed", message: "No se pudo actualizar la solicitud" },
                { status: 500 }
            );
        }

        // Si la solicitud es aprobada, se asocia el usuario al inventario (tabla users_companies)
        if (newStatus === "approved") {
            // Verificar si ya existe una asociación para evitar duplicados
            const { data: existingMapping } = await supabase
                .from("users_companies")
                .select("*")
                .eq("user_id", joinRequest.user_id)
                .eq("company_id", joinRequest.company_id)
                .single();

            if (!existingMapping) {
                const { error: insertMappingError } = await supabase
                    .from("users_companies")
                    .insert({
                        user_id: joinRequest.user_id,
                        company_id: joinRequest.company_id,
                        role: "EMPLOYEE",
                        is_default_inventory: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();
                if (insertMappingError) {
                    return NextResponse.json(
                        { error: "Association failed", message: "No se pudo asociar el usuario con el inventario" },
                        { status: 500 }
                    );
                }

                // Crear notificación para el administrador
                const { error: notificationError } = await supabase
                    .from('notifications')
                    .insert({
                        type: 'alert',
                        title: 'Nueva solicitud aprobada',
                        message: `Has aprobado la solicitud de ${clerkUser.firstName} ${clerkUser.lastName}`,
                        users_companies_id: mapping.id,
                        created_by: clerkUserId,
                        recipient_user_id: joinRequest.user_id,
                        read: false
                    });

                if (notificationError) {
                    console.error('Error creating notification:', notificationError);
                }
            }
        }

        // Responder de acuerdo a la acción realizada
        if (newStatus === "approved") {
            return NextResponse.json(
                { status: "approved", message: "La solicitud ha sido aprobada y el usuario ha sido asociado al inventario." },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { status: "rejected", message: "La solicitud ha sido rechazada." },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Error in admin update join request endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error", message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
