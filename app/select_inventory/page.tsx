"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { CreateInventoryForm } from "./components/create-inventory-form";
import { JoinInventoryForm } from "./components/join-inventory-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function SelectInventoryPage() {
    const router = useRouter();
    const { user } = useUser();
    const { isLoaded, isSignedIn } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Primer useEffect: Verificar si el usuario ya tiene asociación
    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) return;

        const checkUserAssociation = async () => {
            try {
                const res = await fetch("/api/companies", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store",
                });
                if (!res.ok) {
                    console.error("Error fetching user association:", res.statusText);
                    return;
                }
                const data = await res.json();
                console.log("Respuesta de /api/companies:", data);
                if (data.isValid && data.data?.company?.name) {
                    const companyNameEncoded = encodeURIComponent(data.data.company.name);
                    // Redirige al dashboard de la empresa
                    router.push(`/inventory/${companyNameEncoded}/dashboard`);
                }
            } catch (error) {
                console.error("Error en checkUserAssociation:", error);
            }
        };

        checkUserAssociation();
    }, [isLoaded, isSignedIn, router]);

    // Segundo useEffect: Cargar las empresas para el formulario de "unirse"
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/api/companies");
                setCompanies(response.data || []); // Aseguramos que sea un array
            } catch (error) {
                console.error("Error fetching companies:", error);
                setCompanies([]); // En caso de error, se asigna un array vacío
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const handleBackClick = () => {
        setSelectedOption(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
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
                        <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
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
    );
}
