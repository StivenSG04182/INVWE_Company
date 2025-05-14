'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Funnel } from '@prisma/client'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreateFunnelFormSchema } from '@/lib/types'
import { saveActivityLogsNotification, upsertFunnel } from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import FileUpload from '../global/file-upload'

interface CreateFunnelProps {
  defaultData?: Funnel
  agencyId?: string
  subAccountId?: string
}

//CHALLENGE: Use favicons

const FunnelForm: React.FC<CreateFunnelProps> = ({
  defaultData,
  agencyId,
  subAccountId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateFunnelFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreateFunnelFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      description: defaultData?.description || '',
      favicon: defaultData?.favicon || '',
      subDomainName: defaultData?.subDomainName || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        description: defaultData.description || '',
        favicon: defaultData.favicon || '',
        name: defaultData.name || '',
        subDomainName: defaultData.subDomainName || '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreateFunnelFormSchema>) => {
    try {
      console.log('=== INICIO onSubmit en funnel-form ===');
      console.log('Valores del formulario:', values);
      
      // Usar agencyId o subAccountId, dependiendo de cuál esté disponible
      const effectiveAgencyId = agencyId || subAccountId;
      
      if (!effectiveAgencyId) {
        console.error('Error: No se proporcionó ID de agencia o subcuenta');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'ID de agencia no disponible',
        });
        return;
      }
      
      const funnelId = defaultData?.id || v4();
      console.log('Preparando datos para upsertFunnel:', { 
        agencyId: effectiveAgencyId, 
        funnelId,
        liveProducts: defaultData?.liveProducts || '[]' 
      });
      
      const response = await upsertFunnel(
        effectiveAgencyId,
        { ...values, liveProducts: defaultData?.liveProducts || '[]' },
        funnelId
      );
      
      console.log('Respuesta de upsertFunnel:', response);
      
      if (response) {
        console.log('Guardando log de actividad...');
        await saveActivityLogsNotification({
          agencyId: effectiveAgencyId,
          description: `Actualizado embudo | ${response.name}`,
        });
        
        toast({
          title: 'Éxito',
          description: 'Detalles del embudo guardados',
        });
      } else {
        console.error('No se recibió respuesta de upsertFunnel');
        toast({
          variant: 'destructive',
          title: '¡Ups!',
          description: 'No se pudieron guardar los detalles del embudo',
        });
      }
      
      console.log('Cerrando modal y refrescando página...');
      setClose();
      router.refresh();
      console.log('=== FIN onSubmit en funnel-form ===');
    } catch (error) {
      console.error('=== ERROR en onSubmit de funnel-form ===', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'Ocurrió un error al guardar el embudo. Por favor, intente nuevamente.',
      });
    }
  }
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Detalles del Embudo</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Embudo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Embudo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos un poco más sobre este embudo."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subDomainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdominio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Subdominio para el embudo"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono de Favorito</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Guardar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default FunnelForm