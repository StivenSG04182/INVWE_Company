import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateSecurityCode } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResponse {
    isValid: boolean;
    errors: ValidationError[];
}

async function validateCompanyData(values: {
    nit?: string;
    company_name?: string;
}): Promise<ValidationResponse> {
    const errors: ValidationError[] = [];
    const nit = values?.nit ? values.nit.trim() : '';
    if (!nit.match(/^\d{9}-\d$/)) {
        errors.push({ field: "nit", message: "El NIT debe tener el formato: 900123456-7" });
        return { isValid: false, errors };
    }
    const companyName = values?.company_name ? values.company_name.trim() : '';

    if (!nit || !companyName) {
        if (!nit) errors.push({ field: "nit", message: "NIT es requerido" });
        if (!companyName) errors.push({ field: "company_name", message: "Nombre de empresa es requerido" });
        return { isValid: false, errors };
    }

    const { data: existingData, error } = await supabase
        .from("companies")
        .select("nit, name")
        .or(`nit.eq.${nit},name.eq.${companyName}`);

    if (error) {
        console.error("Error checking existing company:", error);
        throw error;
    }

    if (existingData && existingData.length > 0) {
        existingData.forEach((company: { nit: string; name: string | null }) => {
            if (company.nit === nit) {
                errors.push({ field: "nit", message: "Este NIT ya está registrado" });
            }
            if (company.name && company.name.toLowerCase() === companyName.toLowerCase()) {
                errors.push({ field: "company_name", message: "Este nombre de empresa ya está registrado" });
            }
        });
    }
    return { isValid: errors.length === 0, errors };
}

