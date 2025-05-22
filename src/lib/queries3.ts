"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Invoice, InvoiceItem, InvoiceStatus, InvoiceTax, Payment, PaymentMethod, PaymentStatus, Sale, SaleItem, SaleStatus, Tax, CashRegister, RegisterStatus, DocumentType, DianEnvironment } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// =========== FACTURAS Y FACTURACIÓN ELECTRÓNICA ===========

/**
 * Obtiene todas las facturas de una agencia o subcuenta
 */
export const getInvoices = async ({
    agencyId,
    subAccountId,
}: {
    agencyId: string;
    subAccountId?: string;
}) => {
    try {
        const invoices = await db.invoice.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
            },
            include: {
                Customer: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
                Taxes: {
                    include: {
                        Tax: true,
                    },
                },
                Payments: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return invoices;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        return [];
    }
};

/**
 * Obtiene una factura por su ID
 */
export const getInvoiceById = async (invoiceId: string) => {
    try {
        const invoice = await db.invoice.findUnique({
            where: {
                id: invoiceId,
            },
            include: {
                Customer: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
                Taxes: {
                    include: {
                        Tax: true,
                    },
                },
                Payments: true,
            },
        });
        return invoice;
    } catch (error) {
        console.error("Error al obtener factura:", error);
        return null;
    }
};

/**
 * Crea una nueva factura (física o electrónica)
 */
