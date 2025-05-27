// Tipos para los horarios
export interface Schedule {
    id: string
    userId: string
    agencyId: string
    date: Date
    startTime: string
    endTime: string
    breakTime: string
    isOvertime: boolean
    hourlyRate: number
    createdAt: Date
    updatedAt: Date
}

// Tipos para los empleados
export interface Employee {
    id: string
    name: string
    email: string
    avatarUrl?: string
    role: "AGENCY_OWNER" | "AGENCY_ADMIN" | "SUBACCOUNT_USER" | "GUEST"
    Agency?: any
    Permissions?: any[]
}

// Tipos para los días festivos
export interface Holiday {
    date: string
    name: string
}

// Tipos para la nómina
export interface PayrollData {
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
}
