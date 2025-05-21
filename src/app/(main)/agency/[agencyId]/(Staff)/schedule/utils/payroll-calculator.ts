// Función para calcular las horas totales programadas
export function calculateTotalHours(schedules: any[]): number {
    if (!schedules || schedules.length === 0) return 0

    // Por ahora, devolvemos un valor simulado
    // En una implementación real, calcularíamos la diferencia entre startTime y endTime
    // para cada horario y sumaríamos todas las horas
    return 168 // Ejemplo: 168 horas en total (simulado)
}

// Función para calcular el total de la nómina
export function calculateTotalPayroll(schedules: any[]): number {
    if (!schedules || schedules.length === 0) return 0

    // Por ahora, devolvemos un valor simulado
    // En una implementación real, calcularíamos el pago para cada horario
    // basado en las horas trabajadas, recargos, etc.
    return 3850000 // Ejemplo: $3,850,000 COP (simulado)
}

// Función para calcular la nómina de un empleado
export function calculateEmployeePayroll(
    employeeSchedules: any[],
    holidays: any[],
    period: string,
): {
    regularHours: number
    overtimeHours: number
    sundayHours: number
    holidayHours: number
    hourlyRate: number
    regularAmount: number
    overtimeAmount: number
    sundaySurcharge: number
    holidaySurcharge: number
    totalAmount: number
} {
    // En una implementación real, calcularíamos estos valores basados en los horarios
    // Por ahora, devolvemos valores simulados

    // Valores base simulados
    const baseRegularHours = 40
    const baseOvertimeHours = 5
    const baseSundayHours = 8
    const baseHolidayHours = 0
    const baseHourlyRate = 4500 // Valor por hora en pesos colombianos

    // Ajustar valores según el empleado (simulado)
    const employeeId = employeeSchedules.length > 0 ? employeeSchedules[0].userId : ""
    const multiplier = (employeeId.charCodeAt(0) % 5) / 10 + 0.8 // Simulación de variación por empleado

    // Calcular horas según el tipo
    const regularHours = baseRegularHours * multiplier
    const overtimeHours = baseOvertimeHours * multiplier
    const sundayHours = baseSundayHours * multiplier
    const holidayHours = baseHolidayHours * multiplier

    // Calcular montos
    const hourlyRate = baseHourlyRate
    const regularAmount = regularHours * hourlyRate
    const overtimeAmount = overtimeHours * hourlyRate * 1.25 // Recargo del 25%
    const sundaySurcharge = sundayHours * hourlyRate * 0.75 // Recargo del 75%
    const holidaySurcharge = holidayHours * hourlyRate * 1.0 // Recargo del 100%

    // Calcular total
    const totalAmount = regularAmount + overtimeAmount + sundaySurcharge + holidaySurcharge

    return {
        regularHours,
        overtimeHours,
        sundayHours,
        holidayHours,
        hourlyRate,
        regularAmount,
        overtimeAmount,
        sundaySurcharge,
        holidaySurcharge,
        totalAmount,
    }
}
