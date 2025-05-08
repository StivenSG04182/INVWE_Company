'use client'

import React, { useState } from 'react'
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
import { Role } from '@prisma/client'

interface SendInvitationProps {
  agencyId: string
}

// Definimos el esquema de validación
const userDataSchema = z.object({
  email: z.string().email({
    message: "Debe ingresar un correo electrónico válido",
  }),
  role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST'] as const, {
    required_error: "Debe seleccionar un rol para el usuario",
    invalid_type_error: "Rol inválido seleccionado",
  }).default('SUBACCOUNT_USER'),
})

// Tipo derivado del esquema
type UserFormData = z.infer<typeof userDataSchema>

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializamos el formulario con valores por defecto
  const form = useForm<UserFormData>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'SUBACCOUNT_USER',
    },
  })

  const onSubmit = async (values: UserFormData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    console.log('1. Iniciando onSubmit con valores:', values)
    
    try {
      // Validamos que tengamos un email válido
      if (!values.email) {
        console.log('2. Error: Email vacío')
        throw new Error('El correo electrónico es obligatorio')
      }
      
      // Aseguramos que el rol tenga un valor válido
      const role = values.role as Role
      
      // Limpiamos el email para eliminar espacios
      const email = values.email.trim()
      
      console.log('3. Datos procesados para invitación:', {
        role,
        email,
        agencyId
      })

      // Verificamos que todos los parámetros estén definidos
      if (!email || !agencyId) {
        console.log('4. Error: Faltan datos requeridos', { email, agencyId })
        throw new Error('Faltan datos requeridos para enviar la invitación')
      }

      console.log('5. Llamando a sendInvitation con parámetros:', { role, email, agencyId })
      
      // Llamamos a la función de invitación con los parámetros correctos
      const result = await sendInvitation(
        role,
        email,
        agencyId
      )
      
      console.log('6. Resultado de sendInvitation:', result)

      // Verificamos que la respuesta sea válida
      if (!result || !result.invitationRecord) {
        console.log('7. Error: No se recibió respuesta válida de sendInvitation')
        throw new Error('No se pudo crear la invitación')
      }
      
      // Verificamos si es un usuario existente (caso especial)
      const isExistingUser = result.userExists === true

      // Guardamos el log de actividad
      console.log('8. Guardando log de actividad')
      await saveActivityLogsNotification({
        agencyId,
        description: `Invitación enviada a ${result.invitationRecord.email}`,
        subaccountId: undefined,
      })

      console.log('9. Proceso completado con éxito')
      
      // Mostramos mensaje de éxito
      toast({
        title: 'Éxito',
        description: isExistingUser
          ? 'El usuario ya existe en el sistema. Se ha creado una invitación local.'
          : result.invitationRecord.status === 'PENDING' 
            ? 'Invitación enviada correctamente.' 
            : 'Invitación actualizada y enviada correctamente.',
      })

      // Reseteamos el formulario
      form.reset({
        email: '',
        role: 'SUBACCOUNT_USER',
      })
    } catch (error) {
      console.error('Error al enviar invitación:', error)
      
      // Mostramos mensaje de error detallado
      let errorMessage = 'No se pudo enviar la invitación. Intenta de nuevo.'
      
      if (error instanceof Error) {
        // Verificamos si es un error de Prisma por email duplicado
        if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
          errorMessage = 'Ya existe una invitación para este correo electrónico. Se ha actualizado la invitación existente.'
          
          // Aunque hubo un error en Prisma, la lógica de negocio se completó correctamente
          // (la invitación ya existe), así que mostramos un mensaje informativo en lugar de error
          toast({
            title: 'Información',
            description: errorMessage,
          })
          
          // Reseteamos el formulario ya que la operación se considera exitosa
          form.reset({
            email: '',
            role: 'SUBACCOUNT_USER',
          })
          
          // Salimos de la función para evitar mostrar el toast de error
          setIsSubmitting(false)
          return
        } else {
          errorMessage = `Error: ${error.message}`
          console.error('Detalles del error:', error.stack)
        }
      }
      
      toast({
        variant: 'destructive',
        title: '¡Ups!',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitar nuevo miembro</CardTitle>
        <CardDescription>
          Se enviará una invitación al correo electrónico proporcionado. Si ya existe una invitación
          previa para ese email, se actualizará. El usuario recibirá un enlace para unirse a tu agencia.
          <p className="mt-2 text-xs text-amber-600 font-medium">
            Importante: Las invitaciones expiran después de 24 horas. Si no se acepta en ese tiempo, deberás enviar una nueva invitación.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ingresa el correo electrónico" 
                      type="email"
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol del usuario</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue="SUBACCOUNT_USER"
                    disabled={isSubmitting}
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
              disabled={isSubmitting}
              type="submit"
              className="w-full"
            >
              {isSubmitting ? <Loading /> : 'Enviar invitación'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation
