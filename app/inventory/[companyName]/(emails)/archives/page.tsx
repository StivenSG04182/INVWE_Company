import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Trash, Archive, Mail, MailOpen, MoveLeft } from "lucide-react";

const ArchivesPage = () => {
  // Datos de ejemplo para los correos archivados
  const archivedEmails = [
    {
      id: 1,
      sender: "Departamento de Ventas",
      email: "ventas@empresa.com",
      subject: "Reporte de ventas trimestral",
      preview: "Adjunto encontrará el reporte de ventas del último trimestre...",
      date: "15/04/2023",
      category: "Reportes",
      starred: true,
    },
    {
      id: 2,
      sender: "Proveedor Principal",
      email: "contacto@proveedor.com",
      subject: "Catálogo actualizado 2023",
      preview: "Nos complace compartir nuestro catálogo actualizado con los nuevos productos...",
      date: "02/03/2023",
      category: "Proveedores",
      starred: false,
    },
    {
      id: 3,
      sender: "Soporte Técnico",
      email: "soporte@invwe.com",
      subject: "Resolución de incidencia #45678",
      preview: "Confirmamos que la incidencia reportada ha sido resuelta satisfactoriamente...",
      date: "18/02/2023",
      category: "Soporte",
      starred: false,
    },
    {
      id: 4,
      sender: "Recursos Humanos",
      email: "rrhh@empresa.com",
      subject: "Actualización de políticas internas",
      preview: "Informamos sobre las nuevas políticas internas que entrarán en vigor a partir del...",
      date: "05/01/2023",
      category: "RRHH",
      starred: true,
    },
    {
      id: 5,
      sender: "Marketing",
      email: "marketing@empresa.com",
      subject: "Resultados campaña navideña",
      preview: "A continuación presentamos los resultados de la campaña de marketing navideña...",
      date: "10/01/2023",
      category: "Marketing",
      starred: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Archivos</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en archivos..."
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <MoveLeft className="mr-2 h-4 w-4" />
            Restaurar seleccionados
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
            <Trash className="mr-2 h-4 w-4" />
            Eliminar seleccionados
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Filtrar por:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="reportes">Reportes</SelectItem>
              <SelectItem value="proveedores">Proveedores</SelectItem>
              <SelectItem value="soporte">Soporte</SelectItem>
              <SelectItem value="rrhh">RRHH</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[200px]">Remitente</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead className="w-[120px]">Categoría</TableHead>
              <TableHead className="w-[100px]">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedEmails.map((email) => (
              <TableRow key={email.id} className="hover:bg-slate-50 cursor-pointer">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    {email.starred && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{email.sender}</div>
                    <div className="text-xs text-muted-foreground">{email.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{email.subject}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-md">
                      {email.preview}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-slate-100 text-slate-800 hover:bg-slate-100/80">
                    {email.category}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-right">
                    <div>{email.date}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArchivesPage;