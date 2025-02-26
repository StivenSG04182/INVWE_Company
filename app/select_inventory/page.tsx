"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { TextRevealCard } from "@/components/ui/text-reveal-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateInventoryForm } from "./components/create-inventory-form"
import { JoinInventoryForm } from "./components/join-inventory-form"
import axios from "axios"

export default function SelectDashboardInventory() {
    const { user } = useUser()
    const [companies, setCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get("/api/companies")
                setCompanies(response.data || []) // Ensure we always set an array
            } catch (error) {
                console.error("Error fetching companies:", error)
                setCompanies([]) // Set empty array on error
            } finally {
                setIsLoading(false)
            }
        }
        fetchCompanies()
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <TextRevealCard
                text="Selecciona tu Inventario"
                revealText="Únete o Crea uno Nuevo"
                className="w-full max-w-md mb-8"
            />

            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Crear Inventario</TabsTrigger>
                        <TabsTrigger value="join">Unirse a Empresa</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create">
                        <CreateInventoryForm />
                    </TabsContent>
                    <TabsContent value="join">
                        <JoinInventoryForm companies={companies} isLoading={isLoading} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}