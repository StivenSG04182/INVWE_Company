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
      console.warn('🚀 === INICIO DEL PROCESO DE INVITACIÓN ===');
      console.warn('📝 Valores del formulario:', JSON.stringify(values, null, 2));
      console.warn('🏢 Agency ID recibido:', agencyId);
      console.warn('ℹ️ Tipo de Agency ID:', typeof agencyId);
      
      if (!values.role) {
        console.warn('⛔ ERROR CRÍTICO: El rol es undefined o null');
        throw new Error('El rol es obligatorio');
      }
      
      if (!values.email) {
        console.warn('⛔ ERROR CRÍTICO: El email es undefined o null');
        throw new Error('El email es obligatorio');
      }
      
      if (!agencyId) {
        console.warn('⛔ ERROR CRÍTICO: El agencyId es undefined o null');
        throw new Error('El agencyId es obligatorio');
      }
      
      console.warn('📨 Enviando invitación con parámetros:');
      console.warn('👤 - Rol:', values.role, '(tipo:', typeof values.role, ')');
      console.warn('📧 - Email:', values.email, '(tipo:', typeof values.email, ')');
      console.warn('🏢 - Agency ID:', agencyId, '(tipo:', typeof agencyId, ')');
      
      // Convertir explícitamente el rol a tipo Role
      const roleValue = values.role as Role;
      console.warn('🔄 Rol convertido:', roleValue);
      
      const res = await sendInvitation(roleValue, values.email, agencyId)
      console.warn('✅ Respuesta de sendInvitation:', JSON.stringify(res, null, 2));
      
      console.warn('📝 Guardando notificación de actividad...');
      await saveActivityLogsNotification({
        agencyId: agencyId,
        description: `Invited ${res.email}`,
        subaccountId: undefined,
      })
      console.warn('✅ Notificación guardada correctamente');
      
      console.warn('🎉 === PROCESO DE INVITACIÓN COMPLETADO CON ÉXITO ===');
      toast({
        title: 'Éxito',
        description: 'Creación y envío de la invitación',
      })
    } catch (error) {
      console.warn('❌ === ERROR EN EL PROCESO DE INVITACIÓN ===');
      console.warn('⚠️ Detalles del error:', error);
      console.warn('📄 Mensaje:', error instanceof Error ? error.message : 'Error desconocido');
      console.warn('🔍 Stack:', error instanceof Error ? error.stack : 'No disponible');
      
      // Mensaje de error personalizado basado en el tipo de error
      let errorMessage = 'No se ha podido enviar la invitación';
      
      if (error instanceof Error) {
        // Personalizar mensaje según el error específico
        if (error.message.includes('Ya existe una invitación')) {
          errorMessage = 'Ya existe una invitación para este email';
        } else if (error.message.includes('URL de redirección')) {
          errorMessage = 'Error de configuración: URL de redirección no configurada';
        } else if (error.message.includes('Error al enviar la invitación')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
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
              {form.formState.isSubmitting ? <Loading /> : 'Enviar invitación'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation