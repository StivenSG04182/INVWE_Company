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
import { CalendarIcon, Plus, Trash, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createInvoice } from '@/lib/queries3';
import { DocumentType } from '@prisma/client';

const formSchema = z.object({
    subAccountId: z.string().optional(),
    customerId: z.string().optional(),
    additionalRecipients: z.array(z.string().email()).optional(),
    status: z.enum(['DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE']),
    invoiceType: z.enum(['PHYSICAL', 'ELECTRONIC', 'BOTH']).default('PHYSICAL'),
    dueDate: z.date().optional(),
    notes: z.string().optional(),
    
    // Datos fiscales del cliente
    customerTaxId: z.string().optional(),
    customerTaxType: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),
    
    // Condiciones de pago
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'ONLINE', 'OTHER']).optional(),
    paymentTerms: z.string().optional(),
    paymentDays: z.number().min(0).optional(),
    
    // Campos para facturación electrónica
    currency: z.string().default('COP'),
    exchangeRate: z.number().min(0).default(1),
    
    // Retenciones
    retentionVAT: z.number().min(0).default(0),
    retentionIncome: z.number().min(0).default(0),
    retentionICA: z.number().min(0).default(0),
    
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().min(0),
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
    relatedDocuments: z.array(
        z.object({
            documentType: z.string(),
            documentNumber: z.string(),
            documentDate: z.date().optional(),
            notes: z.string().optional(),
        })
    ).optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
    agencyId: string;
    subAccounts?: { id: string; name: string }[];
    customers?: { id: string; name: string; email?: string; phone?: string; address?: string; taxId?: string; taxType?: string }[];
    products?: { id: string; name: string; price: number; description?: string; discount?: number; hasDiscount?: boolean; originalPrice?: number }[];
    taxes?: { id: string; name: string; rate: number }[];
    hasDianConfig?: boolean;
    defaultValues?: Partial<InvoiceFormValues>;
}

