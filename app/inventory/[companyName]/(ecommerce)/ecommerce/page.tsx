'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/hooks/use-toast'
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormLabel, FormMessage, FormItem, FormField } from '@/components/ui/form'

const items = [
    {
        id: "carrito-compra",
        label: "Carrito de Compra",
    },
    {
        id: "buscador",
        label: "Buscador",
    },
    {
        id: "preguntas-frecuentes",
        label: "Preguntas Frecuentes",
    },
    {
        id: "contacto",
        label: "Página de Contacto",
    },
    {
        id: "registro-usuario",
        label: "Sistema de Registro",
    },
    {
        id: "recomendaciones",
        label: "Recomendaciones de Producto",
    },
    {
        id: "fichas-producto",
        label: "Fichas de Producto",
    },
    {
        id: "proceso-compra",
        label: "Proceso de Compra",
    },
    {
        id: "envio",
        label: "Sistema de Envío",
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
        <div className='container mx-auto p-6'>
            <div className="flex flex-col space-y-4 pb-6 border-b">
                <h1 className="text-3xl font-bold tracking-tight">Lista E-Commerce</h1>
                <div className="w-full max-w-sm">
                    <Input
                        placeholder="Buscar E-Commerce"
                        className="w-full"
                    />
                </div>
            </div>

            <div className='flex gap-6 mt-6 h-[calc(100vh-150px)]'>
                <div className='w-64 shrink-0'>
                    <div className='sticky top-4 p-4 bg-white rounded-lg border shadow-sm h-full overflow-y-auto'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="items"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-lg font-semibold">Filtros</FormLabel>
                                                <FormDescription>
                                                    Selecciona los tipos de E-Commerce que deseas ver
                                                </FormDescription>
                                            </div>
                                            <div className="space-y-3">
                                                {items.map((item) => (
                                                    <FormField
                                                        key={item.id}
                                                        control={form.control}
                                                        name="items"
                                                        render={({ field }) => (
                                                            <FormItem
                                                                key={item.id}
                                                                className="flex items-center space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, item.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== item.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-medium">
                                                                    {item.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Aplicar Filtros</Button>
                            </form>
                        </Form>
                    </div>
                </div>

                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-full'>
                    {[1, 2, 3].map((index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <div className='aspect-video bg-gray-100 rounded-md mb-4'></div>
                                <CardTitle className="text-xl">
                                    E-Commerce {index}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    Este es un E-Commerce de venta de productos
                                </CardDescription>
                                <CardContent className="px-0 pt-4">
                                    <div className='grid grid-cols-2 gap-2'>
                                        <Button variant="outline">Previsualización</Button>
                                        <Button>Editar</Button>
                                    </div>
                                </CardContent>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
