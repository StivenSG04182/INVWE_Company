'use client'

import React from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
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
    email: z.string().email({
      message: "Debe ingresar un correo electrónico válido",
    }),
    role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST'], {
      required_error: "Debe seleccionar un rol para el usuario",
      invalid_type_error: "Rol inválido seleccionado",
    }).default('SUBACCOUNT_USER'),
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
    console.log('1. Iniciando onSubmit con valores:', values);
    try {
      // Validar que tengamos un email válido
      if (!values.email) {
        console.log('2. Error: Email vacío');
        throw new Error('El correo electrónico es obligatorio');
      }
      
      // Asegurarse de que el rol tenga un valor válido
      const role = values.role || 'SUBACCOUNT_USER';
      // Limpiar el email para eliminar espacios
      const email = values.email.trim();
      
      console.log('3. Datos procesados para invitación:', {
        role,
        email,
        agencyId
      });

      // Verificar que todos los parámetros estén definidos
      if (!email || !agencyId) {
        console.log('4. Error: Faltan datos requeridos', { email, agencyId });
        throw new Error('Faltan datos requeridos para enviar la invitación');
      }

      console.log('5. Llamando a sendInvitation con parámetros:', { role, email, agencyId });
      const result = await sendInvitation(
        role,
        email,
        agencyId
      )
      console.log('6. Resultado de sendInvitation:', result);

      if (!result || !result.invitationRecord) {
        console.log('7. Error: No se recibió respuesta válida de sendInvitation');
        throw new Error('No se pudo crear la invitación');
      }

      console.log('8. Guardando log de actividad');
      await saveActivityLogsNotification({
        agencyId,
        description: `Invited ${result.invitationRecord.email}`,
        subaccountId: undefined,
      })

      console.log('9. Proceso completado con éxito');
      toast({
        title: 'Éxito',
        description: 'Invitación creada y enviada correctamente.',
      })

      // Reset de campos
      form.reset({
        email: '',
        role: 'SUBACCOUNT_USER',
      })
    } catch (error) {
      console.error('Error al enviar invitación:', error)
      // Mostrar mensaje de error más detallado para ayudar en la depuración
      let errorMessage = 'No se pudo enviar la invitación. Intenta de nuevo.';
      
      // Si tenemos un mensaje de error específico, lo mostramos
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('Detalles del error:', error.stack);
      }
      
      toast({
        variant: 'destructive',
        title: '¡Ups!',
        description: errorMessage,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitar nuevo miembro</CardTitle>
        <CardDescription>
          Se enviará una invitación al correo electrónico proporcionado. Si ya existe una invitación
          previa para ese email, no se enviará otra. El usuario recibirá un enlace para unirse a tu agencia.
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
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa el correo electrónico" {...field} />
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
                <FormItem>
                  <FormLabel>Rol del usuario</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue="SUBACCOUNT_USER"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">
                        Administrador de Agencia
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">
                        Usuario de Subcuenta
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Invitado de Subcuenta
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Administrador: Control total de la agencia | Usuario: Acceso completo a subcuentas | Invitado: Acceso limitado
                  </p>
                </FormItem>
              )}
            />

            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="w-full"
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
