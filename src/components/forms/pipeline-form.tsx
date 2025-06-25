'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PipelineFormProps {
  subaccountId: string
  defaultData?: FormData
  onSuccess?: () => void
}

export const PipelineForm = ({ subaccountId, defaultData, onSuccess }: PipelineFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultData || {
      name: '',
      description: '',
      price: '',
    },
  })

  const isLoading = form.formState.isSubmitting

  const handleSubmit = async (data: FormData) => {
    try {
      // TODO: Implementar guardado de pipeline
      console.log('Guardando pipeline:', data)
      
      toast({
        title: 'Éxito',
        description: 'Pipeline guardado',
      })
      
      onSuccess?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '¡Ups!',
        description: 'No se pudo guardar el pipeline',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detalles del Pipeline</CardTitle>
        <CardDescription>
          Crea un pipeline para tu negocio. Puedes agregar más detalles a este pipeline
          y luego asignar ese pipeline a tus clientes para comenzar a vender productos
          o servicios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Pipeline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del pipeline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Qué hace este pipeline?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                '¡Guardar Pipeline!'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 