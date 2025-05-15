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

  // Datos de horarios simulados ya que no existe el modelo schedule en Prisma
  const schedules = [
    {
      id: "1",
      userId: teamMembers[0]?.id || "",
      agencyId: params.agencyId,
      startTime: "08:00",
      endTime: "17:00",
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      user: teamMembers[0] || null,
    },
    {
      id: "2",
      userId: teamMembers[1]?.id || "",
      agencyId: params.agencyId,
      startTime: "09:00",
      endTime: "18:00",
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      user: teamMembers[1] || null,
    },
  ]

  // Obtener los días festivos de Colombia (simulado)
  const holidays = [
    { date: "2024-01-01", name: "Año Nuevo" },
    { date: "2024-01-08", name: "Día de los Reyes Magos" },
    { date: "2024-03-25", name: "Día de San José" },
    { date: "2024-03-28", name: "Jueves Santo" },
    { date: "2024-03-29", name: "Viernes Santo" },
    { date: "2024-05-01", name: "Día del Trabajo" },
    // Añadir más festivos según el calendario colombiano
  ]

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
