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

// Se valida que los campos de teléfono contengan únicamente números.
const formSchema = z.object({
    // Información del Usuario
    name: z.string().trim(),
    last_name: z.string().trim(),
    email: z.string().email("Debe ser un email válido.").trim(),
    phone: z.string().regex(/^\d+$/, "El teléfono solo debe contener números.").trim(),
    date_of_birth: z.string().trim(),

    // Información de la Empresa
    company_name: z.string().trim(),
    company_address: z.string().trim(),
    company_phone: z.string().regex(/^\d+$/, "El teléfono solo debe contener números.").trim(),
    company_email: z.string().email("Debe ser un email válido.").trim(),

    // Información de la Tienda
    store_name: z.string().trim(),
    store_address: z.string().trim(),
    store_phone: z.string().regex(/^\d+$/, "El teléfono solo debe contener números.").trim(),
});

const formSteps = [
    {
        title: "Información del Usuario",
        fields: ["name", "last_name", "email", "phone", "date_of_birth"]
    },
    {
        title: "Información de la Empresa",
        fields: ["company_name", "company_address", "company_phone", "company_email"]
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
        // Mostrar mensaje al iniciar el proceso de creación
        toast.info("Creando Organización");

        try {
            setIsLoading(true);

            const apiValues = {
                // Datos del usuario
                name: values.name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                date_of_birth: values.date_of_birth,

                // Datos de la empresa
                nombreEmpresa: values.company_name.trim(),
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

            const response = await axios.post("/api/control_login/(select_inventory)/create", apiValues);

            if (response.data.companyName && response.data.storeId) {
                router.push(`/inventory/${encodeURIComponent(response.data.companyName)}/dashboard`);
                toast.success("Empresa registrada exitosamente");
            } else {
                throw new Error("Formato de respuesta inválido");
            }
        } catch (error) {
            toast.error(
                ((error as Error & { response?: { data?: { errors?: Array<{ message: string }> } } }).response?.data?.errors?.[0]?.message) ||
                "Error al registrar la empresa"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        const currentFields = formSteps[currentStep].fields;
        // Dispara la validación únicamente de los campos del paso actual.
        const isValid = await form.trigger(currentFields);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
        } else {
            // Los mensajes de error se muestran de forma inline en cada input.
            toast.error("Por favor, corrige los errores en el formulario antes de continuar.");
        }
    };

    const previousStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const fieldLabels: Record<string, string> = {
        name: "Nombre",
        last_name: "Apellido",
        email: "Correo electrónico",
        phone: "Teléfono",
        date_of_birth: "Fecha de nacimiento",
        company_name: "Nombre de la empresa",
        company_address: "Dirección de la empresa",
        company_phone: "Teléfono de la empresa",
        company_email: "Correo electrónico de la empresa",
        store_name: "Nombre de la tienda",
        store_address: "Dirección de la tienda",
        store_phone: "Teléfono de la tienda",
    };

    // Asigna el tipo de input adecuado según cada campo.
    const getInputType = (fieldName: string) => {
        if (fieldName === "date_of_birth") return "date";
        if (fieldName === "email" || fieldName === "company_email") return "email";
        if (fieldName === "phone" || fieldName === "company_phone" || fieldName === "store_phone") return "tel";
        return "text";
    };

    const renderFormFields = () => {
        const currentFields = formSteps[currentStep].fields;

        return currentFields.map(fieldName => (
            <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof z.infer<typeof formSchema>}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            {fieldLabels[fieldName] || fieldName.replace(/_/g, " ")}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type={getInputType(fieldName)}
                                {...field}
                                value={field.value || ""}
                                onChange={e => field.onChange(e.target.value)}
                                className={fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                        </FormControl>
                        <FormMessage>
                            {fieldState.error?.message}
                        </FormMessage>
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
                                {isLoading ? "Creando Organización" : "Crear Organización"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </Form>
    );
}
