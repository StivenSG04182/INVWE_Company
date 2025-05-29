"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Save,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MovementRegistrationProps {
  agencyId: string;
  type?: "entrada" | "salida" | "transferencia";
  productId?: string;
  products: any[];
  areas: any[];
  subaccountId?: string;
}

export default function MovementRegistration({
  agencyId,
  type = "entrada",
  productId,
  products,
  areas,
  subaccountId,
}: MovementRegistrationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [subaccounts, setSubaccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    type: type,
    productId: productId || "",
    areaId: "",
    subaccountId: subaccountId || "",
    destinationAreaId: "",
    quantity: 1,
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [stockStatus, setStockStatus] = useState<
    "bajo" | "normal" | "alto" | null
  >(null);
  const [stockPercentage, setStockPercentage] = useState<number | null>(null);
  const [showStockAlert, setShowStockAlert] = useState(false);

  // Cargar tiendas al montar o cuando cambie agencyId
  useEffect(() => {
    async function fetchSubaccounts() {
      try {
        const { getSubAccountsForAgency } = await import("@/lib/queries2");
        const result = await getSubAccountsForAgency(agencyId);
        setSubaccounts(result || []);
      } catch (error) {
        setSubaccounts([]);
      }
    }
    if (agencyId) fetchSubaccounts();
  }, [agencyId]);

  // Actualizar el tipo de movimiento cuando cambia el prop
  useEffect(() => {
    setFormData((prev) => ({ ...prev, type }));
  }, [type]);

  // Actualizar el producto cuando cambia el prop
  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({ ...prev, productId }));
      // Buscar el producto seleccionado y calcular su estado de stock
      const selectedProduct = products.find((p) => p.id === productId);
      if (selectedProduct) {
        calculateStockStatus(selectedProduct);
      }
    }
  }, [productId, products]);

  // Calcular el estado del stock cuando cambia el producto seleccionado
  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find((p) => p.id === formData.productId);
      if (selectedProduct) {
        calculateStockStatus(selectedProduct);
      }
    }
  }, [formData.productId, products]);

  // Función para calcular el estado del stock
  const calculateStockStatus = (product: any) => {
    // Obtener el stock total del producto sumando todas las áreas
    const totalStock = product.stocks
      ? product.stocks.reduce(
          (total: number, stock: any) => total + stock.quantity,
          0
        )
      : 0;

    // Calcular el porcentaje respecto al stock mínimo
    const minStock = product.minStock || 0;

    // Si no hay stock mínimo definido, no podemos calcular un porcentaje
    if (minStock <= 0) {
      setStockStatus(null);
      setStockPercentage(null);
      setShowStockAlert(false);
      return;
    }

    const percentage = (totalStock / minStock) * 100;
    setStockPercentage(percentage);

    // Determinar el estado del stock según los criterios
    if (percentage <= 10 || totalStock <= 10) {
      setStockStatus("bajo");
      setShowStockAlert(true);
    } else if (percentage >= 75) {
      setStockStatus("alto");
      setShowStockAlert(false);
    } else {
      setStockStatus("normal");
      setShowStockAlert(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando proceso de registro de movimiento");

    // Obtener el producto seleccionado al inicio
    const selectedProduct = products.find((p) => p.id === formData.productId);

    if (!formData.productId) {
      console.log("Error: No se seleccionó un producto");
      toast({
        title: "Error",
        description: "Debe seleccionar un producto",
        variant: "destructive",
      });
      return;
    }

    if (!formData.areaId) {
      console.log("Error: No se seleccionó un área");
      toast({
        title: "Error",
        description: "Debe seleccionar un área",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "transferencia" && !formData.destinationAreaId) {
      console.log(
        "Error: No se seleccionó un área de destino para la transferencia"
      );
      toast({
        title: "Error",
        description: "Debe seleccionar un área de destino",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity <= 0) {
      console.log("Error: La cantidad debe ser mayor a cero");
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a cero",
        variant: "destructive",
      });
      return;
    }

    // Validar que haya tienda seleccionada y que exista en la lista
    if (!formData.subaccountId || !subaccounts.some(sa => sa.id === formData.subaccountId)) {
      toast({
        title: "Error",
        description: "Debe seleccionar una tienda válida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("Validaciones completadas, iniciando proceso de guardado");

    try {
        // Importar la función createMovement de queries2.ts
        console.log("Importando createMovement...");
        const { createMovement } = await import("@/lib/queries2");
        console.log("createMovement importado correctamente");

        // El subaccountId debe ser el seleccionado por el usuario, nunca agencyId
        const finalSubaccountId = formData.subaccountId;
        console.log("subaccountId final que se utilizará:", finalSubaccountId);

        // Crear el objeto de movimiento
        const movementData = {
          type: formData.type,
          productId: formData.productId,
          areaId: formData.areaId,
          destinationAreaId:
            formData.type === "transferencia"
              ? formData.destinationAreaId
              : undefined,
          quantity: formData.quantity,
          notes: formData.notes,
          date: new Date(formData.date),
          agencyId: agencyId,
          subaccountId: finalSubaccountId,
        };

        console.log(
          "Datos del movimiento a registrar:",
          JSON.stringify(movementData, null, 2)
        );

        // Verificar que todos los campos requeridos estén presentes
        const camposRequeridos = [
          "type",
          "productId",
          "areaId",
          "quantity",
          "agencyId",
          "subaccountId",
        ];
        const camposFaltantes = camposRequeridos.filter(
          (campo) => !movementData[campo]
        );

        if (camposFaltantes.length > 0) {
          console.error("ALERTA: Faltan campos requeridos:", camposFaltantes);
        }

        // Verificar el formato de la fecha
        console.log("Formato de fecha:", {
          original: formData.date,
          tipo: typeof formData.date,
          esValido: !isNaN(new Date(formData.date).getTime()),
        });

        // Guardar el movimiento en la base de datos
        console.log("Llamando a createMovement...");
        let result;
        try {
            result = await createMovement(movementData);
            console.log("Movimiento registrado exitosamente:", result);

            toast({
                title: "Movimiento registrado",
                description: `Se ha registrado correctamente la ${formData.type} de ${formData.quantity} unidades.`,
            });

            // Redirigir a la página de inventario
            console.log("Redirigiendo a la página de productos");
            router.push(`/agency/${agencyId}/products`);

        } catch (movementError) {
            console.error("Error específico al crear el movimiento:", movementError);
            console.log("Mensaje de error:", movementError.message);
            console.log("Stack trace:", movementError.stack);
            throw movementError;
        }

    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        
        // Mostrar mensaje específico según el tipo de error
        let errorMessage = "No se pudo registrar el movimiento.";
        
        if (error instanceof Error) {
            switch (error.message) {
                case 'Stock insuficiente':
                    errorMessage = "No hay suficiente stock disponible para realizar esta operación.";
                    break;
                case 'Stock insuficiente en el área de origen':
                    errorMessage = "No hay suficiente stock en el área de origen para realizar la transferencia.";
                    break;
                case 'El área de origen y destino no pueden ser la misma':
                    errorMessage = "El área de origen y destino deben ser diferentes para una transferencia.";
                    break;
                case 'Se requiere un área de destino para las transferencias':
                    errorMessage = "Debe seleccionar un área de destino para la transferencia.";
                    break;
                default:
                    errorMessage = error.message || "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.";
            }
        }

        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  // Obtener el título y el icono según el tipo de movimiento
  const getMovementInfo = () => {
    switch (formData.type) {
      case "entrada":
        return {
          title: "Registrar Entrada de Inventario",
          description: "Añadir productos al inventario",
          icon: <ArrowDownToLine className="h-5 w-5 text-green-500" />,
          color: "text-green-500",
        };
      case "salida":
        return {
          title: "Registrar Salida de Inventario",
          description: "Retirar productos del inventario",
          icon: <ArrowUpFromLine className="h-5 w-5 text-red-500" />,
          color: "text-red-500",
        };
      case "transferencia":
        return {
          title: "Registrar Transferencia de Inventario",
          description: "Mover productos entre áreas",
          icon: <ArrowLeftRight className="h-5 w-5 text-blue-500" />,
          color: "text-blue-500",
        };
      default:
        return {
          title: "Registrar Movimiento de Inventario",
          description: "Gestionar el inventario",
          icon: <Package className="h-5 w-5" />,
          color: "text-primary",
        };
    }
  };

  const movementInfo = getMovementInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/agency/${agencyId}/products`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inventario
          </Link>
        </Button>
      </div>

      {showStockAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stock Bajo</AlertTitle>
          <AlertDescription>
            El producto seleccionado tiene un nivel de stock bajo (
            {stockPercentage !== null ? Math.round(stockPercentage) : 0}% del
            mínimo recomendado). Se recomienda realizar una entrada de
            inventario pronto.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-muted ${movementInfo.color}`}>
              {movementInfo.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle>{movementInfo.title}</CardTitle>
                {stockStatus && (
                  <Badge
                    variant={
                      stockStatus === "bajo"
                        ? "destructive"
                        : stockStatus === "alto"
                        ? "default"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    Stock{" "}
                    {stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}
                  </Badge>
                )}
              </div>
              <CardDescription>{movementInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Movimiento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                      <SelectItem value="transferencia">
                        Transferencia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId">Producto</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => handleChange("productId", value)}
                  >
                    <SelectTrigger id="productId">
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => {
                        // Calcular el estado del stock para mostrar indicadores visuales
                        const totalStock = product.stocks
                          ? product.stocks.reduce(
                              (total: number, stock: any) =>
                                total + stock.quantity,
                              0
                            )
                          : 0;
                        const minStock = product.minStock || 0;
                        const percentage =
                          minStock > 0 ? (totalStock / minStock) * 100 : null;

                        let stockIndicator = "";
                        if (percentage !== null) {
                          if (percentage <= 10 || totalStock <= 10) {
                            stockIndicator = "🔴"; // Stock bajo
                          } else if (percentage >= 75) {
                            stockIndicator = "🟢"; // Stock alto
                          } else {
                            stockIndicator = "🟡"; // Stock normal
                          }
                        }

                        return (
                          <SelectItem key={product.id} value={product.id}>
                            {stockIndicator} {product.name}{" "}
                            {product.sku ? `(${product.sku})` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaId">
                    {formData.type === "transferencia"
                      ? "Área de Origen"
                      : "Área"}
                  </Label>
                  <Select
                    value={formData.areaId}
                    onValueChange={(value) => handleChange("areaId", value)}
                  >
                    <SelectTrigger id="areaId">
                      <SelectValue placeholder="Seleccione un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subaccountId">Tienda *</Label>
                  <Select
                    value={formData.subaccountId}
                    onValueChange={(value) =>
                      handleSelectChange("subaccountId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tienda" />
                    </SelectTrigger>
                    <SelectContent>
                      {subaccounts.length > 0 ? (
                        subaccounts.map((subaccount) => (
                          <SelectItem key={subaccount.id} value={subaccount.id}>
                            {subaccount.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-subaccounts" disabled>
                          No hay tiendas disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {subaccounts.length === 0 && (
                    <p className="text-sm text-destructive mt-1">
                      No hay tiendas disponibles. Debes crear una tienda
                      antes de continuar.
                    </p>
                  )}
                </div>

                {formData.type === "transferencia" && (
                  <div className="space-y-2">
                    <Label htmlFor="destinationAreaId">Área de Destino</Label>
                    <Select
                      value={formData.destinationAreaId}
                      onValueChange={(value) =>
                        handleChange("destinationAreaId", value)
                      }
                    >
                      <SelectTrigger id="destinationAreaId">
                        <SelectValue placeholder="Seleccione un área de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas
                          .filter((area) => area.id !== formData.areaId)
                          .map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleChange(
                        "quantity",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Detalles adicionales sobre este movimiento..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/agency/${agencyId}/products`)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || subaccounts.length === 0}>
                {loading ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Movimiento
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