export const InvoiceForm = ({
    agencyId,
    subAccounts = [],
    customers = [],
    products = [],
    taxes = [],
    hasDianConfig = false,
    defaultValues,
}: InvoiceFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const [taxTotal, setTaxTotal] = useState(0);
    const [discountTotal, setDiscountTotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [showElectronicFields, setShowElectronicFields] = useState(false);
    const [activeTab, setActiveTab] = useState('form'); // 'form' o 'preview'

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: 'DRAFT',
            invoiceType: 'PHYSICAL',
            currency: 'COP',
            exchangeRate: 1,
            retentionVAT: 0,
            retentionIncome: 0,
            retentionICA: 0,
            items: [{ productId: '', quantity: 1, unitPrice: 0, tax: 0, description: '' }],
            taxes: [],
            relatedDocuments: [],
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
    
    const { fields: relatedDocumentFields, append: appendRelatedDocument, remove: removeRelatedDocument } = useFieldArray({
        control: form.control,
        name: 'relatedDocuments',
    });
    
    // Mostrar/ocultar campos de facturación electrónica según el tipo seleccionado
    const invoiceType = form.watch('invoiceType');
    useEffect(() => {
        const isElectronic = invoiceType === 'ELECTRONIC' || invoiceType === 'BOTH';
        setShowElectronicFields(isElectronic);
        
        if (isElectronic) {
            const customerId = form.getValues('customerId');
            if (!customerId) {
                form.setError('customerId', {
                    type: 'manual',
                    message: 'Debe seleccionar un cliente para generar una factura electrónica'
                });
            } else {
                form.clearErrors('customerId');
                
                const customerEmail = form.getValues('customerEmail');
                if (!customerEmail) {
                    form.setError('customerEmail', {
                        type: 'manual',
                        message: 'El cliente debe tener un correo electrónico para recibir la factura electrónica'
                    });
                } else {
                    form.clearErrors('customerEmail');
                }
                
                if (!form.getValues('additionalRecipients')) {
                    form.setValue('additionalRecipients', []);
                }
            }
        } else {
            form.clearErrors('customerId');
            form.clearErrors('customerEmail');
        }
    }, [invoiceType, form]);

    // Calcular totales cuando cambian los items
    const items = form.watch('items');
    const formTaxes = form.watch('taxes');
    useEffect(() => {
        const currentItems = form.getValues('items') || [];
        let calculatedSubtotal = 0;
        let calculatedDiscount = 0;
        let calculatedTax = 0;

        currentItems.forEach((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            calculatedSubtotal += lineTotal;
            // El descuento ahora viene directamente del producto
            const product = products.find(p => p.id === item.productId);
            const discountRate = (product?.hasDiscount && product?.discount) ? product.discount : 0;
            calculatedDiscount += (lineTotal * discountRate) / 100;
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
    }, [items, formTaxes, form, products]);

    const onSubmit = async (data: InvoiceFormValues) => {
        // Validar que se haya seleccionado un cliente para facturas electrónicas
        if ((data.invoiceType === 'ELECTRONIC' || data.invoiceType === 'BOTH') && !data.customerId) {
            form.setError('customerId', {
                type: 'manual',
                message: 'Debe seleccionar un cliente para generar una factura electrónica'
            });
            window.scrollTo(0, 0);
            return;
        }

        // Validar que el cliente tenga un correo electrónico para facturas electrónicas
        if ((data.invoiceType === 'ELECTRONIC' || data.invoiceType === 'BOTH') && !data.customerEmail) {
            form.setError('customerEmail', {
                type: 'manual',
                message: 'El cliente debe tener un correo electrónico para recibir la factura electrónica'
            });
            window.scrollTo(0, 0);
            return;
        }
        
        // Validar que los correos adicionales sean válidos
        if (data.additionalRecipients && data.additionalRecipients.length > 0) {
            const invalidEmails = data.additionalRecipients.filter(email => !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
            if (invalidEmails.length > 0) {
                form.setError('additionalRecipients', {
                    type: 'manual',
                    message: 'Hay correos electrónicos adicionales inválidos'
                });
                window.scrollTo(0, 0);
                return;
            }
        }
        
        setIsLoading(true);
        try {
            // Preparar datos para la API
            const invoiceData = {
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, // Generar número de factura
                status: data.status,
                invoiceType: data.invoiceType,
                subtotal: subtotal,
                tax: taxTotal,
                discount: discountTotal,
                total: total,
                notes: data.notes,
                dueDate: data.dueDate,
                customerId: data.customerId,
                agencyId: agencyId,
                subAccountId: data.subAccountId,
                // Datos fiscales del cliente
                customerTaxId: data.customerTaxId,
                customerTaxType: data.customerTaxType,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                customerAddress: data.customerAddress,
                // Condiciones de pago
                paymentMethod: data.paymentMethod,
                paymentTerms: data.paymentTerms,
                paymentDays: data.paymentDays,
                // Campos para facturación electrónica
                currency: data.currency,
                exchangeRate: data.exchangeRate,
                isElectronic: data.invoiceType === 'ELECTRONIC' || data.invoiceType === 'BOTH',
                // Retenciones
                retentionVAT: data.retentionVAT,
                retentionIncome: data.retentionIncome,
                retentionICA: data.retentionICA,
            };

            // Preparar items
            const items = data.items.map(item => ({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: (() => {
                    const product = products.find(p => p.id === item.productId);
                    return (product?.hasDiscount && product?.discount) ? product.discount : 0;
                })(),
                tax: (item.unitPrice * item.quantity * item.tax) / 100,
                total: (() => {
                    const product = products.find(p => p.id === item.productId);
                    const discountRate = (product?.hasDiscount && product?.discount) ? product.discount : 0;
                    return item.quantity * item.unitPrice * (1 - discountRate / 100) * (1 + item.tax / 100);
                })(),
                description: item.description,
                productId: item.productId,
            }));

            // Preparar impuestos
            const taxesData = data.taxes?.map(tax => ({
                amount: tax.amount,
                taxId: tax.taxId,
            })) || [];

            // Preparar documentos relacionados
            const relatedDocuments = data.relatedDocuments?.map(doc => ({
                documentType: doc.documentType,
                documentNumber: doc.documentNumber,
                documentDate: doc.documentDate,
                notes: doc.notes,
            })) || [];

            // Preparar destinatarios para factura electrónica
            const emailRecipients: string[] = [];
            if (data.customerEmail) {
                emailRecipients.push(data.customerEmail);
            }
            if (data.additionalRecipients && data.additionalRecipients.length > 0) {
                // Filtrar correos válidos y eliminar duplicados
                const validEmails = data.additionalRecipients.filter(email => 
                    email && email !== data.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                );
                emailRecipients.push(...validEmails);
            }
            
            // Enviar datos al servidor
            const response = await createInvoice({
                invoiceData,
                items,
                taxes: taxesData,
                relatedDocuments,
                emailRecipients: (data.invoiceType === 'ELECTRONIC' || data.invoiceType === 'BOTH') ? emailRecipients : [],
            });

            if (response.success) {
                console.log('Factura creada con éxito:', response.data);
                router.refresh();
                router.push(`/agency/${agencyId}/finance?tab=invoices`);
            } else {
                console.error('Error al crear factura:', response.error);
                // Mostrar mensaje de error
            }
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
            
            // Mostrar mensaje informativo sobre el descuento aplicado si existe
            if (selectedProduct.hasDiscount && selectedProduct.discount && selectedProduct.discount > 0) {
                const discountMessage = `Descuento del ${selectedProduct.discount}% aplicado automáticamente`;
                currentItems[index].description = currentItems[index].description 
                    ? `${currentItems[index].description}\n${discountMessage}` 
                    : discountMessage;
            }
            
            form.setValue('items', currentItems);
        }
    };
    
    // Actualizar datos del cliente cuando se selecciona uno
    const handleCustomerChange = (customerId: string) => {
        const selectedCustomer = customers.find((c) => c.id === customerId);
        if (selectedCustomer) {
            // Actualizar campos fiscales del cliente
            form.setValue('customerTaxId', selectedCustomer.taxId || '');
            form.setValue('customerTaxType', selectedCustomer.taxType || '');
            form.setValue('customerEmail', selectedCustomer.email || '');
            form.setValue('customerPhone', selectedCustomer.phone || '');
            form.setValue('customerAddress', selectedCustomer.address || '');
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

    // Generar vista previa de la factura
    const generateInvoicePreview = () => {
        const data = form.getValues();
        const customer = customers.find(c => c.id === data.customerId);
        const selectedItems = data.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                productName: product?.name || 'Producto no seleccionado',
                total: (() => {
                                    const product = products.find(p => p.id === item.productId);
                                    const discountRate = (product?.hasDiscount && product?.discount) ? product.discount : 0;
                                    return item.quantity * item.unitPrice * (1 - discountRate / 100);
                                })()
            };
        });

        return (
            <div className="p-6 bg-background border rounded-lg">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">FACTURA</h2>
                        <p className="text-gray-500">#{`INV-${Date.now().toString().slice(-6)}`}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Estado: {data.status === 'DRAFT' ? 'Borrador' : 
                                               data.status === 'PENDING' ? 'Pendiente' : 
                                               data.status === 'PAID' ? 'Pagada' : 
                                               data.status === 'CANCELLED' ? 'Cancelada' : 'Vencida'}</p>
                        <p>Fecha: {format(new Date(), 'PPP', { locale: es })}</p>
                        <p>Vencimiento: {data.dueDate ? format(data.dueDate, 'PPP', { locale: es }) : 'No especificada'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold mb-2">De:</h3>
                        <p>Su Empresa S.A.</p>
                        <p>NIT: 900.123.456-7</p>
                        <p>Dirección: Calle Principal #123</p>
                        <p>Teléfono: (601) 123-4567</p>
                        <p>Email: contacto@suempresa.com</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Para:</h3>
                        <p>{customer?.name || 'Cliente no seleccionado'}</p>
                        <p>NIT/CC: {data.customerTaxId || 'No especificado'}</p>
                        <p>Dirección: {data.customerAddress || 'No especificada'}</p>
                        <p>Teléfono: {data.customerPhone || 'No especificado'}</p>
                        <p>Email: {data.customerEmail || 'No especificado'}</p>
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead className="bg-card">
                        <tr>
                            <th className="p-2 text-left">Producto</th>
                            <th className="p-2 text-right">Cantidad</th>
                            <th className="p-2 text-right">Precio</th>
                            <th className="p-2 text-right">Descuento</th>
                            <th className="p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItems.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{item.productName}</td>
                                <td className="p-2 text-right">{item.quantity}</td>
                                <td className="p-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="p-2 text-right">{(() => {
                                    const product = products.find(p => p.id === item.productId);
                                    return (product?.hasDiscount && product?.discount) ? `${product.discount!}%` : '0%';
                                })()}</td>
                                <td className="p-2 text-right">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-1/3">
                        <div className="flex justify-between py-2">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Descuento:</span>
                            <span>-${discountTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Impuestos:</span>
                            <span>${taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold border-t">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {data.notes && (
                    <div className="mt-8 p-4 bg-gray-50 rounded">
                        <h3 className="font-bold mb-2">Notas:</h3>
                        <p>{data.notes}</p>
                    </div>
                )}

                {data.invoiceType === 'ELECTRONIC' || data.invoiceType === 'BOTH' ? (
                    <div className="mt-8 p-4 bg-blue-50 rounded">
                        <h3 className="font-bold mb-2 text-blue-700">Información de Factura Electrónica:</h3>
                        <p>Esta es una representación gráfica de la factura electrónica.</p>
                        <p>CUFE: {crypto.randomUUID()}</p>
                        <div className="mt-2">
                            <p className="font-semibold">Código QR:</p>
                            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mt-2">
                                [QR Code]
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <Form {...form}>
            <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Formulario
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Vista Previa
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="mt-4">
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
                                        Seleccione la tienda para esta factura
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
                                    <FormLabel>Cliente Principal</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleCustomerChange(value);
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente principal" />
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
                                        Seleccione el cliente principal para esta factura
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Destinatarios adicionales para factura electrónica */}
                        {showElectronicFields && (
                            <FormField
                                control={form.control}
                                name="additionalRecipients"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destinatarios Adicionales</FormLabel>
                                        <div className="space-y-2">
                                            {field.value?.map((email, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Input 
                                                        type="email" 
                                                        value={email} 
                                                        onChange={(e) => {
                                                            const newEmails = [...(field.value || [])];
                                                            newEmails[i] = e.target.value;
                                                            field.onChange(newEmails);
                                                        }}
                                                        placeholder="correo@ejemplo.com"
                                                    />
                                                    <Button 
                                                        type="button" 
                                                        variant="destructive" 
                                                        size="icon"
                                                        onClick={() => {
                                                            const newEmails = [...(field.value || [])];
                                                            newEmails.splice(i, 1);
                                                            field.onChange(newEmails);
                                                        }}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    field.onChange([...(field.value || []), '']);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Añadir Destinatario
                                            </Button>
                                        </div>
                                        <FormDescription>
                                            Correos electrónicos adicionales para enviar la factura electrónica
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

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
                            onClick={() => appendItem({ productId: '', quantity: 1, unitPrice: 0, tax: 0, description: '' })}
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
                                                        {product.hasDiscount && product.discount && product.discount > 0 && (
                                                            <span className="ml-2 text-green-600">
                                                                {` (Descuento: ${product.discount!}%)`}
                                                            </span>
                                                        )}
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

                            {/* Campo de descuento eliminado - ahora se aplica automáticamente desde la configuración del producto */}

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

                        {/* Tipo de Factura */}
                        <div className="space-y-4 mt-6">
                            <h3 className="text-lg font-medium">Tipo de Factura</h3>
                            <FormField
                                control={form.control}
                                name="invoiceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Factura</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                // Si cambia a factura electrónica, verificar si hay cliente seleccionado
                                                if (value === 'ELECTRONIC' || value === 'BOTH') {
                                                    const customerId = form.getValues('customerId');
                                                    if (!customerId) {
                                                        form.setError('customerId', {
                                                            type: 'manual',
                                                            message: 'Debe seleccionar un cliente para generar una factura electrónica'
                                                        });
                                                    }
                                                    
                                                    // Verificar si el cliente tiene email
                                                    const customerEmail = form.getValues('customerEmail');
                                                    if (!customerEmail) {
                                                        form.setError('customerEmail', {
                                                            type: 'manual',
                                                            message: 'El cliente debe tener un correo electrónico para recibir la factura electrónica'
                                                        });
                                                    }
                                                } else {
                                                    // Si no es electrónica, limpiar errores relacionados
                                                    form.clearErrors('customerId');
                                                    form.clearErrors('customerEmail');
                                                }
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PHYSICAL">Física</SelectItem>
                                                {hasDianConfig && (
                                                    <>
                                                        <SelectItem value="ELECTRONIC">Electrónica</SelectItem>
                                                        <SelectItem value="BOTH">Ambas</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {(field.value === 'ELECTRONIC' || field.value === 'BOTH') ? (
                                                <span className="text-amber-600">La facturación electrónica requiere un cliente con correo electrónico</span>
                                            ) : (
                                                <span>Seleccione el tipo de factura a generar</span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Campos para facturación electrónica */}
                        {showElectronicFields && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Información para Facturación Electrónica</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Moneda */}
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Moneda</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar moneda" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                                                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tasa de cambio (si no es COP) */}
                                    {form.watch('currency') !== 'COP' && (
                                        <FormField
                                            control={form.control}
                                            name="exchangeRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tasa de Cambio</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.0001"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Tasa de cambio respecto al peso colombiano
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {/* Datos fiscales del cliente */}
                                    <FormField
                                        control={form.control}
                                        name="customerTaxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NIT/Cédula del Cliente</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="customerTaxType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Identificación</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                                        <SelectItem value="NIT">NIT</SelectItem>
                                                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                                        <SelectItem value="PP">Pasaporte</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Email del Cliente
                                                        {(form.watch('invoiceType') === 'ELECTRONIC' || form.watch('invoiceType') === 'BOTH') && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="email" 
                                                            {...field} 
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                // Limpiar error si se ingresa un email
                                                                if (e.target.value && (form.watch('invoiceType') === 'ELECTRONIC' || form.watch('invoiceType') === 'BOTH')) {
                                                                    form.clearErrors('customerEmail');
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        {(form.watch('invoiceType') === 'ELECTRONIC' || form.watch('invoiceType') === 'BOTH') ? (
                                                            <span className="text-amber-600">Obligatorio para enviar la factura electrónica al cliente</span>
                                                        ) : (
                                                            <span>Email para enviar la factura electrónica</span>
                                                        )}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="customerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Teléfono del Cliente</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="customerAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dirección del Cliente</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Retenciones */}
                                    <h3 className="text-md font-medium mt-4">Retenciones</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="retentionVAT"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Retención IVA (%)</FormLabel>
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

                                        <FormField
                                            control={form.control}
                                            name="retentionIncome"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Retención en la Fuente (%)</FormLabel>
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

                                        <FormField
                                            control={form.control}
                                            name="retentionICA"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Retención ICA (%)</FormLabel>
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
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Factura'}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                    <Card>
                        <CardContent className="pt-6">
                            {generateInvoicePreview()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </Form>
    );
};