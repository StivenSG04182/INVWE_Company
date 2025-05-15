'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { User } from '@prisma/client'

// Esquema de validación para el formulario
const formSchema = z.object({
    birthDate: z.string().min(1, { message: 'La fecha de nacimiento es requerida' }),
    gender: z.string().min(1, { message: 'El género es requerido' }),
    maritalStatus: z.string().min(1, { message: 'El estado civil es requerido' }),
    address: z.string().min(1, { message: 'La dirección es requerida' }),
    phone: z.string().min(1, { message: 'El teléfono es requerido' }),
    position: z.string().min(1, { message: 'El cargo es requerido' }),
    hireDate: z.string().min(1, { message: 'La fecha de ingreso es requerida' }),
    salary: z.string().min(1, { message: 'El salario es requerido' }),
    workSchedule: z.string().min(1, { message: 'La jornada laboral es requerida' }),
    socialSecurityNumber: z.string().min(1, { message: 'El número de seguro social es requerido' }),
    socialSecurityAffiliation: z.string().min(1, { message: 'La afiliación es requerida' }),
})

type FormValues = z.infer<typeof formSchema>

interface EditUserFormProps {
    user: User
}

export default function EditUserForm({ user }: EditUserFormProps) {
    const [loading, setLoading] = useState(false)
    
    // Función para cerrar el diálogo modal
    const onClose = () => {
        document.querySelector('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.click()
    }

    // Inicializar el formulario con los valores actuales del usuario
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
            gender: user.gender || '',
            maritalStatus: user.maritalStatus || '',
            address: user.address || '',
            phone: user.phone || '',
            position: user.position || '',
            hireDate: user.hireDate ? user.hireDate.toISOString().split('T')[0] : '',
            salary: user.salary || '',
            workSchedule: user.workSchedule || '',
            socialSecurityNumber: user.socialSecurityNumber || '',
            socialSecurityAffiliation: user.socialSecurityAffiliation || '',
        },
    })

    async function onSubmit(data: FormValues) {
        try {
            setLoading(true)

            // Enviar los datos al servidor
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Error al actualizar la información del usuario')
            }

            toast.success('Información actualizada correctamente')
            // Cerrar el diálogo usando el DOM
            document.querySelector('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.click()
        } catch (error) {
            console.error('Error al actualizar usuario:', error)
            toast.error('Error al actualizar la información')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="font-medium">Información Personal</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Nacimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Género</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Masculino">Masculino</SelectItem>
                                                <SelectItem value="Femenino">Femenino</SelectItem>
                                                <SelectItem value="Otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maritalStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado Civil</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                                                <SelectItem value="Casado/a">Casado/a</SelectItem>
                                                <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                                                <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <h3 className="font-medium mt-4">Información de Contacto</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input type="tel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Información Laboral</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hireDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Ingreso</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salario</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="workSchedule"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Jornada Laboral</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Tiempo completo">Tiempo completo</SelectItem>
                                                <SelectItem value="Medio tiempo">Medio tiempo</SelectItem>
                                                <SelectItem value="Por horas">Por horas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <h3 className="font-medium mt-4">Información de Seguridad Social</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="socialSecurityNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Seguro Social</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="socialSecurityAffiliation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Afiliación</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}