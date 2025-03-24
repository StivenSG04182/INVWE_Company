import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    try {
        // Autenticación del usuario vía Clerk
        const { userId: clerkUserId } = await auth();
        console.log("Authenticated Clerk userId:", clerkUserId);
        if (!clerkUserId) {
            console.error("No userId found in authentication");
            return NextResponse.json(
                { error: "Unauthorized", message: "Usuario no autenticado" },
                { status: 401 }
            );
        }

        const clerkUser = await currentUser();
        console.log("Clerk user data:", clerkUser);
        if (!clerkUser) {
            console.error("Clerk user not found");
            return NextResponse.json(
                { error: "User not found", message: "No se encontró el usuario en Clerk" },
                { status: 401 }
            );
        }

        // Leer parámetro de consulta para filtrar por categoría; default "all"
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") || "all";
        console.log("Category filter:", category);

        // Consultar la tabla de mapeo para verificar que el usuario tenga rol ADMIN o ADMINISTRATOR
        const { data: mappingRecords, error: mappingError } = await supabase
            .from("users_companies")
            .select("id")
            .eq("user_id", clerkUserId)
            .in("role", ["ADMIN", "ADMINISTRATOR"]);

        console.log("Mapping records (users_companies):", mappingRecords);
        if (mappingError || !mappingRecords || mappingRecords.length === 0) {
            console.error("Mapping error or no admin mapping found:", mappingError);
            return NextResponse.json(
                { error: "Unauthorized", message: "No tienes permisos de administrador en ningún inventario" },
                { status: 403 }
            );
        }

        // Extraer los IDs de las relaciones (users_companies)
        const mappingIds = mappingRecords.map((record) => record.id);
        console.log("Mapping IDs:", mappingIds);

        // Construir la consulta para obtener las notificaciones que pertenezcan a los mappingIds del admin
        let query = supabase
            .from("notifications")
            .select("*")
            .in("users_companies_id", mappingIds)
            .order("created_at", { ascending: false });
        console.log("Query inicial para notificaciones configurada");

        if (category === "messages") {
            query = query.eq("type", "message");
            console.log("Aplicado filtro: messages");
        } else if (category === "alerts") {
            query = query.eq("type", "alert");
            console.log("Aplicado filtro: alerts");
        } else if (["store", "invoices", "email"].includes(category)) {
            query = query.ilike("title", `%${category}%`);
            console.log(`Aplicado filtro en título para la categoría: ${category}`);
        }

        // Ejecutar la consulta
        const { data: notifications, error: notifError } = await query;
        console.log("Resultado de notificaciones:", notifications);
        if (notifError) {
            console.error("Error fetching notifications:", notifError);
            return NextResponse.json(
                { error: "Error fetching notifications", message: notifError.message },
                { status: 500 }
            );
        }

        // Devolver las notificaciones encontradas
        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
        console.error("GET_NOTIFICATIONS_ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error", message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
