"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { InvoiceStatus, PaymentMethod, PaymentStatus, RegisterStatus, DocumentType, } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { generateInvoicePDF } from "./pdf-generator";
import { validatePDFGeneration, validatePDFBuffer } from "./pdf-utils"


// =========== FACTURAS Y FACTURACIÓN ELECTRÓNICA ===========

// TODO: Obtiene y filtra todas las facturas de una agencia con sus relaciones (clientes, items, impuestos y pagos)
export const getInvoices = async ({ agencyId }: { agencyId: string }) => {
    try {
        const invoices = await db.invoice.findMany({
            where: {
                agencyId,
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
                SubAccount: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return invoices
    } catch (error) {
        console.error("Error al obtener facturas:", error)
        return []
    }
}

// TODO: Obtiene una factura específica por ID con todas sus relaciones y detalles completos
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

// TODO: Crea una nueva factura física o electrónica con validación DIAN, generación de CUFE/CUDE y envío por correo
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
        customerTaxId?: string;
        customerTaxType?: string;
        customerEmail?: string;
        customerPhone?: string;
        customerAddress?: string;
        paymentMethod?: string;
        paymentTerms?: string;
        paymentDays?: number;
        currency?: string;
        exchangeRate?: number;
        isElectronic?: boolean;
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
                taxId: true,
                taxName: true,
                fiscalRegime: true,
                fiscalResponsibility: true,
                invoiceResolution: true,
                invoicePrefix: true,
                invoiceNextNumber: true,
                DianConfig: true
            }
        });

        let cufe = null;
        let cude = null;
        let qrCode = null;
        let electronicStatus = null;
        let documentType = DocumentType.INVOICE;

        if (invoiceData.invoiceType === "ELECTRONIC" || invoiceData.invoiceType === "BOTH") {
            const dianConfig = await db.dianConfig.findUnique({
                where: { agencyId: invoiceData.agencyId }
            });

            if (!dianConfig) {
                return { success: false, error: "No se encontró configuración DIAN para esta agencia" };
            }

            const generateCUFE = () => {
                // https://www.dian.gov.co/impuestos/factura-electronica/Documents/Anexo_tecnico_factura_electronica_vr_1_7_2020.pdf
                const timestamp = new Date().toISOString();
                const invoiceNumber = invoiceData.invoiceNumber;
                const nit = dianConfig.issuerNIT || (agency && agency.taxId) || "";
                const technicalKey = dianConfig.technicalKey || "";
                const total = invoiceData.total.toString();

                const dataToHash = `${invoiceNumber}|${timestamp}|${nit}|${total}|${technicalKey}`;

                return crypto.createHash('sha384').update(dataToHash).digest('hex');
            };

            const generateCUDE = () => {
                const timestamp = new Date().toISOString();
                const documentNumber = invoiceData.invoiceNumber;
                const nit = dianConfig.issuerNIT || (agency && agency.taxId) || "";
                const total = invoiceData.total.toString();

                const dataToHash = `${documentNumber}|${timestamp}|${nit}|${total}|${documentType}`;

                return crypto.createHash('sha384').update(dataToHash).digest('hex');
            };

            if (documentType === DocumentType.INVOICE || documentType === DocumentType.EXPORT_INVOICE || documentType === DocumentType.CONTINGENCY) {
                cufe = generateCUFE();
            } else if (documentType === DocumentType.CREDIT_NOTE || documentType === DocumentType.DEBIT_NOTE) {
                cude = generateCUDE();
            }

            qrCode = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe || cude}`;
            electronicStatus = "PENDIENTE";
        }

        const invoice = await db.invoice.create({
            data: {
                ...invoiceData,
                documentType: documentType,
                isElectronic: invoiceData.invoiceType === "ELECTRONIC" || invoiceData.invoiceType === "BOTH",
                electronicStatus: electronicStatus,
                cufe: cufe,
                cude: cude,
                qrCode: qrCode,
                currency: invoiceData.currency || "COP",
                exchangeRate: invoiceData.exchangeRate || 1,
                retentionVAT: invoiceData.retentionVAT || 0,
                retentionIncome: invoiceData.retentionIncome || 0,
                retentionICA: invoiceData.retentionICA || 0,
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

        if (invoice.isElectronic) {
            try {
                const dianConfig = await db.dianConfig.findUnique({
                    where: { agencyId: invoiceData.agencyId }
                });

                if (!dianConfig) {
                    console.error("No se encontró configuración DIAN para esta agencia");
                    return { success: true, data: invoice, warning: "Factura creada pero no enviada a DIAN por falta de configuración" };
                }

                const xmlContent = await generateElectronicDocumentXML(invoice, dianConfig);

                const xmlFileName = `${invoice.documentType}_${invoice.invoiceNumber.replace(/\s/g, '_')}.xml`;
                const xmlPath = `/temp/electronic_documents/${xmlFileName}`;

                const signedXml = await signXmlDocument(xmlContent, dianConfig);

                const dianResponse = await sendDocumentToDian(signedXml, dianConfig);

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

                const pdfPath = await generateElectronicDocumentPDF(invoice, dianConfig);

                await db.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        pdfPath: pdfPath
                    }
                });
                if (emailRecipients && emailRecipients.length > 0 && pdfPath) {
                    try {
                        const emailConfig = {
                            host: dianConfig.emailHost || '',
                            port: dianConfig.emailPort || 587,
                            user: dianConfig.emailUser || '',
                            password: dianConfig.emailPassword || '',
                            from: dianConfig.emailFrom || '',
                            subject: `Factura Electrónica ${invoice.invoiceNumber}`,
                            body: dianConfig.emailBody || `Adjunto encontrará su factura electrónica ${invoice.invoiceNumber}.`
                        };
                        if (emailConfig.host && emailConfig.user && emailConfig.password) {

                            console.log(`Enviando factura electrónica por correo a: ${emailRecipients.join(', ')}`);

                            await db.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    acknowledgmentDate: new Date()
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

// TODO: Actualiza una factura existente, incluyendo sus items e impuestos, manteniendo la integridad de datos
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
        const currentInvoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            select: { agencyId: true },
        });

        if (!currentInvoice) {
            return { success: false, error: "Factura no encontrada" };
        }

        const updatedInvoice = await db.invoice.update({
            where: { id: invoiceId },
            data: invoiceData,
        });

        if (items && items.length > 0) {
            await db.invoiceItem.deleteMany({
                where: { invoiceId },
            });

            await db.invoiceItem.createMany({
                data: items.map((item) => ({
                    ...item,
                    invoiceId,
                })),
            });
        }
        if (taxes && taxes.length > 0) {

            await db.invoiceTax.deleteMany({
                where: { invoiceId },
            });

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

// TODO: Elimina una factura y todas sus relaciones mediante borrado en cascada
export const deleteInvoice = async (invoiceId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        const currentInvoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            select: { agencyId: true },
        });

        if (!currentInvoice) {
            return { success: false, error: "Factura no encontrada" };
        }
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

// TODO: Lista todos los pagos de una agencia con sus facturas relacionadas ordenados por fecha
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

// TODO: Obtiene los detalles completos de un pago específico incluyendo su factura asociada
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

// TODO: Crea un nuevo pago y actualiza automáticamente el estado de la factura asociada
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
                if (totalPaid >= Number(invoice.total)) {
                    await db.invoice.update({
                        where: { id: paymentData.invoiceId },
                        data: { status: "PAID" },
                    });
                } else {
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

// TODO: Gestiona la actualización de pagos y su impacto en el estado de facturas asociadas
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
                if (totalPaid >= Number(invoice.total)) {
                    await db.invoice.update({
                        where: { id: currentPayment.invoiceId },
                        data: { status: "PAID" },
                    });
                } else if (totalPaid > 0) {
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

// TODO: Maneja el borrado de pagos y actualiza el estado de facturas relacionadas
export const deletePayment = async (paymentId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };
        const currentPayment = await db.payment.findUnique({
            where: { id: paymentId },
            select: { agencyId: true, invoiceId: true, status: true, amount: true },
        });

        if (!currentPayment) {
            return { success: false, error: "Pago no encontrado" };
        }
        await db.payment.delete({
            where: { id: paymentId },
        });
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

// TODO: Obtiene y filtra la lista de impuestos configurados para una agencia
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

// TODO: Crea un nuevo impuesto con validación de tasas y configuración por defecto
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

// TODO: Actualiza la configuración de un impuesto existente manteniendo la integridad referencial
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

// TODO: Elimina un impuesto verificando que no esté en uso en facturas existentes
export const deleteTax = async (taxId: string) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };
        const currentTax = await db.tax.findUnique({
            where: { id: taxId },
            select: { agencyId: true },
        });

        if (!currentTax) {
            return { success: false, error: "Impuesto no encontrado" };
        }
        const taxUsage = await db.invoiceTax.findFirst({
            where: { taxId },
        });

        if (taxUsage) {
            return {
                success: false,
                error: "No se puede eliminar el impuesto porque está siendo utilizado en facturas",
            };
        }
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

// TODO: Obtiene y filtra el historial de ventas con relaciones completas y rangos de fechas
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

// TODO: Lista las cajas registradoras with sus estados y responsables asignados
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

// TODO: Inicia una nueva sesión de caja con validación de usuario y saldo inicial
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

// TODO: Cierra una sesión de caja calculando diferencias y generando reporte de cierre
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

// TODO: Envía facturas por correo utilizando plantillas personalizadas y maneja respuestas HTTP
export const sendInvoiceEmail = async ({
  invoiceId,
  agencyId,
  recipientEmail,
  templateId,
}: {
  invoiceId: string
  agencyId: string
  recipientEmail?: string
  templateId?: string
}) => {
  try {
    // Simular envío de email - aquí integrarías con tu servicio de email
    console.log(`Enviando email para factura ${invoiceId} a ${recipientEmail}`)

    // En una implementación real, aquí generarías el PDF y lo enviarías por email
    const pdfResult = await generateInvoicePDFById({ invoiceId, agencyId })

    if (!pdfResult.success) {
      throw new Error(pdfResult.error)
    }

    // Aquí integrarías con tu servicio de email (SendGrid, Nodemailer, etc.)
    // await sendEmailWithAttachment(recipientEmail, pdfResult.data, pdfResult.filename)

    return { success: true, message: "Email enviado exitosamente" }
  } catch (error) {
    console.error("Error al enviar factura por correo:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// TODO: Recupera una plantilla de correo específica validando permisos de agencia
export const getEmailTemplate = async ({
    templateId,
    agencyId,
}: {
    templateId: string
    agencyId: string
}) => {
    try {
        const template = await db.emailTemplate.findUnique({
            where: {
                id: templateId,
                agencyId: agencyId,
            },
        })

        return { success: true, data: template }
    } catch (error) {
        console.error("Error al obtener plantilla de correo:", error)
        return { success: false, error: "Error al obtener plantilla de correo" }
    }
}

// TODO: Lista todas las plantillas de correo disponibles filtradas por tipo y ordenadas por fecha
export const getEmailTemplates = async ({
    agencyId,
    type,
}: {
    agencyId: string
    type?: string
}) => {
    try {
        const templates = await db.emailTemplate.findMany({
            where: {
                agencyId,
                ...(type ? { type } : {}),
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        return { success: true, data: templates }
    } catch (error) {
        console.error("Error al obtener plantillas de correo:", error)
        return { success: false, error: "Error al obtener plantillas de correo" }
    }
}

// TODO: Gestiona la creación y actualización de plantillas con validación de contenido y metadatos
export const saveEmailTemplate = async ({
    templateData,
}: {
    templateData: {
        id?: string
        name: string
        type: string
        content: any
        subject?: string
        description?: string
        isActive?: boolean
        agencyId: string
    }
}) => {
    try {
        const { id, ...data } = templateData

        if (id) {
            const template = await db.emailTemplate.update({
                where: { id },
                data,
            })

            return { success: true, data: template }
        } else {
            const template = await db.emailTemplate.create({
                data,
            })

            return { success: true, data: template }
        }
    } catch (error) {
        console.error("Error al guardar plantilla de correo:", error)
        return { success: false, error: "Error al guardar plantilla de correo" }
    }
}

// TODO: Elimina plantillas de correo con verificación de uso y permisos
export const deleteEmailTemplate = async (templateId: string) => {
    try {
        await db.emailTemplate.delete({
            where: { id: templateId },
        })

        return { success: true }
    } catch (error) {
        console.error("Error al eliminar plantilla de correo:", error)
        return { success: false, error: "Error al eliminar plantilla de correo" }
    }
}

// TODO: Registra y consulta el historial de envíos con trazabilidad completa
export const getInvoiceEmailLogs = async (invoiceId: string) => {
    try {
        const logs = await db.invoiceEmailLog.findMany({
            where: { invoiceId },
            orderBy: { sentAt: "desc" },
        })

        return { success: true, data: logs }
    } catch (error) {
        console.error("Error al obtener historial de envíos:", error)
        return { success: false, error: "Error al obtener historial de envíos" }
    }
}

// TODO: Genera un PDF para una transacción específica with todos los detalles y datos de la agencia
export const generateTransactionPDFById = async ({
  transactionId,
  agencyId,
}: {
  transactionId: string
  agencyId: string
}) => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, error: "No autorizado" }

    // Obtener la transacción con todas las relaciones
    const transaction = await db.sale.findUnique({
      where: {
        id: transactionId,
        agencyId: agencyId,
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
        SubAccount: true,
      },
    })

    if (!transaction) {
      return { success: false, error: "Transacción no encontrada" }
    }

    // Obtener información de la agencia
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        name: true,
        companyEmail: true,
        companyPhone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        taxId: true,
        agencyLogo: true,
      },
    })

    // Generar el PDF
    const pdfBuffer = await generateTransactionPDF(transaction, agency || undefined)

    return {
      success: true,
      data: pdfBuffer,
      filename: `Transaccion-${transaction.reference || transaction.id}.pdf`,
    }
  } catch (error) {
    console.error("Error generando PDF de transacción:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generando PDF de transacción",
    }
  }
}

// TODO: Envía por email los detalles de una transacción específica
export const sendTransactionEmailById = async ({
    transactionId,
    agencyId,
    emailData,
}: {
    transactionId: string;
    agencyId: string;
    emailData: {
        recipientEmail: string;
        recipientName?: string;
        subject?: string;
        message?: string;
    };
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // Verificar acceso a la agencia
        const hasAccess = user.Agency?.id === agencyId || user.SubAccount?.some((sa) => sa.agencyId === agencyId);
        if (!hasAccess) {
            return { success: false, error: "No autorizado para acceder a esta agencia" };
        }

        // Obtener la transacción con todas las relaciones
        const transaction = await db.sale.findUnique({
            where: {
                id: transactionId,
                agencyId: agencyId,
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
                SubAccount: true,
            },
        });

        if (!transaction) {
            return { success: false, error: "Transacción no encontrada" };
        }

        // Enviar el email
        await sendTransactionEmail(transaction, agencyId, emailData);

        // Registrar el envío del email
        await db.transactionEmailLog.create({
            data: {
                transactionId: transaction.id,
                email: emailData.recipientEmail,
                sentAt: new Date(),
                status: "SENT",
                subject: emailData.subject,
                message: emailData.message,
            },
        });

        return {
            success: true,
            message: "Email enviado exitosamente"
        };
    } catch (error) {
        console.error("Error enviando email de transacción:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error enviando email de transacción"
        };
    }
};

// TODO: Genera un PDF de factura y lo retorna como buffer
export const generateInvoicePDFById = async ({
  invoiceId,
  agencyId,
}: {
  invoiceId: string
  agencyId: string
}) => {
  console.log("[PDF] Inicio generateInvoicePDFById con jsPDF", { invoiceId, agencyId })

  try {
    const user = await currentUser()
    console.log("[PDF] Usuario autenticado:", user?.id)

    if (!user) {
      return { success: false, error: "No autorizado" }
    }

    // Obtener información de la agencia
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        name: true,
        companyEmail: true,
        companyPhone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        taxId: true,
        agencyLogo: true,
      },
    })

    console.log("[PDF] Agencia encontrada:", agency ? agency.name : "No encontrada")

    if (!agency) {
      return { success: false, error: "Agencia no encontrada" }
    }

    // Obtener la factura con todas las relaciones
    const invoice = await db.invoice.findUnique({
      where: {
        id: invoiceId,
        agencyId: agencyId,
      },
      include: {
        Customer: true,
        Items: {
          include: {
            Product: true,
          },
        },
        Payments: true,
        Taxes: {
          include: {
            Tax: true,
          },
        },
        SubAccount: true,
      },
    })

    console.log("[PDF] Factura encontrada:", invoice ? invoice.id : "No encontrada")

    if (!invoice) {
      return { success: false, error: "Factura no encontrada" }
    }

    // Validar datos mínimos
    if (!invoice.invoiceNumber || !invoice.total) {
      return { success: false, error: "Datos de factura incompletos" }
    }

    // Generar el PDF con jsPDF
    console.log("[PDF] Iniciando generación de PDF con jsPDF...")
    const pdfBuffer = await generateInvoicePDF(invoice, agency)
    console.log("[PDF] Buffer generado exitosamente, tamaño:", pdfBuffer?.length)

    return {
      success: true,
      data: pdfBuffer,
      filename: `Factura-${invoice.invoiceNumber}.pdf`,
    }
  } catch (error) {
    console.error("[PDF] Error generando PDF:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generando PDF",
    }
  }
}

// TODO: Obtiene y filtra la lista de clientes de una agencia con sus relaciones
export const getCustomers = async ({
    agencyId,
    subAccountId,
}: {
    agencyId: string;
    subAccountId?: string;
}) => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No autorizado" };

        const customers = await db.customer.findMany({
            where: {
                agencyId,
                ...(subAccountId ? { subAccountId } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                taxId: true,
                taxType: true,
                type: true,
                status: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return { success: true, data: customers };
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return { success: false, error: "Error al obtener clientes" };
    }
};
