import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ScheduleDashboard } from "./components/schedule-dashboard"
import { ScheduleCalendar } from "./components/schedule-calendar"
import { EmployeeList } from "./components/employee-list"
import { PayrollSummary } from "./components/payroll-summary"
import { AnalyticsDashboard } from "./components/analytics-dashboard"
import { NotificationSystem } from "./components/notification-system"
import { PDFReports } from "./components/pdf-reports"
import { ScheduleTemplates } from "./components/schedule-templates"
import { VacationManagement } from "./components/vacation-management"
import { getSchedules } from "@/lib/queries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, FileText, BarChart, Bell, FileDown, Clock, Briefcase } from "lucide-react"

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
      agencyId: agencyId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  })

  // Obtener los horarios
  const schedules = await getSchedules(agencyId)

  // Obtener los días festivos
  const holidays = await db.holiday.findMany({
    where: {
      agencyId: agencyId,
    },
  })

  return (
    <div className="p-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Empleados</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ScheduleDashboard teamMembers={teamMembers} schedules={schedules} />
          <ScheduleCalendar
            teamMembers={teamMembers}
            schedules={schedules}
            holidays={holidays}
            agencyId={agencyId}
          />
          <PayrollSummary
            teamMembers={teamMembers}
            schedules={schedules}
            holidays={holidays}
          />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeList teamMembers={teamMembers} />
          <VacationManagement
            teamMembers={teamMembers}
            agencyId={agencyId}
          />
          <NotificationSystem
            teamMembers={teamMembers}
            agencyId={agencyId}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <ScheduleTemplates
            agencyId={agencyId}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AnalyticsDashboard
            teamMembers={teamMembers}
            schedules={schedules}
            holidays={holidays}
            agencyId={agencyId}
          />
          <PDFReports
            teamMembers={teamMembers}
            schedules={schedules}
            holidays={holidays}
            agencyId={agencyId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SchedulePage
