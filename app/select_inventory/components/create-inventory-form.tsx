"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    // User Information
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    last_name: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    email: z.string().email("Debe ser un email válido"),
    phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
    date_of_birth: z.string().min(1, "La fecha de nacimiento es requerida"),

    // Company Information
    nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres").regex(/^\d{9}-\d$/, "El NIT debe tener el formato: 900123456-7"),
    company_name: z.string().min(3, "El nombre de la empresa debe tener al menos 3 caracteres"),
    company_address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    company_phone: z.string()
        .min(7, "El teléfono debe tener al menos 7 caracteres")
        .regex(/^[0-9+]+$/, "El teléfono solo debe contener números"),
    company_email: z.string().email("Debe ser un email válido"),

    // Store Information
    store_name: z.string().min(3, "El nombre de la tienda debe tener al menos 3 caracteres"),
    store_address: z.string().min(5, "La dirección de la tienda debe tener al menos 5 caracteres"),
    store_phone: z.string()
        .min(7, "El teléfono de la tienda debe tener al menos 7 caracteres")
        .regex(/^[0-9+]+$/, "El teléfono solo debe contener números"),
});

const formSteps = [
    {
        title: "Información del Usuario",
        fields: ["name", "last_name", "email", "phone", "date_of_birth"]
    },
    {
        title: "Información de la Empresa",
        // Se agrega el campo "nit" junto a los demás datos de la empresa
        fields: ["nit", "company_name", "company_address", "company_phone", "company_email"]
    },
    {
        title: "Configuración de la Tienda",
        fields: ["store_name", "store_address", "store_phone"]
    }
];

export function CreateInventoryForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            last_name: "",
            email: "",
            phone: "",
            date_of_birth: "",
            nit: "",
            company_name: "",
            company_address: "",
            company_phone: "",
            company_email: "",
            store_name: "",
            store_address: "",
            store_phone: "",
        },
    });

    const progress = ((currentStep + 1) / formSteps.length) * 100;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            // Construir el objeto para el API sin duplicar claves
            const apiValues = {
                // Datos del usuario
                name: values.name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                date_of_birth: values.date_of_birth,

                // Datos de la empresa
                nombreEmpresa: values.company_name.trim(),
                nit: values.nit.trim(),
                address: values.company_address.trim(),
                phone_company: values.company_phone.trim(),
                email_company: values.company_email.trim(),

                // Datos para la relación usuario-empresa
                nombres_apellidos: `${values.name} ${values.last_name}`.trim(),
                correo_electronico: values.email.trim(),
                telefono_usuario: values.phone.trim(),
                direccion_usuario: values.company_address.trim(),

                // Datos de la tienda
                store_name: values.store_name.trim(),
                store_address: values.store_address.trim(),
                store_phone: values.store_phone.trim()
            };

            const response = await axios.post("/api/inventory/create", apiValues);

            if (response.data.companyName && response.data.storeId) {
                router.push(`/inventory/${encodeURIComponent(response.data.companyName)}/dashboard`);
                toast.success("Empresa registrada exitosamente");
            } else {
                throw new Error("Formato de respuesta inválido");
            }
        } catch (error) {
            console.error("Error creando inventario:", error);
            toast.error(
                ((error as Error & { response?: { data?: { errors?: Array<{ message: string }> } } }).response?.data?.errors?.[0]?.message) ||
                "Error al registrar la empresa"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        const fields = formSteps[currentStep].fields;
        const currentValues = form.getValues();
        const currentStepSchema = z.object(
            fields.reduce((acc, field) => ({
                ...acc,
                [field]: formSchema.shape[field as keyof typeof formSchema.shape]
            }), {})
        );

        try {
            currentStepSchema.parse(currentValues);
            setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(err => {
                    toast.error(`${err.path.join('.')}: ${err.message}`);
                });
            } else {
                toast.error("Por favor complete todos los campos requeridos correctamente");
            }
        }
    };

    const previousStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const renderFormFields = () => {
        const currentFields = formSteps[currentStep].fields;

        return currentFields.map(fieldName => (
            <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {fieldName.replace(/_/g, " ").charAt(0).toUpperCase() +
                                fieldName.slice(1).replace(/_/g, " ")}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type={
                                    fieldName === "date_of_birth" || fieldName.includes("fecha")
                                        ? "date"
                                        : "text"
                                }
                                placeholder={`Ingrese ${fieldName.replace(/_/g, " ")}`}
                                {...field}
                                value={field.value || ""}
                                onChange={e => field.onChange(e.target.value)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ));
    };

    return (
        <Form {...form}>
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{formSteps[currentStep].title}</h2>
                    <Progress value={progress} className="w-full" />
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {renderFormFields()}

                    <div className="flex justify-between space-x-4">
                        {currentStep > 0 && (
                            <Button type="button" onClick={previousStep} variant="outline">
                                Anterior
                            </Button>
                        )}

                        {currentStep < formSteps.length - 1 ? (
                            <Button type="button" onClick={nextStep}>
                                Siguiente
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? "Creando..." : "Crear Inventario"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </Form>
    );
}
