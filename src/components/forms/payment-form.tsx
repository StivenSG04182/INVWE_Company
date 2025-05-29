'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
    subAccountId: z.string().optional(),
    invoiceId: z.string(),
    amount: z.number().min(0.01, { message: 'El monto debe ser mayor a 0' }),
    method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'ONLINE', 'OTHER']),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
    agencyId: string;
    subAccounts?: { id: string; name: string }[];
    invoices?: { id: string; invoiceNumber: string; total: number; status: string; customerName?: string }[];
    defaultValues?: Partial<PaymentFormValues>;
}

export const PaymentForm = ({
    agencyId,
    subAccounts = [],
    invoices = [],
    defaultValues,
}: PaymentFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInvoiceAmount, setSelectedInvoiceAmount] = useState(0);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            method: 'CASH',
            status: 'PENDING',
            amount: 0,
            ...defaultValues,
        },
    });

    const onSubmit = async (data: PaymentFormValues) => {
        setIsLoading(true);
        try {
            // Aquí iría la lógica para guardar el pago
            console.log('Datos del pago:', data);
            router.refresh();
            router.push(`/agency/${agencyId}/payments`);
        } catch (error) {
            console.error('Error al guardar el pago:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvoiceChange = (invoiceId: string) => {
        const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
        if (selectedInvoice) {
            setSelectedInvoiceAmount(selectedInvoice.total);
            form.setValue('amount', selectedInvoice.total);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {/* Selección de Tienda */}
                        <FormField
                            control={form.control}
                            name="subAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tienda</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tienda" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subAccounts.map((subAccount) => (
                                                <SelectItem key={subAccount.id} value={subAccount.id}>
                                                    {subAccount.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Seleccione la tienda para este pago
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Selección de Factura */}
                        <FormField
                            control={form.control}
                            name="invoiceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Factura</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleInvoiceChange(value);
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar factura" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {invoices.map((invoice) => (
                                                <SelectItem key={invoice.id} value={invoice.id}>
                                                    {invoice.invoiceNumber} - {invoice.customerName || 'Sin cliente'} (${invoice.total})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Seleccione la factura a la que corresponde este pago
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Monto del pago (el total de la factura es ${selectedInvoiceAmount.toFixed(2)})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Método de Pago */}
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar método" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Efectivo</SelectItem>
                                            <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                                            <SelectItem value="DEBIT_CARD">Tarjeta de Débito</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Transferencia Bancaria</SelectItem>
                                            <SelectItem value="CHECK">Cheque</SelectItem>
                                            <SelectItem value="ONLINE">Pago en Línea</SelectItem>
                                            <SelectItem value="OTHER">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Método utilizado para realizar el pago
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estado del Pago */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pendiente</SelectItem>
                                            <SelectItem value="COMPLETED">Completado</SelectItem>
                                            <SelectItem value="FAILED">Fallido</SelectItem>
                                            <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Estado actual del pago
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Referencia */}
                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referencia</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Número de referencia o transacción"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Número de referencia o identificador de la transacción
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notas */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notas adicionales sobre el pago"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Información adicional sobre el pago
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Resumen del Pago</h3>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Factura:</span>
                                            <span>{form.watch('invoiceId') ?
                                                invoices.find(inv => inv.id === form.watch('invoiceId'))?.invoiceNumber || 'No seleccionada' :
                                                'No seleccionada'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Monto a pagar:</span>
                                            <span>${form.watch('amount')?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Método:</span>
                                            <span>{form.watch('method') === 'CASH' ? 'Efectivo' :
                                                form.watch('method') === 'CREDIT_CARD' ? 'Tarjeta de Crédito' :
                                                    form.watch('method') === 'DEBIT_CARD' ? 'Tarjeta de Débito' :
                                                        form.watch('method') === 'BANK_TRANSFER' ? 'Transferencia Bancaria' :
                                                            form.watch('method') === 'CHECK' ? 'Cheque' :
                                                                form.watch('method') === 'ONLINE' ? 'Pago en Línea' : 'Otro'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Estado:</span>
                                            <span className={`font-medium ${form.watch('status') === 'COMPLETED' ? 'text-green-600' :
                                                form.watch('status') === 'PENDING' ? 'text-amber-600' :
                                                    form.watch('status') === 'FAILED' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {form.watch('status') === 'PENDING' ? 'Pendiente' :
                                                    form.watch('status') === 'COMPLETED' ? 'Completado' :
                                                        form.watch('status') === 'FAILED' ? 'Fallido' : 'Reembolsado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Registrar Pago'}
                </Button>
            </form>
        </Form>
    );
};