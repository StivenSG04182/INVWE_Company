import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
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
                .select('name')
                .eq('name', 'users_companies')
                .single()

            if (!tables) {
                console.log("Table 'users_companies' does not exist")
                return NextResponse.json([])
            }

            const { data, error } = await supabase
                .from('users_companies')
                .select('company_id, role, name, last_name, email')
                .eq('user_id', userId)

            if (error) {
                console.error("Supabase Error:", error)
                return NextResponse.json([])
            }
            userCompanies = data
        } catch (dbError) {
            console.error("Database Error:", dbError)
            return NextResponse.json([])
        }

        if (!userCompanies || userCompanies.length === 0) {
            return NextResponse.json([])
        }

        const companyIds = userCompanies.map(uc => uc.company_id)

        // Get company details from Supabase
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, nit, business_name, address, phone, email')
            .in('id', companyIds)

        if (companiesError) {
            console.error("Supabase Companies Error:", companiesError)
            return NextResponse.json([])
        }

        // Enrich with MongoDB data if available
        try {
            const client = await clientPromise
            const db = client.db(process.env.MONGODB_DB)
            const companiesCollection = db.collection("companies")

            // Find companies in MongoDB using the Supabase IDs
            const mongoCompanies = await companiesCollection
                .find({ "metadata.supabaseId": { $in: companyIds } })
                .project({ _id: 1, name: 1, metadata: 1 })
                .toArray()

            // Merge data from both sources
            const enrichedCompanies = companies.map(company => {
                const mongoCompany = mongoCompanies.find(mc => 
                    mc.metadata?.supabaseId === company.id
                )
                
                return {
                    ...company,
                    mongoId: mongoCompany?._id?.toString() || null,
                    userRole: userCompanies.find(uc => uc.company_id === company.id)?.role || 'EMPLOYEE'
                }
            })

            return NextResponse.json(enrichedCompanies)
        } catch (mongoError) {
            console.error("MongoDB Error:", mongoError)
            // Return just the Supabase data if MongoDB fails
            return NextResponse.json(companies)
        }
    } catch (error) {
        console.error("GET_COMPANIES_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}