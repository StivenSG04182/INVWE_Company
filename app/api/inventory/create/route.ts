import { auth, clerkMiddleware } from "@clerk/nextjs/server";
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
    
    const { data: existingData, error } = await supabase
        .from("companies")
        .select("nit, name, email, phone, address")
        .or(`nit.eq.${values.nit.replace(/[^0-9-]/g, '')},name.eq.${values.nombreEmpresa.replace(/'/g, "''")}`);
    if (error) {
        console.error("Comprobación de errores en la empresa existente:", error);
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

        // Validate required fields
        const requiredFields = [
            'nombreEmpresa', 'nit', 'businessName', 'address', 'phone', 'email',
            'last_name', 'email', 'phone', 'address'
        ];
        const missingFields = requiredFields.filter(field => !values[field]);
        if (missingFields.length > 0) {
            return NextResponse.json({
                errors: missingFields.map(field => ({
                    field,
                    message: `El campo ${field} es requerido`
                }))
            }, { status: 400 });
        }

        const companyId = uuidv4();
        const securityCode = generateSecurityCode(8);

        // Validar datos de la empresa
        const validation = await validateCompanyData(values);
        if (!validation.isValid) {
            return NextResponse.json({ errors: validation.errors }, { status: 401 });
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
                // Verificar si ya existe la empresa en MongoDB
                const existingCompany = await db.collection("companies").findOne({ nit: values.nit });
                if (existingCompany) {
                    throw new Error("Empresa existente en MongoDB");
                }

                mongoCompany = await db.collection("companies").insertOne(
                    {
                        name: values.nombreEmpresa,
                        nit: values.nit,
                        phone: values.phone,
                        email: values.email,
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

                mongoStore = await db.collection("stores").insertOne(
                    {
                        companyId: mongoCompany.insertedId,
                        name: values.store_name || "Tienda Principal",
                        address: values.store_address,
                        phone: values.store_phone,
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    { session }
                );

                if (!mongoStore.insertedId) {
                    throw new Error("Fallo en creación de tienda en MongoDB");
                }

                return true;
            });
        } catch (error) {
            if (session) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            if (session) {
                session.endSession();
            }
        }

        if (!transactionResult) {
            throw new Error("Transicción fallida MongoDB");
        }

        // Crear registro de la empresa en Supabase
        const { error: createCompanyError } = await supabase.from("companies").insert({
            id: companyId,
            name: values.nombreEmpresa,
            nit: values.nit,
            security_code: securityCode,
            address: values.address,
            phone: values.phone,
            email: values.email,
            dian_registered: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (createCompanyError) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            throw createCompanyError;
        }

        // Crear la relación usuario-empresa en Supabase
        const { error: relationsError } = await supabase.from("users_companies").insert({
            user_id: userId,
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
            await supabase.from("users_companies").delete().eq("company_id", companyId);
            throw relationsError;
        }
        
        const { error: relationsUsersError } = await supabase.from( "users" ). insert({
            id: userId,
            name: values.name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            date_of_birth: values.date_of_birth,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })

        
        // Actualizar otros registros del usuario para que no sean predeterminados
        await supabase
            .from("users_companies")
            .update({ is_default_inventory: false })
            .eq("user_id", userId)
            .neq("company_id", companyId);

        // Crear suscripción y tienda en Supabase
        const [subscriptionResult, storeResult] = await Promise.all([
            supabase.from("subscriptions").insert({
                user_id: userId,
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
                address: values.store_address,
                phone: values.store_phone,
                created_by: userId,
                mongodb_store_id: mongoStore.insertedId.toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).select(),
        ]);

        if (subscriptionResult.error || storeResult.error) {
            await db.collection("companies").deleteOne({ _id: mongoCompany.insertedId });
            await db.collection("stores").deleteOne({ _id: mongoStore.insertedId });
            await supabase.from("companies").delete().eq("id", companyId);
            await supabase.from("users_companies").delete().eq("company_id", companyId);
            throw subscriptionResult.error || storeResult.error;
        }

        return NextResponse.json({
            companyName: values.nombreEmpresa,
            storeId: mongoStore.insertedId.toString(),
            redirectUrl: `/inventory/${encodeURIComponent(values.nombreEmpresa)}/dashboard`
        });

    } catch (error: any) {
        console.error("Detailed Error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        // Cleanup in case of error
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
            
            return NextResponse.json({ errors: [errorMessage] }, { status: 400 });
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
