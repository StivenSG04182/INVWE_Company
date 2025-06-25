import jsPDF from "jspdf"

interface InvoiceData {
  id: string
  invoiceNumber: string
  issuedDate: Date
  dueDate?: Date
  status: string
  invoiceType: string
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  Customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
    taxId?: string
    taxIdType?: string
  } | null
  Items: Array<{
    description?: string
    quantity: number
    unitPrice: number
    discount: number
    tax: number
    total: number
    Product?: {
      name: string
    }
  }>
  Payments?: Array<{
    amount: number
    method: string
    createdAt: Date
  }>
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
  agencyLogo?: string
}

export const generateInvoicePDF = async (invoice: InvoiceData, agency?: AgencyData): Promise<Buffer> => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configurar colores
    const primaryColor = [37, 99, 235] // #2563eb
    const secondaryColor = [100, 116, 139] // #64748b
    const successColor = [22, 163, 74] // #16a34a
    const warningColor = [234, 88, 12] // #ea580c
    const dangerColor = [220, 38, 38] // #dc2626

    // Función para obtener color del estado
    const getStatusColor = (status: string): [number, number, number] => {
      switch (status.toUpperCase()) {
        case "PAID":
          return successColor
        case "PENDING":
          return warningColor
        case "OVERDUE":
          return dangerColor
        default:
          return secondaryColor
      }
    }

    // Función para obtener texto del estado
    const getStatusText = (status: string): string => {
      switch (status.toUpperCase()) {
        case "PAID":
          return "PAGADA"
        case "PENDING":
          return "PENDIENTE"
        case "OVERDUE":
          return "VENCIDA"
        case "CANCELLED":
          return "ANULADA"
        case "DRAFT":
          return "BORRADOR"
        default:
          return status.toUpperCase()
      }
    }

    let yPosition = 20

    // HEADER - Información de la empresa
    doc.setFontSize(24)
    doc.setTextColor(...primaryColor)
    doc.text(agency?.name || "EMPRESA", 20, yPosition)

    // Información de contacto de la empresa
    doc.setFontSize(10)
    doc.setTextColor(...secondaryColor)
    yPosition += 10
    if (agency?.address) {
      doc.text(agency.address, 20, yPosition)
      yPosition += 5
    }
    if (agency?.city || agency?.state || agency?.zipCode) {
      doc.text(`${agency?.city || ""} ${agency?.state || ""} ${agency?.zipCode || ""}`, 20, yPosition)
      yPosition += 5
    }
    if (agency?.companyPhone) {
      doc.text(`Tel: ${agency.companyPhone}`, 20, yPosition)
      yPosition += 5
    }
    if (agency?.companyEmail) {
      doc.text(`Email: ${agency.companyEmail}`, 20, yPosition)
      yPosition += 5
    }
    if (agency?.taxId) {
      doc.text(`NIT: ${agency.taxId}`, 20, yPosition)
      yPosition += 5
    }

    // TÍTULO FACTURA (lado derecho)
    doc.setFontSize(28)
    doc.setTextColor(...primaryColor)
    doc.text("FACTURA", 150, 25, { align: "right" })

    // Número de factura
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`No. ${invoice.invoiceNumber}`, 150, 35, { align: "right" })

    // Estado de la factura
    const statusColor = getStatusColor(invoice.status)
    const statusText = getStatusText(invoice.status)

    doc.setFillColor(...statusColor)
    doc.rect(120, 40, 70, 10, "F")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(statusText, 155, 47, { align: "center" })

    yPosition = 65

    // LÍNEA SEPARADORA
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(1)
    doc.line(20, yPosition, 190, yPosition)

    yPosition += 10

    // INFORMACIÓN DE FECHAS
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("FECHA DE EMISIÓN:", 20, yPosition)
    doc.text(new Date(invoice.issuedDate).toLocaleDateString("es-CO"), 70, yPosition)

    if (invoice.dueDate) {
      doc.text("FECHA DE VENCIMIENTO:", 120, yPosition)
      doc.text(new Date(invoice.dueDate).toLocaleDateString("es-CO"), 170, yPosition)
    }

    yPosition += 15

    // INFORMACIÓN DEL CLIENTE
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("FACTURAR A:", 20, yPosition)

    yPosition += 8

    if (invoice.Customer) {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(invoice.Customer.name, 20, yPosition)
      yPosition += 6

      if (invoice.Customer.taxId) {
        doc.text(`${invoice.Customer.taxIdType || "NIT"}: ${invoice.Customer.taxId}`, 20, yPosition)
        yPosition += 6
      }

      if (invoice.Customer.email) {
        doc.text(`Email: ${invoice.Customer.email}`, 20, yPosition)
        yPosition += 6
      }

      if (invoice.Customer.phone) {
        doc.text(`Teléfono: ${invoice.Customer.phone}`, 20, yPosition)
        yPosition += 6
      }

      if (invoice.Customer.address) {
        doc.text(`Dirección: ${invoice.Customer.address}`, 20, yPosition)
        yPosition += 6
      }
    } else {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Cliente General", 20, yPosition)
      yPosition += 6
    }

    yPosition += 10

    // TABLA DE PRODUCTOS/SERVICIOS
    const tableStartY = yPosition
    const colWidths = [15, 80, 20, 25, 20, 30]
    const colPositions = [20, 35, 115, 135, 160, 180]

    // Encabezados de la tabla
    doc.setFillColor(...primaryColor)
    doc.rect(20, tableStartY, 170, 10, "F")

    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text("#", colPositions[0] + 2, tableStartY + 7)
    doc.text("DESCRIPCIÓN", colPositions[1] + 2, tableStartY + 7)
    doc.text("CANT.", colPositions[2] + 2, tableStartY + 7)
    doc.text("PRECIO", colPositions[3] + 2, tableStartY + 7)
    doc.text("DESC.", colPositions[4] + 2, tableStartY + 7)
    doc.text("TOTAL", colPositions[5] + 2, tableStartY + 7)

    yPosition = tableStartY + 15

    // Filas de productos
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)

    invoice.Items.forEach((item, index) => {
      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(20, yPosition - 3, 170, 8, "F")
      }

      doc.text(`${index + 1}`, colPositions[0] + 2, yPosition + 2)

      // Truncar descripción si es muy larga
      const description = item.Product?.name || item.description || "Producto/Servicio"
      const truncatedDesc = description.length > 35 ? description.substring(0, 32) + "..." : description
      doc.text(truncatedDesc, colPositions[1] + 2, yPosition + 2)

      doc.text(item.quantity.toString(), colPositions[2] + 2, yPosition + 2)
      doc.text(`$${Number(item.unitPrice).toLocaleString("es-CO")}`, colPositions[3] + 2, yPosition + 2)
      doc.text(`${item.discount}%`, colPositions[4] + 2, yPosition + 2)
      doc.text(`$${Number(item.total).toLocaleString("es-CO")}`, colPositions[5] + 2, yPosition + 2)

      yPosition += 8
    })

    // Línea final de la tabla
    doc.setDrawColor(...primaryColor)
    doc.line(20, yPosition, 190, yPosition)

    yPosition += 15

    // TOTALES
    const totalsX = 120
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    doc.text("SUBTOTAL:", totalsX, yPosition)
    doc.text(`$${Number(invoice.subtotal).toLocaleString("es-CO")} COP`, 190, yPosition, { align: "right" })
    yPosition += 8

    if (Number(invoice.discount) > 0) {
      doc.text("DESCUENTO:", totalsX, yPosition)
      doc.text(`-$${Number(invoice.discount).toLocaleString("es-CO")} COP`, 190, yPosition, { align: "right" })
      yPosition += 8
    }

    if (Number(invoice.tax) > 0) {
      doc.text("IMPUESTOS:", totalsX, yPosition)
      doc.text(`$${Number(invoice.tax).toLocaleString("es-CO")} COP`, 190, yPosition, { align: "right" })
      yPosition += 8
    }

    // Total final
    doc.setFillColor(...primaryColor)
    doc.rect(totalsX - 5, yPosition - 2, 75, 12, "F")

    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text("TOTAL:", totalsX, yPosition + 5)
    doc.text(`$${Number(invoice.total).toLocaleString("es-CO")} COP`, 185, yPosition + 5, { align: "right" })

    yPosition += 20

    // INFORMACIÓN DE PAGOS (si existen)
    if (invoice.Payments && invoice.Payments.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text("HISTORIAL DE PAGOS:", 20, yPosition)
      yPosition += 8

      invoice.Payments.forEach((payment) => {
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(`${new Date(payment.createdAt).toLocaleDateString("es-CO")} - ${payment.method}`, 20, yPosition)
        doc.text(`$${Number(payment.amount).toLocaleString("es-CO")} COP`, 190, yPosition, { align: "right" })
        yPosition += 6
      })

      yPosition += 5
    }

    // NOTAS (si existen)
    if (invoice.notes) {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text("NOTAS:", 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      // Dividir las notas en líneas si son muy largas
      const noteLines = doc.splitTextToSize(invoice.notes, 170)
      doc.text(noteLines, 20, yPosition)
      yPosition += noteLines.length * 5 + 10
    }

    // FOOTER
    const footerY = 280
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text("Esta factura fue generada electrónicamente.", 105, footerY, { align: "center" })
    doc.text(
      `Generada el ${new Date().toLocaleDateString("es-CO")} a las ${new Date().toLocaleTimeString("es-CO")}`,
      105,
      footerY + 5,
      { align: "center" },
    )

    // Convertir a Buffer
    const pdfOutput = doc.output("arraybuffer")
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error("Error generando PDF con jsPDF:", error)
    throw error
  }
}

