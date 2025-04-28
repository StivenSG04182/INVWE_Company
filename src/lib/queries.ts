"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Lane, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client";
import { v4 } from "uuid";
import { sub } from "date-fns";
import { CreateFunnelFormSchema, UpsertFunnelPage, createMediaType } from "./types";
import { z } from "zod";
import { revalidatePath } from 'next/cache'

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });
  return userData;
};

export const getAgencyDetails = async (agencyId: string): Promise<Agency | null> => {
  return await db.agency.findUnique({
    where: {
      id: agencyId
    },
    include: {
      SubAccount: true,
      Subscription: true
    }
  })
}

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    // Si no hay usuario autenticado, buscar un usuario con acceso a la subcuenta o agencia
    const response = await db.user.findFirst({
      where: {
        OR: [
          // Buscar usuarios con rol SUBACCOUNT_USER
          {
            role: 'SUBACCOUNT_USER',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          // Buscar usuarios con rol SUBACCOUNT_GUEST
          {
            role: 'SUBACCOUNT_GUEST',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          // Buscar usuarios con rol AGENCY_OWNER
          {
            role: 'AGENCY_OWNER',
            Agency: {
              id: agencyId,
            },
          },
          // Buscar usuarios con rol AGENCY_ADMIN
          {
            role: 'AGENCY_ADMIN',
            Agency: {
              id: agencyId,
            },
          },
        ],
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      // Si no hay ID de agencia ni de subcuenta, simplemente registramos y retornamos
      console.log("No agency ID or subaccount ID provided for activity log");
      return;
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (response) foundAgencyId = response.agencyId;
  }
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};
export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });
  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  console.log('1. Iniciando initUser con:', newUser);

  const user = await currentUser();
  console.log('2. Usuario actual:', {
    id: user?.id,
    email: user?.emailAddresses[0]?.emailAddress
  });

  if (!user) {
    console.log('3. No hay usuario, retornando');
    return;
  }

  try {
    console.log('4. Intentando upsert en la base de datos');
    const userData = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        id: user.id,
        avatarUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });
    console.log('5. Datos de usuario guardados:', userData);

    // Actualización de metadatos en Clerk
    if (user.id) {
      console.log('6. Preparando actualización de metadatos en Clerk');
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(user.id, {
          privateMetadata: {
            role: newUser.role || "SUBACCOUNT_USER",
            agencyId: userData.agencyId,
            email: user.emailAddresses[0].emailAddress
          },
        });
        console.log('7. Metadatos actualizados exitosamente');
      } catch (clerkError) {
        console.error('7.1. Error al actualizar metadatos de Clerk:', clerkError);
        throw clerkError;
      }
    }

    return userData;
  } catch (error) {
    console.error('8. Error general en initUser:', error);
    return null;
  }
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const agencyDetails = await db.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: {
        users: { connect: { email: agency.companyEmail } },
        ...agency,
        SidebarOption: {
          create: [
            // 1. Dashboard & Visión general
            { name: "Dashboard & Visión general", icon: "chart", link: "#" },
            { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },
            { name: "Análisis", icon: "chart", link: `/agency/${agency.id}/analytics` },
            { name: "Actividad", icon: "calendar", link: `/agency/${agency.id}/activity` },
            { name: "Visión general", icon: "chart", link: `/agency/${agency.id}/overview` },
            { name: "Integraciones", icon: "link", link: `/agency/${agency.id}/integrations` },

            // 2. Gestión de Inventario
            { name: "Gestión de Inventario", icon: "database", link: "#" },
            { name: "Productos", icon: "category", link: `/agency/${agency.id}/products` },
            { name: "Stock", icon: "database", link: `/agency/${agency.id}/stock` },
            { name: "Movimientos", icon: "compass", link: `/agency/${agency.id}/movements` },
            { name: "Proveedores", icon: "person", link: `/agency/${agency.id}/providers` },
            { name: "Áreas de Inventario", icon: "home", link: `/agency/${agency.id}/areas` },

            // 3. Tienda & E-Commerce
            { name: "Tienda & E-Commerce", icon: "category", link: "#" },
            { name: "Tiendas Físicas", icon: "home", link: `/agency/${agency.id}/physical-stores` },
            { name: "E-Commerce", icon: "pipelines", link: `/agency/${agency.id}/funnels` },
            { name: "Envíos", icon: "send", link: `/agency/${agency.id}/shipping` },

            // 4. Ventas & Facturación
            { name: "Ventas & Facturación", icon: "payment", link: "#" },
            { name: "Transacciones", icon: "receipt", link: `/agency/${agency.id}/transactions` },
            { name: "Facturas", icon: "receipt", link: `/agency/${agency.id}/invoices` },
            { name: "Notas Crédito/Débito", icon: "receipt", link: `/agency/${agency.id}/notes` },
            { name: "Configuración DIAN", icon: "settings", link: `/agency/${agency.id}/dian-config` },
            { name: "Reportes", icon: "chart", link: `/agency/${agency.id}/reports` },
            { name: "Pagos", icon: "payment", link: `/agency/${agency.id}/payments` },
            { name: "Billing", icon: "payment", link: `/agency/${agency.id}/billing` },

            // 5. Clientes & CRM
            { name: "Clientes & CRM", icon: "person", link: "#" },
            { name: "Clientes", icon: "person", link: `/agency/${agency.id}/clients` },
            { name: "CRM", icon: "contact", link: `/agency/${agency.id}/crm` },
            { name: "All Sub-Accounts", icon: "person", link: `/agency/${agency.id}/all-subaccounts` },

            // 6. Personal & RRHH
            { name: "Personal & RRHH", icon: "person", link: "#" },
            { name: "Empleados", icon: "person", link: `/agency/${agency.id}/team` },
            { name: "Horarios & Nómina", icon: "calendar", link: `/agency/${agency.id}/schedule` },
            { name: "Contactos", icon: "contact", link: `/agency/${agency.id}/contacts` },

            // 7. Comunicaciones
            { name: "Comunicaciones", icon: "messages", link: "#" },
            { name: "Campañas", icon: "send", link: `/agency/${agency.id}/campaigns` },
            { name: "Bandeja de entrada", icon: "messages", link: `/agency/${agency.id}/inbox` },
            { name: "Medios", icon: "database", link: `/agency/${agency.id}/media` },
            { name: "Chat", icon: "messages", link: `/agency/${agency.id}/chat` },

            // 8. Reportes & Analíticas
            { name: "Reportes & Analíticas", icon: "chart", link: "#" },
            { name: "Ventas", icon: "chart", link: `/agency/${agency.id}/sales-reports` },
            { name: "Inventario", icon: "database", link: `/agency/${agency.id}/inventory-reports` },
            { name: "Desempeño", icon: "chart", link: `/agency/${agency.id}/performance` },

            // 9. Configuración & Administración
            { name: "Configuración & Administración", icon: "settings", link: "#" },
            { name: "Ajustes de Empresa", icon: "settings", link: `/agency/${agency.id}/company-settings` },
            { name: "Usuarios & Permisos", icon: "settings", link: `/agency/${agency.id}/users` },
            { name: "Facturación", icon: "payment", link: `/agency/${agency.id}/billing` },
            { name: "Configuración Inicial", icon: "settings", link: `/agency/${agency.id}/launchpad` },
            { name: "General Settings", icon: "tune", link: `/agency/${agency.id}/settings` },
            { name: "Automatización", icon: "chip", link: `/agency/${agency.id}/automations` },
            { name: "Pipelines", icon: "flag", link: `/agency/${agency.id}/pipelines` },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    console.log(error);
  }
};


export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}


