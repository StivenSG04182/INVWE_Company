"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
    nombreEmpresa: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres"),
    businessName: z.string().min(3, "La razón social debe tener al menos 3 caracteres"),
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
    email: z.string().email("Debe ser un email válido"),
    logoEmpresa: z.instanceof(FileList).transform(list => list.item(0))
        .refine((file) => file !== null, "La imagen es requerida")
        .refine(
            (file) => file && file.size <= 5 * 1024 * 1024,
            "La imagen debe ser menor a 5MB"
        )
        .refine(
            (file) => file && ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
            "Solo se permiten archivos JPG, PNG y GIF"
        )
})

export function CreateInventoryForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombreEmpresa: "",
            nit: "",
            businessName: "",
            address: "",
            phone: "",
            email: "",
            logoEmpresa: undefined
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true)
            
            const formData = new FormData()
            formData.append('nombreEmpresa', values.nombreEmpresa)
            formData.append('nit', values.nit)
            formData.append('businessName', values.businessName)
            formData.append('address', values.address)
            formData.append('phone', values.phone)
            formData.append('email', values.email)
            formData.append('logoEmpresa', values.logoEmpresa as File)

            const response = await axios.post("/api/inventory/create", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })
            
            if (response.data.companyName && response.data.storeId) {
                router.push(`/${response.data.companyName}/${response.data.storeId}`)
                toast.success("Empresa registrada exitosamente")
            } else {
                throw new Error("Invalid response format")
            }
        } catch (error: any) {
            console.error("Error creating inventory:", error)
            toast.error(error.response?.data || "Error al registrar la empresa")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nombreEmpresa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la Empresa</FormLabel>
                            <FormControl>
                                <Input placeholder="Mi Empresa S.A." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIT</FormLabel>
                            <FormControl>
                                <Input placeholder="900123456-7" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razón Social</FormLabel>
                            <FormControl>
                                <Input placeholder="Mi Empresa S.A.S." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input placeholder="Calle 123 #45-67" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                                <Input placeholder="3001234567" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input 
                                    type="email" 
                                    placeholder="empresa@ejemplo.com" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="logoEmpresa"
                    render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                            <FormLabel>Logo de la Empresa</FormLabel>
                            <FormControl>
                                <Input 
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onChange(e.target.files)}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Creando..." : "Crear Inventario"}
                </Button>
            </form>
        </Form>
    )
}