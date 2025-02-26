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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    nombreEmpresa: z.string().min(1, "Debe seleccionar una empresa"),
    nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres"),
    codigoSeguridad: z.string().min(6, "El código debe tener al menos 6 caracteres")
})

interface JoinInventoryFormProps {
    companies: Array<{ _id: string; name: string; }>;
    isLoading: boolean;
}

export function JoinInventoryForm({ companies = [], isLoading }: JoinInventoryFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombreEmpresa: "",
            nit: "",
            codigoSeguridad: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)
            const response = await axios.post("/api/inventory/join", values)
            router.push(`/${values.nombreEmpresa}/${response.data.storeId}`)
            toast.success("Te has unido al inventario exitosamente")
        } catch (error) {
            toast.error("Error al unirse al inventario")
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return <div>Cargando empresas...</div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nombreEmpresa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una empresa" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.isArray(companies) && companies.map((company) => (
                                        <SelectItem key={company._id} value={company.name}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    name="codigoSeguridad"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de Seguridad</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                    Unirse al Inventario
                </Button>
            </form>
        </Form>
    )
}