export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: 'AGENCY_OWNER'
    }
  })
  if (!agencyOwner) return console.log('Error could not create subaccount because currently not agency owner')
  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: {
      id: subAccount.id
    },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId
        },
      },
      Pipeline: {
        create: { name: 'Lead Cycle' },
      },
      SidebarOption: {
        create: [
          {
            name: 'Settings',
            icon: 'settings',
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: 'Media',
            icon: 'database',
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: 'Automations',
            icon: 'chip',
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: 'Pipelines',
            icon: 'flag',
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: 'Dashboard',
            icon: 'category',
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    }
  })
  return response
}

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  })

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  })

  return response
}


export const changeUserPermissions = async (
  permissionsId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionsId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      }
    })
    return response
  } catch (erro) {
    console.log("💀Could not change permission")
  }
}

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  // Usar console.warn para asegurar que los mensajes sean más visibles en la terminal
  console.warn('🚀 === INICIO DE FUNCIÓN sendInvitation ===');
  console.warn('Parámetros recibidos:');
  console.warn('- Role:', role, '(tipo:', typeof role, ')');
  console.warn('- Email:', email, '(tipo:', typeof email, ')');
  console.warn('- Agency ID:', agencyId, '(tipo:', typeof agencyId, ')');
  
  // Validación de parámetros
  if (!role) {
    console.warn('⛔ ERROR: Role es undefined o null');
    throw new Error('Role es obligatorio para crear una invitación');
  }
  
  if (!email) {
    console.warn('⛔ ERROR: Email es undefined o null');
    throw new Error('Email es obligatorio para crear una invitación');
  }
  
  if (!agencyId) {
    console.warn('⛔ ERROR: AgencyId es undefined o null');
    throw new Error('AgencyId es obligatorio para crear una invitación');
  }
  
  try {
    // Verificar si ya existe una invitación para este email en esta agencia
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email: email,
        agencyId: agencyId,
      },
    });
    
    if (existingInvitation) {
      console.warn('⚠️ Ya existe una invitación para este email en esta agencia');
      console.warn('Detalles:', JSON.stringify(existingInvitation, null, 2));
      throw new Error('Ya existe una invitación para este email');
    }
    
    console.warn('📝 Creando registro en la base de datos con los siguientes datos:');
    console.warn(JSON.stringify({ email, agencyId, role }, null, 2));
    
    let response;
    try {
      response = await db.invitation.create({
        data: { 
          email: email, 
          agencyId: agencyId, 
          role: role,
          status: 'PENDING' // Asegurando que el estado sea PENDING
        },
      });
      
      console.warn('✅ Registro creado exitosamente en la base de datos:');
      console.warn(JSON.stringify(response, null, 2));
    } catch (dbError) {
      console.warn('⛔ ERROR al crear registro en la base de datos:');
      console.warn('Mensaje:', dbError instanceof Error ? dbError.message : 'Error desconocido');
      console.warn('Stack:', dbError instanceof Error ? dbError.stack : 'No disponible');
      
      // Verificar si es un error de clave única (email duplicado)
      if (dbError instanceof Error && dbError.message.includes('Unique constraint')) {
        throw new Error('Ya existe una invitación para este email');
      }
      
      throw dbError;
    }

    try {
      console.warn('📨 Intentando crear invitación en Clerk...');
      console.warn('NEXT_PUBLIC_URL:', process.env.NEXT_PUBLIC_URL);
      
      if (!process.env.NEXT_PUBLIC_URL) {
        console.warn('⛔ ERROR: NEXT_PUBLIC_URL no está definido');
        throw new Error('La URL de redirección no está configurada');
      }
      
      const redirectUrl = process.env.NEXT_PUBLIC_URL.endsWith('/') 
        ? process.env.NEXT_PUBLIC_URL 
        : `${process.env.NEXT_PUBLIC_URL}/`;
      
      console.warn('🔗 URL de redirección:', redirectUrl);
      
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: redirectUrl,
        publicMetadata: {
          throughInvitation: true,
          role,
          agencyId,
        },
      });
      
      console.warn('✅ Invitación creada exitosamente en Clerk:');
      console.warn(JSON.stringify(invitation, null, 2));
    } catch (clerkError) {
      console.warn('⛔ ERROR al crear invitación en Clerk:');
      console.warn('Mensaje:', clerkError instanceof Error ? clerkError.message : 'Error desconocido');
      console.warn('Stack:', clerkError instanceof Error ? clerkError.stack : 'No disponible');
      
      // Intentar eliminar la invitación de la base de datos si falló en Clerk
      try {
        if (response?.id) {
          await db.invitation.delete({
            where: { id: response.id },
          });
          console.warn('🗑️ Invitación eliminada de la base de datos debido al error en Clerk');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Error al limpiar la invitación de la base de datos:', cleanupError);
      }
      
      throw new Error('Error al enviar la invitación: ' + (clerkError instanceof Error ? clerkError.message : 'Error desconocido'));
    }

    console.warn('🎉 === FUNCIÓN sendInvitation COMPLETADA CON ÉXITO ===');
    return response;
  } catch (error) {
    console.warn('❌ === ERROR GENERAL EN sendInvitation ===');
    console.warn('Mensaje:', error instanceof Error ? error.message : 'Error desconocido');
    console.warn('Stack:', error instanceof Error ? error.stack : 'No disponible');
    throw error;
  }
}
export const getMedia = async (subaccountIdOrAgencyId: string, isAgencyId: boolean = false) => {
  console.log('getMedia llamado con:', { subaccountIdOrAgencyId, isAgencyId });
  
  if (!subaccountIdOrAgencyId) {
    console.log('No se proporcionó ID, devolviendo array vacío');
    // Si no hay ID, devolver un objeto con array Media vacío
    return { Media: [] }
  }
  
  let agencyId: string | null = null;
  
  if (isAgencyId) {
    // Si se proporciona directamente el agencyId
    console.log('Usando directamente el agencyId:', subaccountIdOrAgencyId);
    agencyId = subaccountIdOrAgencyId;
  } else {
    // Si se proporciona un subaccountId, obtenemos su agencyId
    console.log('Buscando agencyId para subaccountId:', subaccountIdOrAgencyId);
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountIdOrAgencyId,
      },
      select: {
        agencyId: true
      }
    })
    
    if (!subaccount) {
      console.log('No se encontró la subcuenta, devolviendo array vacío');
      return { Media: [] }
    }
    
    agencyId = subaccount.agencyId;
    console.log('AgencyId encontrado:', agencyId);
  }
  
  // Obtenemos todas las subcuentas asociadas a la agencia
  console.log('Buscando subcuentas para agencyId:', agencyId);
  const agencySubaccounts = await db.subAccount.findMany({
    where: {
      agencyId: agencyId
    },
    select: {
      id: true
    }
  })
  
  const subaccountIds = agencySubaccounts.map(sub => sub.id)
  console.log('IDs de subcuentas encontrados:', subaccountIds);
  
  // Verificamos si hay subcuentas
  if (subaccountIds.length === 0) {
    console.log('No se encontraron subcuentas para la agencia, buscando solo por agencyId');
  }
  
  // Construimos la consulta para buscar medios
  let whereClause: any = {};
  
  if (subaccountIds.length > 0) {
    // Si hay subcuentas, buscamos por subcuentas y agencyId
    whereClause = {
      OR: [
        {
          subAccountId: {
            in: subaccountIds
          }
        },
        {
          agencyId: agencyId
        }
      ]
    };
  } else {
    // Si no hay subcuentas, buscamos solo por agencyId
    whereClause = {
      agencyId: agencyId
    };
  }
  
  console.log('Buscando medios con condición:', JSON.stringify(whereClause, null, 2));
  
  // Ejecutamos la consulta
  const mediaFiles = await db.media.findMany({
    where: whereClause,
    include: {
      Subaccount: {
        select: {
          name: true,
          agencyId: true
        }
      }
    }
  }).catch(async (error) => {
    console.log('Error en la consulta principal, intentando consulta alternativa:', error.message);
    
    // Si falla la consulta con include, intentamos sin incluir la relación Subaccount
    return await db.media.findMany({
      where: whereClause
    });
  });
  
  // Verificamos si realmente se encontraron archivos
  if (mediaFiles.length === 0) {
    console.log('ADVERTENCIA: No se encontraron archivos multimedia para la agencia:', agencyId);
    
    // Intentamos una búsqueda directa solo por agencyId para verificar
    const directMediaFiles = await db.media.findMany({
      where: {
        agencyId: agencyId
      }
    }).catch(async (error) => {
      console.log('Error en la búsqueda directa, devolviendo array vacío:', error.message);
      return [];
    });
    
    console.log(`Búsqueda directa por agencyId: ${directMediaFiles.length} archivos encontrados`);
    
    // Si encontramos archivos en la búsqueda directa pero no en la original, usamos estos
    if (directMediaFiles.length > 0) {
      console.log('Usando resultados de búsqueda directa por agencyId');
      return { 
        Media: directMediaFiles,
        id: isAgencyId ? null : subaccountIdOrAgencyId
      }
    }
  }
  
  console.log(`Se encontraron ${mediaFiles.length} archivos multimedia`);
  if (mediaFiles.length > 0) {
    console.log('Primer archivo encontrado:', {
      id: mediaFiles[0].id,
      name: mediaFiles[0].name,
      subAccountId: mediaFiles[0].subAccountId,
      agencyId: mediaFiles[0].agencyId
    });
  }
  
  // Devolvemos los medios en el formato esperado por los componentes
  return { 
    Media: mediaFiles,
    id: isAgencyId ? null : subaccountIdOrAgencyId
  }
}

