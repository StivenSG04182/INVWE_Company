import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ScheduleDashboard } from "./components/schedule-dashboard"
import { ScheduleCalendar } from "./components/schedule-calendar"
import { EmployeeList } from "./components/employee-list"
import { PayrollSummary } from "./components/payroll-summary"

const SchedulePage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener los miembros del equipo asociados a la agencia
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })

  // Datos de horarios - intentamos cargar desde localStorage si estamos en el cliente
  // o usamos datos simulados como fallback en el servidor
  let schedules = [
    {
      id: "1",
      userId: teamMembers[0]?.id || "",
      agencyId: params.agencyId,
      date: new Date().toISOString().split('T')[0],
      startTime: "08:00",
      endTime: "17:00",
      breakTime: "01:00",
      isOvertime: false,
      hourlyRate: 4500,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: teamMembers[1]?.id || "",
      agencyId: params.agencyId,
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "18:00",
      breakTime: "01:00",
      isOvertime: false,
      hourlyRate: 4500,
      createdAt: new Date().toISOString(),
    },
  ]
  
  // Nota: En un entorno real, estos datos vendrían de la base de datos
  // En este caso, usamos localStorage en el cliente para persistencia temporal

  // Obtener los días festivos de Colombia usando la librería festivos-colombianos
  const { default: holidaysColombia } = require("festivos-colombianos")
  const currentYear = new Date().getFullYear()
  const colombianHolidays = holidaysColombia(currentYear)
  
  // Convertir el formato de la librería al formato que espera nuestra aplicación
  const holidays = colombianHolidays.map(holiday => ({
    date: holiday.holiday, // Formato YYYY-MM-DD
    name: holiday.celebration
  }))
  
  // Añadir también los festivos del próximo año para planificación a futuro
  const nextYearHolidays = holidaysColombia(currentYear + 1)
  holidays.push(...nextYearHolidays.map(holiday => ({
    date: holiday.holiday,
    name: holiday.celebration
  })))


  return (
    <div className="container mx-auto p-6 space-y-8">
      <ScheduleDashboard teamMembers={teamMembers} schedules={schedules} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScheduleCalendar teamMembers={teamMembers} schedules={schedules} holidays={holidays} agencyId={agencyId} />
          <EmployeeList teamMembers={teamMembers} />
        </div>
        <div>
          <PayrollSummary teamMembers={teamMembers} schedules={schedules} holidays={holidays} />
        </div>
      </div>
    </div>
  )
}

export default SchedulePage
