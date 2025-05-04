import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import BlurPage from '@/components/global/blur-page';
import { db } from '@/lib/db';

const UsersPermissionsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }

  // Obtener todos los usuarios de la agencia
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: agencyId,
      },
    },
    include: {
      Permissions: { include: { SubAccount: true } },
    },
  });

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Usuarios & Permisos</h1>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
              Añadir Usuario
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/80">
              Gestionar Roles
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Gestión de Usuarios</h2>
            <p className="text-muted-foreground">
              Administre los usuarios de su empresa y configure sus permisos de acceso.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar usuarios..." 
                  className="p-2 rounded-md border"
                />
                <select className="p-2 rounded-md border">
                  <option value="">Todos los roles</option>
                  <option value="AGENCY_OWNER">Propietario</option>
                  <option value="AGENCY_ADMIN">Administrador</option>
                  <option value="SUBACCOUNT_USER">Usuario</option>
                  <option value="SUBACCOUNT_GUEST">Invitado</option>
                </select>
              </div>
              <div>
                <button className="p-2 rounded-md hover:bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Usuario</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Rol</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Último Acceso</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-bold">
                                {member.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{member.email}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                      </td>
                      <td className="p-3">Hace 2 horas</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button className="p-1 rounded-md hover:bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button className="p-1 rounded-md hover:bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path>
                              <path d="M18 13v6"></path>
                              <path d="M15 16h6"></path>
                              <path d="M15 3l6 6"></path>
                              <path d="M21 3v6"></path>
                              <path d="M15 9h6"></path>
                            </svg>
                          </button>
                          <button className="p-1 rounded-md hover:bg-muted text-destructive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Roles y Permisos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Propietario</h4>
                <p className="text-sm text-muted-foreground mb-4">Acceso completo a todas las funciones y configuraciones.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Gestión completa de la empresa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Administración de usuarios y permisos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Configuración de facturación</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Administrador</h4>
                <p className="text-sm text-muted-foreground mb-4">Acceso a la mayoría de funciones excepto configuraciones críticas.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Gestión de inventario y ventas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Administración de usuarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Configuración de facturación</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Usuario</h4>
                <p className="text-sm text-muted-foreground mb-4">Acceso a funciones operativas diarias.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Gestión de inventario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Procesamiento de ventas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Administración de usuarios</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Invitado</h4>
                <p className="text-sm text-muted-foreground mb-4">Acceso limitado de solo lectura.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Visualización de inventario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Visualización de reportes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Modificación de datos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-md hover:bg-muted">
                Cancelar
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </BlurPage>
  );
};

// Función auxiliar para obtener la clase CSS del badge según el rol
function getRoleBadgeClass(role: string | null) {
  switch (role) {
    case 'AGENCY_OWNER':
      return 'bg-primary/20 text-primary';
    case 'AGENCY_ADMIN':
      return 'bg-blue-100 text-blue-800';
    case 'SUBACCOUNT_USER':
      return 'bg-green-100 text-green-800';
    case 'SUBACCOUNT_GUEST':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Función auxiliar para obtener la etiqueta del rol
function getRoleLabel(role: string | null) {
  switch (role) {
    case 'AGENCY_OWNER':
      return 'Propietario';
    case 'AGENCY_ADMIN':
      return 'Administrador';
    case 'SUBACCOUNT_USER':
      return 'Usuario';
    case 'SUBACCOUNT_GUEST':
      return 'Invitado';
    default:
      return 'Desconocido';
  }
}

export default UsersPermissionsPage;