import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const body = await req.json()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { nombreEmpresa, nit, codigoSeguridad } = body

        if (!nombreEmpresa || !nit || !codigoSeguridad) {
            return NextResponse.json({ 
                error: "Missing required fields",
                errors: [
                    !nombreEmpresa && { field: "nombreEmpresa", message: "Nombre de empresa es requerido" },
                    !nit && { field: "nit", message: "NIT es requerido" },
                    !codigoSeguridad && { field: "codigoSeguridad", message: "Código de seguridad es requerido" }
                ].filter(Boolean)
            }, { status: 400 })
        }

        // First check MongoDB for company by NIT
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")
        
        const mongoCompany = await companiesCollection.findOne({ nit: nit })

        if (!mongoCompany) {
            return NextResponse.json({
                error: "Company not found",
                message: "No se encontró una empresa con el NIT proporcionado"
            }, { status: 401 })
        }

        // Then verify in Supabase using the supabaseId from MongoDB
        const { data: supabaseCompany, error: companyError } = await supabase
            .from("companies")
            .select("id, name, nit, email, security_code")
            .eq("id", mongoCompany.metadata.supabaseId)
            .single()

        if (companyError || !supabaseCompany) {
            return NextResponse.json({
                error: "Company not found",
                message: "Error al verificar la empresa"
            }, { status: 401 })
        }

        // Verify security code - normalize both codes for comparison (trim whitespace and convert to lowercase)
        const normalizedDbCode = supabaseCompany.security_code?.trim().toLowerCase();
        const normalizedInputCode = codigoSeguridad?.trim().toLowerCase();
        
        if (!normalizedDbCode || !normalizedInputCode || normalizedDbCode !== normalizedInputCode) {
            console.log("Security code mismatch:", { 
                stored: supabaseCompany.security_code,
                provided: codigoSeguridad 
            });
            return NextResponse.json({
                error: "Invalid security code",
                message: "El código de seguridad es incorrecto"
            }, { status: 401 })
        }

        // Check if user is already associated with the company
        const { data: existingRelation } = await supabase
            .from("users_companies")
            .select("*")
            .eq("user_id", userId)
            .eq("company_id", supabaseCompany.id)
            .single()

        if (existingRelation) {
            // If user is already associated, just ensure this is their default inventory
            if (!existingRelation.is_default_inventory) {
                // Update this relationship to be default
                await supabase
                    .from("users_companies")
                    .update({ is_default_inventory: true, updated_at: new Date().toISOString() })
                    .eq("user_id", userId)
                    .eq("company_id", supabaseCompany.id)

                // Update other relationships to not be default
                await supabase
                    .from("users_companies")
                    .update({ is_default_inventory: false, updated_at: new Date().toISOString() })
                    .eq("user_id", userId)
                    .neq("company_id", supabaseCompany.id)
            }
        } else {
            // Create new user-company relationship with is_default_inventory set to true and status pending
            const { error: relationError } = await supabase.from("users_companies").insert({
                user_id: userId,
                company_id: supabaseCompany.id,
                role: "EMPLOYEE",
                nombres_apellidos: supabaseCompany.name,
                correo_electronico: supabaseCompany.email,
                is_default_inventory: true,
                status: "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

            if (relationError) {
                return NextResponse.json({
                    error: "Error creating relationship",
                    message: "Error al crear la relación usuario-empresa"
                }, { status: 500 })
            }

            // Update other user-company relationships to not be default
            await supabase
                .from("users_companies")
                .update({ is_default_inventory: false, updated_at: new Date().toISOString() })
                .eq("user_id", userId)
                .neq("company_id", supabaseCompany.id)

            // Add user to company's users collection in MongoDB
            const usersCollection = db.collection("users_companies")
            await usersCollection.insertOne({
                userId,
                companyId: mongoCompany._id,
                role: "EMPLOYEE",
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }

        // Get the main store for this company
        const storesCollection = db.collection("stores")
        const store = await storesCollection.findOne({
            companyId: mongoCompany._id
        })

        if (!store) {
            return NextResponse.json({
                error: "Store not found",
                message: "No se encontró la tienda principal"
            }, { status: 404 })
        }

        // If the user's status is pending, return that information
        if (existingRelation?.status === 'pending' || (!existingRelation && mongoCompany)) {
            return NextResponse.json({ 
                companyName: mongoCompany.name,
                status: 'pending',
                message: 'Tu solicitud está pendiente de aprobación por un administrador'
            }, { status: 200 })
        }
        
        // Otherwise return normal success response
        return NextResponse.json({ 
            companyName: mongoCompany.name,
            storeId: store._id.toString(),
            redirectUrl: `/inventory/${encodeURIComponent(mongoCompany.name)}/dashboard`
        }, { status: 200 })
    } catch (error) {
        console.error("JOIN_INVENTORY_ERROR:", error)
        return NextResponse.json({
            error: "Internal server error",
            message: "Error interno del servidor"
        }, { status: 500 })
    }
}