export const createMedia = async (
  subaccountId: string,
  mediaFile: createMediaType
) => {
  try {
    console.log('createMedia llamado con:', { subaccountId, mediaFile });
    
    // Verificamos si se proporcionó un agencyId directamente
    if (mediaFile.agencyId) {
      console.log('Usando agencyId proporcionado directamente:', mediaFile.agencyId);
      
      const response = await db.media.create({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
          agencyId: mediaFile.agencyId,
        }
      })
      
      console.log('Media creado exitosamente con agencyId proporcionado:', response);
      return response
    }
    
    // Si no se proporcionó agencyId, intentamos obtenerlo de la subcuenta
    console.log('Buscando agencyId para subaccountId:', subaccountId);
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
      select: {
        agencyId: true
      }
    })
    
    console.log('Resultado de búsqueda de subcuenta:', subaccount);
    
    if (!subaccount) {
      console.error('Subcuenta no encontrada y no se proporcionó agencyId');
      throw new Error('Subcuenta no encontrada y no se proporcionó agencyId')
    }
    
    // Si encontramos la subcuenta, procedemos normalmente
    console.log('Usando agencyId de la subcuenta:', subaccount.agencyId);
    
    const response = await db.media.create({
      data: {
        link: mediaFile.link,
        name: mediaFile.name,
        subAccountId: subaccountId,
        agencyId: subaccount.agencyId, // Agregamos el agencyId obtenido de la subcuenta
      }
    })
    
    console.log('Media creado exitosamente:', response);
    return response
  } catch (error) {
    console.error('Error al crear media:', error)
    throw error
  }
}


