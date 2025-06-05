import nodemailer from "nodemailer"
import { generateInvoicePDF } from "./pdf-generator"
import { generateTransactionPDF } from "./transaction-pdf-generator"
import { db } from "./db"
import Image from "next/image"

interface EmailConfig {
    host: string
    port: number
    secure: boolean
    auth: {
        user: string
        pass: string
    }
    from: string
}

// Configuración del transportador de email
const createTransporter = (config: EmailConfig) => {
    return nodemailer.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
    })
}

export const sendTransactionEmail = async (
    transaction: any,
    agencyId: string,
    emailOptions: {
        recipientEmail: string
        recipientName: string
        subject?: string
        message?: string
    },
) => {
    try {
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
                logo: true,
                DianConfig: true,
            },
        })

        if (!agency) {
            throw new Error("No se encontró la agencia")
        }

        // Obtener configuración de email
        const emailConfig: EmailConfig = {
            host: agency.DianConfig?.emailHost || process.env.SMTP_HOST || "smtp.gmail.com",
            port: agency.DianConfig?.emailPort || Number.parseInt(process.env.SMTP_PORT || "587"),
            secure: agency.DianConfig?.emailSecure || process.env.SMTP_SECURE === "true",
            auth: {
                user: agency.DianConfig?.emailUser || process.env.SMTP_USER || "",
                pass: agency.DianConfig?.emailPassword || process.env.SMTP_PASS || "",
            },
            from: agency.DianConfig?.emailFrom || agency.companyEmail || process.env.SMTP_FROM || "",
        }

        // Generar PDF de la transacción
        const pdfBuffer = await generateTransactionPDF(transaction, agency)

        const transporter = createTransporter(emailConfig)

        // Configurar el email
        const mailOptions = {
            from: {
                name: agency.name || "Sistema de Ventas",
                address: emailConfig.from,
            },
            to: emailOptions.recipientEmail,
            subject: emailOptions.subject || `Recibo de compra - ${agency.name}`,
            html: generateTransactionEmailTemplate(transaction, agency, emailOptions),
            attachments: [
                {
                    filename: `Recibo-${transaction.reference || transaction.id}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        }

        // Enviar el email
        const info = await transporter.sendMail(mailOptions)
        console.log("Email de transacción enviado:", info.messageId)

        return info
    } catch (error) {
        console.error("Error enviando email de transacción:", error)
        throw error
    }
}

const generateTransactionEmailTemplate = (
    transaction: any,
    agency: any,
    emailOptions: { recipientName: string; message?: string },
): string => {
    const statusText = getTransactionStatusText(transaction.status)
    const statusColor = getTransactionStatusColor(transaction.status)

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Compra</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 10px;
            }
            .content {
                background-color: #f9fafb;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }
            .transaction-details {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #3b82f6;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background-color: ${statusColor};
            }
            .total-amount {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                text-align: center;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            ${agency.logo ? `<Image src="${agency.logo}" alt="${agency.name}" class="logo">` : ""}
            <h1>${agency.name || "Mi Empresa"}</h1>
            <p>Recibo de Compra</p>
        </div>
        
        <div class="content">
            <h2>Estimado/a ${emailOptions.recipientName},</h2>
            
            ${emailOptions.message
            ? `<p>${emailOptions.message}</p>`
            : `
            <p>Gracias por su compra. Adjunto encontrará el recibo de su transacción con los siguientes detalles:</p>
            `
        }
            
            <div class="transaction-details">
                <h3>Detalles de la Transacción</h3>
                <p><strong>Referencia:</strong> ${transaction.reference || transaction.id.substring(0, 8)}</p>
                <p><strong>Fecha:</strong> ${new Date(transaction.saleDate).toLocaleDateString("es-CO")}</p>
                <p><strong>Cajero:</strong> ${transaction.Cashier?.name || "Sistema"}</p>
                ${transaction.Area ? `<p><strong>Área:</strong> ${transaction.Area.name}</p>` : ""}
                <p><strong>Estado:</strong> <span class="status-badge">${statusText}</span></p>
            </div>
            
            <div class="total-amount">
                Total: $${Number(transaction.total).toLocaleString("es-CO")} COP
            </div>
            
            <p>Si tiene alguna pregunta sobre esta transacción, no dude en contactarnos:</p>
            <ul>
                <li>Teléfono: ${agency.companyPhone || ""}</li>
                <li>Email: ${agency.companyEmail || ""}</li>
                <li>Dirección: ${agency.address || ""}, ${agency.city || ""}, ${agency.state || ""}</li>
            </ul>
            
            <p>Gracias por elegirnos.</p>
            
            <p>Cordialmente,<br>
            <strong>Equipo de Ventas</strong><br>
            ${agency.name || ""}</p>
        </div>
        
        <div class="footer">
            <p>Este correo fue generado automáticamente. Por favor no responda a esta dirección.</p>
            <p>${agency.name || ""} - ${agency.taxId ? `NIT: ${agency.taxId}` : ""}</p>
            <p>${agency.address || ""}, ${agency.city || ""}, ${agency.state || ""}, ${agency.country || ""}</p>
        </div>
    </body>
    </html>
    `
}

const getTransactionStatusText = (status: string): string => {
    switch (status) {
        case "COMPLETED":
            return "Completada"
        case "PENDING":
            return "Pendiente"
        case "CANCELLED":
            return "Cancelada"
        default:
            return "Desconocido"
    }
}

const getTransactionStatusColor = (status: string): string => {
    switch (status) {
        case "COMPLETED":
            return "#22c55e"
        case "PENDING":
            return "#f59e0b"
        case "CANCELLED":
            return "#ef4444"
        default:
            return "#6b7280"
    }
}

// Mantener las funciones existentes para facturas
export const sendInvoiceEmail = async (invoice: any, agencyId: string) => {
    try {
        if (!invoice.Customer?.email) {
            throw new Error("El cliente no tiene email registrado")
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
                logo: true,
                DianConfig: true,
            },
        })

        if (!agency) {
            throw new Error("No se encontró la agencia")
        }

        // Obtener configuración de email de la agencia o usar la configuración DIAN si existe
        const emailConfig: EmailConfig = {
            host: agency.DianConfig?.emailHost || process.env.SMTP_HOST || "smtp.gmail.com",
            port: agency.DianConfig?.emailPort || Number.parseInt(process.env.SMTP_PORT || "587"),
            secure: agency.DianConfig?.emailSecure || process.env.SMTP_SECURE === "true",
            auth: {
                user: agency.DianConfig?.emailUser || process.env.SMTP_USER || "",
                pass: agency.DianConfig?.emailPassword || process.env.SMTP_PASS || "",
            },
            from: agency.DianConfig?.emailFrom || agency.companyEmail || process.env.SMTP_FROM || "",
        }

        // Verificar si existe una plantilla personalizada para facturas
        const emailTemplate = await db.emailTemplate.findFirst({
            where: {
                agencyId: agencyId,
                type: "INVOICE",
                isActive: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        })

        // Generar PDF de la factura
        const pdfBuffer = await generateInvoicePDF(invoice, agency)

        const transporter = createTransporter(emailConfig)

        // Configurar el email
        const mailOptions = {
            from: {
                name: agency.name || "Sistema de Facturación",
                address: emailConfig.from,
            },
            to: invoice.Customer.email,
            subject: `Factura ${invoice.invoiceNumber} - ${agency.name}`,
            html: emailTemplate
                ? renderEmailTemplate(emailTemplate.content, { invoice, agency })
                : generateDefaultEmailTemplate(invoice, agency),
            attachments: [
                {
                    filename: `Factura-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        }

        // Enviar el email
        const info = await transporter.sendMail(mailOptions)
        console.log("Email enviado:", info.messageId)

        // Registrar el envío en la base de datos
        await db.invoiceEmailLog.create({
            data: {
                invoiceId: invoice.id,
                email: invoice.Customer.email,
                sentAt: new Date(),
                status: "SENT",
                subject: mailOptions.subject,
                templateId: emailTemplate?.id,
            },
        })

        return info
    } catch (error) {
        console.error("Error enviando email:", error)
        throw error
    }
}

// Función para renderizar plantillas personalizadas
const renderEmailTemplate = (templateContent: any, data: { invoice: any; agency: any }) => {
    // Si el contenido de la plantilla es un string (HTML), reemplazar variables
    if (typeof templateContent === "string") {
        let html = templateContent

        // Reemplazar variables de la factura
        html = html
            .replace(/{{invoice\.invoiceNumber}}/g, data.invoice.invoiceNumber || "")
            .replace(/{{invoice\.total}}/g, Number(data.invoice.total).toLocaleString("es-CO") || "")
            .replace(/{{invoice\.subtotal}}/g, Number(data.invoice.subtotal).toLocaleString("es-CO") || "")
            .replace(/{{invoice\.tax}}/g, Number(data.invoice.tax).toLocaleString("es-CO") || "")
            .replace(/{{invoice\.issuedDate}}/g, new Date(data.invoice.issuedDate).toLocaleDateString("es-CO") || "")
            .replace(
                /{{invoice\.dueDate}}/g,
                data.invoice.dueDate ? new Date(data.invoice.dueDate).toLocaleDateString("es-CO") : "",
            )
            .replace(/{{invoice\.status}}/g, getStatusText(data.invoice.status) || "")

        // Reemplazar variables del cliente
        html = html
            .replace(/{{customer\.name}}/g, data.invoice.Customer?.name || "Cliente")
            .replace(/{{customer\.email}}/g, data.invoice.Customer?.email || "")
            .replace(/{{customer\.phone}}/g, data.invoice.Customer?.phone || "")
            .replace(/{{customer\.address}}/g, data.invoice.Customer?.address || "")
            .replace(/{{customer\.taxId}}/g, data.invoice.Customer?.taxId || "")

        // Reemplazar variables de la agencia
        html = html
            .replace(/{{agency\.name}}/g, data.agency.name || "")
            .replace(/{{agency\.logo}}/g, data.agency.logo || "")
            .replace(/{{agency\.address}}/g, data.agency.address || "")
            .replace(/{{agency\.city}}/g, data.agency.city || "")
            .replace(/{{agency\.state}}/g, data.agency.state || "")
            .replace(/{{agency\.country}}/g, data.agency.country || "")
            .replace(/{{agency\.phone}}/g, data.agency.companyPhone || "")
            .replace(/{{agency\.email}}/g, data.agency.companyEmail || "")
            .replace(/{{agency\.taxId}}/g, data.agency.taxId || "")

        return html
    }

    // Si el contenido es un objeto (estructura JSON del editor)
    if (typeof templateContent === "object") {
        // Convertir la estructura del editor a HTML
        return convertEditorContentToHtml(templateContent, data)
    }

    // Si no se puede procesar, usar la plantilla por defecto
    return generateDefaultEmailTemplate(data.invoice, data.agency)
}

// Función para convertir el contenido del editor a HTML
const convertEditorContentToHtml = (content: any, data: { invoice: any; agency: any }) => {
    // Esta función debería convertir la estructura JSON del editor a HTML
    // Por ahora, usamos una implementación básica

    let html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${data.invoice.invoiceNumber}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">`

    // Procesar elementos del editor
    if (Array.isArray(content)) {
        content.forEach((element) => {
            html += renderElement(element, data)
        })
    }

    html += `
    </div>
  </body>
  </html>`

    return html
}

// Función para renderizar un elemento del editor
const renderElement = (element: any, data: { invoice: any; agency: any }): string => {
    switch (element.type) {
        case "header":
            return `<h1 style="${styleObjectToString(element.styles)}">${replaceVariables(element.content, data)}</h1>`
        case "text":
            return `<p style="${styleObjectToString(element.styles)}">${replaceVariables(element.content, data)}</p>`
        case "image":
            return `<Image src="${element.content?.src || data.agency.logo || ""}" alt="${element.content?.alt || ""}" style="${styleObjectToString(element.styles)}" />`
        case "button":
            return `<a href="${element.content?.url || "#"}" style="${styleObjectToString(element.styles)}">${replaceVariables(element.content?.text || "", data)}</a>`
        case "divider":
            return `<hr style="${styleObjectToString(element.styles)}" />`
        case "spacer":
            return `<div style="${styleObjectToString(element.styles)}"></div>`
        case "section":
            let sectionContent = ""
            if (Array.isArray(element.content)) {
                element.content.forEach((child) => {
                    sectionContent += renderElement(child, data)
                })
            }
            return `<div style="${styleObjectToString(element.styles)}">${sectionContent}</div>`
        case "columns":
            let columnsContent =
                '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="' +
                styleObjectToString(element.styles) +
                '"><tr>'
            if (Array.isArray(element.content)) {
                element.content.forEach((column) => {
                    let columnContent = ""
                    if (Array.isArray(column.content)) {
                        column.content.forEach((child) => {
                            columnContent += renderElement(child, data)
                        })
                    }
                    columnsContent += `<td style="${styleObjectToString(column.styles)}">${columnContent}</td>`
                })
            }
            columnsContent += "</tr></table>"
            return columnsContent
        default:
            return ""
    }
}

// Función para convertir objeto de estilos a string CSS
const styleObjectToString = (styles: Record<string, string> = {}): string => {
    return Object.entries(styles)
        .map(([key, value]) => `${key}: ${value};`)
        .join(" ")
}

// Función para reemplazar variables en el texto
const replaceVariables = (text: string, data: { invoice: any; agency: any }): string => {
    if (typeof text !== "string") return ""

    // Reemplazar variables de la factura
    text = text
        .replace(/{{invoice\.invoiceNumber}}/g, data.invoice.invoiceNumber || "")
        .replace(/{{invoice\.total}}/g, Number(data.invoice.total).toLocaleString("es-CO") || "")
        .replace(/{{invoice\.subtotal}}/g, Number(data.invoice.subtotal).toLocaleString("es-CO") || "")
        .replace(/{{invoice\.tax}}/g, Number(data.invoice.tax).toLocaleString("es-CO") || "")
        .replace(/{{invoice\.issuedDate}}/g, new Date(data.invoice.issuedDate).toLocaleDateString("es-CO") || "")
        .replace(
            /{{invoice\.dueDate}}/g,
            data.invoice.dueDate ? new Date(data.invoice.dueDate).toLocaleDateString("es-CO") : "",
        )
        .replace(/{{invoice\.status}}/g, getStatusText(data.invoice.status) || "")

    // Reemplazar variables del cliente
    text = text
        .replace(/{{customer\.name}}/g, data.invoice.Customer?.name || "Cliente")
        .replace(/{{customer\.email}}/g, data.invoice.Customer?.email || "")
        .replace(/{{customer\.phone}}/g, data.invoice.Customer?.phone || "")
        .replace(/{{customer\.address}}/g, data.invoice.Customer?.address || "")
        .replace(/{{customer\.taxId}}/g, data.invoice.Customer?.taxId || "")

    // Reemplazar variables de la agencia
    text = text
        .replace(/{{agency\.name}}/g, data.agency.name || "")
        .replace(/{{agency\.address}}/g, data.agency.address || "")
        .replace(/{{agency\.city}}/g, data.agency.city || "")
        .replace(/{{agency\.state}}/g, data.agency.state || "")
        .replace(/{{agency\.country}}/g, data.agency.country || "")
        .replace(/{{agency\.phone}}/g, data.agency.companyPhone || "")
        .replace(/{{agency\.email}}/g, data.agency.companyEmail || "")
        .replace(/{{agency\.taxId}}/g, data.agency.taxId || "")

    return text
}

const generateDefaultEmailTemplate = (invoice: any, agency: any): string => {
    const statusText = getStatusText(invoice.status)
    const statusColor = getStatusColor(invoice.status)

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura ${invoice.invoiceNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 10px;
            }
            .content {
                background-color: #f9fafb;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }
            .invoice-details {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #3b82f6;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background-color: ${statusColor};
            }
            .total-amount {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                text-align: center;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            ${agency.logo ? `<Image src="${agency.logo}" alt="${agency.name}" class="logo">` : ""}
            <h1>${agency.name || "Mi Empresa"}</h1>
            <p>Factura de Venta</p>
        </div>
        
        <div class="content">
            <h2>Estimado/a ${invoice.Customer?.name || "Cliente"},</h2>
            
            <p>Esperamos que se encuentre bien. Adjunto a este correo encontrará su factura de venta con los siguientes detalles:</p>
            
            <div class="invoice-details">
                <h3>Detalles de la Factura</h3>
                <p><strong>Número de Factura:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Fecha de Emisión:</strong> ${new Date(invoice.issuedDate).toLocaleDateString("es-CO")}</p>
                ${invoice.dueDate ? `<p><strong>Fecha de Vencimiento:</strong> ${new Date(invoice.dueDate).toLocaleDateString("es-CO")}</p>` : ""}
                <p><strong>Estado:</strong> <span class="status-badge">${statusText}</span></p>
                <p><strong>Tipo:</strong> ${invoice.invoiceType === "ELECTRONIC" ? "Factura Electrónica" : invoice.invoiceType === "BOTH" ? "Factura Electrónica y Física" : "Factura Física"}</p>
            </div>
            
            <div class="total-amount">
                Total: $${Number(invoice.total).toLocaleString("es-CO")} COP
            </div>
            
            ${invoice.status === "PENDING" || invoice.status === "OVERDUE"
            ? `
                <p style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <strong>Recordatorio:</strong> Esta factura se encuentra pendiente de pago. 
                    Le agradecemos procesar el pago a la mayor brevedad posible.
                </p>
            `
            : ""
        }
            
            ${invoice.notes
            ? `
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <h4>Notas adicionales:</h4>
                    <p>${invoice.notes}</p>
                </div>
            `
            : ""
        }
            
            <p>Si tiene alguna pregunta sobre esta factura, no dude en contactarnos:</p>
            <ul>
                <li>Teléfono: ${agency.companyPhone || ""}</li>
                <li>Email: ${agency.companyEmail || ""}</li>
                <li>Dirección: ${agency.address || ""}, ${agency.city || ""}, ${agency.state || ""}</li>
            </ul>
            
            <p>Gracias por confiar en nosotros.</p>
            
            <p>Cordialmente,<br>
            <strong>Equipo de Facturación</strong><br>
            ${agency.name || ""}</p>
        </div>
        
        <div class="footer">
            <p>Este correo fue generado automáticamente. Por favor no responda a esta dirección.</p>
            <p>${agency.name || ""} - ${agency.taxId ? `NIT: ${agency.taxId}` : ""}</p>
            <p>${agency.address || ""}, ${agency.city || ""}, ${agency.state || ""}, ${agency.country || ""}</p>
            <p>Esta factura cumple con la normativa DIAN vigente para facturación electrónica.</p>
        </div>
    </body>
    </html>
    `
}

const getStatusText = (status: string): string => {
    switch (status) {
        case "PAID":
            return "Pagada"
        case "PENDING":
            return "Pendiente"
        case "OVERDUE":
            return "Vencida"
        case "CANCELLED":
            return "Anulada"
        case "DRAFT":
            return "Borrador"
        default:
            return "Desconocido"
    }
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case "PAID":
            return "#22c55e"
        case "PENDING":
            return "#f59e0b"
        case "OVERDUE":
            return "#ef4444"
        case "CANCELLED":
            return "#6b7280"
        case "DRAFT":
            return "#3b82f6"
        default:
            return "#6b7280"
    }
}
