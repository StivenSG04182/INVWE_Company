'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { v4 } from 'uuid'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

import FileUpload from '../global/file-upload'
import Loading from '../global/loading'
import { useToast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'

import { Agency, SubAccount } from '@prisma/client'
import { upsertSubAccount, saveActivityLogsNotification } from '@/lib/queries'

// Esquema de validación mejorado
const formSchema = z.object({
  name: z.string().nonempty('Nombre de cuenta es obligatorio'),
  companyEmail: z
    .string()
    .nonempty('Email es obligatorio')
    .email('Email inválido'),
  companyPhone: z
    .string()
    .nonempty('Teléfono es obligatorio')
    .regex(/^\+?\d+$/, 'Sólo dígitos y opcional + al inicio'),
  address: z.string().nonempty('Dirección es obligatoria'),
  city: z.string().nonempty('Ciudad es obligatoria'),
  state: z.string().nonempty('Estado es obligatorio'),
  zipCode: z
    .string()
    .nonempty('Código postal es obligatorio')
    .regex(/^\d{4,6}$/, 'Zipcode debe tener 4–6 dígitos'),
  country: z.string().nonempty('País es obligatorio'),
  subAccountLogo: z.string().nonempty('Logo es obligatorio'),
})

interface Props {
  agencyDetails: Agency
  details?: Partial<SubAccount>
  userId: string
  userName: string
}

export default function SubAccountDetails({
  details,
  agencyDetails,
  userId,
  userName,
}: Props) {
  const { toast } = useToast()
  const { setClose } = useModal()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Aseguramos que los valores iniciales nunca sean undefined
  const defaultValues = {
    name: details?.name || '',
    companyEmail: details?.companyEmail || '',
    companyPhone: details?.companyPhone || '',
    address: details?.address || '',
    city: details?.city || '',
    state: details?.state || '',
    zipCode: details?.zipCode || '',
    country: details?.country || '',
    subAccountLogo: details?.subAccountLogo || '',
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues,
  })

  // Actualizamos el formulario cuando cambian los detalles
  useEffect(() => {
    if (details) {
      const updatedValues = {
        name: details.name || '',
        companyEmail: details.companyEmail || '',
        companyPhone: details.companyPhone || '',
        address: details.address || '',
        city: details.city || '',
        state: details.state || '',
        zipCode: details.zipCode || '',
        country: details.country || '',
        subAccountLogo: details.subAccountLogo || '',
      }
      form.reset(updatedValues)
    }
  }, [details, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('DEBUG - Iniciando envío del formulario con valores:', values)
    setSubmitting(true)
    
    try {
      // Validación adicional para el email
      if (!values.companyEmail) {
        throw new Error('El email de la compañía es obligatorio')
      }
      
      // Limpiamos el email para eliminar espacios
      const email = values.companyEmail.trim()
      console.log('DEBUG - Email validado:', email)
      
      if (!email) {
        throw new Error('El email de la compañía no puede estar vacío')
      }
      
      const id = details?.id || v4()
      const now = new Date()
      
      // Crear objeto con todos los campos explícitamente
      const subAccountData: SubAccount = {
        id,
        agencyId: agencyDetails.id,
        name: values.name,
        companyEmail: email, // Usamos el email validado
        companyPhone: values.companyPhone,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
        subAccountLogo: values.subAccountLogo,
        connectAccountId: details?.connectAccountId || '',
        goal: details?.goal || 5000,
        createdAt: details?.createdAt || now,
        updatedAt: now,
      }
      
      console.log('DEBUG - Enviando datos de subcuenta:', JSON.stringify(subAccountData))
      
      const response = await upsertSubAccount(subAccountData)

      if (!response) {
        throw new Error('No se recibió respuesta del servidor')
      }

      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `${userName} ${details?.id ? 'actualizó' : 'creó'} sub cuenta ${response.name}`,
        subaccountId: response.id,
      })

      toast({
        title: '¡Éxito!',
        description: 'Subcuenta guardada correctamente.',
      })
      setClose()
      router.refresh()
    } catch (error) {
      console.error('ERROR - Al guardar subcuenta:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la subcuenta.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Información de Sub Cuenta</CardTitle>
        <CardDescription>Por favor ingresa los datos de la subcuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Logo */}
            <FormField
              control={form.control}
              name="subAccountLogo"
              disabled={submitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo de la cuenta</FormLabel>
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

            {/* Nombre y Email */}
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="name"
                disabled={submitting}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre de la cuenta</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Nombre de la empresa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyEmail"
                disabled={submitting}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email de la cuenta</FormLabel>
                    <FormControl>
                      <Input
                        required
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value || '';
                          console.log('DEBUG - Email cambiado a:', value);
                          field.onChange(value);
                        }}
                        onBlur={() => {
                          console.log('DEBUG - Email en onBlur:', field.value);
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="companyPhone"
              disabled={submitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de la cuenta</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="+1234567890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={submitting}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="123 Calle Principal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                disabled={submitting}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input required placeholder="Ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={submitting}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Estado/Provincia</FormLabel>
                    <FormControl>
                      <Input required placeholder="Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={submitting}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input required placeholder="Ej. 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={submitting}
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input required placeholder="País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting}>
              {submitting ? <Loading /> : 'Guardar información de la cuenta'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}