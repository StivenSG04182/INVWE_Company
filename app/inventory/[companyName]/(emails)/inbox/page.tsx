import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, Trash, Archive, Mail, MailOpen } from "lucide-react";

const InboxPage = () => {
  // Datos de ejemplo para la bandeja de entrada
  const emails = [
    {
      id: 1,
      sender: "Juan Pérez",
      email: "juan@empresa.com",
      subject: "Actualización de inventario",
      preview: "Hemos actualizado el inventario con los nuevos productos...",
      date: "10:30 AM",
      read: false,
      starred: true,
    },
    {
      id: 2,
      sender: "María López",
      email: "maria@proveedor.com",
      subject: "Cotización de productos",
      preview: "Adjunto encontrará la cotización solicitada para los productos...",
      date: "Ayer",
      read: true,
      starred: false,
    },
    {
      id: 3,
      sender: "Carlos Rodríguez",
      email: "carlos@cliente.com",
      subject: "Consulta sobre disponibilidad",
      preview: "Quisiera saber si tienen disponible el producto código XYZ123...",
      date: "Ayer",
      read: true,
      starred: false,
    },
    {
      id: 4,
      sender: "Ana Martínez",
      email: "ana@distribuidor.com",
      subject: "Nuevo catálogo 2023",
      preview: "Nos complace compartir nuestro nuevo catálogo de productos 2023...",
      date: "Lun",
      read: false,
      starred: false,
    },
    {
      id: 5,
      sender: "Soporte INVWE",
      email: "soporte@invwe.com",
      subject: "Actualización del sistema",
      preview: "Informamos que el sistema estará en mantenimiento el próximo...",
      date: "Dom",
      read: true,
      starred: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bandeja de entrada</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar emails..."
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          Todos
        </Button>
        <Button variant="outline" size="sm">
          No leídos
        </Button>
        <Button variant="outline" size="sm">
          Destacados
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        <div className="p-2 border-b flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MailOpen className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">1-5 de 5</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[200px]">Remitente</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead className="w-[100px]">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id} className={email.read ? "" : "font-medium bg-slate-50"}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {email.read ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-blue-500 fill-blue-500" />
                    )}
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
                  <div className="text-right">
                    <div>{email.date}</div>
                    {!email.read && <Badge variant="outline" className="bg-blue-100">Nuevo</Badge>}
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

export default InboxPage;