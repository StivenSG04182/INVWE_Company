"use client";
import { Agency } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { NumberInput } from "@tremor/react";
import Loading from "../global/loading";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotification,
  updateAgencyDetails,
  upsertAgency,
} from "@/lib/queries";
import { Button } from "../ui/button";
import { v4 } from "uuid";

type Props = {
  data?: Partial<Agency>;
};
const FormSchema = z.object({
  name: z.string().min(2, { message: "El nombre de la agencia debe tener al menos 2 caracteres." }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
});

const AgencyDetails = ({ data }: Props) => {
  console.log("Renderizando AgencyDetails");
  const { toast } = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || "",
      companyEmail: data?.companyEmail || "",
      companyPhone: data?.companyPhone || "",
      whiteLabel: data?.whiteLabel || false,
      address: data?.address || "",
      city: data?.city || "",
      zipCode: data?.zipCode || "",
      state: data?.state || "",
      country: data?.country || "",
      agencyLogo: data?.agencyLogo || "",
    },
  });

  useEffect(() => {
    if (data) {
      console.log("Datos de agencia recibidos:", data);
      form.reset(data);
    }
  }, [data]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      console.log("Iniciando handleSubmit con valores:", values);

      // Inicializar usuario
      const userData = await initUser({ role: "AGENCY_OWNER" });
      console.log("Usuario inicializado:", userData);

      if (!userData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo inicializar el usuario",
        });
        return;
      }

      // Crear o actualizar la agencia
      const response = await upsertAgency({
        id: data?.id ? data.id : v4(),
        customerId: "",
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: 5,
      });

      console.log("Respuesta de upsertAgency:", response);

      if (!response) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear la agencia",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Agencia creada correctamente",
      });

      if (data?.id) {
        router.refresh();
      } else {
        router.push(`/agency/${response.id}`);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!data?.id) return;
    setDeletingAgency(true);
    // WIP: discontinue the subscription
    try {
      const response = await deleteAgency(data.id);
      toast({
        title: "Agencia Eliminada",
        description: "Se eliminó tu agencia y todas las tiendas",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({ 
        variant:'destructive',
        title: "¡Ups!",
        description: "No se pudo eliminar tu agencia y todas las tiendas",
      });
    }
    setDeletingAgency(false);
  };
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Información de la Agencia</CardTitle>
          <CardDescription>
            Vamos a crear una agencia para tu negocio. Puedes editar la configuración de la agencia
            más tarde desde la pestaña de configuración de la agencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo de la Agencia</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nombre de la Agencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de tu agencia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Correo de la Agencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Correo electrónico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Teléfono de la Agencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                    <div>
                      <FormLabel>Agencia marca blanca</FormLabel>
                      <FormDescription>
                        Activar el modo white label mostrará el logo de tu agencia
                        a todas las tiendas por defecto. Puedes sobrescribir esta
                        funcionalidad a través de la configuración de la tienda.
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
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle 123..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Estado/Provincia</FormLabel>
                      <FormControl>
                        <Input placeholder="Estado/Provincia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="Código Postal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="País" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Crear un Objetivo</FormLabel>
                  <FormDescription>
                    ✨ Crea un objetivo para tu agencia. A medida que tu negocio crece
                    tus objetivos también crecen, ¡así que no olvides establecer el listón más alto!
                  </FormDescription>
                  <NumberInput
                    defaultValue={data?.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return;
                      await updateAgencyDetails(data.id, { goal: val });
                      await saveActivityLogsNotification({
                        agencyId: data.id,
                        description: `Actualizado el objetivo de la agencia a | ${val} Tiendas`,
                        subaccountId: undefined,
                      });
                      router.refresh();
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Objetivo de Tiendas"
                  />
                </div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loading /> : "Guardar Información de la Agencia"}
              </Button>
            </form>
          </Form>
          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Zona de Peligro</div>
              </div>
              <div className="text-muted-foreground">
                Eliminar tu agencia no se puede deshacer. Esto también eliminará todas
                las tiendas y todos los datos relacionados con tus tiendas. Las
                tiendas ya no tendrán acceso a embudos, contactos, etc.
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingAgency}
                className="text-red-600 p-2 text-center mt-2 rounded-md hove:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingAgency ? "Eliminando..." : "Eliminar Agencia"}
              </AlertDialogTrigger>
            </div>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                ¿Estás absolutamente seguro?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Esta acción no se puede deshacer. Esto eliminará permanentemente la
                cuenta de Agencia y todas las tiendas relacionadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteAgency}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
