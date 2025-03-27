"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form } from '@/components/ui/form'
import { FormProvider } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { InvoiceForm } from '@/components/dashboard/invoices/invoice-form'
import InvoicePreview from '@/components/dashboard/invoices/invoice-preview'
import { useToast } from '@/hooks/use-toast'
import { Undo2 } from "lucide-react"
import Link from 'next/link'

const invoiceSchema = z.object({
    clientId: z.string().uuid(),
    invoiceDate: z.date(),
    dueDate: z.date(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        taxRate: z.number().min(0),
    })).min(1),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function CreateInvoicePage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            items: [{ productId: '', quantity: 1, unitPrice: 0, taxRate: 0 }]
        }
    })

    const onSubmit = async (data: InvoiceFormData) => {
        try {
            setIsSubmitting(true)
            // TODO: Implementar lógica de creación de factura
            toast({
                title: "Factura creada",
                description: "La factura se ha creado correctamente"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear la factura",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-auto py-6 md:py-8 lg:py-10 h-screen flex flex-col">
            <div className="flex flex-col flex-grow space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Crear Factura</h2>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="./">
                            <Undo2 className="mr-2 h-4 w-4" /> Volver
                        </Link>
                    </Button>
                </div>
                <div className="grid flex-grow border-t-2 border-solid border-gray-300">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-2 w-full h-full">
                            <div className="w-full order-1 flex flex-col h-full">
                                <div className="flex flex-col flex-grow">
                                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex-grow overflow-y-auto">
                                        <InvoiceForm />
                                    </div>
                                </div>
                            </div>
                            <div className="lg:flex lg:flex-col order-2 h-full">
                                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex-grow overflow-y-auto">
                                    <InvoicePreview />
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                    <div className="mt-6 p-4 md:p-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto">
                            {isSubmitting ? "Creando..." : "Crear Factura"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}