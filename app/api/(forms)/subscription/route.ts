import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const body = await req.json()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { companyId, plan, limits } = body

        if (!companyId || !plan || !limits) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Save subscription in Supabase
        const { error: supabaseError } = await supabase
            .from("subscriptions")
            .insert({
                company_id: companyId,
                plan_name: plan,
                worker_limit: limits.workers,
                invoice_limit: limits.invoices,
                store_limit: limits.stores,
                status: "active",
                created_at: new Date().toISOString(),
                user_id: userId
            })

        if (supabaseError) {
            console.error("Supabase Error:", supabaseError)
            throw supabaseError
        }

        // Create initial store in MongoDB
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")
        const storesCollection = db.collection("stores")

        const company = await companiesCollection.findOne({
            _id: new ObjectId(companyId)
        })

        if (!company) {
            return new NextResponse("Company not found", { status: 404 })
        }

        const store = await storesCollection.insertOne({
            companyId: new ObjectId(companyId),
            name: "Tienda Principal",
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({
            companyName: company.name,
            storeId: store.insertedId.toString()
        }, { status: 201 })
    } catch (error) {
        console.error("SUBSCRIPTION_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get companies from Supabase where the user has access
        let userCompanies;
        try {
            // First check if the table exists
            const { data: tables } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_name', 'users_companies')
                .single()

            if (!tables) {
                console.log("Table 'users_companies' does not exist")
                return NextResponse.json([])
            }

            const { data, error } = await supabase
                .from('users_companies')
                .select('company_id')
                .eq('user_id', userId.toString())

            if (error) {
                console.error("Supabase Error:", error)
                return NextResponse.json([])
            }
            userCompanies = data
        } catch (error) {
            console.error("Supabase Error:", error)
            return NextResponse.json([])
        }

        if (!userCompanies || userCompanies.length === 0) {
            return NextResponse.json([])
        }

        const companyIds = userCompanies.map(uc => uc.company_id)

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")

        // Find companies in MongoDB using the Supabase IDs
        const companies = await companiesCollection
            .find({ supabaseId: { $in: companyIds } })
            .project({ _id: 1, name: 1 })
            .toArray()

        return NextResponse.json(companies)
    } catch (error) {
        console.error("GET_COMPANIES_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}