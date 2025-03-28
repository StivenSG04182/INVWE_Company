"use client"

import * as React from 'react'
import { useFieldArray, useFormContext, useController } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Trash2, Plus } from 'lucide-react'

export function InvoiceForm() {
  const { register, control, watch, formState: { errors }, setValue, clearErrors } = useFormContext()
  const { field } = useController({
    name: 'isManualClient',
    control,
    defaultValue: false
  })

  const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
  }
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const isManualClient = watch("isManualClient")

  React.useEffect(() => {
    if (!isManualClient) {
      setValue("customer.name", "")
      setValue("customer.phone", "")
      setValue("customer.email", "")
      setValue("customer.address", "")
      clearErrors(["customer.name", "customer.phone", "customer.email", "customer.address", "customer.paymentMethod", "customer.paymentType"])
    } else {
      setValue("clientId", "")
      clearErrors("clientId")
    }
  }, [isManualClient, setValue, clearErrors])

  return (
    <div className="space-y-6 md:space-y-4">
      <Card className="p-4 md:p-6 border-t-2 border-b-2 border-solid border-gray-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Información del Cliente</h3>
          <div className="flex items-center space-x-2">
            <Label htmlFor="isManualClient">Cliente Manual</Label>
            <Switch
              id="isManualClient"
              checked={field.value}
              onCheckedChange={field.onChange}
              {...field}
            />
          </div>
        </div>

        <div className="space-y-4">
          {!isManualClient ? (
            <div className="w-full">
              <Label htmlFor="clientId" className="block mb-2">Cliente</Label>
              <Select {...register("clientId", { required: !isManualClient ? "Debe seleccionar un cliente" : false })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Cargar lista de clientes */}
                  <SelectItem value="1">Cliente 1</SelectItem>
                  <SelectItem value="2">Cliente 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm text-red-500 mt-1">{errors.clientId.message as string}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer.name" className="block mb-2">Nombre</Label>
                  <Input {...register("customer.name", { required: isManualClient ? "El nombre es requerido" : false })} className="w-full" />
                  {errors.customer?.name && <p className="text-sm text-red-500 mt-1">{errors.customer.name.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="customer.phone" className="block mb-2">Teléfono</Label>
                  <Input {...register("customer.phone", { required: isManualClient ? "El teléfono es requerido" : false })} className="w-full" />
                  {errors.customer?.phone && <p className="text-sm text-red-500 mt-1">{errors.customer.phone.message as string}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="customer.email" className="block mb-2">Email</Label>
                <Input type="email" {...register("customer.email", {
                  required: isManualClient ? "El email es requerido" : false,
                  validate: (value) => !value || validateEmail(value) || "Email inválido"
                })} className="w-full" />
                {errors.customer?.email && <p className="text-sm text-red-500 mt-1">{errors.customer.email.message as string}</p>}
              </div>
              <div>
                <Label htmlFor="customer.address" className="block mb-2">Dirección</Label>
                <Input {...register("customer.address", { required: isManualClient ? "La dirección es requerida" : false })} className="w-full" />
                {errors.customer?.address && <p className="text-sm text-red-500 mt-1">{errors.customer.address.message as string}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate" className="block mb-2">Fecha de Emisión</Label>
              <Input type="date" {...register("invoiceDate")} className="w-full" />
            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="block mb-2">Método de Pago</Label>
              <Select {...register("paymentMethod")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <Input {...register("customer.paymentType", { required: isManualClient ? "" : false })} className="w-full" />
                  {errors.customer?.paymentType && <p className="text-sm text-red-500 mt-1">{errors.customer.paymentType.message as string}</p>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentType" className="block mb-2">Tipo de Pago</Label>
              <Select {...register("paymentType")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contado">Contado</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <Input {...register("customer.paymentMethod", { required: isManualClient ? "" : false })} className="w-full" />
                  {errors.customer?.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.customer.paymentMethod.message as string}</p>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-4 gap-4 sm:gap-0">
          <h3 className="text-lg font-semibold">Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, taxRate: 0 })}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </div>

        <div className="space-y-6 md:space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border-t-2 border-dashed border-gray-500 bg-white rounded-lg p-4 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-end">
              <div className="lg:col-span-4 space-y-2">
                <Label className="block text-sm font-medium">Producto/Servicio</Label>
                <Select {...register(`items.${index}.productId`)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Cargar lista de productos */}
                    <SelectItem value="1">Producto 1</SelectItem>
                    <SelectItem value="2">Producto 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2 space-y-2">
                <Label className="block text-sm font-medium">Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`items.${index}.quantity`)}
                  className="w-full"
                />
              </div>
              <div className="lg:col-span-2 space-y-2">
                <Label className="block text-sm font-medium">Precio Unit.</Label>
                <Input
                  type="number"
                  min="0"
                  {...register(`items.${index}.unitPrice`)}
                  className="w-full"
                />
              </div>
              <div className="lg:col-span-2 space-y-2">
                <Label className="block text-sm font-medium">IVA %</Label>
                <Input
                  type="number"
                  min="0"
                  {...register(`items.${index}.taxRate`)}
                  className="w-full"
                />
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}