"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { TextRevealCard } from "@/components/ui/text-reveal-card"
import { CreateInventoryForm } from "./components/create-inventory-form"
import { JoinInventoryForm } from "./components/join-inventory-form"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function SelectDashboardInventory() {
    const { user } = useUser()
    const [companies, setCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

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

    const handleBackClick = () => {
        setSelectedOption(null)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {/* Background will be added later */}
            {/* <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"> */}
            
            <TextRevealCard
                text="INVWE_Company"
                revealText="Únete o Crea uno Nuevo"
                className="w-full max-w-md mb-8"
                textAlign="center"
            />

            {selectedOption === null ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        onClick={() => setSelectedOption("create")}
                    >
                        <CardHeader>
                            <CardTitle className="text-center">Crear Inventario</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-hidden">
                            {/* Image carousel will be added here */}
                            <div className="h-full bg-gray-100 flex items-center justify-center">
                                <p className="text-gray-500">Carrusel de imágenes</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button>Seleccionar</Button>
                        </CardFooter>
                    </Card>

                    <Card 
                        className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        onClick={() => setSelectedOption("join")}
                    >
                        <CardHeader>
                            <CardTitle className="text-center">Unirse a Inventario</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-hidden">
                            {/* Image carousel will be added here */}
                            <div className="h-full bg-gray-100 flex items-center justify-center">
                                <p className="text-gray-500">Carrusel de imágenes</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button>Seleccionar</Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex items-center mb-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleBackClick}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-bold">
                            {selectedOption === "create" ? "Crear Inventario" : "Unirse a Inventario"}
                        </h2>
                    </div>
                    
                    {selectedOption === "create" ? (
                        <CreateInventoryForm />
                    ) : (
                        <JoinInventoryForm companies={companies} isLoading={isLoading} />
                    )}
                </div>
            )}
        </div>
    )
}