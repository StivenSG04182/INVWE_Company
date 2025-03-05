"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import axios from "axios"

export default function Page() {
    const [formData, setFormData] = useState({
        companyName: "",
        firstName: "",
        lastName: "",
        email: "",
        companySize: "",
        phoneNumber: "",
        timezone: "",
        referralSource: "",
        additionalDetails: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('/api/enterprise', formData)
            if (response.status === 201) {
                toast.success('Formulario enviado correctamente')
                setFormData({
                    companyName: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    companySize: "",
                    phoneNumber: "",
                    timezone: "",
                    referralSource: "",
                    additionalDetails: ""
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error(error.response?.data?.error || 'Error al enviar el formulario')
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="flex justify-center mb-8">
                <h1 className="text-3xl font-bold">Contacto Empresarial</h1>
            </div>
            
            <Card className="bg-card/50 backdrop-blur-xl border shadow-lg">
                <CardHeader>
                    <CardTitle>Consulta de Planes Empresariales</CardTitle>
                    <CardDescription>
                        Este formulario es para consultas de planes empresariales dirigidas al equipo de crecimiento. 
                        No abordamos las preocupaciones relacionadas con el soporte aquí, por favor envíe un 
                        <a href="/support" className="text-primary hover:underline"> ticket de soporte </a> 
                        para asistencia más detallada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="required">Nombre de la Empresa</Label>
                            <Input 
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="required">Su Nombre</Label>
                                <Input 
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="required">Su Apellido</Label>
                                <Input 
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email" className="required">Correo Empresarial</Label>
                            <Input 
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="companySize">Tamaño de la Empresa</Label>
                            <Select 
                                value={formData.companySize} 
                                onValueChange={(value) => handleSelectChange("companySize", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                                    <SelectItem value="11-50">11-50 empleados</SelectItem>
                                    <SelectItem value="51-200">51-200 empleados</SelectItem>
                                    <SelectItem value="201-500">201-500 empleados</SelectItem>
                                    <SelectItem value="501+">501+ empleados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                            <Input 
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="referralSource">¿Cómo se enteró de nosotros?</Label>
                            <Select 
                                value={formData.referralSource} 
                                onValueChange={(value) => handleSelectChange("referralSource", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="search">Búsqueda en Google</SelectItem>
                                    <SelectItem value="social">Redes Sociales</SelectItem>
                                    <SelectItem value="friend">Recomendación</SelectItem>
                                    <SelectItem value="event">Evento</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="additionalDetails">Detalles Adicionales</Label>
                            <Textarea 
                                id="additionalDetails"
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                        
                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black">
                                Enviar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <style jsx>{`
                .required:after {
                    content: "*";
                    color: red;
                    margin-left: 4px;
                }
            `}</style>
        </div>
    );
}