export const deleteMedia = async (mediaId: string) => {
  try {
    // Primero obtenemos el media para verificar si existe
    const mediaToDelete = await db.media.findUnique({
      where: {
        id: mediaId
      }
    })
    
    if (!mediaToDelete) {
      throw new Error('Media no encontrado')
    }
    
    // Eliminamos el media
    const response = await db.media.delete({
      where: {
        id: mediaId
      }
    })
    
    // Registramos la actividad
    await saveActivityLogsNotification({
      agencyId: mediaToDelete.agencyId || undefined,
      description: `Eliminó un archivo multimedia: ${mediaToDelete.name}`,
      subaccountId: mediaToDelete.subAccountId || undefined
    })
    
    // Devolvemos la respuesta sin depender de la relación Subaccount
    return response
  } catch (error) {
    console.error('Error al eliminar media:', error)
    throw error
  }
}

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique(
    {
      where: {
        id: pipelineId,
      },
    }
  )
  return response
}

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: "asc" },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        }
      }
    }
  })
  return response
}

export const upsertFunnel = async (
  subaccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string
) => {
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  })

  return response
}


export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: {
      id: pipelineId
    }
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, 'ERROR UPDATE LANES ORDER')
  }
}

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } })
  return resposne
}
export const deleteTicket = async (ticketId: string) => {
  const resposne = await db.ticket.delete({ where: { id: ticketId } })
  return resposne
}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  })
  return subaccountUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  })

  return response
}
export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}
export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  })
  return funnel
}
export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  })
  return data
}

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string
) => {
  if (!subaccountId || !funnelId) return
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || '' },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
          {
            content: [],
            id: '__body',
            name: 'Body',
            styles: { backgroundColor: 'white' },
            type: '__body',
          },
        ]),
      funnelId,
    },
  })

  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, 'page')
  return response
}


export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}