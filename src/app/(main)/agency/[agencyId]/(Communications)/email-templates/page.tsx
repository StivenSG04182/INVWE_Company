import { getAuthUserDetails } from "@/lib/queries"
import { getEmailTemplates, duplicateEmailTemplate, deleteEmailTemplate } from "@/lib/email-template-queries"
import { redirect } from "next/navigation"
import BlurPage from "@/components/global/blur-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateFilters } from "@/components/email-editor/template-filters"
import { TemplateActions } from "@/components/email-editor/template-actions"
import { EmailTemplateStatus } from "@prisma/client"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Copy, Trash2, Mail, Zap, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const EmailTemplatesPage = async ({
    params,
    searchParams,
}: {
    params: { agencyId: string }
    searchParams: { search?: string; status?: string }
}) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    const { templates, stats } = await getEmailTemplates(agencyId, {
        search: searchParams.search,
        status: searchParams.status as EmailTemplateStatus,
    })

    return (
        <BlurPage>
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Plantillas de Email</h1>
                            <p className="text-muted-foreground mt-2">
                                Crea y gestiona plantillas de email profesionales con nuestro editor visual
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </Button>
                            <Link href={`/agency/${agencyId}/email-templates/editor/new`}>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nueva Plantilla
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <TemplateFilters searchParams={searchParams} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-muted-foreground">Total Plantillas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                    <p className="text-sm text-muted-foreground">Activas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Edit className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.draft}</p>
                                    <p className="text-sm text-muted-foreground">Borradores</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                                    <p className="text-sm text-muted-foreground">Esta semana</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Template Card */}
                    <Link href={`/agency/${agencyId}/email-templates/editor/new`}>
                        <Card className="border-dashed border-2 hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-md group h-full">
                            <CardContent className="flex flex-col items-center justify-center p-8 h-full min-h-[280px]">
                                <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Plus className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Crear Nueva Plantilla</h3>
                                <p className="text-sm text-muted-foreground text-center">
                                    Diseña una plantilla desde cero con nuestro editor visual
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Template Cards */}
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
                            <div className="relative">
                                <Image
                                    src={template.thumbnail || "/placeholder.svg"}
                                    alt={template.name}
                                    width={200}
                                    height={120}
                                    className="w-full h-32 object-cover rounded-t-lg bg-muted"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TemplateActions 
                                        templateId={template.id}
                                        agencyId={agencyId}
                                    />
                                </div>
                                <Badge
                                    variant={template.status === "ACTIVE" ? "default" : "secondary"}
                                    className="absolute top-2 left-2"
                                >
                                    {template.status === "ACTIVE" ? "Activo" : "Borrador"}
                                </Badge>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-1">
                                            {template.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>{template.category}</span>
                                    <span>{new Date(template.updatedAt).toLocaleDateString("es-CO")}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <div className="flex gap-2 w-full">
                                    <Link href={`/agency/${agencyId}/email-templates/preview/${template.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Vista previa
                                        </Button>
                                    </Link>
                                    <Link href={`/agency/${agencyId}/email-templates/editor/${template.id}`} className="flex-1">
                                        <Button size="sm" className="w-full">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Recent Templates Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plantillas Recientes</CardTitle>
                        <CardDescription>Últimas plantillas modificadas en tu cuenta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Nombre</th>
                                        <th className="text-left p-3 font-medium">Categoría</th>
                                        <th className="text-left p-3 font-medium">Estado</th>
                                        <th className="text-left p-3 font-medium">Última modificación</th>
                                        <th className="text-left p-3 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.slice(0, 5).map((template) => (
                                        <tr key={template.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {template.description}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">{template.category}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge 
                                                    variant={template.status === "ACTIVE" ? "default" : "secondary"}
                                                >
                                                    {template.status === "ACTIVE" ? "Activo" : "Borrador"}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {new Date(template.updatedAt).toLocaleDateString("es-CO")}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Link href={`/agency/${agencyId}/email-templates/preview/${template.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/agency/${agencyId}/email-templates/editor/${template.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={async () => {
                                                            await duplicateEmailTemplate(template.id)
                                                            window.location.reload()
                                                        }}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-destructive"
                                                        onClick={async () => {
                                                            if (confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
                                                                await deleteEmailTemplate(template.id)
                                                                window.location.reload()
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </BlurPage>
    )
}

export default EmailTemplatesPage
