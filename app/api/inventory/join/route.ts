import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        // Obtener datos de autenticación de Clerk
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            console.error("Unauthorized access: no userId");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Obtener detalles completos del usuario desde Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) {
            console.error("No se pudo obtener el usuario de Clerk");
            return NextResponse.json({
                error: "User not found",
                message: "No se encontró el usuario en Clerk",
            }, { status: 401 });
        }

        // Leer datos enviados en el body
        const body = await req.json();
        console.log("Request body:", body);
        const { nombreEmpresa, nit, codigoSeguridad } = body;

        if (!nombreEmpresa || !nit || !codigoSeguridad) {
            console.error("Missing required fields", { nombreEmpresa, nit, codigoSeguridad });
            return NextResponse.json({
                error: "Missing required fields",
                errors: [
                    !nombreEmpresa && { field: "nombreEmpresa", message: "Nombre de empresa es requerido" },
                    !nit && { field: "nit", message: "NIT es requerido" },
                    !codigoSeguridad && { field: "codigoSeguridad", message: "Código de seguridad es requerido" },
                ].filter(Boolean),
            }, { status: 400 });
        }

        if (!process.env.MONGODB_DB) {
            console.error("MONGODB_DB environment variable is not set");
            return NextResponse.json({
                error: "Configuration error",
                message: "MONGODB_DB is not configured",
            }, { status: 500 });
        }

        // Conexión a MongoDB y búsqueda de la empresa por NIT
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const companiesCollection = db.collection("companies");
        const mongoCompany = await companiesCollection.findOne({ nit: nit });
        if (!mongoCompany) {
            console.error("Company not found in MongoDB for NIT:", nit);
            return NextResponse.json({
                error: "Company not found",
                message: "No se encontró una empresa con el NIT proporcionado",
            }, { status: 401 });
        }

        // Consultar la empresa en Supabase utilizando el campo mongo_id
        const { data: supabaseCompany, error: companyError } = await supabase
            .from("companies")
            .select("id, name, nit, email, security_code")
            .eq("mongo_id", mongoCompany._id.toString())
            .single();

        if (companyError || !supabaseCompany) {
            console.error("Error fetching company from Supabase", companyError);
            return NextResponse.json({
                error: "Company not found",
                message: "Error al verificar la empresa en Supabase",
            }, { status: 401 });
        }

        // Comparar el código de seguridad (normalizando los valores)
        const normalizedDbCode = supabaseCompany.security_code?.trim().toLowerCase();
        const normalizedInputCode = codigoSeguridad?.trim().toLowerCase();
        if (!normalizedDbCode || !normalizedInputCode || normalizedDbCode !== normalizedInputCode) {
            console.error("Security code mismatch", {
                stored: supabaseCompany.security_code,
                provided: codigoSeguridad,
            });
            return NextResponse.json({
                error: "Invalid security code",
                message: "El código de seguridad es incorrecto",
            }, { status: 401 });
        }

        // Verificar si el usuario ya existe en Supabase (tabla users) usando el id de Clerk en la columna 'clerk'
        let { data: supabaseUser, error: userError } = await supabase
            .from("users")
            .select("id, name, last_name, email, phone")
            .eq("clerk", clerkUserId)
            .single();

        // Si no existe, crear el registro en la tabla 'users'
        if (userError || !supabaseUser) {
            // Extraer datos básicos de Clerk
            const name = clerkUser.firstName || "SinNombre";
            const lastName = clerkUser.lastName || "SinApellido";
            const email =
                clerkUser.emailAddresses && clerkUser.emailAddresses[0]?.emailAddress
                    ? clerkUser.emailAddresses[0].emailAddress
                    : "sinemail@example.com";
            const phone = clerkUser.phoneNumber || "0000000000";
            const date_of_birth = "1970-01-01"; // valor por defecto

            const { data: newUser, error: insertUserError } = await supabase
                .from("users")
                .insert({
                    name,
                    last_name: lastName,
                    email,
                    phone,
                    date_of_birth,
                    clerk: clerkUserId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select("id, name, last_name, email, phone")
                .single();

            if (insertUserError || !newUser) {
                console.error("Error inserting new user:", insertUserError);
                return NextResponse.json({
                    error: "Error creating user",
                    message: "Error al crear el registro de usuario",
                }, { status: 500 });
            }
            supabaseUser = newUser;
        }

        const supabaseUserId = supabaseUser.id;

        // Verificar si ya existe una solicitud en inventory_join_requests para este usuario y empresa
        const { data: existingRequest, error: requestFetchError } = await supabase
            .from("inventory_join_requests")
            .select("*")
            .eq("user_id", supabaseUserId)
            .eq("company_id", supabaseCompany.id)
            .single();

        if (existingRequest) {
            // Si ya existe la solicitud, se retorna el mensaje de pendiente
            return NextResponse.json({
                companyName: mongoCompany.name,
                status: "pending",
                message: "Tu solicitud ya está pendiente de aprobación por un administrador",
            }, { status: 200 });
        } else {
            // Insertar la nueva solicitud en inventory_join_requests
            const { error: insertError } = await supabase.from("inventory_requests").insert({
                user_id: supabaseUserId,
                company_id: supabaseCompany.id,
                name: supabaseUser.name,
                last_name: supabaseUser.last_name,
                email: supabaseUser.email,
                phone: supabaseUser.phone,
                status: "pending", // Estado inicial pendiente
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            if (insertError) {
                console.error("Error inserting new join request:", insertError);
                return NextResponse.json({
                    error: "Error creating join request",
                    message: "Error al crear la solicitud de unión al inventario",
                }, { status: 500 });
            }
        }

        // Respuesta indicando que la solicitud está pendiente
        return NextResponse.json({
            companyName: mongoCompany.name,
            status: "pending",
            message: "Tu solicitud está pendiente de aprobación por un administrador",
        }, { status: 200 });
    } catch (error) {
        console.error("JOIN_INVENTORY_ERROR:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: "Error interno del servidor",
        }, { status: 500 });
    }
}
