"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, ArrowLeft, Trash2, DollarSign, Barcode, Tag, ImageIcon, Info, Box, Percent, Layers, FileText, Settings, Plus, X, Save, Globe, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { createCategory, createProduct, getSubAccountsForAgency, getProviders, getCategories, getAreas } from "@/lib/queries2";

interface ProductFormProps {
  agencyId: string;
  product?: {
    _id?: string;
    name: string;
    description?: string;
    sku: string;
    barcode?: string;
    price: number;
    cost?: number;
    minStock?: number;
    images?: string[];
    productImage?: string;
    subAccountId?: string;
    categoryId?: string;
    brand?: string;
    model?: string;
    tags?: string[];
    unit?: string;
    quantity?: number;
    locationId?: string;
    warehouseId?: string;
    batchNumber?: string;
    expirationDate?: string;
    serialNumber?: string;
    warrantyMonths?: number;
    isReturnable?: boolean;
    active?: boolean;
    discount?: number;
    discountStartDate?: string;
    discountEndDate?: string;
    discountMinimumPrice?: number;
    taxRate?: number;
    supplierId?: string;
    variants?: Array<{
      name: string;
      value: string;
    }>;
    documents?: string[];
    customFields?: Record<string, any>;
    externalIntegrations?: Record<string, string>;
  };
  isEditing?: boolean;
}