// Función auxiliar para generar PDF de transacciones
export const generateTransactionPDF = async (transaction: any, agency?: AgencyData): Promise<Buffer> => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const primaryColor = [37, 99, 235]
    const secondaryColor = [100, 116, 139]

    let yPosition = 20

    // HEADER
    doc.setFontSize(24)
    doc.setTextColor(...primaryColor)
    doc.text(agency?.name || "EMPRESA", 20, yPosition)

    // Información de contacto
    doc.setFontSize(10)
    doc.setTextColor(...secondaryColor)
    yPosition += 10
    if (agency?.address) {
      doc.text(agency.address, 20, yPosition)
      yPosition += 5
    }
    if (agency?.city || agency?.state) {
      doc.text(`${agency?.city || ""} ${agency?.state || ""}`, 20, yPosition)
      yPosition += 5
    }
    if (agency?.companyPhone) {
      doc.text(`Tel: ${agency.companyPhone}`, 20, yPosition)
      yPosition += 5
    }
    if (agency?.companyEmail) {
      doc.text(`Email: ${agency.companyEmail}`, 20, yPosition)
      yPosition += 5
    }

    // TÍTULO
    doc.setFontSize(28)
    doc.setTextColor(...primaryColor)
    doc.text("RECIBO DE VENTA", 150, 25, { align: "right" })

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`No. ${transaction.reference || transaction.id.substring(0, 8)}`, 150, 35, { align: "right" })

    yPosition = 60

    // INFORMACIÓN DE LA TRANSACCIÓN
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("FECHA:", 20, yPosition)
    doc.text(new Date(transaction.saleDate || transaction.createdAt).toLocaleDateString("es-CO"), 50, yPosition)

    if (transaction.Customer) {
      yPosition += 8
      doc.text("CLIENTE:", 20, yPosition)
      doc.text(transaction.Customer.name, 50, yPosition)
    }

    if (transaction.Cashier) {
      yPosition += 8
      doc.text("CAJERO:", 20, yPosition)
      doc.text(transaction.Cashier.name, 50, yPosition)
    }

    yPosition += 20

    // PRODUCTOS
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("PRODUCTOS/SERVICIOS:", 20, yPosition)

    yPosition += 15

    // Lista de productos
    if (transaction.Items && transaction.Items.length > 0) {
      transaction.Items.forEach((item: any, index: number) => {
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(`${index + 1}. ${item.Product?.name || item.description}`, 20, yPosition)
        doc.text(`${item.quantity} x $${Number(item.unitPrice).toLocaleString("es-CO")}`, 120, yPosition)
        doc.text(`$${Number(item.total).toLocaleString("es-CO")}`, 190, yPosition, { align: "right" })
        yPosition += 8
      })
    }

    yPosition += 10

    // TOTAL
    doc.setFillColor(...primaryColor)
    doc.rect(120, yPosition, 70, 15, "F")

    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text("TOTAL:", 125, yPosition + 10)
    doc.text(`$${Number(transaction.total).toLocaleString("es-CO")} COP`, 185, yPosition + 10, { align: "right" })

    // FOOTER
    const footerY = 250
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text("Gracias por su compra", 105, footerY, { align: "center" })
    doc.text(`Generado el ${new Date().toLocaleDateString("es-CO")}`, 105, footerY + 5, { align: "center" })

    // Convertir a Buffer
    const pdfOutput = doc.output("arraybuffer")
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error("Error generando PDF de transacción:", error)
    throw error
  }
}
