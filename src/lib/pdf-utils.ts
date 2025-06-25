// Utilidades adicionales para el manejo de PDFs

export const validatePDFGeneration = (invoice: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!invoice) {
        errors.push("Factura no proporcionada")
        return { isValid: false, errors }
    }

    if (!invoice.invoiceNumber) {
        errors.push("Número de factura requerido")
    }

    if (!invoice.total || Number(invoice.total) <= 0) {
        errors.push("Total de factura inválido")
    }

    if (!invoice.Items || invoice.Items.length === 0) {
        errors.push("La factura debe tener al menos un producto/servicio")
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

export const formatCurrency = (amount: number, currency = "COP"): string => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export const formatDate = (date: Date | string, locale = "es-CO"): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

// Función para optimizar el tamaño del PDF
export const optimizePDFSize = (buffer: Buffer): Buffer => {
    // En una implementación real, aquí podrías usar librerías como pdf-lib
    // para comprimir o optimizar el PDF
    return buffer
}

// Función para validar que el PDF se generó correctamente
export const validatePDFBuffer = (buffer: Buffer): boolean => {
    if (!buffer || buffer.length === 0) {
        return false
    }

    // Verificar que comience con el header de PDF
    const pdfHeader = buffer.slice(0, 4).toString()
    return pdfHeader === "%PDF"
}
