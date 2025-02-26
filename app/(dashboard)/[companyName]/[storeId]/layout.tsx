import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import clientPromise from "@/lib/mongodb"

interface DashboardLayoutProps {
    children: React.ReactNode
    params: { 
        companyName: string
        storeId: string 
    }
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { userId } = auth()

    if (!userId) {
        redirect("/sign-in")
    }

    try {
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        const companiesCollection = db.collection("companies")
        const usersCollection = db.collection("users_companies")

        // Verify if user has access to this company
        const company = await companiesCollection.findOne({ name: params.companyName })
        if (!company) {
            redirect("/select_inventory")
        }

        const userAccess = await usersCollection.findOne({
            userId,
            companyId: company._id
        })

        if (!userAccess) {
            redirect("/select_inventory")
        }

        return (
            <div>
                <nav className="border-b">
                    <div className="flex h-16 items-center px-4">
                        <h1 className="text-xl font-bold">{company.name}</h1>
                    </div>
                </nav>
                <main className="flex-1">{children}</main>
            </div>
        )
    } catch (error) {
        console.error("Database Error:", error)
        return <div>Something went wrong. Please try again later.</div>
    }
}