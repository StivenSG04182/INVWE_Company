import { format } from "date-fns"
import { es } from "date-fns/locale"

// Constantes legales colombianas 2025
export const LEGAL_CONSTANTS = {
    MINIMUM_WAGE: 1423500,
    TRANSPORT_ALLOWANCE: 200000,
    MAX_WEEKLY_HOURS: 44,
    MAX_DAILY_HOURS: 8,
    MONTHLY_HOURS: 220, // Aproximado para cálculo de hora ordinaria

    // Recargos según legislación colombiana
    OVERTIME_SURCHARGE: 0.25, // 25% adicional
    NIGHT_OVERTIME_SURCHARGE: 0.75, // 75% adicional
    SUNDAY_SURCHARGE: 0.75, // 75% adicional
    HOLIDAY_SURCHARGE: 1.0, // 100% adicional
    SUNDAY_HOLIDAY_SURCHARGE: 1.5, // 150% adicional

    // Horarios
    NIGHT_START: 21, // 9 PM
    NIGHT_END: 6, // 6 AM
}

// Función para calcular horas entre dos tiempos
export function calculateHoursBetween(startTime: string, endTime: string, breakTime: string): number {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    // Calcular la diferencia total en horas
    let diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Si el tiempo de descanso es "00:00", no hay descanso
    if (breakTime === "00:00") {
        return diffHours;
    }
    
    // Convertir el tiempo de descanso a horas (asumiendo que es la duración del descanso)
    const [breakHours, breakMinutes] = breakTime.split(":").map(Number);
    const breakDuration = breakHours + breakMinutes / 60;
    
    // Restar la duración del descanso
    diffHours -= breakDuration;
    
    // Asegurar que no sea negativo
    return Math.max(0, diffHours);
}

// Función para verificar si una hora está en horario nocturno
export function isNightTime(hour: number): boolean {
    return hour >= LEGAL_CONSTANTS.NIGHT_START || hour <= LEGAL_CONSTANTS.NIGHT_END
}

// Función para calcular horas nocturnas en un turno
export function calculateNightHours(startTime: string, endTime: string): number {
    const [startHour] = startTime.split(":").map(Number)
    const [endHour] = endTime.split(":").map(Number)

    let nightHours = 0
    let currentHour = startHour

    while (currentHour !== endHour) {
        if (isNightTime(currentHour)) {
            nightHours++
        }
        currentHour = (currentHour + 1) % 24
    }

    return nightHours
}

// Función mejorada para calcular las horas totales programadas
export function calculateTotalHours(schedules: any[]): number {
    if (!schedules || schedules.length === 0) return 0

    return schedules.reduce((total, schedule) => {
        const hours = calculateHoursBetween(schedule.startTime, schedule.endTime, schedule.breakTime || "01:00")
        return total + hours
    }, 0)
}

// Función mejorada para calcular el total de la nómina
export function calculateTotalPayroll(schedules: any[], holidays: any[] = []): number {
    if (!schedules || schedules.length === 0) return 0

    // Agrupar horarios por empleado
    const employeeSchedules = schedules.reduce((acc, schedule) => {
        if (!acc[schedule.userId]) {
            acc[schedule.userId] = []
        }
        acc[schedule.userId].push(schedule)
        return acc
    }, {})

    // Calcular nómina total
    return (Object.values(employeeSchedules) as any[][]).reduce((total: number, empSchedules: any[]) => {
        const payroll = calculateEmployeePayroll(empSchedules, holidays, "current-month")
        return total + payroll.totalAmount
    }, 0)
}

