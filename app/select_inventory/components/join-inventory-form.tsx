"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
    nombreEmpresa: z.string().min(1, "Debe seleccionar una empresa"),
    nit: z
        .string()
        .min(9, "El NIT debe tener al menos 9 caracteres")
        .regex(/^\d{9}-\d$/, "El NIT debe tener el formato: 900123456-7"),
    codigoSeguridad: z.string().min(6, "El código debe tener al menos 6 caracteres"),
});

interface JoinInventoryFormProps { }

export function JoinInventoryForm({ }: JoinInventoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<"error" | "success" | null>(null);
    const [companies, setCompanies] = useState<Array<{ _id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get("/api/companies/list");
                if (response.data && Array.isArray(response.data)) {
                    setCompanies(response.data);
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
                toast.error("Error al cargar las empresas");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombreEmpresa: "",
            nit: "",
            codigoSeguridad: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            setFeedback(null);

            console.log("Submitting values:", values);

            const response = await axios.post("/api/inventory/join", {
                nombreEmpresa: values.nombreEmpresa.trim(),
                nit: values.nit.trim(),
                codigoSeguridad: values.codigoSeguridad.trim(),
            });

            // En este flujo la respuesta debe indicar que la solicitud está en estado pending.
            if (response.data?.status === "pending") {
                toast.success("Tu solicitud está pendiente de aprobación por un administrador.");
                setFeedback("Tu solicitud está pendiente de aprobación por un administrador.");
                setFeedbackType("success");
                // Opcional: redirigir a una página de "pending-approval" o similar.
                router.push("/pending-approval");
            } else {
                throw new Error("Respuesta inválida del servidor");
            }
        } catch (error: any) {
            console.error("Error joining inventory:", error);
            let errorMsg = "Error al enviar la solicitud";
            if (error.response?.data) {
                if (typeof error.response.data === "string") {
                    errorMsg = error.response.data;
                } else if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        errorMsg = `${err.field}: ${err.message}`;
                    });
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            toast.error(errorMsg);
            setFeedback(errorMsg);
            setFeedbackType("error");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <div>Cargando empresas...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nombreEmpresa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {field.value
                                            ? companies.find((company) => company.name === field.value)?.name
                                            : "Seleccionar empresa..."}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Buscar empresa..."
                                            className="h-9"
                                            value={searchTerm}
                                            onValueChange={setSearchTerm}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No se encontraron empresas.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredCompanies.map((company) => (
                                                    <CommandItem
                                                        key={company._id}
                                                        value={company.name}
                                                        onSelect={(currentValue) =>
                                                            field.onChange(currentValue === field.value ? "" : currentValue)
                                                        }
                                                    >
                                                        {company.name}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                field.value === company.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="nit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIT</FormLabel>
                            <FormControl>
                                <Input placeholder="900123456-7" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="codigoSeguridad"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de Seguridad</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Ingrese el código de 6+ caracteres" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Procesando..." : "Unirse al Inventario"}
                </Button>

                {feedback && (
                    <p className={`mt-4 text-center ${feedbackType === "error" ? "text-red-600" : "text-green-600"}`}>
                        {feedback}
                    </p>
                )}
            </form>
        </Form>
    );
}
