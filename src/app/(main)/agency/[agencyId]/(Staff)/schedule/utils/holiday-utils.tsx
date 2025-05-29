import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

// Festivos fijos colombianos 2025
export const FIXED_HOLIDAYS_2025 = [
    { date: "2025-01-01", name: "Año Nuevo", type: "fixed" },
    { date: "2025-05-01", name: "Día del Trabajo", type: "fixed" },
    { date: "2025-07-20", name: "Día de la Independencia", type: "fixed" },
    { date: "2025-08-07", name: "Batalla de Boyacá", type: "fixed" },
    { date: "2025-12-08", name: "Inmaculada Concepción", type: "fixed" },
    { date: "2025-12-25", name: "Navidad", type: "fixed" },
]

// Festivos que se trasladan al lunes siguiente si caen entre martes y sábado
export const MOVABLE_HOLIDAYS_2025 = [
    { date: "2025-01-06", name: "Día de los Reyes Magos", type: "movable" },
    { date: "2025-03-24", name: "Día de San José", type: "movable" },
    { date: "2025-06-30", name: "San Pedro y San Pablo", type: "movable" },
    { date: "2025-08-18", name: "Asunción de la Virgen", type: "movable" },
    { date: "2025-10-13", name: "Día de la Raza", type: "movable" },
    { date: "2025-11-03", name: "Todos los Santos", type: "movable" },
    { date: "2025-11-17", name: "Independencia de Cartagena", type: "movable" },
]

// Festivos que dependen de la fecha de Pascua 2025
export const EASTER_HOLIDAYS_2025 = [
    { date: "2025-04-17", name: "Jueves Santo", type: "easter" },
    { date: "2025-04-18", name: "Viernes Santo", type: "easter" },
    { date: "2025-06-02", name: "Ascensión del Señor", type: "easter" },
    { date: "2025-06-23", name: "Corpus Christi", type: "easter" },
    { date: "2025-07-07", name: "Sagrado Corazón de Jesús", type: "easter" },
]

// Función para obtener todos los festivos del año
export function getAllHolidays2025() {
    return [
        ...FIXED_HOLIDAYS_2025,
        ...MOVABLE_HOLIDAYS_2025,
        ...EASTER_HOLIDAYS_2025,
    ].map(holiday => ({
        ...holiday,
        date: parseISO(holiday.date),
        dateString: holiday.date,
    }))
}

// Función para verificar si una fecha es festivo
export function isHoliday(date: Date): { isHoliday: boolean; holiday?: any } {
    const holidays = getAllHolidays2025()
    const holiday = holidays.find(h => isSameDay(h.date, date))

    return {
        isHoliday: !!holiday,
        holiday: holiday
    }
}

// Función para obtener el nombre del festivo
export function getHolidayName(date: Date): string | null {
    const { isHoliday: isHol, holiday } = isHoliday(date)
    return isHol ? holiday?.name || null : null
}

// Función para obtener festivos del mes
export function getMonthHolidays(year: number, month: number) {
    const holidays = getAllHolidays2025()
    return holidays.filter(holiday => {
        const holidayDate = holiday.date
        return holidayDate.getFullYear() === year && holidayDate.getMonth() === month
    })
}

// Función para calcular días laborales entre dos fechas
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay()
        const { isHoliday: isHol } = isHoliday(currentDate)

        // Si no es sábado (6), domingo (0) ni festivo
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHol) {
            workingDays++
        }

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return workingDays
}
