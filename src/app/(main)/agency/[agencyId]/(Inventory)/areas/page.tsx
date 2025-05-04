import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { AreaService } from '@/lib/services/inventory-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AreasPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }
  
  // Obtener áreas de MongoDB
  let areas = [];
  try {
    areas = await AreaService.getAreas(agencyId);
  } catch (error) {
    console.error('Error al cargar áreas:', error);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Áreas de Inventario</h1>
        <Link href={`/agency/${agencyId}/areas/new`}>
          <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Nueva Área
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Gestión de Ubicaciones</h2>
          <p className="text-muted-foreground">
            Configure y administre las diferentes áreas y ubicaciones donde se almacenan sus productos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total de Áreas</h3>
            <p className="text-2xl font-bold">{areas.length}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Capacidad Total</h3>
            <p className="text-2xl font-bold">0 m²</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Ocupación</h3>
            <p className="text-2xl font-bold">0%</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          <div className="p-4 border-b bg-muted/40">
            <div className="flex justify-between items-center mb-4">
              <input 
                type="text" 
                placeholder="Buscar área..." 
                className="px-3 py-2 border rounded-md w-64"
              />
              <select className="px-3 py-2 border rounded-md">
                <option value="">Todos los tipos</option>
                <option value="almacen">Almacén</option>
                <option value="tienda">Tienda</option>
                <option value="bodega">Bodega</option>
              </select>
            </div>
            
            {areas.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No hay áreas de inventario registradas. Cree su primera área para comenzar a organizar su inventario.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Nombre</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Fecha de Creación</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((area: any) => (
                      <tr key={area._id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{area.name}</td>
                        <td className="px-4 py-2">{area.description || '-'}</td>
                        <td className="px-4 py-2">{new Date(area.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Link href={`/agency/${agencyId}/areas/${area._id}`}>
                              <Button variant="outline" size="sm">Editar</Button>
                            </Link>
                            <Link href={`/agency/${agencyId}/stock?areaId=${area._id}`}>
                              <Button variant="outline" size="sm">Ver Stock</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreasPage;