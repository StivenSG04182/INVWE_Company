'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const formSchema = z.object({
  agencyName: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  agencyDescription: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }),
  contactEmail: z.string().email({
    message: 'Por favor ingresa un email válido.',
  }),
  supportEmail: z.string().email({
    message: 'Por favor ingresa un email válido.',
  }),
  notificationsEnabled: z.boolean(),
  emailNotificationsEnabled: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export default function SettingsPage() {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<FormData | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agencyName: '',
      agencyDescription: '',
      contactEmail: '',
      supportEmail: '',
      notificationsEnabled: true,
      emailNotificationsEnabled: true,
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/agency/${params.agencyId}/settings`)
        const data = await response.json()
        if (data.success) {
          setInitialData(data.settings)
          form.reset(data.settings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Error al cargar la configuración')
      }
    }

    fetchSettings()
  }, [params.agencyId, form])

  async function onSubmit(values: FormData) {
    try {
      setLoading(true)
      const response = await fetch(`/api/agency/${params.agencyId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Configuración actualizada correctamente')
        setInitialData(values)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Error al actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración General</h2>
        <p className="text-muted-foreground">
          Administra la configuración general de tu agencia
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Agencia</CardTitle>
              <CardDescription>
                Esta información será visible para tus clientes y subaccounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="agencyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Agencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Agencia Digital" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este es el nombre que verán tus clientes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agencyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Somos una agencia digital especializada en..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Una breve descripción de tu agencia y servicios
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>
                Configura los emails de contacto y soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@miagencia.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email principal para comunicaciones con clientes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Soporte</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="soporte@miagencia.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email para tickets de soporte y ayuda
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura las preferencias de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notificaciones en la Plataforma
                      </FormLabel>
                      <FormDescription>
                        Recibe notificaciones dentro de la plataforma
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notificaciones por Email
                      </FormLabel>
                      <FormDescription>
                        Recibe notificaciones importantes por email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Form>
    </div>
  )
}