export async function POST(req: Request) {
    interface MongoCompanyResult {
        insertedId: string;
    }

    let mongoCompany: MongoCompanyResult | null = null;
    let mongoStore: { insertedId: string } | null = null;
    // Eliminamos las declaraciones innecesarias de 'db' y 'session'
    // const db: { insertedId: string | number } | null = null;
    // const session: { insertedId: string | number } | null = null;

    try {
        // Obtenemos el id del usuario desde Clerk
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Obtener los datos enviados en el body
        const values = await req.json();
        console.log("Request body:", values);

        // Mapear los campos del formulario a los nombres esperados
        values.company_name = values.company_name || values.nombreEmpresa;
        values.company_address = values.company_address || values.address;
        values.company_phone = values.company_phone || values.phone_company;
        values.company_email = values.company_email || values.email_company;

        // Validar campos requeridos (ajustados a los nombres usados en el formulario)
        const requiredFields = [
            'name', 'last_name', 'email', 'phone'
        ];

        if (!values.company_name && !values.nombreEmpresa) {
            requiredFields.push('company_name');
        }
        if (!values.nit) {
            requiredFields.push('nit');
        }
        if (!values.company_address && !values.address) {
            requiredFields.push('company_address');
        }
        if (!values.company_phone && !values.phone_company) {
            requiredFields.push('company_phone');
        }
        if (!values.company_email && !values.email_company) {
            requiredFields.push('company_email');
        }

        const missingFields = requiredFields.filter(field => !values[field]);
        if (missingFields.length > 0) {
            return NextResponse.json({
                errors: missingFields.map(field => ({ field, message: `El campo ${field} es requerido` }))
            }, { status: 400 });
        }

        // Asignar equivalentes para Supabase en caso de que no se envíen
        values.company_name = values.company_name || values.nombreEmpresa;
        values.company_address = values.company_address || values.address;
        values.company_phone = values.company_phone || values.phone;
        values.company_email = values.company_email || values.email;

        // Buscar o crear usuario en Supabase
        let internalUserId: string;
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk", userId)
            .single();

        if (userError || !userData) {
            internalUserId = uuidv4();
            const { error: createUserError } = await supabase.from("users").insert({
                id: internalUserId,
                name: values.name,
                last_name: values.last_name,
                email: values.email,
                phone: values.phone,
                date_of_birth: values.date_of_birth,
                clerk: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            if (createUserError) throw createUserError;
        } else {
            internalUserId = userData.id;
        }

        // Validar duplicidad de la empresa
        const companyId = uuidv4();
        const securityCode = generateSecurityCode(8);
        const validation = await validateCompanyData(values);
        if (!validation.isValid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        // Operaciones en MongoDB con transacción
        const client = await clientPromise;
        if (!client) {
            throw new Error("Could not connect to MongoDB");
        }
        const db = client.db(process.env.MONGODB_DB);
        const session = client.startSession();

        let transactionResult = null;
        try {
            transactionResult = await session.withTransaction(async () => {
                const existingCompany = await db.collection("companies").findOne({ nit: values.nit });
                if (existingCompany) {
                    throw new Error("Empresa existente en MongoDB");
                }

                const insertResult = await db.collection("companies").insertOne({
                    name: values.company_name || values.nombreEmpresa,
                    nit: values.nit,
                    address: values.company_address || values.address,
                    phone: values.company_phone || values.phone_company,
                    email: values.company_email || values.email_company,
                    security_code: securityCode,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    clerkUserId: userId,
                    metadata: {
                        supabaseId: companyId,
                        securityCode: securityCode,
                        status: "active",
                        dianRegistered: false
                    }
                }, { session });

                if (!insertResult.insertedId) {
                    throw new Error("Fallo en la creación de empresa: insertedId no generado");
                }

                mongoCompany = {
                    insertedId: insertResult.insertedId.toString()
                };

                mongoStore = await db.collection("stores").insertOne({
                    companyId: mongoCompany.insertedId,
                    name: values.store_name || "Tienda Principal",
                    address: values.store_address,
                    phone: values.store_phone,
                    createdBy: internalUserId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { session }).then(result => ({
                    insertedId: result.insertedId.toString()
                }));

                if (!mongoStore?.insertedId) {
                    throw new Error("Fallo en creación de tienda en MongoDB");
                }

                return true;
            });
        } catch (error: unknown) {
            if (session) await session.abortTransaction();
            throw error;
        } finally {
            if (session) await session.endSession();
        }

        if (!transactionResult) {
            throw new Error("Transacción fallida en MongoDB");
        }

        if (!mongoCompany || !('insertedId' in mongoCompany)) {
            throw new Error("Fallo al crear empresa en MongoDB: Estructura inválida");
        }

        // Insertar la empresa en Supabase
        const { error: createCompanyError } = await supabase.from("companies").insert({
            id: companyId,
            name: values.company_name,
            nit: values.nit,
            address: values.company_address,
            phone: values.company_phone,
            email: values.company_email,
            dian_registered: false,
            mongo_id: mongoCompany.insertedId,
            security_code: securityCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (createCompanyError) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            throw createCompanyError;
        }

        const { error: relationsError } = await supabase.from("users_companies").insert({
            user_id: internalUserId,
            company_id: companyId,
            role: "ADMINISTRATOR",
            is_default_inventory: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (relationsError) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            throw relationsError;
        }

        await supabase
            .from("users_companies")
            .update({ is_default_inventory: false })
            .eq("user_id", internalUserId)
            .neq("company_id", companyId);

        const [subscriptionResult, storeResult] = await Promise.all([
            supabase.from("subscriptions").insert({
                user_id: internalUserId,
                plan_id: "free",
                plan_name: "Gratis",
                worker_limit: 10,
                invoice_limit: 1000,
                store_limit: 3,
                status: "active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }),
            supabase.from("stores").insert({
                company_id: companyId,
                name: values.store_name || "Tienda Principal",
                address: values.store_address || values.company_address,
                phone: values.store_phone || values.company_phone,
                created_by: internalUserId,
                mongodb_store_id: mongoStore.insertedId.toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        ]);

        if (subscriptionResult.error || storeResult.error) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            await supabase.from("users_companies").delete().eq("company_id", companyId);
            throw subscriptionResult.error || storeResult.error;
        }

        return NextResponse.json({
            companyName: values.company_name,
            storeId: mongoStore.insertedId.toString(),
            redirectUrl: `/inventory/${encodeURIComponent(values.company_name)}/dashboard`
        });

    } catch (error: unknown) {
        // Definimos una interfaz para extender el error si tiene propiedades adicionales
        interface ExtendedError extends Error {
            code?: string;
            details?: string;
            hint?: string;
        }
        const err = error as ExtendedError;
        console.error("Detailed Error:", {
            message: err.message,
            code: err.code,
            details: err.details,
            hint: err.hint,
            stack: err.stack
        });

        // Manejo de limpieza y respuestas según el error
        // (Mantén la lógica de rollback y respuesta de error según tu implementación)
        return NextResponse.json(
            { errors: [{ field: "general", message: err.message || "Error interno del servidor" }] },
            { status: 500 }
        );
    }
}