// Función mejorada para calcular la nómina de un empleado
export function calculateEmployeePayroll(
    employeeSchedules: any[],
    holidays: any[] = [],
    period: string,
): {
    regularHours: number
    overtimeHours: number
    nightHours: number
    sundayHours: number
    holidayHours: number
    hourlyRate: number
    regularAmount: number
    overtimeAmount: number
    nightSurcharge: number
    sundaySurcharge: number
    holidaySurcharge: number
    totalAmount: number
    weeklyHours: number
    dailyHoursExceeded: number
} {
    if (!employeeSchedules || employeeSchedules.length === 0) {
        return {
            regularHours: 0,
            overtimeHours: 0,
            nightHours: 0,
            sundayHours: 0,
            holidayHours: 0,
            hourlyRate: LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS,
            regularAmount: 0,
            overtimeAmount: 0,
            nightSurcharge: 0,
            sundaySurcharge: 0,
            holidaySurcharge: 0,
            totalAmount: 0,
            weeklyHours: 0,
            dailyHoursExceeded: 0,
        }
    }

    // Calcular valor hora base
    const hourlyRate = employeeSchedules[0]?.hourlyRate || LEGAL_CONSTANTS.MINIMUM_WAGE / LEGAL_CONSTANTS.MONTHLY_HOURS

    let regularHours = 0
    let overtimeHours = 0
    let nightHours = 0
    let sundayHours = 0
    let holidayHours = 0
    let weeklyHours = 0
    let dailyHoursExceeded = 0

    // Procesar cada horario
    employeeSchedules.forEach((schedule) => {
        const dailyHours = calculateHoursBetween(schedule.startTime, schedule.endTime, schedule.breakTime || "01:00")
        const nightHoursInShift = calculateNightHours(schedule.startTime, schedule.endTime)

        // Verificar si es domingo o festivo
        const scheduleDays = JSON.parse(schedule.days || "[]")
        const isSundayShift = scheduleDays.includes("domingo")
        const isHolidayShift = scheduleDays.some((day: string) =>
            holidays.some((holiday) => format(new Date(holiday.date), "EEEE", { locale: es }) === day),
        )

        // Acumular horas semanales
        weeklyHours += dailyHours

        // Verificar exceso de horas diarias
        if (dailyHours > LEGAL_CONSTANTS.MAX_DAILY_HOURS) {
            dailyHoursExceeded += dailyHours - LEGAL_CONSTANTS.MAX_DAILY_HOURS
        }

        // Clasificar horas
        if (isHolidayShift) {
            holidayHours += dailyHours
        } else if (isSundayShift) {
            sundayHours += dailyHours
        } else {
            regularHours += Math.min(dailyHours, LEGAL_CONSTANTS.MAX_DAILY_HOURS)
            if (dailyHours > LEGAL_CONSTANTS.MAX_DAILY_HOURS) {
                overtimeHours += dailyHours - LEGAL_CONSTANTS.MAX_DAILY_HOURS
            }
        }

        nightHours += nightHoursInShift
    })

    // Verificar exceso de horas semanales
    if (weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS) {
        const weeklyOvertime = weeklyHours - LEGAL_CONSTANTS.MAX_WEEKLY_HOURS
        overtimeHours += weeklyOvertime
        regularHours = Math.max(0, regularHours - weeklyOvertime)
    }

    // Calcular montos
    const regularAmount = regularHours * hourlyRate
    const overtimeAmount = overtimeHours * hourlyRate * (1 + LEGAL_CONSTANTS.OVERTIME_SURCHARGE)
    const nightSurcharge = nightHours * hourlyRate * LEGAL_CONSTANTS.NIGHT_OVERTIME_SURCHARGE
    const sundaySurcharge = sundayHours * hourlyRate * (1 + LEGAL_CONSTANTS.SUNDAY_SURCHARGE)
    const holidaySurcharge = holidayHours * hourlyRate * (1 + LEGAL_CONSTANTS.HOLIDAY_SURCHARGE)

    const totalAmount = regularAmount + overtimeAmount + nightSurcharge + sundaySurcharge + holidaySurcharge

    return {
        regularHours,
        overtimeHours,
        nightHours,
        sundayHours,
        holidayHours,
        hourlyRate,
        regularAmount,
        overtimeAmount,
        nightSurcharge,
        sundaySurcharge,
        holidaySurcharge,
        totalAmount,
        weeklyHours,
        dailyHoursExceeded,
    }
}

// Función para validar solapamiento de turnos
export function validateScheduleOverlap(
    newSchedule: { startTime: string; endTime: string; days: string[] },
    existingSchedules: any[],
    userId: string,
): { hasOverlap: boolean; conflictingSchedules: any[] } {
    const conflictingSchedules = existingSchedules.filter((schedule) => {
        if (schedule.userId !== userId) return false

        const scheduleDays = JSON.parse(schedule.days || "[]")
        const hasCommonDay = newSchedule.days.some((day) => scheduleDays.includes(day))

        if (!hasCommonDay) return false

        // Verificar solapamiento de horarios
        const newStart = timeToMinutes(newSchedule.startTime)
        const newEnd = timeToMinutes(newSchedule.endTime)
        const existingStart = timeToMinutes(schedule.startTime)
        const existingEnd = timeToMinutes(schedule.endTime)

        return newStart < existingEnd && newEnd > existingStart
    })

    return {
        hasOverlap: conflictingSchedules.length > 0,
        conflictingSchedules,
    }
}

// Función auxiliar para convertir tiempo a minutos
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

// Función para generar alertas de cumplimiento legal
export function generateComplianceAlerts(
    employeeSchedules: any[],
    holidays: any[],
): {
    type: "warning" | "error" | "info"
    message: string
    employeeId?: string
}[] {
    const alerts: any[] = []

    // Agrupar por empleado
    const schedulesByEmployee = employeeSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.userId]) acc[schedule.userId] = []
        acc[schedule.userId].push(schedule)
        return acc
    }, {})

    Object.entries(schedulesByEmployee).forEach(([employeeId, schedules]: [string, any]) => {
        const payroll = calculateEmployeePayroll(schedules, holidays, "current-week")

        // Alerta por exceso de horas semanales
        if (payroll.weeklyHours > LEGAL_CONSTANTS.MAX_WEEKLY_HOURS) {
            alerts.push({
                type: "warning",
                message: `Empleado excede ${LEGAL_CONSTANTS.MAX_WEEKLY_HOURS} horas semanales (${payroll.weeklyHours.toFixed(1)} hrs)`,
                employeeId,
            })
        }

        // Alerta por exceso de horas diarias
        if (payroll.dailyHoursExceeded > 0) {
            alerts.push({
                type: "error",
                message: `Empleado excede ${LEGAL_CONSTANTS.MAX_DAILY_HOURS} horas diarias`,
                employeeId,
            })
        }

        // Alerta por muchas horas nocturnas
        if (payroll.nightHours > 20) {
            alerts.push({
                type: "info",
                message: `Empleado tiene muchas horas nocturnas (${payroll.nightHours.toFixed(1)} hrs)`,
                employeeId,
            })
        }
    })

    return alerts
}
