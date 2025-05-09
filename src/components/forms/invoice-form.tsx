'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    subAccountId: z.string().optional(),
    customerId: z.string().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE']),
    dueDate: z.date().optional(),
    notes: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().min(0),
            discount: z.number().min(0).default(0),
            tax: z.number().min(0).default(0),
            description: z.string().optional(),
        })
    ),
    taxes: z.array(
        z.object({
            taxId: z.string(),
            amount: z.number().min(0),
        })
    ).optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
    agencyId: string;
    subAccounts?: { id: string; name: string }[];
    customers?: { id: string; name: string }[];
    products?: { id: string; name: string; price: number; description?: string }[];
    taxes?: { id: string; name: string; rate: number }[];
    defaultValues?: Partial<InvoiceFormValues>;
}

export const InvoiceForm = ({
    agencyId,
    subAccounts = [],
    customers = [],
    products = [],
    taxes = [],
    defaultValues,
}: InvoiceFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const [taxTotal, setTaxTotal] = useState(0);
    const [discountTotal, setDiscountTotal] = useState(0);
    const [total, setTotal] = useState(0);

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: 'DRAFT',
            items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, description: '' }],
            taxes: [],
            ...defaultValues,
        },
    });

    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
        control: form.control,
        name: 'taxes',
    });

    // Calcular totales cuando cambian los items
    useEffect(() => {
        const items = form.getValues('items') || [];
        let calculatedSubtotal = 0;
        let calculatedDiscount = 0;
        let calculatedTax = 0;

        items.forEach((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            calculatedSubtotal += lineTotal;
            calculatedDiscount += (lineTotal * item.discount) / 100;
            calculatedTax += (lineTotal * item.tax) / 100;
        });

        // Añadir impuestos adicionales
        const additionalTaxes = form.getValues('taxes') || [];
        let additionalTaxTotal = 0;
        additionalTaxes.forEach((tax) => {
            additionalTaxTotal += tax.amount;
        });

        setSubtotal(calculatedSubtotal);
        setDiscountTotal(calculatedDiscount);
        setTaxTotal(calculatedTax + additionalTaxTotal);
        setTotal(calculatedSubtotal - calculatedDiscount + calculatedTax + additionalTaxTotal);
    }, [form.watch('items'), form.watch('taxes')]);

    const onSubmit = async (data: InvoiceFormValues) => {
        setIsLoading(true);
        try {
            // Aquí iría la lógica para guardar la factura
            console.log('Datos de la factura:', data);
            router.refresh();
            router.push(`/agency/${agencyId}/invoices`);
        } catch (error) {
            console.error('Error al guardar la factura:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductChange = (index: number, productId: string) => {
        const selectedProduct = products.find((p) => p.id === productId);
        if (selectedProduct) {
            const currentItems = form.getValues('items');
            currentItems[index].unitPrice = selectedProduct.price;
            currentItems[index].description = selectedProduct.description || '';
            form.setValue('items', currentItems);
        }
    };

    const handleTaxChange = (index: number, taxId: string) => {
        const selectedTax = taxes.find((t) => t.id === taxId);
        if (selectedTax) {
            const currentTaxes = form.getValues('taxes') || [];
            // Calcular el monto del impuesto basado en el subtotal
            const taxAmount = (subtotal - discountTotal) * (selectedTax.rate / 100);
            currentTaxes[index].amount = taxAmount;
            form.setValue('taxes', currentTaxes);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {/* Selección de Subcuenta */}
                        <FormField
                            control={form.control}
                            name="subAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subcuenta</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar subcuenta" />
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
                                        Seleccione la subcuenta para esta factura
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Selección de Cliente */}
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Seleccione el cliente para esta factura
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estado de la Factura */}
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
                                            <SelectItem value="DRAFT">Borrador</SelectItem>
                                            <SelectItem value="PENDING">Pendiente</SelectItem>
                                            <SelectItem value="PAID">Pagada</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                            <SelectItem value="OVERDUE">Vencida</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Estado actual de la factura
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fecha de Vencimiento */}
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Vencimiento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: es })
                                                    ) : (
                                                        <span>Seleccionar fecha</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Fecha límite para el pago de esta factura
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
                                            placeholder="Notas adicionales para la factura"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Información adicional para el cliente
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Descuento:</span>
                                        <span>-${discountTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impuestos:</span>
                                        <span>${taxTotal.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Items de la Factura */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Productos y Servicios</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendItem({ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, description: '' })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Añadir Producto
                        </Button>
                    </div>

                    {itemFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-md">
                            <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Producto</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleProductChange(index, value);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar producto" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cantidad</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`items.${index}.discount`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descuento %</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-end space-x-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    disabled={itemFields.length === 1}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Impuestos Adicionales */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Impuestos Adicionales</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendTax({ taxId: '', amount: 0 })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Añadir Impuesto
                        </Button>
                    </div>

                    {taxFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-md">
                            <FormField
                                control={form.control}
                                name={`taxes.${index}.taxId`}
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Impuesto</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleTaxChange(index, value);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar impuesto" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {taxes.map((tax) => (
                                                    <SelectItem key={tax.id} value={tax.id}>
                                                        {tax.name} ({tax.rate}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-end space-x-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeTax(index)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Factura'}
                </Button>
            </form>
        </Form>
    );
};