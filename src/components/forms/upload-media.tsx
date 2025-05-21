'use client'
import React from 'react'
import { z } from 'zod'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type Props = {
    subaccountId: string
    agencyId?: string
}

const formSchema = z.object({
    link: z.string().min(1, { message: 'Se requiere archivo multimedia' }),
    name: z.string().min(1, { message: 'Nombre obligatorio' }),
})

const UploadMediaForm = ({ subaccountId, agencyId }: Props) => {
    const { toast } = useToast()
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      mode: 'onSubmit',
      defaultValues: {
        link: '',
        name: '',
      },
    })

    async function onSubmit(values:z.infer<typeof formSchema>){
        try{
            console.log('UploadMediaForm - onSubmit con valores:', values);
            console.log('UploadMediaForm - Parámetros:', { subaccountId, agencyId });
            
            // Pasamos el agencyId solo si está definido
            const mediaData = agencyId ? {...values, agencyId} : values;
            const response = await createMedia(subaccountId, mediaData)
            console.log('UploadMediaForm - Respuesta de createMedia:', response);
            
            // Guardamos la notificación con el agencyId correcto
            await saveActivityLogsNotification({
                description:`Cargado un archivo multimedia | ${response.name}`,
                subaccountId: subaccountId || '', // Aseguramos que siempre haya un valor, incluso si es vacío
                agencyId: agencyId || response.agencyId // Usamos el agencyId del formulario o de la respuesta
            })
            
            toast({title:"Éxito", description:"Archivo multimedia cargado correctamente"})
            router.refresh()
        } catch(error){
            console.error('Error al cargar archivo multimedia:', error)
            toast({
                variant:"destructive",
                title:"Error",
                description:"No se han podido cargar los archivos"
            }) 
        }

    }

    return <Card className='w-full'>
        <CardHeader>
            <CardTitle>Información para los medios</CardTitle>
                <CardDescription>Introduzca los datos de su expediente</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nombre del archivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del archivo multimedia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo multimedia</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="media"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-4"
            >
              Cargar medios
            </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
}

export default UploadMediaForm