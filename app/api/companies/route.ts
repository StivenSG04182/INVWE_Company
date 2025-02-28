import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")

        // Fetch all companies
        const companies = await companiesCollection
            .find({})
            .project({ _id: 1, name: 1 })
            .toArray()

        return NextResponse.json(companies)
    } catch (error) {
        console.error("GET_COMPANIES_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}