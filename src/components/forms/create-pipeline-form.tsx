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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Funnel, Pipeline } from '@prisma/client'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { CreatePipelineFormSchema } from '@/lib/types'
import {
  saveActivityLogsNotification,
  upsertFunnel,
  upsertPipeline,
} from '@/lib/queries'
import { v4 } from 'uuid'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

interface CreatePipelineFormProps {
  defaultData?: Pipeline
  subAccountId: string
}

const CreatePipelineForm: React.FC<CreatePipelineFormProps> = ({
  defaultData,
  subAccountId,
}) => {
  const { data, isOpen, setOpen, setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreatePipelineFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreatePipelineFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
      })
    }
  }, [defaultData, form])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreatePipelineFormSchema>) => {
    if (!subAccountId) return
    try {
      const response = await upsertPipeline({
        ...values,
        id: defaultData?.id,
        subAccountId: subAccountId,
      })

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Actualizado pipeline | ${response?.name}`,
        subaccountId: subAccountId,
      })

      toast({
        title: 'Éxito',
        description: 'Detalles del pipeline guardados',
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '¡Ups!',
        description: 'No se pudieron guardar los detalles del pipeline',
      })
    }

    setClose()
  }
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Detalles del Pipeline</CardTitle>
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
                  <FormLabel>Nombre del Pipeline</FormLabel>
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

export default CreatePipelineForm