"use client"

import { useParams } from "next/navigation"

export default function DashboardPage() {
    const params = useParams()
    
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p className="text-muted-foreground">
                Bienvenido al dashboard de {params.companyName}
            </p>
        </div>
    )
}