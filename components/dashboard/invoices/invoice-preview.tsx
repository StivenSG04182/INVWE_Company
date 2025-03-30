"use client"

import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWatch, useFormContext } from 'react-hook-form';
import React from 'react';

interface InvoicePreviewProps {
  data: {
    items: Array<{
      productId: string
      code: string
      unit: string
      description: string
      quantity: number
      unitPrice: number | string
      taxRate: number
      discount?: number
    }>
    dianResolution: string
    cufe: string
    paymentMethod: string
    paymentType: string
    seller: string
    customer: {
      name: string
      address: string
      phone: string
      email: string
      paymentMethod: string
      paymentType: string
    }
  }
  loading: boolean
  company: {
    name?: string
    nit?: string
    phone?: string
    address?: string
    email?: string
  }
  params?: {
    companyName?: string
  }
}

export default React.memo(function InvoicePreview({ loading = false, company = {} }: Partial<InvoicePreviewProps> = {}) {
  const { control } = useFormContext();
  const formData = useWatch({ control });

  const calculateSubtotal = (quantity: number, unitPrice: number | string) => {
    const price = typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice
    return quantity * price
  }

  const calculateTax = (subtotal: number, taxRate: number) => {
    return subtotal * (taxRate / 100)
  }

  const calculateTotal = () => {
    return formData.items.reduce((total: number, item: { quantity: number, unitPrice: number | string, taxRate: number }) => {
      const subtotal = calculateSubtotal(item.quantity, item.unitPrice)
      const tax = calculateTax(subtotal, item.taxRate)
      return total + subtotal + tax
    }, 0)
  }

  return (
    <Card className="p-6 border-t-2 border-b-2 border-solid border-gray-500 h-full w-full flex flex-col">
      <div className="space-y-8 flex-grow overflow-y-auto w-full">
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">FACTURA ELECTRÓNICA DE VENTA</h2>
            <p className="text-lg text-gray-700">FET #{formData.cufe?.substring(0, 8)}</p>
            <p className="text-sm text-gray-600">Resolución DIAN N° {formData.dianResolution}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-gray-500">Fecha y Hora de Generación</p>
            <p className="font-semibold text-gray-900">{new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Datos de la Empresa</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Nombre:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : company?.name || "Nombre de la empresa"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">NIT:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : company?.nit || "NIT de la empresa"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Teléfono:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : company?.phone || "Teléfono de la empresa"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Dirección:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : company?.address || "Dirección de la empresa"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Fiscal</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">RESPONSABLE DE IVA</p>
              <p className="font-medium text-gray-900">Autorretenedor de ICA</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Datos del cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Nombre:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : formData.customer?.name || "Nombre del cliente"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Teléfono:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : formData.customer?.phone || "Teléfono"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Email:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : formData.customer?.email || "Correo electrónico"}
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-24 text-sm text-gray-500">Dirección:</p>
                <p className="font-medium text-gray-900">
                  {loading ? "Loading..." : formData.customer?.address || "Dirección"}
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="border rounded-lg bg-white overflow-hidden w-full">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="py-2 px-2">#</TableHead>
                <TableHead className="py-2 px-2">COD</TableHead>
                <TableHead className="py-2 px-2">UN</TableHead>
                <TableHead className="py-2 px-2">DESCP</TableHead>
                <TableHead className="py-2 px-2 text-right">CANT</TableHead>
                <TableHead className="py-2 px-2 text-right">V.UNIT</TableHead>
                <TableHead className="py-2 px-2 text-right">IVA</TableHead>
                <TableHead className="py-2 px-2 text-right">DESC</TableHead>
                <TableHead className="py-2 px-2 text-right">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item: { 
                productId: string;
                code: string;
                unit: string;
                description: string;
                quantity: number;
                unitPrice: number | string;
                taxRate: number;
                discount?: number;
              }, index: number) => {
                const subtotal = calculateSubtotal(item.quantity, item.unitPrice)
                const tax = calculateTax(subtotal, item.taxRate)
                const total = subtotal + tax

                return (
                  <TableRow key={index} className="text-xs">
                    <TableCell className="py-1 px-2">{index + 1}</TableCell>
                    <TableCell className="py-1 px-2">{item.code}</TableCell>
                    <TableCell className="py-1 px-2">{item.unit}</TableCell>
                    <TableCell className="py-1 px-2">{item.description}</TableCell>
                    <TableCell className="py-1 px-2 text-right">{item.quantity}</TableCell>
                    <TableCell className="py-1 px-2 text-right">
                      ${(typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-1 px-2 text-right">{item.taxRate}%</TableCell>
                    <TableCell className="py-1 px-2 text-right">${item.discount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="py-1 px-2 text-right">${total.toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end">
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ${formData.items.reduce((acc: number, item: { quantity: number, unitPrice: number | string }) => acc + calculateSubtotal(item.quantity, item.unitPrice), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">IVA Total:</span>
                  <span className="font-medium">
                    ${formData.items.reduce((acc: number, item: { quantity: number, unitPrice: number | string, taxRate: number }) => acc + calculateTax(calculateSubtotal(item.quantity, item.unitPrice), item.taxRate), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-8 border-t pt-4">
          <div className="grid grid-cols-2 gap-8 w-full">
            <div>
              <h4 className="font-semibold mb-2">Información de Pago</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Método de Pago:</span>
                  {loading ? "Loading..." : formData.customer?.paymentMethod || 'No especificado'}</p>
                <p><span className="font-medium">Tipo de Pago:</span>
                  {loading ? "Loading..." : formData.customer?.paymentType || 'No especificado'}</p>
                <p><span className="font-medium">Vendedor:</span> {formData.seller || 'No especificado'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">CUFE</h4>
              <p className="text-sm break-all">{formData.cufe || 'No generado'}</p>
              {/* Aquí se puede agregar el código QR */}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <p>Observaciones:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>¡Gracias por su compra!</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
})