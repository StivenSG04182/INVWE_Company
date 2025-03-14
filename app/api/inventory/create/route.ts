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

async function validateCompanyData(values: any): Promise<ValidationResponse> {
    const errors: ValidationError[] = [];
    // Se usa values.company_name, que se habrá definido previamente
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
        existingData.forEach((company: any) => {
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
    let mongoCompany: any = null;
    let mongoStore: any = null;
    let db: any = null;
    let session: any = null;

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
        
        // Verificar que existan los campos de empresa, ya sea con nombres en inglés o español
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

        // Si no se envían, se asignan los equivalentes para Supabase
        values.company_name = values.company_name || values.nombreEmpresa;
        values.company_address = values.company_address || values.address;
        values.company_phone = values.company_phone || values.phone;
        values.company_email = values.company_email || values.email;

        // Buscar en la tabla "users" el registro asociado al usuario de Clerk
        let internalUserId: string;
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk", userId)
            .single();

        if (userError || !userData) {
            // Si el usuario no existe, se crea uno nuevo y se utiliza un uuid generado
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

        // Validar duplicidad de la empresa usando los datos normalizados
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
        db = client.db(process.env.MONGODB_DB);
        session = client.startSession();

        let transactionResult = null;
        try {
            transactionResult = await session.withTransaction(async () => {
                const existingCompany = await db.collection("companies").findOne({ nit: values.nit });
                if (existingCompany) {
                    throw new Error("Empresa existente en MongoDB");
                }

                mongoCompany = await db.collection("companies").insertOne(
                    {
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
                    },
                    { session }
                );

                if (!mongoCompany.insertedId) {
                    throw new Error("Falle en creación de empresa en MongoDB");
                }

                mongoStore = await db.collection("stores").insertOne({
                    companyId: mongoCompany.insertedId,
                    name: values.store_name || "Tienda Principal",
                    address: values.store_address,
                    phone: values.store_phone,
                    createdBy: internalUserId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { session });

                if (!mongoStore.insertedId) {
                    throw new Error("Fallo en creación de tienda en MongoDB");
                }

                return true;
            });
        } catch (error) {
            if (session) await session.abortTransaction();
            throw error;
        } finally {
            if (session) await session.endSession();
        }

        if (!transactionResult) {
            throw new Error("Transicción fallida MongoDB");
        }

        // Insertar la empresa en Supabase usando el UUID interno para evitar error de sintaxis
        const { error: createCompanyError } = await supabase.from("companies").insert({
            id: companyId,
            name: values.company_name,
            nit: values.nit,
            address: values.company_address,
            phone: values.company_phone,
            email: values.company_email,
            dian_registered: false,
            mongo_id: mongoCompany.insertedId.toString(),
            security_code: securityCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (createCompanyError) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            throw createCompanyError;
        }

        // Corregido: Añadido user_id en la inserción de users_companies
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

        // Actualizar otros registros del usuario para que no sean predeterminados
        await supabase
            .from("users_companies")
            .update({ is_default_inventory: false })
            .eq("user_id", internalUserId)
            .neq("company_id", companyId);

        // Crear suscripción, tienda y una relación adicional en Supabase en paralelo
        // Corregido: Añadido plan_id y corregida la sintaxis de Promise.all
        const [subscriptionResult, storeResult] = await Promise.all([
            supabase.from("subscriptions").insert({
                user_id: internalUserId,
                plan_id: "free", // Añadido plan_id requerido
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

        // Corregido: Verificar solo los errores de las promesas que se ejecutaron
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

    } catch (error: any) {
        console.error("Detailed Error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            stack: error.stack
        });

        if (db && mongoCompany?.insertedId) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            if (mongoStore?.insertedId) {
                await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            }
        }

        if (error.code === '23505') {
            const errorMessage = error.message?.includes('companies_nit_key')
                ? { field: "nit", message: "Este NIT ya está registrado" }
                : { field: "general", message: "Datos duplicados detectados" };
            return NextResponse.json({ errors: [errorMessage] }, { status: 403 });
        }

        if (error.code === '42501') {
            return NextResponse.json(
                { errors: [{ field: "general", message: "Error de permisos al crear la tienda" }] },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { errors: [{ field: "general", message: error.message || "Error interno del servidor" }] },
            { status: error.status || 500 }
        );
    }
}