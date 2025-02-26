import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

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

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")

        // Verify company exists and security code matches
        const company = await companiesCollection.findOne({
            name: nombreEmpresa,
            nit,
            securityCode: codigoSeguridad
        })

        if (!company) {
            return new NextResponse("Invalid company details or security code", { status: 400 })
        }

        // Add user to company's users collection
        const usersCollection = db.collection("users_companies")
        await usersCollection.insertOne({
            userId,
            companyId: company._id,
            role: "EMPLOYEE",
            createdAt: new Date()
        })

        return NextResponse.json({ 
            companyName: company.name,
            storeId: company._id 
        }, { status: 200 })
    } catch (error) {
        console.error("JOIN_INVENTORY_ERROR:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}