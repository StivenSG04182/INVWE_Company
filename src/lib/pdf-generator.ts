import jsPDF from "jspdf"
import "jspdf-autotable"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

interface InvoiceData {
    id: string
    invoiceNumber: string
    issuedDate: string
    dueDate?: string
    total: number
    subtotal: number
    tax: number
    discount: number
    status: string
    invoiceType: string
    Customer?: {
        name: string
        email?: string
        phone?: string
        address?: string
        city?: string
        state?: string
        zipCode?: string
        country?: string
        taxId?: string
        taxIdType?: string
    } | null
    Items: Array<{
        id: string
        quantity: number
        unitPrice: number
        total: number
        discount: number
        description?: string
        Product: {
            name: string
        }
    }>
    SubAccount?: {
        name: string
    } | null
    notes?: string
    cufe?: string
    qrCode?: string
}

interface AgencyData {
    name: string
    companyEmail?: string
    companyPhone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
    taxId?: string
    logo?: string
    DianConfig?: any
}

export const generateInvoicePDF = async (invoice: InvoiceData, agency?: AgencyData): Promise<Buffer> => {
    const doc = new jsPDF()

    // Configuración de colores
    const primaryColor = [59, 130, 246] // Blue-500
    const secondaryColor = [107, 114, 128] // Gray-500
    const textColor = [17, 24, 39] // Gray-900

    // Encabezado con logo de la agencia si está disponible
    let yPos = 25

    if (agency?.logo) {
        try {
            // Intentar cargar el logo
            const img = new Image()
            img.src = agency.logo
            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
            })

            // Calcular dimensiones para mantener la proporción
            const imgWidth = 40
            const imgHeight = (img.height * imgWidth) / img.width

            doc.addImage(agency.logo, "PNG", 20, yPos - 10, imgWidth, imgHeight)
            yPos += imgHeight + 5
        } catch (error) {
            console.error("Error al cargar el logo:", error)
            // Si hay error, continuar sin logo
            yPos = 25
        }
    }

    // Encabezado de la factura
    doc.setFontSize(20)
    doc.setTextColor(...primaryColor)
    doc.text("FACTURA DE VENTA", 20, yPos)
    yPos += 10

    // Información de la empresa
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(agency?.name || "Mi Empresa SAS", 20, yPos)
    yPos += 7

    if (agency?.taxId) {
        doc.text(`NIT: ${agency.taxId}`, 20, yPos)
        yPos += 7
    }

    if (agency?.address) {
        doc.text(`Dirección: ${agency.address}`, 20, yPos)
        yPos += 7
    }

    if (agency?.city || agency?.state) {
        doc.text(`${agency.city || ""}, ${agency.state || ""}`, 20, yPos)
        yPos += 7
    }

    if (agency?.companyPhone) {
        doc.text(`Tel: ${agency.companyPhone}`, 20, yPos)
        yPos += 7
    }

    // Información de la factura
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text(`Factura No: ${invoice.invoiceNumber}`, 140, 35)

    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(`Fecha de emisión: ${new Date(invoice.issuedDate).toLocaleDateString("es-CO")}`, 140, 45)
    if (invoice.dueDate) {
        doc.text(`Fecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString("es-CO")}`, 140, 52)
    }
    doc.text(`Tipo: ${getInvoiceTypeText(invoice.invoiceType)}`, 140, 59)

    // Estado de la factura
    const statusText = getStatusText(invoice.status)
    const statusColor = getStatusColorRGB(invoice.status)
    doc.setTextColor(...statusColor)
    doc.text(`Estado: ${statusText}`, 140, 66)

    // Información del cliente
    doc.setTextColor(...primaryColor)
    doc.setFontSize(12)
    doc.text("INFORMACIÓN DEL CLIENTE", 20, 85)

    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    const customer = invoice.Customer
    if (customer) {
        doc.text(`Cliente: ${customer.name}`, 20, 95)
        if (customer.taxId) {
            doc.text(`${customer.taxIdType || "NIT"}: ${customer.taxId}`, 20, 102)
        }
        if (customer.email) {
            doc.text(`Email: ${customer.email}`, 20, 109)
        }
        if (customer.phone) {
            doc.text(`Teléfono: ${customer.phone}`, 20, 116)
        }
        if (customer.address) {
            doc.text(`Dirección: ${customer.address}`, 20, 123)
            if (customer.city) {
                doc.text(`${customer.city}, ${customer.state || ""} ${customer.zipCode || ""}`, 20, 130)
            }
        }
    } else {
        doc.text("Cliente: Cliente general", 20, 95)
    }

    // Tabla de productos
    const tableData = invoice.Items.map((item) => [
        item.Product.name,
        item.quantity.toString(),
        `$${Number(item.unitPrice).toLocaleString("es-CO")}`,
        item.discount > 0 ? `${item.discount}%` : "-",
        `$${Number(item.total).toLocaleString("es-CO")}`,
    ])

    // @ts-ignore
    doc.autoTable({
        head: [["Producto/Servicio", "Cant.", "Precio Unit.", "Desc.", "Total"]],
        body: tableData,
        startY: 145,
        theme: "grid",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: "bold",
        },
        bodyStyles: {
            fontSize: 9,
            textColor: textColor,
        },
        columnStyles: {
            1: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "center" },
            4: { halign: "right" },
        },
    })

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 200

    // Totales
    const totalsStartY = finalY + 20
    doc.setFontSize(10)
    doc.setTextColor(...textColor)

    doc.text("Subtotal:", 140, totalsStartY)
    doc.text(`$${Number(invoice.subtotal).toLocaleString("es-CO")}`, 180, totalsStartY, { align: "right" })

    if (Number(invoice.discount) > 0) {
        doc.text("Descuento:", 140, totalsStartY + 7)
        doc.text(`-$${Number(invoice.discount).toLocaleString("es-CO")}`, 180, totalsStartY + 7, { align: "right" })
    }

    if (Number(invoice.tax) > 0) {
        doc.text("IVA:", 140, totalsStartY + 14)
        doc.text(`$${Number(invoice.tax).toLocaleString("es-CO")}`, 180, totalsStartY + 14, { align: "right" })
    }

    // Total
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text("TOTAL:", 140, totalsStartY + 25)
    doc.text(`$${Number(invoice.total).toLocaleString("es-CO")} COP`, 180, totalsStartY + 25, { align: "right" })

    // Notas
    if (invoice.notes) {
        doc.setFontSize(10)
        doc.setTextColor(...textColor)
        doc.text("Notas:", 20, totalsStartY + 40)
        const splitNotes = doc.splitTextToSize(invoice.notes, 160)
        doc.text(splitNotes, 20, totalsStartY + 47)
    }

    // Información DIAN para facturas electrónicas
    if (invoice.invoiceType === "ELECTRONIC" || invoice.invoiceType === "BOTH") {
        let dianY = totalsStartY + (invoice.notes ? 60 : 40)

        doc.setFontSize(10)
        doc.setTextColor(...primaryColor)
        doc.text("INFORMACIÓN FACTURA ELECTRÓNICA", 20, dianY)
        dianY += 10

        doc.setFontSize(8)
        doc.setTextColor(...textColor)

        if (invoice.cufe) {
            doc.text(`CUFE: ${invoice.cufe}`, 20, dianY)
            dianY += 5
        }

        // Si hay código QR, añadirlo
        if (invoice.qrCode) {
            try {
                // Aquí iría la lógica para generar el código QR
                // Por ahora, solo mostramos el texto
                doc.text(`Escanee el código QR para verificar la validez de esta factura electrónica.`, 20, dianY)
                dianY += 5
            } catch (error) {
                console.error("Error al generar código QR:", error)
            }
        }
    }

    // Pie de página
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text("Esta factura fue generada electrónicamente y cumple con la normativa DIAN vigente.", 20, pageHeight - 20)
    doc.text(`Generada el ${new Date().toLocaleString("es-CO")}`, 20, pageHeight - 15)

    // Convertir a Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    return pdfBuffer
}

