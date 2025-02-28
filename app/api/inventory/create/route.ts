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
    
    // Check for existing company in Supabase
    const { data: existingData, error } = await supabase
        .from("companies")
        .select("nit, name, email, phone, address")
        .or('nit.eq.' + values.nit + ',name.eq.' + values.nombreEmpresa + ',email.eq.' + values.email + ',phone.eq.' + values.phone);

    if (error) {
        console.error("Error checking existing company:", error);
        throw error;
    }

    if (existingData && existingData.length > 0) {
        existingData.forEach(company => {
            if (company.nit === values.nit) {
                errors.push({ field: "nit", message: "Este NIT ya está registrado" });
            }
            if (company.name === values.nombreEmpresa) {
                errors.push({ field: "nombreEmpresa", message: "Este nombre de empresa ya está registrado" });
            }
            if (company.email === values.email) {
                errors.push({ field: "email", message: "Este email ya está registrado" });
            }
            if (company.phone === values.phone) {
                errors.push({ field: "phone", message: "Este teléfono ya está registrado" });
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export async function POST(req: Request) {
    let mongoCompany: any = null;
    let mongoStore: any = null;
    let db = null;
    let session = null;

    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const values = await req.json();
        const companyId = uuidv4();
        const securityCode = generateSecurityCode(8);
        const { nombreEmpresa, nit, businessName, address, phone, email } = values;

        // Validar datos de la empresa
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

        await session.withTransaction(async () => {
            // Verificar si ya existe la empresa en MongoDB
            const existingCompany = await db.collection("companies").findOne({ nit: nit });
            if (existingCompany) {
                throw new Error("Company already exists in MongoDB");
            }

            mongoCompany = await db.collection("companies").insertOne(
                {
                    name: nombreEmpresa,
                    nit: nit,
                    businessName: businessName,
                    address: address,
                    phone: phone,
                    email: email,
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
                throw new Error("Failed to create company in MongoDB");
            }

            mongoStore = await db.collection("stores").insertOne(
                {
                    companyId: mongoCompany.insertedId,
                    name: "Tienda Principal",
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { session }
            );

            if (!mongoStore.insertedId) {
                throw new Error("Failed to create store in MongoDB");
            }
        });
        session.endSession();

        // Operaciones en Supabase
        // Crear registro de la empresa en Supabase
        const { error: createCompanyError } = await supabase.from("companies").insert({
            id: companyId,
            name: nombreEmpresa,
            nit: nit,
            tax_id: nit,
            security_code: securityCode,
            business_name: businessName,
            address: address,
            phone: phone,
            email: email,
            dian_registered: false
        });
        if (createCompanyError) {
            // Rollback en MongoDB
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            throw createCompanyError;
        }

        // Crear la relación usuario-empresa en Supabase
        const { error: relationsError } = await supabase.from("users_companies").insert({
            user_id: userId,
            company_id: companyId,
            role: "ADMINISTRATOR",
            nombres_apellidos: nombreEmpresa,
            correo_electronico: email,
            is_default_inventory: true
        });

        if (relationsError) {
            // Rollback en MongoDB y en la tabla companies de Supabase
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            throw relationsError;
        }
        // Actualizar otros registros del usuario para que no sean predeterminados
        if (!relationsError) {
            await supabase
                .from("users_companies")
                .update({ is_default_inventory: false })
                .eq("user_id", userId)
                .neq("company_id", companyId);
        }
        if (relationsError) {
            // Rollback en MongoDB y en la tabla companies de Supabase
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            throw relationsError;
        }

        // Crear suscripción y tienda en Supabase en paralelo
        const [subscriptionResult, storeResult] = await Promise.all([
            supabase.from("subscriptions").insert({
                company_id: companyId,
                user_id: userId,
                plan_name: "Gratis",
                worker_limit: 10,
                invoice_limit: 1000,
                store_limit: 3,
                status: "active",
            }),
            supabase.from("stores").insert({
                company_id: companyId,
                name: "Tienda Principal",
                created_by: userId,
                mongodb_store_id: mongoStore.insertedId.toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).select(),
        ]);
        if (subscriptionResult.error || storeResult.error) {
            // Rollback en ambas bases de datos
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            await supabase.from("users_companies").delete().eq("company_id", companyId);
            throw subscriptionResult.error || storeResult.error;
        }

        // Redirigir al dashboard utilizando el nombre de la empresa
        return NextResponse.json({
            companyName: nombreEmpresa,
            storeId: mongoStore.insertedId.toString(),
            redirectUrl: `/inventory/${encodeURIComponent(nombreEmpresa)}/dashboard`
        });
    } catch (error: any) {
        console.error("Detailed Error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        // Rollback en MongoDB en caso de error
        if (db && mongoCompany?.insertedId) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            if (mongoStore?.insertedId) {
                await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            }
        }
        if (session) {
            await session.endSession();
        }

        if (error.message?.includes("UPDATE requires a WHERE clause")) {
            return new NextResponse(
                "Error creating company. Please try again later.",
                { status: 400 }
            );
        }
        if (error.code === '23505') {
            const errorMessage = error.message?.includes('companies_nit_key')
                ? { field: "nit", message: "Este NIT ya está registrado" }
                : { field: "general", message: "Datos duplicados detectados" };
            
            return NextResponse.json({ errors: [errorMessage] }, { status: 400 });
        }
        
        if (error.code === '42501') {
            return NextResponse.json(
                { errors: [{ field: "general", message: "Error de permisos al crear la tienda" }] },
                { status: 500 }
            );
        }
        return new NextResponse(
            error.message || "Internal Server Error",
            {
                status: error.status || 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}
