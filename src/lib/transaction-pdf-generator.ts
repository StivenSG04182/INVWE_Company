import jsPDF from "jspdf"
import "jspdf-autotable"

interface TransactionData {
    id: string
    reference?: string
    saleDate: string
    total: number
    subtotal?: number
    tax?: number
    discount?: number
    status: string
    Customer?: {
        name: string
        email?: string
        phone?: string
        address?: string
    } | null
    Cashier?: {
        name: string
    } | null
    Area?: {
        name: string
    } | null
    Items: Array<{
        id: string
        quantity: number
        unitPrice: number
        total: number
        Product: {
            name: string
        }
    }>
    SubAccount?: {
        name: string
    } | null
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
}

// Compatibilidad Buffer para Node.js ESM y browser
let MyBuffer: typeof Buffer
try {
  MyBuffer = Buffer
} catch {
  // @ts-ignore
  MyBuffer = (await import('buffer')).Buffer
}

// Extiende el tipado de jsPDF para lastAutoTable
declare global {
  interface jsPDF {
    lastAutoTable?: { finalY?: number }
  }
}

export const generateTransactionPDF = async (transaction: TransactionData, agency?: AgencyData): Promise<Buffer> => {
    const doc = new jsPDF()

    // Configuración de colores
    const primaryColor: [number, number, number] = [59, 130, 246] // Blue-500
    const secondaryColor: [number, number, number] = [107, 114, 128] // Gray-500
    const textColor: [number, number, number] = [17, 24, 39] // Gray-900

    let yPos = 25

    // Logo de la agencia si está disponible
    if (agency?.logo) {
        // Solo se soportan imágenes en formato base64 DataURL
        if (agency.logo.startsWith('data:image')) {
            try {
                // Se asume que el logo es un PNG base64 válido
                const imgWidth = 40
                // Altura fija por defecto (no se puede calcular sin cargar la imagen en Node)
                const imgHeight = 20
                doc.addImage(agency.logo, 'PNG', 20, yPos - 10, imgWidth, imgHeight)
                yPos += imgHeight + 5
            } catch (error) {
                console.error('Error al agregar el logo:', error)
                yPos = 25
            }
        }
    }

    // Encabezado
    doc.setFontSize(20)
    doc.setTextColor(...primaryColor)
    doc.text("RECIBO DE VENTA", 20, yPos)
    yPos += 10

    // Información de la empresa
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(agency?.name || "Mi Empresa", 20, yPos)
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

    // Información de la transacción
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text(`Recibo No: ${transaction.reference || transaction.id.substring(0, 8)}`, 140, 35)

    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(`Fecha: ${new Date(transaction.saleDate).toLocaleDateString("es-CO")}`, 140, 45)
    doc.text(`Cajero: ${transaction.Cashier?.name || "Sistema"}`, 140, 52)
    if (transaction.Area) {
        doc.text(`Área: ${transaction.Area.name}`, 140, 59)
    }

    // Estado de la transacción
    const statusText = getTransactionStatusText(transaction.status)
    const statusColor = getTransactionStatusColorRGB(transaction.status)
    doc.setTextColor(...statusColor)
    doc.text(`Estado: ${statusText}`, 140, 66)

    // Información del cliente
    doc.setTextColor(...primaryColor)
    doc.setFontSize(12)
    doc.text("INFORMACIÓN DEL CLIENTE", 20, 85)

    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    const customer = transaction.Customer
    if (customer) {
        doc.text(`Cliente: ${customer.name}`, 20, 95)
        if (customer.email) {
            doc.text(`Email: ${customer.email}`, 20, 102)
        }
        if (customer.phone) {
            doc.text(`Teléfono: ${customer.phone}`, 20, 109)
        }
        if (customer.address) {
            doc.text(`Dirección: ${customer.address}`, 20, 116)
        }
    } else {
        doc.text("Cliente: Cliente general", 20, 95)
    }

    // Tabla de productos
    const tableData = transaction.Items.map((item) => [
        item.Product.name,
        item.quantity.toString(),
        `$${Number(item.unitPrice).toLocaleString("es-CO")}`,
        `$${Number(item.total).toLocaleString("es-CO")}`,
    ])

    // @ts-ignore
    doc.autoTable({
        head: [["Producto", "Cant.", "Precio Unit.", "Total"]],
        body: tableData,
        startY: 130,
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
            3: { halign: "right" },
        },
    })

    // @ts-expect-error: lastAutoTable es agregado por autotable
    const finalY = doc.lastAutoTable?.finalY || 180

    // Totales
    const totalsStartY = finalY + 20
    doc.setFontSize(10)
    doc.setTextColor(...textColor)

    if (transaction.subtotal && Number(transaction.subtotal) !== Number(transaction.total)) {
        doc.text("Subtotal:", 140, totalsStartY)
        doc.text(`$${Number(transaction.subtotal).toLocaleString("es-CO")}`, 180, totalsStartY, { align: "right" })
    }

    if (transaction.discount && Number(transaction.discount) > 0) {
        doc.text("Descuento:", 140, totalsStartY + 7)
        doc.text(`-$${Number(transaction.discount).toLocaleString("es-CO")}`, 180, totalsStartY + 7, { align: "right" })
    }

    if (transaction.tax && Number(transaction.tax) > 0) {
        doc.text("Impuestos:", 140, totalsStartY + 14)
        doc.text(`$${Number(transaction.tax).toLocaleString("es-CO")}`, 180, totalsStartY + 14, { align: "right" })
    }

    // Total
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text("TOTAL:", 140, totalsStartY + 25)
    doc.text(`$${Number(transaction.total).toLocaleString("es-CO")} COP`, 180, totalsStartY + 25, { align: "right" })

    // Pie de página
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text("Gracias por su compra. Este recibo es válido como comprobante de venta.", 20, pageHeight - 20)
    doc.text(`Generado el ${new Date().toLocaleString("es-CO")}`, 20, pageHeight - 15)

    // Convertir a Buffer
    const pdfBuffer = MyBuffer.from(doc.output('arraybuffer'))
    return pdfBuffer as Buffer
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

const getTransactionStatusColorRGB = (status: string): [number, number, number] => {
    switch (status) {
        case "COMPLETED":
            return [34, 197, 94] // Green-500
        case "PENDING":
            return [245, 158, 11] // Amber-500
        case "CANCELLED":
            return [239, 68, 68] // Red-500
        default:
            return [107, 114, 128] // Gray-500
    }
}