// Función para añadir firma digital al PDF (simulada)
export const signPDF = async (pdfBuffer: Buffer, certificateData: any): Promise<Buffer> => {
    try {
        // Cargar el PDF existente
        const pdfDoc = await PDFDocument.load(pdfBuffer)

        // Añadir una página para la firma si es necesario
        const pages = pdfDoc.getPages()
        const lastPage = pages[pages.length - 1]

        // Añadir texto de firma
        const { width, height } = lastPage.getSize()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

        lastPage.drawText("Documento firmado digitalmente", {
            x: 50,
            y: 50,
            size: 12,
            font,
            color: rgb(0, 0, 0.7),
        })

        // Añadir información del certificado
        if (certificateData) {
            lastPage.drawText(`Certificado: ${certificateData.name || "No disponible"}`, {
                x: 50,
                y: 35,
                size: 8,
                font,
                color: rgb(0.4, 0.4, 0.4),
            })

            lastPage.drawText(`Fecha de firma: ${new Date().toLocaleString("es-CO")}`, {
                x: 50,
                y: 25,
                size: 8,
                font,
                color: rgb(0.4, 0.4, 0.4),
            })
        }

        // Guardar el PDF firmado
        const signedPdfBytes = await pdfDoc.save()

        return Buffer.from(signedPdfBytes)
    } catch (error) {
        console.error("Error al firmar el PDF:", error)
        // Si hay error, devolver el PDF original
        return pdfBuffer
    }
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

const getInvoiceTypeText = (type: string): string => {
    switch (type) {
        case "ELECTRONIC":
            return "Factura Electrónica"
        case "PHYSICAL":
            return "Factura Física"
        case "BOTH":
            return "Factura Electrónica y Física"
        default:
            return "Factura"
    }
}

const getStatusColorRGB = (status: string): [number, number, number] => {
    switch (status) {
        case "PAID":
            return [34, 197, 94] // Green-500
        case "PENDING":
            return [245, 158, 11] // Amber-500
        case "OVERDUE":
            return [239, 68, 68] // Red-500
        case "CANCELLED":
            return [107, 114, 128] // Gray-500
        case "DRAFT":
            return [59, 130, 246] // Blue-500
        default:
            return [107, 114, 128] // Gray-500
    }
}
