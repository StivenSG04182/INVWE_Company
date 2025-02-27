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
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Verify company exists in Supabase
        const { data: supabaseCompany, error: supabaseError } = await supabase
            .from("companies")
            .select("*")
            .eq("name", nombreEmpresa)
            .eq("nit", nit)
            .eq("security_code", codigoSeguridad)
            .single()

        if (supabaseError || !supabaseCompany) {
            return new NextResponse("Invalid company details or security code", { status: 400 })
        }

        // Get MongoDB company record
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")
        const storesCollection = db.collection("stores")

        const mongoCompany = await companiesCollection.findOne({
            name: nombreEmpresa,
            nit: nit
        })

        if (!mongoCompany) {
            return new NextResponse("Company not found in MongoDB", { status: 400 })
        }

        // Get the main store for this company
        const store = await storesCollection.findOne({
            companyId: mongoCompany._id
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 400 })
        }

        // Create user-company relationship in Supabase
        const { error: relationError } = await supabase.from("users_companies").insert({
            user_id: userId,
            company_id: supabaseCompany.id,
            role: "EMPLOYEE",
            nombres_apellidos: nombreEmpresa,
            correo_electronico: supabaseCompany.email
        })

        if (relationError) {
            return new NextResponse("Error creating user-company relationship", { status: 500 })
        }

        // Add user to company's users collection in MongoDB
        const usersCollection = db.collection("users_companies")
        await usersCollection.insertOne({
            userId,
            companyId: mongoCompany._id,
            role: "EMPLOYEE",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({ 
            companyName: mongoCompany.name,
            storeId: store._id.toString()
        }, { status: 200 })
    } catch (error) {
        console.error("JOIN_INVENTORY_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}