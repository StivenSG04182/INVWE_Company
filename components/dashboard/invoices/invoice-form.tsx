"use client"

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'

export function InvoiceForm() {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  return (
    <div className="space-y-6 md:space-y-4">
      <Card className="p-4 md:p-6 border-t-2 border-b-2  border-solid border-gray-500">
        <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
        <div className="space-y-4">
          <div className="w-full">
            <Label htmlFor="clientId" className="block mb-2">Cliente</Label>
            <Select {...register("clientId")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Cargar lista de clientes */}
                <SelectItem value="1">Cliente 1</SelectItem>
                <SelectItem value="2">Cliente 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate" className="block mb-2">Fecha de Emisión</Label>
              <Input type="date" {...register("invoiceDate")} className="w-full" />
            </div>
            <div>
              <Label htmlFor="dueDate" className="block mb-2">Fecha de Vencimiento</Label>
              <Input type="date" {...register("dueDate")} className="w-full" />
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