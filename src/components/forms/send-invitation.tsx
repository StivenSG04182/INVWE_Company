'use client'
import React from 'react'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '../ui/use-toast'

interface SendInvitationProps {
  agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { toast } = useToast()
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'SUBACCOUNT_USER',
    },
  })

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      console.log('Enviando invitación con rol:', values.role);
      const res = await sendInvitation(values.role as Role, values.email, agencyId)
      await saveActivityLogsNotification({
        agencyId: agencyId,
        description: `Invited ${res.email}`,
        subaccountId: undefined,
      })
      toast({
        title: 'Éxito',
        description: 'Creación y envío de la invitación',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructivo',
        title: 'Oppse!',
        description: 'No se ha podido enviar la invitación',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitación</CardTitle>
        <CardDescription>
          Se enviará una invitación al usuario. Los usuarios que ya tengan una invitación de
          enviada a su correo electrónico, no recibirán otra invitación.
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
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Función del usuario</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Administración de la Agencia</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">
                      Usuario de la subcuenta
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                      Subcuenta Invitado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Enviar invitaciónInvitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation