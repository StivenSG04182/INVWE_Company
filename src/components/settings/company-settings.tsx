"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import type { Agency } from "@prisma/client"

interface CompanySettingsProps {
    agencyId: string
    agencyDetails: Agency
}

const CompanySettingsContent = ({ agencyId, agencyDetails }: CompanySettingsProps) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        name: agencyDetails.name || "",
        companyEmail: agencyDetails.companyEmail || "",
        companyPhone: agencyDetails.companyPhone || "",
        address: agencyDetails.address || "",
        city: agencyDetails.city || "",
        state: agencyDetails.state || "",
        country: agencyDetails.country || "",
        zipCode: agencyDetails.zipCode || "",
        agencyLogo: agencyDetails.agencyLogo || "",
    })

    const [loading, setLoading] = useState(false)

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Aquí iría la lógica para guardar los cambios
            // Por ejemplo: await updateAgencyDetails(agencyId, formData)

            toast({
                title: "Cambios guardados",
                description: "La configuración de la empresa ha sido actualizada correctamente.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Ajustes de Empresa</CardTitle>
                    <CardDescription>Configure los detalles básicos de su empresa y personalice su experiencia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="block text-sm font-medium mb-1">Nombre de la Empresa</Label>
                                <Input
                                    type="text"
                                    className="w-full p-2 rounded-md border"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Correo Electrónico</Label>
                                <Input
                                    type="email"
                                    className="w-full p-2 rounded-md border"
                                    value={formData.companyEmail}
                                    onChange={(e) => handleChange("companyEmail", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Teléfono</Label>
                                <Input
                                    type="tel"
                                    className="w-full p-2 rounded-md border"
                                    value={formData.companyPhone}
                                    onChange={(e) => handleChange("companyPhone", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Dirección</Label>
                                <Input
                                    type="text"
                                    className="w-full p-2 rounded-md border"
                                    value={formData.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="block text-sm font-medium mb-1">Ciudad</Label>
                                    <Input
                                        type="text"
                                        className="w-full p-2 rounded-md border"
                                        value={formData.city}
                                        onChange={(e) => handleChange("city", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium mb-1">Estado/Provincia</Label>
                                    <Input
                                        type="text"
                                        className="w-full p-2 rounded-md border"
                                        value={formData.state}
                                        onChange={(e) => handleChange("state", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="block text-sm font-medium mb-1">País</Label>
                                    <Input
                                        type="text"
                                        className="w-full p-2 rounded-md border"
                                        value={formData.country}
                                        onChange={(e) => handleChange("country", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium mb-1">Código Postal</Label>
                                    <Input
                                        type="text"
                                        className="w-full p-2 rounded-md border"
                                        value={formData.zipCode}
                                        onChange={(e) => handleChange("zipCode", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="block text-sm font-medium mb-1">Logo de la Empresa</Label>
                                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                                    {formData.agencyLogo ? (
                                        <div className="relative w-32 h-32">
                                            <Image
                                                src={formData.agencyLogo || "/placeholder-logo.png"} // Asegúrate de que este archivo exista en la carpeta public
                                                alt="Logo de la empresa"
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 128px) 100vw, 128px"
                                            />
                                            <button
                                                className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                                                onClick={() => handleChange("agencyLogo", "")}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M18 6L6 18"></path>
                                                    <path d="M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                                                <path d="M12 12v9"></path>
                                                <path d="m16 16-4-4-4 4"></path>
                                            </svg>
                                            <p className="mt-2 text-sm text-muted-foreground">Arrastre y suelte o haga clic para cargar</p>
                                            <Input
                                                type="file"
                                                className="hidden"
                                                id="logo-upload"
                                                onChange={(e) => {
                                                    // Aquí iría la lógica para manejar la carga de archivos
                                                    // Por ahora, solo simulamos el cambio
                                                    if (e.target.files && e.target.files[0]) {
                                                        const reader = new FileReader()
                                                        reader.onload = (event) => {
                                                            if (event.target?.result) {
                                                                handleChange("agencyLogo", event.target.result as string)
                                                            }
                                                        }
                                                        reader.readAsDataURL(e.target.files[0])
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="logo-upload" className="mt-2 cursor-pointer text-sm text-primary">
                                                Seleccionar archivo
                                            </Label>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Zona Horaria</Label>
                                <Select defaultValue="America/Bogota">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una zona horaria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="America/Bogota">América/Bogotá (UTC-5)</SelectItem>
                                        <SelectItem value="America/Mexico_City">América/Ciudad de México (UTC-6)</SelectItem>
                                        <SelectItem value="America/Santiago">América/Santiago (UTC-4)</SelectItem>
                                        <SelectItem value="America/Buenos_Aires">América/Buenos Aires (UTC-3)</SelectItem>
                                        <SelectItem value="Europe/Madrid">Europa/Madrid (UTC+1)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Moneda Predeterminada</Label>
                                <Select defaultValue="COP">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                        <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                                        <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Idioma</Label>
                                <Select defaultValue="es">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un idioma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="en">Inglés</SelectItem>
                                        <SelectItem value="pt">Portugués</SelectItem>
                                        <SelectItem value="fr">Francés</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium mb-1">Formato de Fecha</Label>
                                <Select defaultValue="DD/MM/YYYY">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un formato" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="flex gap-2">
                            <Button variant="outline">Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CompanySettingsContent