export default function ProductFormFixed({
  agencyId,
  product,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");
  const [hasDiscountDates, setHasDiscountDates] = useState(false);  const [hasMinimumPrice, setHasMinimumPrice] = useState(false);
  const [invalidFields, setInvalidFields] = useState<{[key: string]: boolean}>({});
  const [tabsWithErrors, setTabsWithErrors] = useState<{[key: string]: boolean}>({});
  const [areas, setAreas] = useState<any[]>([]);;
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price?.toString() || "0",
    cost: product?.cost?.toString() || "0",
    minStock: product?.minStock?.toString() || "0",
    images: product?.images || [],
    subaccountId: product?.subAccountId || "",
    categoryId: product?.categoryId || "no-category",
    brand: product?.brand || "",
    model: product?.model || "",
    tags: product?.tags || [],
    unit: product?.unit || "pieza",
    quantity: product?.quantity?.toString() || "0",
    locationId: product?.locationId || "",
    warehouseId: product?.warehouseId || "no-area",
    batchNumber: product?.batchNumber || "",
    expirationDate: product?.expirationDate ? new Date(product.expirationDate).toISOString().split('T')[0] : "",
    serialNumber: product?.serialNumber || "",
    warrantyMonths: product?.warrantyMonths?.toString() || "",
    isReturnable: product?.isReturnable || false,
    isActive: product?.active !== false,
    discount: product?.discount?.toString() || "0",
    discountStartDate: product?.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : "",
    discountEndDate: product?.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : "",
    discountMinimumPrice: product?.discountMinimumPrice?.toString() || "",
    taxRate: product?.taxRate?.toString() || "0",
    supplierId: product?.supplierId || "no-supplier",
    variants: product?.variants || [],
    documents: product?.documents || [],
    customFields: product?.customFields || {},
    externalIntegrations: product?.externalIntegrations || {},
  });

  useEffect(() => {
    if (product) {
      setHasDiscountDates(
        !!product.discountStartDate || !!product.discountEndDate
      );
      setHasMinimumPrice(!!product.discountMinimumPrice);
    }
  }, [product]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subaccountsData = await getSubAccountsForAgency(agencyId);
        if (subaccountsData) {
          setSubaccounts(subaccountsData);
        }
        const categoriesData = await getCategories(agencyId);
        if (categoriesData) {
          setCategories(categoriesData);
        }
        const providersData = await getProviders(agencyId);
        if (providersData) {
          setProviders(providersData || []);
        } else {
          console.error(
            "Error al cargar proveedores: No se encontraron proveedores"
          );
        }
      } catch (error) {
      }
    };

    fetchData();
  }, [agencyId, toast]);

  // Efecto para cargar áreas cuando se seleccione una tienda
  useEffect(() => {
    const loadAreas = async () => {
      if (formData.subaccountId) {
        try {
          const areasData = await getAreas(agencyId, formData.subaccountId);
          if (areasData && Array.isArray(areasData)) {
            setAreas(areasData);
          } else {
            console.error("Error al cargar áreas: No se encontraron áreas");
          }
        } catch (error) {
          console.error("Error al cargar áreas:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar las áreas disponibles.",
          });
        }
      } else {
        setAreas([]);
      }
    };

    loadAreas();
  }, [agencyId, formData.subaccountId, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "cost" ||
        name === "minStock" ||
        name === "quantity" ||
        name === "warrantyMonths" ||
        name === "discount" ||
        name === "discountMinimumPrice" ||
        name === "taxRate"
          ? Number.parseFloat(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addVariant = () => {
    if (newVariantName.trim() && newVariantValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        variants: [
          ...prev.variants,
          { name: newVariantName.trim(), value: newVariantValue.trim() },
        ],
      }));
      setNewVariantName("");
      setNewVariantValue("");
    }
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };
  // Función para crear categoría usando la función de queries2.ts
  const createCategoryAction = async () => {
    if (!newCategory.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "El nombre de la categoría no puede estar vacío."
      });
      return;
    }

    try {
      const result = await createCategory({
        name: newCategory.trim(),
        description: "",
        agencyId: agencyId,
        subaccountId: formData.subaccountId,
      });

      if (result) {
        // Actualizar la lista de categorías
        const updatedCategories = await getCategories(agencyId);
        setCategories(updatedCategories);

        // Actualizar el formulario con la nueva categoría
        setFormData((prev) => ({
          ...prev,
          categoryId: result.id,
        }));

        setNewCategory("");

        toast({
          title: "Categoría creada",
          description: `La categoría "${newCategory}" ha sido creada exitosamente.`,
        });

        // Limpiar el estado de error si existe
        if (invalidFields.categoryId) {
          setInvalidFields(prev => ({
            ...prev,
            categoryId: false
          }));
        }
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al crear la categoría. Inténtalo de nuevo."
      });
    }
  };

  // Función para crear proveedor usando server action
  const createProviderAction = async () => {
    if (!newProvider.trim()) return;

    try {
      const { createProvider } = await import("@/lib/queries2");

      const result = await createProvider({
        name: newProvider,
        contactName: "",
        email: "",
        phone: "",
        address: "",
        active: true,
        agencyId: agencyId,
        subaccountId: formData.subaccountId,
      });

      if (result) {
        toast({
          title: "Proveedor creado",
          description: `El proveedor ${newProvider} ha sido creado exitosamente.`,
        });
        setProviders([...providers, result]);
        setFormData((prev) => ({
          ...prev,
          supplierId: result.id,
        }));
        setNewProvider("");
      }
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Hubo un problema al crear el proveedor. Inténtalo de nuevo.",
      });
    }
  };

  const validateFormValues = () => {
    const number = (value: string | number) => typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    return {
      ...formData,
      price: number(formData.price),
      cost: number(formData.cost),
      quantity: number(formData.quantity),
      taxRate: number(formData.taxRate),
      minStock: number(formData.minStock)
    };
  };

  const calculateDiscountedPrice = () => {
    const values = validateFormValues();
    if (!values.price || !values.discount) return values.price;

    const discountedPrice = values.price * (1 - Number(values.discount) / 100);

    // Si hay un precio mínimo configurado, no permitir que el precio baje de ese valor
    if (hasMinimumPrice && Number(formData.discountMinimumPrice) > 0) {
      return Math.max(discountedPrice, Number(formData.discountMinimumPrice));
    }

    return discountedPrice;
  };

  const calculateProfit = () => {
    const values = validateFormValues();
    if (!values.price || !values.cost) return 0;
    return values.price - values.cost;
  };

  const calculateMargin = () => {
    const values = validateFormValues();
    if (!values.price || !values.cost) return 0;
    return ((values.price - values.cost) / values.price) * 100;
  };    const validateRequiredFields = () => {
    const requiredFields: FormValidation = {
      name: { value: formData.name, tab: "general" },
      subaccountId: { value: formData.subaccountId, tab: "general" },
      description: { value: formData.description, tab: "general" },
      sku: { value: formData.sku, tab: "general" },
      unit: { value: formData.unit, tab: "general" },
      categoryId: { value: formData.categoryId, tab: "general", invalidValues: ["no-category"] },
      price: { value: formData.price, tab: "pricing" },
      cost: { value: formData.cost, tab: "pricing" },
      supplierId: { value: formData.supplierId, tab: "pricing", invalidValues: ["no-supplier"] },
      minStock: { value: formData.minStock, tab: "inventory" },
      quantity: { value: formData.quantity, tab: "inventory" },
      warehouseId: { value: formData.warehouseId, tab: "inventory", invalidValues: ["no-area"] }
    };const newInvalidFields: {[key: string]: boolean} = {};
    const newTabsWithErrors: {[key: string]: boolean} = {};
    const missingFields: string[] = [];

    for (const [fieldName, field] of Object.entries(requiredFields)) {      const invalidValues = field.invalidValues || [];
      const isInvalid = !field.value || 
                       field.value === "" || 
                       (typeof field.value === 'string' && invalidValues.includes(field.value));
                       
      newInvalidFields[fieldName] = isInvalid;
      if (isInvalid) {
        newTabsWithErrors[field.tab] = true;
        missingFields.push(fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1').trim());
      }
    }

    setInvalidFields(newInvalidFields);
    setTabsWithErrors(newTabsWithErrors);

    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos requeridos faltantes",
        description: `Por favor complete los siguientes campos: ${missingFields.join(", ")}`,
      });
      return false;
    }

    return true;
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateRequiredFields()) {
      setIsLoading(false);
      return;
    }

    try {
      // Importar las funciones del servidor dinámicamente
      const { createProduct, updateProduct, createMovement } = await import(
        "@/lib/queries2"
      );

      const initialQuantity = parseInt(formData.quantity);

      // Preparar los datos del formulario asegurando que los valores numéricos son números
      const preparedData = {
        ...formData,
        agencyId,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        minStock: parseInt(formData.minStock) || 0,
        quantity: initialQuantity || 0,
        warrantyMonths: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : null,
        discount: parseFloat(formData.discount) || 0,
        discountMinimumPrice: formData.discountMinimumPrice ? parseFloat(formData.discountMinimumPrice) : null,
        taxRate: parseFloat(formData.taxRate) || 0,
        // Asegurarse de que las fechas sean objetos Date válidos
        discountStartDate: formData.discountStartDate ? new Date(formData.discountStartDate).toISOString() : null,
        discountEndDate: formData.discountEndDate ? new Date(formData.discountEndDate).toISOString() : null,
        // Manejar valores especiales
        categoryId: formData.categoryId === "no-category" ? null : formData.categoryId,
        supplierId: formData.supplierId === "no-supplier" ? null : formData.supplierId,
        warehouseId: formData.warehouseId === "no-area" ? null : formData.warehouseId,
        // Asegurar que los arrays estén inicializados
        images: formData.images || [],
        tags: formData.tags || [],
        variants: formData.variants || [],
        documents: formData.documents || [],
        // Asegurar que los objetos estén inicializados
        customFields: formData.customFields || {},
        externalIntegrations: formData.externalIntegrations || {}
      };

      let result;

      if (isEditing && product?._id) {
        // Actualizar producto existente
        result = await updateProduct(product._id, preparedData);
      } else {
        // Crear nuevo producto
        result = await createProduct(preparedData);

        // Crear movimiento inicial si es necesario
        if (result && initialQuantity > 0) {
          try {
            await createMovement({
              type: "entrada",
              quantity: initialQuantity,
              notes: "Stock inicial al crear el producto",
              productId: result.id,
              areaId: formData.locationId || formData.warehouseId || "default-area",
              agencyId: agencyId,
              subaccountId: formData.subaccountId,
            });
          } catch (movementError) {
            console.error("Error al registrar el movimiento inicial:", movementError);
            // No interrumpimos el flujo si falla el registro del movimiento
          }
        }
      }

      if (result) {
        // Si es un producto nuevo y tiene cantidad inicial, crear un registro de movimiento usando server action      const values = validateFormValues();      const initialQuantity = parseInt(formData.quantity);
      if (!isEditing && initialQuantity > 0 && result) {
        try {
          await createMovement({
            type: "entrada",
            quantity: initialQuantity,
            notes: "Stock inicial al crear el producto",
            productId: result.id,
            areaId: formData.locationId || formData.warehouseId || "default-area",
            agencyId: agencyId,
            subaccountId: formData.subaccountId,
          });
          } catch (movementError) {
            console.error(
              "Error al registrar el movimiento de stock inicial:",
              movementError
            );
            // No interrumpimos el flujo si falla el registro del movimiento
          }
        }

        toast({
          title: isEditing ? "Producto actualizado" : "Producto creado",
          description: `El producto ${formData.name} ha sido ${
            isEditing ? "actualizado" : "creado"
          } exitosamente.`,
        });
        router.refresh();
        router.push(
          `/agency/${agencyId}/products/${isEditing ? product?._id : result.id}`
        );
      } else {
        throw new Error("Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Hubo un problema al guardar el producto. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container max-w-7xl mx-auto pb-10">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h1>
        {isEditing && (
          <Badge variant="outline" className="ml-4">
            ID: {product?._id?.substring(0, 8)}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Columna izquierda - Imágenes y estado */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Imágenes
                </CardTitle>
                <CardDescription>
                  Agrega imágenes para mostrar tu producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md overflow-hidden border bg-muted/20"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Producto ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.images.length === 0 && (
                      <div className="col-span-2 aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/20">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>Sin imágenes</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Cargando imagen...</span>
                      </div>
                    )}
                    <UploadButton
                      endpoint="media"
                      onUploadBegin={() => {
                        setIsUploading(true);
                        toast({
                          title: "Subiendo imagen",
                          description:
                            "Por favor espere mientras se sube la imagen...",
                        });
                      }}
                      onClientUploadComplete={(res) => {
                        setIsUploading(false);
                        if (res && res.length > 0) {
                          setFormData((prev) => ({
                            ...prev,
                            images: [
                              ...prev.images,
                              ...res.map((file) => file.url),
                            ],
                          }));
                          toast({
                            title: "Imagen subida",
                            description:
                              "La imagen se ha subido correctamente.",
                          });
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploading(false);
                        console.error("Error de carga:", error);
                        toast({
                          variant: "destructive",
                          title: "Error al subir imagen",
                          description: error.message,
                        });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="h-5 w-5 mr-2" />
                  Estado del Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Producto Activo</Label>
                      <p className="text-sm text-muted-foreground">
                        Los productos inactivos no se muestran en el catálogo
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("isActive", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isReturnable">Producto Retornable</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite devoluciones de este producto
                      </p>
                    </div>
                    <Switch
                      id="isReturnable"
                      checked={formData.isReturnable}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("isReturnable", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Información del producto */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="general" className="relative">
                  General
                  {tabsWithErrors.general && (
                    <AlertCircle className="w-4 h-4 text-destructive absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="pricing" className="relative">
                  Precios
                  {tabsWithErrors.pricing && (
                    <AlertCircle className="w-4 h-4 text-destructive absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="inventory" className="relative">
                  Inventario
                  {tabsWithErrors.inventory && (
                    <AlertCircle className="w-4 h-4 text-destructive absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="variants">Variantes</TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
              </TabsList>

              {/* Pestaña de Información General */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Información General
                    </CardTitle>
                    <CardDescription>
                      Datos básicos para identificar tu producto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className={invalidFields.name ? "text-destructive" : ""}>
                          Nombre del Producto *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ej. Camiseta de algodón"
                          required
                          className={invalidFields.name ? "border-destructive" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subaccountId" className={invalidFields.subaccountId ? "text-destructive" : ""}>
                          Tienda *
                        </Label>
                        <Select
                          value={formData.subaccountId}
                          onValueChange={(value) => handleSelectChange("subaccountId", value)}
                          required
                        >
                          <SelectTrigger className={invalidFields.subaccountId ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccionar tienda" />
                          </SelectTrigger>
                          <SelectContent>
                            {subaccounts.length > 0 ? (
                              subaccounts.map((subaccount) => (
                                <SelectItem
                                  key={subaccount.id}
                                  value={subaccount.id}
                                >
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
                        {invalidFields.subaccountId && (
                          <p className="text-sm text-destructive">
                            Este campo es requerido
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className={invalidFields.description ? "text-destructive" : ""}>
                        Descripción *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe tu producto con detalle"
                        rows={3}
                        required
                        className={invalidFields.description ? "border-destructive" : ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku" className={`flex items-center ${invalidFields.sku ? "text-destructive" : ""}`}>
                          <Tag className="h-4 w-4 mr-2" />
                          SKU *
                        </Label>
                        <Input
                          id="sku"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder="Ej. CAM-001"
                          required
                          className={invalidFields.sku ? "border-destructive" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="barcode" className="flex items-center">
                          <Barcode className="h-4 w-4 mr-2" />
                          Código de Barras
                        </Label>
                        <Input
                          id="barcode"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleChange}
                          placeholder="Ej. 7501234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit" className={invalidFields.unit ? "text-destructive" : ""}>
                          Unidad de Medida *
                        </Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => handleSelectChange("unit", value)}
                          required
                        >
                          <SelectTrigger className={invalidFields.unit ? "border-destructive" : ""}>
                            <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pieza">Pieza</SelectItem>
                            <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                            <SelectItem value="g">Gramo (g)</SelectItem>
                            <SelectItem value="l">Litro (l)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                            <SelectItem value="m">Metro (m)</SelectItem>
                            <SelectItem value="cm">Centímetro (cm)</SelectItem>
                            <SelectItem value="m2">
                              Metro cuadrado (m²)
                            </SelectItem>
                            <SelectItem value="m3">
                              Metro cúbico (m³)
                            </SelectItem>
                            <SelectItem value="docena">Docena</SelectItem>
                            <SelectItem value="caja">Caja</SelectItem>
                            <SelectItem value="paquete">Paquete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          placeholder="Ej. Nike"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          placeholder="Ej. Air Max 90"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="categoryId" className={invalidFields.categoryId ? "text-destructive" : ""}>
                          Categoría *
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Nueva categoría"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-48"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={createCategoryAction}
                          >
                            Crear
                          </Button>
                        </div>
                      </div>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleSelectChange("categoryId", value)}
                        required
                      >
                        <SelectTrigger className={invalidFields.categoryId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-category">
                            Sin categoría
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Etiquetas</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {formData.tags.length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            No hay etiquetas
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nueva etiqueta"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag}>
                          Añadir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Precios */}
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Precios y Costos
                    </CardTitle>
                    <CardDescription>
                      Configura precios, costos e impuestos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className={invalidFields.price ? "text-destructive" : ""}>
                          Precio de Venta *
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            className={`pl-9 ${invalidFields.price ? "border-destructive" : ""}`}
                            required
                          />
                        </div>
                        {invalidFields.price && (
                          <p className="text-sm text-destructive">
                            Este campo es requerido
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost" className={invalidFields.cost ? "text-destructive" : ""}>
                          Costo *
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="cost"
                            name="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.cost}
                            onChange={handleChange}
                            className={`pl-9 ${invalidFields.cost ? "border-destructive" : ""}`}
                            required
                          />
                        </div>
                        {invalidFields.cost && (
                          <p className="text-sm text-destructive">
                            Este campo es requerido
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="taxRate"
                            name="taxRate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.taxRate}
                            onChange={handleChange}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    {parseFloat(formData.cost) > 0 && parseFloat(formData.price) > 0 && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground mb-1">
                              Ganancia
                            </div>
                            <div className="text-xl font-semibold">
                              ${calculateProfit().toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground mb-1">
                              Margen
                            </div>
                            <div className="text-xl font-semibold">
                              {calculateMargin().toFixed(2)}%
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground mb-1">
                              Precio con Impuesto
                            </div>
                            <div className="text-xl font-semibold">
                              $
                              {(                                parseFloat(formData.price) *
                                (1 + parseFloat(formData.taxRate) / 100)
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="supplierId" className={invalidFields.supplierId ? "text-destructive" : ""}>
                          Proveedor *
                        </Label>
                      </div>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(value) => handleSelectChange("supplierId", value)}
                        required
                      >
                        <SelectTrigger className={invalidFields.supplierId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-supplier">
                            Sin proveedor
                          </SelectItem>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Inventario */}
              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Box className="h-5 w-5 mr-2" />
                      Detalles de Inventario
                    </CardTitle>
                    <CardDescription>
                      Configura niveles de stock y ubicaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minStock" className={invalidFields.minStock ? "text-destructive" : ""}>
                          Stock Mínimo *
                        </Label>
                        <Input
                          id="minStock"
                          name="minStock"
                          type="number"
                          min="0"
                          value={formData.minStock}
                          onChange={handleChange}
                          className={invalidFields.minStock ? "border-destructive" : ""}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Cantidad mínima antes de alertar por bajo stock
                        </p>
                        {invalidFields.minStock && (
                          <p className="text-sm text-destructive">
                            Este campo es requerido
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity" className={invalidFields.quantity ? "text-destructive" : ""}>
                          Stock Inicial *
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={handleChange}
                          className={invalidFields.quantity ? "border-destructive" : ""}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Cantidad inicial en inventario
                        </p>
                      </div>                    <div className="space-y-2">
                      <Label htmlFor="warehouseId" className={invalidFields.warehouseId ? "text-destructive" : ""}>
                        Almacén *
                      </Label>
                      <Select
                        value={formData.warehouseId}
                        onValueChange={(value) => handleSelectChange("warehouseId", value)}
                        required
                      >
                        <SelectTrigger className={invalidFields.warehouseId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Seleccionar almacén" />
                        </SelectTrigger>                        <SelectContent>
                          {areas.length > 0 ? (
                            areas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-area" disabled>
                              {formData.subaccountId 
                                ? "No hay áreas disponibles para esta tienda" 
                                : "Primero selecciona una tienda"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {areas.length === 0 && formData.subaccountId && (
                        <p className="text-sm text-destructive mt-1">
                          No hay áreas disponibles. Debes crear un área en la tienda seleccionada antes de continuar.
                        </p>
                      )}
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="h-5 w-5 mr-2" />
                      Variantes del Producto
                    </CardTitle>
                    <CardDescription>
                      Configura diferentes variantes como color, tamaño, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="variantName">
                            Nombre de Variante
                          </Label>
                          <Input
                            id="variantName"
                            value={newVariantName}
                            onChange={(e) => setNewVariantName(e.target.value)}
                            placeholder="Ej. Color, Tamaño, Material"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variantValue">
                            Valor de Variante
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="variantValue"
                              value={newVariantValue}
                              onChange={(e) =>
                                setNewVariantValue(e.target.value)
                              }
                              placeholder="Ej. Rojo, XL, Algodón"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addVariant();
                                }
                              }}
                            />
                            <Button type="button" onClick={addVariant}>
                              Añadir
                            </Button>
                          </div>
                        </div>
                      </div>

                      {formData.variants.length > 0 ? (
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="w-[100px]">
                                  Acciones
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.variants.map((variant, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {variant.name}
                                  </TableCell>
                                  <TableCell>{variant.value}</TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeVariant(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-md">
                          <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay variantes
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Añade variantes para crear diferentes versiones del
                            producto
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Configuración Avanzada
                    </CardTitle>
                    <CardDescription>
                      Documentos y configuraciones adicionales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Documentos Adjuntos</Label>
                      <div className="border rounded-md p-4">
                        <div className="text-center py-4">
                          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay documentos
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Añade fichas técnicas, manuales u otros documentos
                            relacionados con el producto
                          </p>
                          <Button type="button" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Documento
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Campos Personalizados</Label>
                      <div className="border rounded-md p-4">
                        <div className="text-center py-4">
                          <Settings className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay campos personalizados
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Añade campos personalizados para almacenar
                            información adicional
                          </p>
                          <Button type="button" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Campo
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Integraciones Externas</Label>
                      <div className="border rounded-md p-4">
                        <div className="text-center py-4">
                          <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay integraciones
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Conecta este producto con sistemas externos como
                            tiendas online
                          </p>
                          <Button type="button" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Integración
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface RequiredField {
  value: string | number | boolean;
  tab: string;
  invalidValues?: string[];
}

interface FormValidation {
  [key: string]: RequiredField;
}
