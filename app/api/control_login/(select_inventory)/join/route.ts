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
            return NextResponse.json(
                { error: "Unauthorized", message: "No se encontró un usuario autenticado" },
                { status: 401 }
            );
        }

        // Obtener detalles completos del usuario desde Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) {
            console.error("No se pudo obtener el usuario de Clerk");
            return NextResponse.json(
                { error: "User not found", message: "No se encontró el usuario en Clerk" },
                { status: 401 }
            );
        }

        // Leer datos enviados en el body
        const body = await req.json();
        console.log("Request body:", body);
        const { nombreEmpresa, nit, codigoSeguridad } = body;

        if (!nombreEmpresa || !nit || !codigoSeguridad) {
            console.error("Missing required fields", { nombreEmpresa, nit, codigoSeguridad });
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    errors: [
                        !nombreEmpresa && { field: "nombreEmpresa", message: "Nombre de empresa es requerido" },
                        !nit && { field: "nit", message: "NIT es requerido" },
                        !codigoSeguridad && { field: "codigoSeguridad", message: "Código de seguridad es requerido" },
                    ].filter(Boolean),
                },
                { status: 400 }
            );
        }

        if (!process.env.MONGODB_DB) {
            console.error("MONGODB_DB environment variable is not set");
            return NextResponse.json(
                { error: "Configuration error", message: "MONGODB_DB is not configured" },
                { status: 500 }
            );
        }

        // Conexión a MongoDB y búsqueda de la empresa por NIT
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const companiesCollection = db.collection("companies");
        const mongoCompany = await companiesCollection.findOne({ nit: nit });
        if (!mongoCompany) {
            console.error("Company not found in MongoDB for NIT:", nit);
            return NextResponse.json(
                { error: "Company not found", message: "No se encontró una empresa con el NIT proporcionado" },
                { status: 401 }
            );
        }

        // Consultar la empresa en Supabase utilizando el campo mongo_id
        const { data: supabaseCompany, error: companyError } = await supabase
            .from("companies")
            .select("id, name, nit, email, security_code")
            .eq("mongo_id", mongoCompany._id.toString())
            .single();

        if (companyError || !supabaseCompany) {
            console.error("Error fetching company from Supabase", companyError);
            return NextResponse.json(
                { error: "Company not found", message: "Error al verificar la empresa en Supabase" },
                { status: 401 }
            );
        }

        // Comparar el código de seguridad (normalizando los valores)
        const normalizedDbCode = supabaseCompany.security_code?.trim().toLowerCase();
        const normalizedInputCode = codigoSeguridad?.trim().toLowerCase();
        if (!normalizedDbCode || !normalizedInputCode || normalizedDbCode !== normalizedInputCode) {
            console.error("Security code mismatch", {
                stored: supabaseCompany.security_code,
                provided: codigoSeguridad,
            });
            return NextResponse.json(
                { error: "Invalid security code", message: "El código de seguridad es incorrecto" },
                { status: 401 }
            );
        }

        // Se utiliza la información de Clerk para poblar los datos del usuario
        const userData = {
            id: clerkUserId,
            name: clerkUser.firstName || "SinNombre",
            last_name: clerkUser.lastName || "SinApellido",
            email:
                clerkUser.emailAddresses && clerkUser.emailAddresses[0]?.emailAddress
                    ? clerkUser.emailAddresses[0].emailAddress
                    : "sinemail@example.com",
            phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || "0000000000",
        };

        // Verificar si existe una solicitud rechazada en las últimas 24 horas
        const { data: rejectedRequest } = await supabase
            .from("inventory_join_requests")
            .select("created_at")
            .eq("user_id", clerkUserId)
            .eq("company_id", supabaseCompany.id)
            .eq("status", "rejected")
            .single();

        if (rejectedRequest) {
            const requestDate = new Date(rejectedRequest.created_at);
            const now = new Date();
            const diffMs = now.getTime() - requestDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours < 24) {
                return NextResponse.json(
                    {
                        error: "Solicitud rechazada recientemente",
                        message:
                            "No puedes solicitar unirte a una empresa hasta que hayan pasado 24 horas desde tu última solicitud rechazada.",
                    },
                    { status: 400 }
                );
            }
        }

        // Verificar si ya existe una solicitud pendiente para este usuario y empresa
        const { data: existingRequest } = await supabase
            .from("inventory_join_requests")
            .select("*")
            .eq("user_id", clerkUserId)
            .eq("company_id", supabaseCompany.id)
            .single();

        if (existingRequest) {
            return NextResponse.json(
                {
                    companyName: mongoCompany.name,
                    status: "pending",
                    message: "Ya tienes una solicitud pendiente de aprobación. Por favor, espera a que se resuelva tu solicitud.",
                },
                { status: 200 }
            );
        } else {
            // Insertar la nueva solicitud en inventory_join_requests
            const { error: insertError } = await supabase
                .from("inventory_join_requests")
                .insert({
                    user_id: clerkUserId,
                    company_id: supabaseCompany.id,
                    name: userData.name,
                    last_name: userData.last_name,
                    email: userData.email,
                    phone: userData.phone,
                    status: "pending", // Estado inicial pendiente
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (insertError) {
                console.error("Error inserting new join request:", insertError);
                return NextResponse.json(
                    {
                        error: "Error creating join request",
                        message: "Error al crear la solicitud de unión al inventario",
                    },
                    { status: 500 }
                );
            }
        }

        // Insertar notificación para que los administradores de la empresa revisen la solicitud
        try {
            // Buscar todos los usuarios con rol ADMINISTRATOR para esta empresa
            const { data: adminUsers, error: adminUsersError } = await supabase
                .from("users_companies")
                .select("id, user_id")
                .eq("company_id", supabaseCompany.id)
                .eq("role", "ADMINISTRATOR");

            if (adminUsersError) {
                console.error("Error obteniendo administradores de la empresa:", adminUsersError);
            } else if (adminUsers && adminUsers.length > 0) {
                // Crear notificaciones para cada administrador
                const notifMessage = `El usuario ${userData.name} ${userData.last_name} (${userData.email}) ha solicitado unirse a la empresa ${nombreEmpresa}. Revisa y decide aprobar o rechazar la solicitud.`;
                
                const notificationPromises = adminUsers.map(admin => {
                    return supabase
                        .from("notifications")
                        .insert({
                            type: "alert",
                            title: "Nueva solicitud de unión",
                            message: notifMessage,
                            users_companies_id: admin.id,  // Usar el ID de la relación users_companies
                            created_by: clerkUserId,
                            category: "store",  // Agregar categoría para filtrado
                        });
                });
                
                const results = await Promise.allSettled(notificationPromises);
                const failedNotifications = results.filter(result => result.status === 'rejected');
                
                if (failedNotifications.length > 0) {
                    console.error(`${failedNotifications.length} notificaciones fallaron al insertarse`);
                } else {
                    console.log(`${results.length} notificaciones de solicitud de unión creadas exitosamente`);
                }
            } else {
                console.warn("No se encontraron administradores para esta empresa. No se insertaron notificaciones.");
            }
        } catch (notifError) {
            console.error("Error al crear notificaciones para administradores:", notifError);
        }


        // Respuesta indicando que la solicitud está pendiente
        return NextResponse.json(
            {
                companyName: mongoCompany.name,
                status: "pending",
                message: "Tu solicitud está pendiente de aprobación por un administrador.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("JOIN_INVENTORY_ERROR:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}
