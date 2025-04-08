import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BarChart, Users, Mail, Send, Clock } from "lucide-react";

const CampaignsPage = () => {
  // Datos de ejemplo para las campañas
  const campaigns = [
    {
      id: 1,
      title: "Promoción de Verano",
      status: "active",
      sent: 1250,
      opened: 876,
      clicked: 432,
      date: "15/06/2023",
      scheduled: false,
    },
    {
      id: 2,
      title: "Nuevos Productos 2023",
      status: "draft",
      sent: 0,
      opened: 0,
      clicked: 0,
      date: "Pendiente",
      scheduled: false,
    },
    {
      id: 3,
      title: "Descuentos Exclusivos",
      status: "scheduled",
      sent: 0,
      opened: 0,
      clicked: 0,
      date: "25/07/2023",
      scheduled: true,
    },
    {
      id: 4,
      title: "Newsletter Mensual",
      status: "completed",
      sent: 2500,
      opened: 1875,
      clicked: 945,
      date: "01/06/2023",
      scheduled: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campañas de Email</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Campaña
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.reduce((acc, campaign) => acc + campaign.sent, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">+15% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground mt-1">+5% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Clics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36%</div>
            <p className="text-xs text-muted-foreground mt-1">+2% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Activas</TabsTrigger>
              <TabsTrigger value="draft">Borradores</TabsTrigger>
              <TabsTrigger value="scheduled">Programadas</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar campañas..."
                className="pl-8 w-[250px] md:w-[300px]"
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{campaign.title}</CardTitle>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <CardDescription>
                      {campaign.scheduled ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Programada para: {campaign.date}
                        </div>
                      ) : (
                        <div>Fecha: {campaign.date}</div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="flex justify-center">
                          <Send className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium mt-1">{campaign.sent}</div>
                        <div className="text-xs text-muted-foreground">Enviados</div>
                      </div>
                      <div>
                        <div className="flex justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium mt-1">{campaign.opened}</div>
                        <div className="text-xs text-muted-foreground">Abiertos</div>
                      </div>
                      <div>
                        <div className="flex justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium mt-1">{campaign.clicked}</div>
                        <div className="text-xs text-muted-foreground">Clics</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <BarChart className="mr-2 h-4 w-4" /> Estadísticas
                    </Button>
                    {campaign.status === "draft" || campaign.status === "scheduled" ? (
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" /> {campaign.status === "draft" ? "Enviar" : "Editar"}
                      </Button>
                    ) : null}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contenido similar para otras pestañas */}
          <TabsContent value="active" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.filter(c => c.status === "active").map((campaign) => (
                <Card key={campaign.id}>
                  {/* Contenido similar */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente para mostrar el estado de la campaña
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activa</Badge>;
    case "draft":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Borrador</Badge>;
    case "scheduled":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Programada</Badge>;
    case "completed":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completada</Badge>;
    default:
      return null;
  }
};

export default CampaignsPage;