export const createInvoice = async ({
    invoiceData,
    items,
    taxes,
    relatedDocuments,
    emailRecipients = [],
}: {
    invoiceData: {
        invoiceNumber: string;
        status: InvoiceStatus;
        invoiceType: "PHYSICAL" | "ELECTRONIC" | "BOTH";
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        notes?: string;
        dueDate?: Date;
        customerId?: string;
        agencyId: string;
        subAccountId?: string;
        // Datos fiscales del cliente
        customerTaxId?: string;
        customerTaxType?: string;
        customerEmail?: string;
        customerPhone?: string;
        customerAddress?: string;
        // Condiciones de pago
        paymentMethod?: string;
        paymentTerms?: string;
        paymentDays?: number;
        // Campos para facturación electrónica
        currency?: string;
        exchangeRate?: number;
        isElectronic?: boolean;
        // Retenciones
        retentionVAT?: number;
        retentionIncome?: number;
        retentionICA?: number;
    };
    items: {
        quantity: number;
        unitPrice: number;
        discount: number;
        tax: number;
        total: number;
        description?: string;
        productId: string;
    }[];
    taxes?: {
        amount: number;
        taxId: string;
    }[];
    relatedDocuments?: {
        documentType: string;
        documentNumber: string;
        documentDate?: Date;
        notes?: string;
    }[];
    emailRecipients?: string[];
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener información de la agencia para datos fiscales
        const agency = await db.agency.findUnique({
            where: { id: invoiceData.agencyId },
            select: {
                name: true,
                companyEmail: true,
                companyPhone: true,
                address: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
                // Campos fiscales que sí existen en el modelo Agency
                taxId: true,
                taxName: true,
                fiscalRegime: true,
                fiscalResponsibility: true,
                invoiceResolution: true,
                invoicePrefix: true,
                invoiceNextNumber: true,
                // Obtener también la configuración DIAN relacionada
                DianConfig: true
            }
        });

        // Generar CUFE/CUDE para documentos electrónicos
        let cufe = null;
        let cude = null;
        let qrCode = null;
        let electronicStatus = null;
        let documentType = DocumentType.INVOICE; // Por defecto es factura

        if (invoiceData.invoiceType === "ELECTRONIC" || invoiceData.invoiceType === "BOTH") {
            // Obtener configuración DIAN de la agencia
            const dianConfig = await db.dianConfig.findUnique({
                where: { agencyId: invoiceData.agencyId }
            });

            if (!dianConfig) {
                return { success: false, error: "No se encontró configuración DIAN para esta agencia" };
            }

            // Generar CUFE según algoritmo DIAN (simplificado para demostración)
            const generateCUFE = () => {
                // En producción, esto seguiría el algoritmo oficial DIAN
                // https://www.dian.gov.co/impuestos/factura-electronica/Documents/Anexo_tecnico_factura_electronica_vr_1_7_2020.pdf
                const timestamp = new Date().toISOString();
                const invoiceNumber = invoiceData.invoiceNumber;
                // Usar el NIT de DianConfig o el taxId de la agencia si está disponible
                const nit = dianConfig.issuerNIT || (agency && agency.taxId) || "";
                const technicalKey = dianConfig.technicalKey || "";
                const total = invoiceData.total.toString();
                
                // Concatenar valores según especificación DIAN
                const dataToHash = `${invoiceNumber}|${timestamp}|${nit}|${total}|${technicalKey}`;
                
                // Generar hash SHA-384 (requerido por DIAN)
                return crypto.createHash('sha384').update(dataToHash).digest('hex');
            };

            // Generar CUDE para notas crédito/débito
            const generateCUDE = () => {
                // Similar al CUFE pero con algunas diferencias según especificación DIAN
                const timestamp = new Date().toISOString();
                const documentNumber = invoiceData.invoiceNumber;
                // Usar el NIT de DianConfig o el taxId de la agencia si está disponible
                const nit = dianConfig.issuerNIT || (agency && agency.taxId) || "";
                const total = invoiceData.total.toString();
                
                // Concatenar valores según especificación DIAN para CUDE
                const dataToHash = `${documentNumber}|${timestamp}|${nit}|${total}|${documentType}`;
                
                // Generar hash SHA-384
                return crypto.createHash('sha384').update(dataToHash).digest('hex');
            };

            // Asignar valores según tipo de documento
            if (documentType === DocumentType.INVOICE || documentType === DocumentType.EXPORT_INVOICE || documentType === DocumentType.CONTINGENCY) {
                cufe = generateCUFE();
            } else if (documentType === DocumentType.CREDIT_NOTE || documentType === DocumentType.DEBIT_NOTE) {
                cude = generateCUDE();
            }

            // Generar código QR
            qrCode = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe || cude}`;
            electronicStatus = "PENDIENTE";
        }

        const invoice = await db.invoice.create({
            data: {
                ...invoiceData,
                // Tipo de documento
                documentType: documentType,
                // Campos para facturación electrónica
                isElectronic: invoiceData.invoiceType === "ELECTRONIC" || invoiceData.invoiceType === "BOTH",
                electronicStatus: electronicStatus,
                cufe: cufe,
                cude: cude,
                qrCode: qrCode,
                currency: invoiceData.currency || "COP",
                exchangeRate: invoiceData.exchangeRate || 1,
                // Retenciones
                retentionVAT: invoiceData.retentionVAT || 0,
                retentionIncome: invoiceData.retentionIncome || 0,
                retentionICA: invoiceData.retentionICA || 0,
                // Items y taxes
                Items: {
                    create: items,
                },
                ...(taxes && taxes.length > 0
                    ? {
                        Taxes: {
                            create: taxes,
                        },
                    }
                    : {}),
                // Documentos relacionados
                ...(relatedDocuments && relatedDocuments.length > 0
                    ? {
                        RelatedDocuments: {
                            create: relatedDocuments,
                        },
                    }
                    : {}),
            },
            include: {
                Items: true,
                Taxes: true,
                RelatedDocuments: true,
            },
        });

        // Si es factura electrónica, enviar a la DIAN
        if (invoice.isElectronic) {
            try {
                // Obtener configuración DIAN
                const dianConfig = await db.dianConfig.findUnique({
                    where: { agencyId: invoiceData.agencyId }
                });

                if (!dianConfig) {
                    console.error("No se encontró configuración DIAN para esta agencia");
                    return { success: true, data: invoice, warning: "Factura creada pero no enviada a DIAN por falta de configuración" };
                }

                // Generar XML según formato UBL 2.1 requerido por DIAN
                const xmlContent = await generateElectronicDocumentXML(invoice, dianConfig);
                
                // Guardar XML en sistema de archivos (en producción podría ser un almacenamiento en la nube)
                const xmlFileName = `${invoice.documentType}_${invoice.invoiceNumber.replace(/\s/g, '_')}.xml`;
                const xmlPath = `/temp/electronic_documents/${xmlFileName}`;
                
                // Firmar XML con certificado digital
                const signedXml = await signXmlDocument(xmlContent, dianConfig);
                
                // Enviar a DIAN según ambiente configurado
                const dianResponse = await sendDocumentToDian(signedXml, dianConfig);
                
                // Actualizar factura con respuesta de DIAN
                await db.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        electronicStatus: dianResponse.status,
                        xmlPath: xmlPath,
                        signatureValue: dianResponse.signatureValue,
                        validationDate: new Date(),
                        acknowledgmentDate: dianResponse.acknowledgmentDate
                    }
                });
                
                // Generar representación gráfica (PDF)
                const pdfPath = await generateElectronicDocumentPDF(invoice, dianConfig);
                
                // Actualizar factura con ruta del PDF
                await db.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        pdfPath: pdfPath
                    }
                });
                
                // Enviar factura por correo electrónico a los destinatarios
                if (emailRecipients && emailRecipients.length > 0 && pdfPath) {
                    try {
                        // Obtener configuración de correo de la agencia
                        const emailConfig = {
                            host: dianConfig.emailHost || '',
                            port: dianConfig.emailPort || 587,
                            user: dianConfig.emailUser || '',
                            password: dianConfig.emailPassword || '',
                            from: dianConfig.emailFrom || '',
                            subject: `Factura Electrónica ${invoice.invoiceNumber}`,
                            body: dianConfig.emailBody || `Adjunto encontrará su factura electrónica ${invoice.invoiceNumber}.`
                        };
                        
                        // Verificar que la configuración de correo esté completa
                        if (emailConfig.host && emailConfig.user && emailConfig.password) {
                            // Aquí iría la lógica para enviar el correo con el PDF adjunto
                            console.log(`Enviando factura electrónica por correo a: ${emailRecipients.join(', ')}`);
                            
                            // Registrar el envío en la base de datos
                            await db.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    acknowledgmentDate: new Date() // Usar este campo para registrar cuando se envió el correo
                                }
                            });
                        } else {
                            console.warn('Configuración de correo incompleta. No se pudo enviar la factura por correo.');
                        }
                    } catch (emailError) {
                        console.error('Error al enviar factura por correo:', emailError);
                    }
                }
                
                console.log(`Factura electrónica ${invoice.invoiceNumber} enviada a DIAN con éxito`);
            } catch (error) {
                console.error(`Error al enviar factura electrónica a DIAN:`, error);
                return { 
                    success: true, 
                    data: invoice, 
                    warning: "Factura creada pero hubo un error al enviarla a DIAN" 
                };
            }
        }

        revalidatePath(`/agency/${invoiceData.agencyId}/finances`);
        return { success: true, data: invoice };
    } catch (error) {
        console.error("Error al crear factura:", error);
        return { success: false, error: "Error al crear factura" };
    }
};

/**
 * Actualiza una factura existente
 */
export const updateInvoice = async ({
    invoiceId,
    invoiceData,
    items,
    taxes,
}: {
    invoiceId: string;
    invoiceData: {
        invoiceNumber?: string;
        status?: InvoiceStatus;
        subtotal?: number;
        tax?: number;
        discount?: number;
        total?: number;
        notes?: string;
        dueDate?: Date;
        customerId?: string;
    };
    items?: {
        id?: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        tax: number;
        total: number;
        description?: string;
        productId: string;
    }[];
    taxes?: {
        id?: string;
        amount: number;
        taxId: string;
    }[];
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener la factura actual para conocer su agencyId
        const currentInvoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            select: { agencyId: true },
        });

        if (!currentInvoice) {
            return { success: false, error: "Factura no encontrada" };
        }

        // Actualizar la factura
        const updatedInvoice = await db.invoice.update({
            where: { id: invoiceId },
            data: invoiceData,
        });

        // Si hay items para actualizar
        if (items && items.length > 0) {
            // Eliminar items existentes
            await db.invoiceItem.deleteMany({
                where: { invoiceId },
            });

            // Crear nuevos items
            await db.invoiceItem.createMany({
                data: items.map((item) => ({
                    ...item,
                    invoiceId,
                })),
            });
        }

        // Si hay impuestos para actualizar
        if (taxes && taxes.length > 0) {
            // Eliminar impuestos existentes
            await db.invoiceTax.deleteMany({
                where: { invoiceId },
            });

            // Crear nuevos impuestos
            await db.invoiceTax.createMany({
                data: taxes.map((tax) => ({
                    ...tax,
                    invoiceId,
                })),
            });
        }

        revalidatePath(`/agency/${currentInvoice.agencyId}/finances`);
        return { success: true, data: updatedInvoice };
    } catch (error) {
        console.error("Error al actualizar factura:", error);
        return { success: false, error: "Error al actualizar factura" };
    }
};

/**
 * Elimina una factura
 */
export const deleteInvoice = async (invoiceId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener la factura actual para conocer su agencyId
        const currentInvoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            select: { agencyId: true },
        });

        if (!currentInvoice) {
            return { success: false, error: "Factura no encontrada" };
        }

        // Eliminar la factura (las relaciones se eliminarán en cascada)
        await db.invoice.delete({
            where: { id: invoiceId },
        });

        revalidatePath(`/agency/${currentInvoice.agencyId}/finances`);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar factura:", error);
        return { success: false, error: "Error al eliminar factura" };
    }
};

// =========== PAGOS ===========

/**
 * Obtiene todos los pagos de una agencia o subcuenta
 */
export const getPayments = async ({
    agencyId,
    subAccountId,
}: {
    agencyId: string;
    subAccountId?: string;
}) => {
    try {
        const payments = await db.payment.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
            },
            include: {
                Invoice: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return payments;
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        return [];
    }
};

/**
 * Obtiene un pago por su ID
 */
export const getPaymentById = async (paymentId: string) => {
    try {
        const payment = await db.payment.findUnique({
            where: {
                id: paymentId,
            },
            include: {
                Invoice: true,
            },
        });
        return payment;
    } catch (error) {
        console.error("Error al obtener pago:", error);
        return null;
    }
};

/**
 * Crea un nuevo pago
 */
export const createPayment = async ({
    paymentData,
}: {
    paymentData: {
        amount: number;
        method: PaymentMethod;
        status: PaymentStatus;
        reference?: string;
        notes?: string;
        invoiceId: string;
        agencyId: string;
        subAccountId?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        const payment = await db.payment.create({
            data: paymentData,
        });

        // Actualizar el estado de la factura si es necesario
        if (paymentData.status === "COMPLETED") {
            const invoice = await db.invoice.findUnique({
                where: { id: paymentData.invoiceId },
                include: {
                    Payments: {
                        where: { status: "COMPLETED" },
                    },
                },
            });

            if (invoice) {
                const totalPaid = invoice.Payments.reduce(
                    (sum, payment) => sum + Number(payment.amount),
                    Number(payment.amount)
                );

                // Si el total pagado es igual o mayor al total de la factura, marcarla como pagada
                if (totalPaid >= Number(invoice.total)) {
                    await db.invoice.update({
                        where: { id: paymentData.invoiceId },
                        data: { status: "PAID" },
                    });
                } else {
                    // Si hay un pago parcial, actualizar el estado a PENDING
                    await db.invoice.update({
                        where: { id: paymentData.invoiceId },
                        data: { status: "PENDING" },
                    });
                }
            }
        }

        revalidatePath(`/agency/${paymentData.agencyId}/finances`);
        return { success: true, data: payment };
    } catch (error) {
        console.error("Error al crear pago:", error);
        return { success: false, error: "Error al crear pago" };
    }
};

/**
 * Actualiza un pago existente
 */
export const updatePayment = async ({
    paymentId,
    paymentData,
}: {
    paymentId: string;
    paymentData: {
        amount?: number;
        method?: PaymentMethod;
        status?: PaymentStatus;
        reference?: string;
        notes?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener el pago actual para conocer su agencyId e invoiceId
        const currentPayment = await db.payment.findUnique({
            where: { id: paymentId },
            select: { agencyId: true, invoiceId: true },
        });

        if (!currentPayment) {
            return { success: false, error: "Pago no encontrado" };
        }

        const payment = await db.payment.update({
            where: { id: paymentId },
            data: paymentData,
        });

        // Si se actualizó el estado a COMPLETED, verificar si la factura debe actualizarse
        if (paymentData.status === "COMPLETED") {
            const invoice = await db.invoice.findUnique({
                where: { id: currentPayment.invoiceId },
                include: {
                    Payments: {
                        where: { status: "COMPLETED" },
                    },
                },
            });

            if (invoice) {
                const totalPaid = invoice.Payments.reduce(
                    (sum, payment) => sum + Number(payment.amount),
                    0
                );

                // Si el total pagado es igual o mayor al total de la factura, marcarla como pagada
                if (totalPaid >= Number(invoice.total)) {
                    await db.invoice.update({
                        where: { id: currentPayment.invoiceId },
                        data: { status: "PAID" },
                    });
                } else if (totalPaid > 0) {
                    // Si hay un pago parcial, actualizar el estado a PENDING
                    await db.invoice.update({
                        where: { id: currentPayment.invoiceId },
                        data: { status: "PENDING" },
                    });
                }
            }
        }

        revalidatePath(`/agency/${currentPayment.agencyId}/finances`);
        return { success: true, data: payment };
    } catch (error) {
        console.error("Error al actualizar pago:", error);
        return { success: false, error: "Error al actualizar pago" };
    }
};

/**
 * Elimina un pago
 */
export const deletePayment = async (paymentId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener el pago actual para conocer su agencyId e invoiceId
        const currentPayment = await db.payment.findUnique({
            where: { id: paymentId },
            select: { agencyId: true, invoiceId: true, status: true, amount: true },
        });

        if (!currentPayment) {
            return { success: false, error: "Pago no encontrado" };
        }

        // Eliminar el pago
        await db.payment.delete({
            where: { id: paymentId },
        });

        // Si el pago estaba completado, actualizar el estado de la factura
        if (currentPayment.status === "COMPLETED") {
            const invoice = await db.invoice.findUnique({
                where: { id: currentPayment.invoiceId },
                include: {
                    Payments: {
                        where: { status: "COMPLETED" },
                    },
                },
            });

            if (invoice) {
                const totalPaid = invoice.Payments.reduce(
                    (sum, payment) => sum + Number(payment.amount),
                    0
                );

                // Actualizar el estado de la factura según los pagos restantes
                if (totalPaid === 0) {
                    await db.invoice.update({
                        where: { id: currentPayment.invoiceId },
                        data: { status: "PENDING" },
                    });
                } else if (totalPaid < Number(invoice.total)) {
                    await db.invoice.update({
                        where: { id: currentPayment.invoiceId },
                        data: { status: "PENDING" },
                    });
                }
            }
        }

        revalidatePath(`/agency/${currentPayment.agencyId}/finances`);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar pago:", error);
        return { success: false, error: "Error al eliminar pago" };
    }
};

// =========== IMPUESTOS ===========

/**
 * Obtiene todos los impuestos de una agencia o subcuenta
 */
export const getTaxes = async ({
    agencyId,
    subAccountId,
}: {
    agencyId: string;
    subAccountId?: string;
}) => {
    try {
        const taxes = await db.tax.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
            },
            orderBy: {
                name: "asc",
            },
        });
        return taxes;
    } catch (error) {
        console.error("Error al obtener impuestos:", error);
        return [];
    }
};

/**
 * Crea un nuevo impuesto
 */
export const createTax = async ({
    taxData,
}: {
    taxData: {
        name: string;
        rate: number;
        description?: string;
        isDefault?: boolean;
        agencyId: string;
        subAccountId?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        const tax = await db.tax.create({
            data: taxData,
        });

        revalidatePath(`/agency/${taxData.agencyId}/finances`);
        return { success: true, data: tax };
    } catch (error) {
        console.error("Error al crear impuesto:", error);
        return { success: false, error: "Error al crear impuesto" };
    }
};

/**
 * Actualiza un impuesto existente
 */
export const updateTax = async ({
    taxId,
    taxData,
}: {
    taxId: string;
    taxData: {
        name?: string;
        rate?: number;
        description?: string;
        isDefault?: boolean;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener el impuesto actual para conocer su agencyId
        const currentTax = await db.tax.findUnique({
            where: { id: taxId },
            select: { agencyId: true },
        });

        if (!currentTax) {
            return { success: false, error: "Impuesto no encontrado" };
        }

        const tax = await db.tax.update({
            where: { id: taxId },
            data: taxData,
        });

        revalidatePath(`/agency/${currentTax.agencyId}/finances`);
        return { success: true, data: tax };
    } catch (error) {
        console.error("Error al actualizar impuesto:", error);
        return { success: false, error: "Error al actualizar impuesto" };
    }
};

/**
 * Elimina un impuesto
 */
export const deleteTax = async (taxId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener el impuesto actual para conocer su agencyId
        const currentTax = await db.tax.findUnique({
            where: { id: taxId },
            select: { agencyId: true },
        });

        if (!currentTax) {
            return { success: false, error: "Impuesto no encontrado" };
        }

        // Verificar si el impuesto está siendo utilizado en facturas
        const taxUsage = await db.invoiceTax.findFirst({
            where: { taxId },
        });

        if (taxUsage) {
            return {
                success: false,
                error: "No se puede eliminar el impuesto porque está siendo utilizado en facturas",
            };
        }

        // Eliminar el impuesto
        await db.tax.delete({
            where: { id: taxId },
        });

        revalidatePath(`/agency/${currentTax.agencyId}/finances`);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar impuesto:", error);
        return { success: false, error: "Error al eliminar impuesto" };
    }
};

// =========== TRANSACCIONES Y CAJAS ===========

/**
 * Obtiene todas las ventas de una agencia o subcuenta
 */
export const getSales = async ({
    agencyId,
    subAccountId,
    areaId,
    startDate,
    endDate,
}: {
    agencyId: string;
    subAccountId?: string;
    areaId?: string;
    startDate?: Date;
    endDate?: Date;
}) => {
    try {
        const sales = await db.sale.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
                ...(areaId ? { areaId } : {}),
                ...(startDate && endDate
                    ? {
                        saleDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    }
                    : {}),
            },
            include: {
                Customer: true,
                Cashier: true,
                Area: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
            },
            orderBy: {
                saleDate: "desc",
            },
        });
        return sales;
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        return [];
    }
};

/**
 * Obtiene todas las cajas registradoras de una agencia o subcuenta
 */
export const getCashRegisters = async ({
    agencyId,
    subAccountId,
    areaId,
    cashierId,
    status,
}: {
    agencyId: string;
    subAccountId?: string;
    areaId?: string;
    cashierId?: string;
    status?: RegisterStatus;
}) => {
    try {
        const cashRegisters = await db.cashRegister.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
                ...(areaId ? { areaId } : {}),
                ...(cashierId ? { cashierId } : {}),
                ...(status ? { status } : {}),
            },
            include: {
                Cashier: true,
                Area: true,
            },
            orderBy: {
                openDate: "desc",
            },
        });
        return cashRegisters;
    } catch (error) {
        console.error("Error al obtener cajas registradoras:", error);
        return [];
    }
};

/**
 * Abre una nueva caja registradora
 */
export const openCashRegister = async ({
    registerData,
}: {
    registerData: {
        openAmount: number;
        cashierId: string;
        areaId: string;
        agencyId: string;
        subAccountId?: string;
        notes?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Verificar si ya hay una caja abierta para este cajero y área
        const existingRegister = await db.cashRegister.findFirst({
            where: {
                cashierId: registerData.cashierId,
                areaId: registerData.areaId,
                status: "OPEN",
            },
        });

        if (existingRegister) {
            return {
                success: false,
                error: "Ya existe una caja abierta para este cajero y área",
            };
        }

        const cashRegister = await db.cashRegister.create({
            data: {
                ...registerData,
                status: "OPEN",
                openDate: new Date(),
            },
        });

        revalidatePath(`/agency/${registerData.agencyId}/finances`);
        return { success: true, data: cashRegister };
    } catch (error) {
        console.error("Error al abrir caja registradora:", error);
        return { success: false, error: "Error al abrir caja registradora" };
    }
};

/**
 * Cierra una caja registradora
 */
export const closeCashRegister = async ({
    registerId,
    closeData,
}: {
    registerId: string;
    closeData: {
        closeAmount: number;
        notes?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Obtener la caja actual
        const currentRegister = await db.cashRegister.findUnique({
            where: { id: registerId },
            select: {
                agencyId: true,
                openAmount: true,
                cashSales: true,
                cardSales: true,
                otherSales: true,
                totalSales: true,
            },
        });

        if (!currentRegister) {
            return { success: false, error: "Caja registradora no encontrada" };
        }

        // Calcular la diferencia
        const expectedAmount = Number(currentRegister.openAmount) + Number(currentRegister.cashSales);
        const difference = Number(closeData.closeAmount) - expectedAmount;

        const cashRegister = await db.cashRegister.update({
            where: { id: registerId },
            data: {
                closeAmount: closeData.closeAmount,
                difference,
                notes: closeData.notes,
                status: "CLOSED",
                closeDate: new Date(),
            },
        });

        revalidatePath(`/agency/${currentRegister.agencyId}/finances`);
        return { success: true, data: cashRegister };
    } catch (error) {
        console.error("Error al cerrar caja registradora:", error);
        return { success: false, error: "Error al cerrar caja registradora" };
    }
};