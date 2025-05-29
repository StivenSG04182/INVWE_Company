"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, UserPlus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { saveActivityLogsNotification, sendInvitation } from "@/lib/queries"

// Definición del esquema de validación
const userDataSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
  role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"], {
    message: "Por favor selecciona un rol válido",
  }),
})

// Tipo derivado del esquema
type InvitationFormValues = z.infer<typeof userDataSchema>

interface SendInvitationProps {
  agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "SUBACCOUNT_USER",
    },
  })

  const onSubmit = async (values: InvitationFormValues) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      console.log("Enviando invitación con datos:", {
        role: values.role,
        email: values.email,
        agencyId,
      })

      // Enviar la invitación
      const res = await sendInvitation(values.role, values.email, agencyId)

      // Registrar la actividad
      await saveActivityLogsNotification({
        agencyId: agencyId,
        description: `Invited ${res.email}`,
        subaccountId: undefined,
      })

      // Reiniciar el formulario
      form.reset({
        email: "",
        role: "SUBACCOUNT_USER",
      })

      // Mostrar mensaje de éxito
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${values.email}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error al enviar invitación:", error)

      // Verificar si es un error de invitación duplicada
      if (
        (error instanceof Error && error.message.includes("duplicate")) ||
        error.message.includes("duplicada") ||
        error.message.includes("ya existe una invitación")
      ) {
        toast({
          variant: "warning",
          title: "Invitación ya enviada",
          description: `Ya existe una invitación pendiente para ${values.email}. No es necesario enviar otra.`,
        })
      } else {
        // Otro tipo de error
        toast({
          variant: "destructive",
          title: "Error al enviar invitación",
          description: error instanceof Error ? error.message : "No se pudo enviar la invitación",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Invitar usuario</CardTitle>
        </div>
        <CardDescription>
          Se enviará una invitación al correo electrónico del usuario. Los usuarios que ya tienen una invitación enviada
          no recibirán otra.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="usuario@ejemplo.com" {...field} autoComplete="email" />
                    </div>
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
                      <SelectItem value="AGENCY_ADMIN">Administrador de Agencia</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">Usuario de Tienda</SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">Invitado de Tienda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                "Enviar invitación"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export default SendInvitation
