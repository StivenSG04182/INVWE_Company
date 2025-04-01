'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormLabel, FormMessage, FormItem, FormField } from '@/components/ui/form'

const items = [
    {
        id: "E-Commerce-1",
        label: "E-Commerce 1",
    },
    {
        id: "E-Commerce-2",
        label: "E-Commerce 2",
    },
    {
        id: "E-Commerce-3",
        label: "E-Commerce 3",
    }
] as const

const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "Debe seleccionar al menos un item",
    }),
});

export default function EcommercePage() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: ["E-Commerce-1", "E-Commerce-2", "E-Commerce-3"],
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }


    return (
        <div className='p-6'>
            <h1 className="text-2xl font-bold mb-4">Lista E-Commerce</h1>
            <div className="flex gap-4 mb-10">
                <Input
                    placeholder="Buscar E-Commerce"
                    className="max-w-sm"
                />
            </div>
            <div className='flex justify-init'>
                <p>Filtro</p>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader>
                        <div className='max-w-relative h-32 bg-gray-200 rounded-md mb-4 p-4 border border-solid grid-500'>
                        </div>
                        <CardTitle>
                            E-Commerce 1
                        </CardTitle>
                        <CardDescription>
                            Este es un E-Commerce de venta de productos
                        </CardDescription>
                        <CardContent>
                            <div className='grid grid-cols-2 gap-2 mt-4'>
                                <Button className=''>Previsualización</Button>
                                <Button className=''>Edit</Button>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
