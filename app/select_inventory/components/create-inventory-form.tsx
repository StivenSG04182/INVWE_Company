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
    nombres_apellidos: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
    correo_electronico: z.string().email("Debe ser un email válido"),
    telefono_usuario: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
    fecha_nacimiento: z.string().optional(),
    direccion_usuario: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),

    // Company Information
    nombreEmpresa: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres").regex(/^[0-9-]+$/, "El NIT solo debe contener números y guiones"),
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres").regex(/^[0-9+]+$/, "El teléfono solo debe contener números"),
    email: z.string().email("Debe ser un email válido"),

    // Store Information
    store_name: z.string().min(3, "El nombre de la tienda debe tener al menos 3 caracteres"),
    store_address: z.string().min(5, "La dirección de la tienda debe tener al menos 5 caracteres"),
    store_phone: z.string().min(7, "El teléfono de la tienda debe tener al menos 7 caracteres").regex(/^[0-9+]+$/, "El teléfono solo debe contener números"),
});

const formSteps = [
    {
        title: "Información del Usuario",
        fields: ["nombres_apellidos", "correo_electronico", "telefono_usuario", "fecha_nacimiento", "direccion_usuario"]
    },
    {
        title: "Información de la Empresa",
        fields: ["nombreEmpresa", "nit", "address", "phone", "email"]
    },
    {
        title: "Configuración de la Tienda",
        fields: ["store_name", "store_address", "store_phone"]
    },
    {
        title: "Configuración DIAN",
        fields: ["modo_prueba", "certificado", "clave_tecnica", "id_software", "pin_software",
            "numero_resolucion", "fecha_resolucion", "fecha_inicio_resolucion", "fecha_fin_resolucion",
            "prefijo_resolucion", "desde_resolucion", "hasta_resolucion"]
    }
];

export function CreateInventoryForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombres_apellidos: "",
            correo_electronico: "",
            telefono_usuario: "",
            fecha_nacimiento: "",
            direccion_usuario: "",
            nombreEmpresa: "",
            nit: "",
            address: "",
            phone: "",
            email: "",
            store_name: "Tienda Principal",
            store_address: "",
            store_phone: "",
        },
    });

    const progress = ((currentStep + 1) / formSteps.length) * 100;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const response = await axios.post("/api/inventory/create", values);

            if (response.data.companyName && response.data.storeId) {
                router.push(`/inventory/${response.data.companyName}/dashboard`);
                toast.success("Empresa registrada exitosamente");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            console.error("Error creating inventory:", error);
            toast.error(error.response?.data || "Error al registrar la empresa");
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
                [field]: formSchema.shape[field]
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
                name={fieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldName.replace(/_/g, " ").charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, " ")}</FormLabel>
                        <FormControl>
                            <Input
                                type={fieldName.includes("fecha") ? "date" :
                                    fieldName === "modo_prueba" ? "checkbox" :
                                        fieldName.includes("resolucion") && fieldName.startsWith("desde") ? "number" :
                                            fieldName.includes("resolucion") && fieldName.startsWith("hasta") ? "number" :
                                                "text"}
                                placeholder={`Ingrese ${fieldName.replace(/_/g, " ")}`}
                                {...field}
                                value={fieldName === "modo_prueba" ? field.value : field.value || ""}
                                onChange={e => {
                                    if (fieldName === "modo_prueba") {
                                        field.onChange(e.target.checked);
                                    } else if (fieldName.includes("resolucion") && (fieldName.startsWith("desde") || fieldName.startsWith("hasta"))) {
                                        field.onChange(e.target.value ? parseInt(e.target.value) : "");
                                    } else {
                                        field.onChange(e.target.value);
                                    }
                                }}
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

