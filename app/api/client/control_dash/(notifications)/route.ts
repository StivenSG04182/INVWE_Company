import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET: Obtener notificaciones del usuario
 */
export async function GET(req: Request) {
  try {
    // Autenticación del usuario vía Clerk
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Obtener usuario actual
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found", message: "No se encontró el usuario en Clerk" },
        { status: 401 }
      );
    }

    // Leer parámetros de consulta para filtrado
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const read = searchParams.get("read");

    // Consultar la tabla de mapeo para obtener los IDs de users_companies del usuario
    const { data: mappingRecords, error: mappingError } = await supabase
      .from("users_companies")
      .select("id")
      .eq("user_id", clerkUserId);

    if (mappingError || !mappingRecords || mappingRecords.length === 0) {
      return NextResponse.json(
        { error: "Not found", message: "No se encontraron registros para este usuario" },
        { status: 404 }
      );
    }

    // Extraer los IDs de las relaciones (users_companies)
    const mappingIds = mappingRecords.map((record) => record.id);

    // Construir la consulta para obtener las notificaciones
    let query = supabase
      .from("notifications")
      .select("*")
      .in("users_companies_id", mappingIds)
      .order("created_at", { ascending: false });

    // Aplicar filtros según los parámetros
    if (category === "message") {
      query = query.eq("type", "message");
    } else if (category === "alert") {
      query = query.eq("type", "alert");
    }

    // Filtrar por estado de lectura si se especifica
    if (read === "true") {
      query = query.eq("read", true);
    } else if (read === "false") {
      query = query.eq("read", false);
    }

    // Ejecutar la consulta
    const { data: notifications, error: notifError } = await query;

    if (notifError) {
      return NextResponse.json(
        { error: "Database error", message: notifError.message },
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

/**
 * POST: Crear una nueva notificación
 */
export async function POST(req: Request) {
  try {
    // Autenticación del usuario vía Clerk
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Obtener datos de la solicitud
    const body = await req.json();
    const { type, title, message, users_companies_id } = body;

    // Validar datos requeridos
    if (!type || !title || !message || !users_companies_id) {
      return NextResponse.json(
        { error: "Bad request", message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de notificación
    if (type !== "message" && type !== "alert") {
      return NextResponse.json(
        { error: "Bad request", message: "Tipo de notificación inválido" },
        { status: 400 }
      );
    }

    // Crear la notificación
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        type,
        title,
        message,
        users_companies_id,
        created_by: clerkUserId,
        read: false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("POST_NOTIFICATION_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}