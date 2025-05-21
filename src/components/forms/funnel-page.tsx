'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { useToast } from '../ui/use-toast'
import { FunnelPage } from '@prisma/client'
import { FunnelPageSchema } from '@/lib/types'
import {
  deleteFunnelePage,
  getFunnels,
  saveActivityLogsNotification,
  upsertFunnelPage,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { v4 } from 'uuid'
import { CopyPlusIcon, Trash } from 'lucide-react'

interface CreateFunnelPageProps {
  defaultData?: FunnelPage
  funnelId: string
  order: number
  agencyId?: string
  subaccountId?: string
}

const CreateFunnelPage: React.FC<CreateFunnelPageProps> = ({
  defaultData,
  funnelId,
  order,
  agencyId,
  subaccountId,
}) => {
  console.log('=== INICIO CreateFunnelPage ===');
  console.log('Props recibidas:', { defaultData, funnelId, order, agencyId, subaccountId });
  
  // Usar agencyId si está disponible, de lo contrario usar subaccountId
  const effectiveId = agencyId || subaccountId;
  console.log('ID efectivo a utilizar:', effectiveId);
  
  const { toast } = useToast()
  const router = useRouter()
  //ch
  const form = useForm<z.infer<typeof FunnelPageSchema>>({
    resolver: zodResolver(FunnelPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  })

  useEffect(() => {
    console.log('useEffect para defaultData:', defaultData);
    if (defaultData) {
      console.log('Reseteando formulario con:', { name: defaultData.name, pathName: defaultData.pathName });
      form.reset({ name: defaultData.name, pathName: defaultData.pathName })
    }
  }, [defaultData, form])

  const onSubmit = async (values: z.infer<typeof FunnelPageSchema>) => {
    console.log('=== INICIO onSubmit en funnel-page ===');
    console.log('Valores del formulario:', values);
    console.log('Order:', order);
    
    if (order !== 0 && !values.pathName) {
      console.log('Error: Se requiere pathName para páginas que no son la primera');
      return form.setError('pathName', {
        message:
          "Las páginas que no son la primera en el embudo requieren un nombre de ruta, ejemplo: 'segundopaso'.",
      });
    }
    
    try {
      const pageData = {
        ...values,
        id: defaultData?.id || v4(),
        order: defaultData?.order || order,
        pathName: values.pathName || '',
      };
      
      console.log('Datos a enviar a upsertFunnelPage:', pageData);
      console.log('ID efectivo:', effectiveId);
      console.log('funnelId:', funnelId);
      
      if (!effectiveId) {
        console.error('Error: No se proporcionó ID de agencia o subcuenta');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'ID de agencia o subcuenta no disponible',
        });
        return;
      }
      
      const response = await upsertFunnelPage(
        effectiveId,
        pageData,
        funnelId
      );
      
      console.log('Respuesta de upsertFunnelPage:', response);

      await saveActivityLogsNotification({
        agencyId: agencyId || undefined,
        description: `Actualizada página de embudo | ${response?.name}`,
        subaccountId: subaccountId || undefined,
      });

      toast({
        title: 'Éxito',
        description: 'Detalles de la página de embudo guardados',
      });
      router.refresh();
      console.log('=== FIN onSubmit en funnel-page ===');
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast({
        variant: 'destructive',
        title: '¡Ups!',
        description: 'No se pudieron guardar los detalles de la página de embudo',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Página de Embudo</CardTitle>
        <CardDescription>
          Las páginas de embudo fluyen en el orden en que se crean por defecto. Puedes
          moverlas para cambiar su orden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting || order === 0 || !effectiveId}
              control={form.control}
              name="pathName"
              render={({ field }) => {
                console.log('Renderizando campo pathName:', { 
                  value: field.value, 
                  isDisabled: form.formState.isSubmitting || order === 0,
                  order
                });
                return (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre de ruta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ruta para la página"
                        {...field}
                        value={field.value?.toLowerCase() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Guardar Página'}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await deleteFunnelePage(defaultData.id)
                    await saveActivityLogsNotification({
                      agencyId: agencyId || undefined,
                      description: `Deleted a funnel page | ${response?.name}`,
                      subaccountId: subaccountId || undefined,
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <Trash />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    if (!effectiveId) {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'ID de agencia o subcuenta no disponible',
                      });
                      return;
                    }
                    const response = await getFunnels(effectiveId)
                    const lastFunnelPage = response.find(
                      (funnel) => funnel.id === funnelId
                    )?.FunnelPages.length

                    await upsertFunnelPage(
                      effectiveId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastFunnelPage ? lastFunnelPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      funnelId
                    )
                    toast({
                      title: 'Success',
                      description: 'Saves Funnel Page Details',
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateFunnelPage