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
import { SkeletonShinyGradient } from "@/components/ui/skeleton-shiny-gradient";

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
            items: ["E-Commerce-1", "E-Commerce-2", "E-Commerce-3", "E-Commerce 4", "E-Commerce 5"],
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
<div className="container mx-auto p-6">
  {/* Encabezado con título y buscador */}
  <div className="pb-6 border-b">
    <h1 className="text-3xl font-bold tracking-tight">Lista E-Commerce</h1>
    <div className="max-w-sm mt-4">
      <Input placeholder="Buscar E-Commerce" className="w-full" />
    </div>
  </div>

  {/* Contenedor principal con filtro y lista de elementos */}
  <div className="flex mt-6">
    {/* Filtro de elementos a la izquierda */}
    <div className="w-1/4 p-4 bg-white rounded-lg border shadow-sm">
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
                        <FormItem className="flex items-center space-x-3 space-y-0">
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
                                    );
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
          <Button type="submit" className="w-full">
            Aplicar Filtros
          </Button>
        </form>
      </Form>
    </div>

    {/* Lista de elementos a la derecha */}
    <div className="w-3/4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <SkeletonShinyGradient
            key={index}
            className="flex flex-col gap-5 rounded-2xl bg-black/5 p-4 dark:bg-white/5"
          >
            <div className="h-24 w-full rounded-lg bg-neutral-200 dark:bg-rose-100/10" />
            <div className="space-y-3">
              <div className="h-3 w-3/5 rounded-lg bg-neutral-200 dark:bg-rose-100/10" />
              <h1 className="text-base lg:text-lg">E-Commerce {index}</h1>
              <p>Este es un E-Commerce de venta de productos</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">Previsualización</Button>
                <Button>Editar</Button>
              </div>
            </div>
          </SkeletonShinyGradient>
        ))}
      </div>
    </div>
  </div>
</div>

    )
}