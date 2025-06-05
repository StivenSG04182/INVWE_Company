"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Lane, Plan, Prisma, Role, SubAccount, Tag, Ticket, User } from "@prisma/client";
import { v4 } from "uuid";
import { CreateFunnelFormSchema, UpsertFunnelPage, createMediaType } from "./types";
import { z } from "zod";
import { revalidatePath } from 'next/cache'
import { createBuilderPage } from './builderio'

// TODO: Autenticación y gestión de usuarios
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

// TODO: Gestión de agencias
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

// TODO: Registro de actividades y notificaciones
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
    const response = await db.user.findFirst({
      where: {
        OR: [
          {
            role: 'SUBACCOUNT_USER',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          {
            role: 'SUBACCOUNT_GUEST',
            Agency: {
              SubAccount: {
                some: { id: subaccountId },
              },
            },
          },
          {
            role: 'AGENCY_OWNER',
            Agency: {
              id: agencyId,
            },
          },
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
    return;
  }
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      return;
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (response) foundAgencyId = response.agencyId;
  }
  if (!foundAgencyId) {
    return;
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

// TODO: Creación de usuarios del equipo
export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
  return response;
};

// TODO: Verificación y aceptación de invitaciones
export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  
  // Primero verificamos si hay metadata en el usuario que indique una invitación
  const metadata = user.publicMetadata;
  const invitationId = metadata?.invitationId as string | undefined;
  
  // Buscar la invitación por ID si está disponible en los metadatos
  let invitationExists;
  
  if (invitationId) {
    invitationExists = await db.invitation.findUnique({
      where: {
        id: invitationId,
        status: "PENDING",
      },
    });
  }
  
  // Si no se encontró por ID o no había ID, buscar por email
  if (!invitationExists) {
    invitationExists = await db.invitation.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        status: "PENDING",
      },
    });
  }
  
  if (invitationExists) {
    // Verificar si la invitación ha expirado (24 horas desde su creación)
    const now = new Date();
    const createdAt = invitationExists.createdAt;
    const expirationTime = new Date(createdAt);
    expirationTime.setHours(expirationTime.getHours() + 24);
    
    if (now > expirationTime) {
      
      // Actualizamos el estado de la invitación a REVOKED (usamos este estado en lugar de EXPIRED ya que no requiere migración)
      await db.invitation.update({
        where: { id: invitationExists.id },
        data: { status: "REVOKED" }
      });
      
      // Guardamos un log de la expiración
      await saveActivityLogsNotification({
        agencyId: invitationExists.agencyId,
        description: `Invitación para ${invitationExists.email} expirada (más de 24 horas)`,
        subaccountId: undefined,
      });
      
      // Redirigimos con un mensaje de error
      throw new Error('La invitación ha expirado. Por favor, solicita una nueva invitación.');
    }
    
    // La invitación es válida, procedemos a aceptarla
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      birthDate: null,
      gender: null,
      maritalStatus: null,
      address: null,
      phone: null,
      position: null,
      salary: null,
      hireDate: null,
      socialSecurityAffiliation: null,
      workSchedule: null,
      socialSecurityNumber: null
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

      try {
        
        const invitations = await clerkClient.invitations.getInvitationList({
          emailAddress: userDetails.email,
        });
        
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
        
        if (pendingInvitations.length > 0) {
          for (const invitation of pendingInvitations) {
            try {
              await clerkClient.invitations.revokeInvitation(invitation.id);
            } catch (revocationError) {
            }
          }
          
          const checkInvitations = await clerkClient.invitations.getInvitationList({
            emailAddress: userDetails.email,
            status: 'pending'
          });
          
          if (checkInvitations.length > 0) {
          } 
        }
      } catch (clerkError) {
      }

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

// TODO: Actualización de detalles de agencia
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

// TODO: Eliminación de agencia
export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

// TODO: Inicialización de usuario
export const initUser = async (newUser: Partial<User>) => {

  const user = await currentUser();


  if (!user) {
    return;
  }

  try {
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

    if (user.id) {
      try {
        await clerkClient.users.updateUser(user.id, {
          privateMetadata: {
            role: newUser.role || "SUBACCOUNT_USER",
            agencyId: userData.agencyId,
            email: user.emailAddresses[0].emailAddress
          },
        });
      } catch (clerkError) {
        throw clerkError;
      }
    }

    return userData;
  } catch (error) {
    return null;
  }
};

// TODO: Creación y actualización de agencia
export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const userExists = await db.user.findUnique({
      where: { email: agency.companyEmail }
    });
    
    if (!userExists) {
      return null;
    }
    
    const agencyDetails = await db.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: {
        users: { connect: { email: agency.companyEmail } },
        ...agency,
        SidebarOption: {
          create: [
            // 1. Dashboard
            { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },

            // 2. Gestión de Inventario
            { name: "Gestión de Inventario", icon: "database", link: "#" },
            { name: "Productos", icon: "category", link: `/agency/${agency.id}/(Inventory)/products` },
            { name: "Movimientos", icon: "compass", link: `/agency/${agency.id}/(Inventory)/movements` },
            { name: "Proveedores", icon: "person", link: `/agency/${agency.id}/(Inventory)/providers` },
            { name: "Áreas de Inventario", icon: "home", link: `/agency/${agency.id}/(Inventory)/areas` },

            // 3. Tienda & E-Commerce
            /* { name: "Tienda & E-Commerce", icon: "category", link: "#" },
            { name: "Tiendas", icon: "category", link: `/agency/${agency.id}/(Ecommerce)/stores` },
            { name: "E-Commerce", icon: "pipelines", link: `/agency/${agency.id}/(Ecommerce)/funnels` },
            { name: "Envíos", icon: "send", link: `/agency/${agency.id}/(Ecommerce)/shipping` }, */

            // 4. POS (Punto de Venta)
            { name: "POS (Punto de Venta)", icon: "shoppingCart", link: "#" },
            { name: "Terminal", icon: "payment", link: `/agency/${agency.id}/(POS)/terminal` },
            { name: "Ventas POS", icon: "receipt", link: `/agency/${agency.id}/(POS)/sales-pos` },
           /*  { name: "Cierre de Caja", icon: "chart", link: `/agency/${agency.id}/(POS)/cash-closing` },   */

            // 5. Ventas & Facturación
            { name: "Ventas & Facturación", icon: "payment", link: `/agency/${agency.id}/(Billing)/finance` },

            // 6. Clientes & CRM
            { name:  "Clientes", icon: "person", link: `/agency/${agency.id}/(Customers)/clients` },

            // 7. Personal & RRHH
            { name: "Personal & RRHH", icon: "contact", link: "#" },
            { name: "Empleados", icon: "person", link: `/agency/${agency.id}/(Staff)/team` },
            { name: "Horarios & Nómina", icon: "calendar", link: `/agency/${agency.id}/(Staff)/schedule` },
            { name: "Contactos", icon: "contact", link: `/agency/${agency.id}/(Staff)/contacts` },
            { name: "Objetivos", icon: "flag", link: `/agency/${agency.id}/(Staff)/pipelines` },

            // 8. Comunicaciones
            /* { name: "Comunicaciones", icon: "messages", link: "#" },
            { name: "Campañas", icon: "send", link: `/agency/${agency.id}/(Communications)/campaigns` },
            { name: "Bandeja de entrada", icon: "messages", link: `/agency/${agency.id}/(Communications)/inbox` },
            { name: "Medios", icon: "database", link: `/agency/${agency.id}/(Communications)/media` },
            { name: "Chat", icon: "messages", link: `/agency/${agency.id}/(Communications)/chat` }, */

            // 9. Reportes & Analíticas
            { name: "Reportes & Analíticas", icon: "chartLine", link: `/agency/${agency.id}/(Reports)/reports-all` },

            // 10. Configuración & Administración
            { name: "Configuración & Administración", icon: "settings", link: "#" },
            /* { name: "Facturación Cuenta", icon: "payment", link: `/agency/${agency.id}/(Settings)/billing` }, */
            /* { name: "Configuración Pasarela de pagos", icon: "settings", link: `/agency/${agency.id}/(Settings)/launchpad` }, */ 
            { name: "Configuración General", icon: "tune", link: `/agency/${agency.id}/(Settings)/settings` },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      // Eliminado console.error
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Eliminado console.error
    }
    return null;
  }
};

// TODO: Obtención de notificaciones y usuarios
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
  }
}

// TODO: Creación y actualización de tiendas
export const upsertSubAccount = async (subAccount: SubAccount) => {

  if (!subAccount.companyEmail) {
    return null
  }

  try {
    const agencyOwner = await db.user.findFirst({
      where: {
        Agency: { id: subAccount.agencyId },
        role: 'AGENCY_OWNER',
      },
    })

    if (!agencyOwner) {
      return null
    }

    const permissionId = v4()

    const response = await db.subAccount.upsert({
      where: { id: subAccount.id },
      update: subAccount,
      create: {
        ...subAccount,
        Permissions: {
          create: {
            id: permissionId,
            email: agencyOwner.email,
            access: true,
          },
        },
        Pipeline: { create: { name: 'Lead Cycle' } },
        SidebarOption: {
          create: [
            // 1. Dashboard
            { name: "Dashboard", icon: "category", link: `/subaccount/${subAccount.id}` },

            // 2. Gestión de Inventario
            { name: "Gestión de Inventario", icon: "database", link: "#" },
            { name: "Productos", icon: "category", link: `/subaccount/${subAccount.id}/(Inventory)/products` },
            { name: "Movimientos", icon: "compass", link: `/subaccount/${subAccount.id}/(Inventory)/movements` },
            { name: "Proveedores", icon: "person", link: `/subaccount/${subAccount.id}/(Inventory)/providers` },
            { name: "Áreas de Inventario", icon: "home", link: `/subaccount/${subAccount.id}/(Inventory)/areas` },

            // 3. Tienda & E-Commerce
            /* { name: "Tienda & E-Commerce", icon: "category", link: "#" },
            { name: "Envíos", icon: "send", link: `/subaccount/${subAccount.id}/(Ecommerce)/shipping` }, */

            // 4. POS (Punto de Venta)
            { name: "POS (Punto de Venta)", icon: "shoppingCart", link: "#" },
            { name: "Terminal", icon: "payment", link: `/subaccount/${subAccount.id}/(POS)/terminal` },
            { name: "Ventas POS", icon: "receipt", link: `/subaccount/${subAccount.id}/(POS)/sales-pos` },
           /*  { name: "Cierre de Caja", icon: "chart", link: `/subaccount/${subAccount.id}/(POS)/cash-closing` },   */

            // 5. Ventas & Facturación
            { name: "Ventas & Facturación", icon: "payment", link: `/subaccount/${subAccount.id}/(Billing)/finance` },

            // 6. Clientes & CRM
            { name:  "Clientes", icon: "person", link: `/subaccount/${subAccount.id}/(Customers)/clients` },

            // 7. Personal & RRHH
            { name: "Personal & RRHH", icon: "contact", link: "#" },
            { name: "Objetivos", icon: "flag", link: `/subaccount/${subAccount.id}/(Staff)/pipelines` },

            // 8. Comunicaciones
            /* { name: "Comunicaciones", icon: "messages", link: "#" },
            { name: "Campañas", icon: "send", link: `/subaccount/${subAccount.id}/(Communications)/campaigns` },
            { name: "Bandeja de entrada", icon: "messages", link: `/subaccount/${subAccount.id}/(Communications)/inbox` },
            { name: "Medios", icon: "database", link: `/subaccount/${subAccount.id}/(Communications)/media` },
            { name: "Chat", icon: "messages", link: `/subaccount/${subAccount.id}/(Communications)/chat` }, */

            // 9. Reportes & Analíticas
            { name: "Reportes & Analíticas", icon: "chartLine", link: `/subaccount/${subAccount.id}/(Reports)/reports-all` },

            // 10. Configuración & Administración
            { name: "Configuración & Administración", icon: "settings", link: "#" },
            { name: "Configuración General", icon: "tune", link: `/subaccount/${subAccount.id}/(Settings)/settings` },
          ],
        },
      },
    })

    return response
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      // Eliminado console.error
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Eliminado console.error
    }
    return null
  }
}

// TODO: Obtención de permisos de usuario
export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  })

  return response
}

// TODO: Actualización de usuario
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

// TODO: Cambio de permisos de usuario
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
  } catch (error) {
  }
}

// TODO: Obtención de detalles de tienda
export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

// TODO: Eliminación de tienda
export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })
  return response
}

// TODO: Eliminación de usuario
export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

// TODO: Obtención de usuario
export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

// TODO: Envío de invitaciones
export const sendInvitation = async (role: Role, email: string, agencyId: string) => {

  if (!email) {
    throw new Error("El email es requerido para crear una invitación")
  }

  if (!agencyId) {
    throw new Error("El ID de la agencia es requerido para crear una invitación")
  }

  try {
    // Primero verificamos si ya existe una invitación para este email
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        agencyId,
        status: "PENDING", // Solo nos importan las invitaciones pendientes
      },
    })

    if (existingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este email")
    }

    // Si no existe, creamos la invitación en la base de datos
    const response = await db.invitation.create({
      data: {
        email,
        agencyId,
        role,
      },
    })

    try {
      // Intentamos crear la invitación en Clerk
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_URL,
        publicMetadata: {
          throughInvitation: true,
          role,
        },
      })
    } catch (clerkError: any) {
      // Si Clerk falla porque ya existe una invitación, manejamos el error
      if (clerkError.errors && clerkError.errors[0] && clerkError.errors[0].code === "duplicate_record") {
        // Eliminamos la invitación que acabamos de crear en nuestra base de datos
        // para mantener la consistencia
        await db.invitation.delete({
          where: { id: response.id },
        })

        throw new Error("Ya existe una invitación pendiente para este email")
      }

      // Si es otro tipo de error de Clerk, lo propagamos
      throw clerkError
    }

    return response
  } catch (error) {
    console.error("Error en sendInvitation:", error)
    throw error
  }
}

// TODO: Gestión de medios
export const getMedia = async (subaccountIdOrAgencyId: string, isAgencyId: boolean = false) => {
  if (!subaccountIdOrAgencyId) {
    return { Media: [] }
  }
  
  let agencyId: string | null = null;
  
  if (isAgencyId) {
    // Si se proporciona directamente el agencyId
    agencyId = subaccountIdOrAgencyId;
  } else {
    // Si se proporciona un subaccountId, obtenemos su agencyId
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountIdOrAgencyId,
      },
      select: {
        agencyId: true
      }
    })
    
    if (!subaccount) {
      return { Media: [] }
    }
    
    agencyId = subaccount.agencyId;
  }
  
  // Obtenemos todas las tiendas asociadas a la agencia
  const agencySubaccounts = await db.subAccount.findMany({
    where: {
      agencyId: agencyId
    },
    select: {
      id: true
    }
  })
  
  const subaccountIds = agencySubaccounts.map(sub => sub.id)

  // Verificamos si hay tiendas
  if (subaccountIds.length === 0) {
  }
  
  // Construimos la consulta para buscar medios
  let whereClause: any = {};
  
  if (subaccountIds.length > 0) {
    // Si hay tiendas, buscamos por tiendas y agencyId
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
    // Si no hay tiendas, buscamos solo por agencyId
    whereClause = {
      agencyId: agencyId
    };
  }
  
  
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
    
    // Si falla la consulta con include, intentamos sin incluir la relación Subaccount
    return await db.media.findMany({
      where: whereClause
    });
  });
  
  // Verificamos si realmente se encontraron archivos
  if (mediaFiles.length === 0) {
    
    // Intentamos una búsqueda directa solo por agencyId para verificar
    const directMediaFiles = await db.media.findMany({
      where: {
        agencyId: agencyId
      }
    }).catch(async (error) => {
      return [];
    });
    

    if (directMediaFiles.length > 0) {
      return { 
        Media: directMediaFiles,
        id: isAgencyId ? null : subaccountIdOrAgencyId
      }
    }
  }
  
  if (mediaFiles.length > 0) {
  }
  
  return { 
    Media: mediaFiles,
    id: isAgencyId ? null : subaccountIdOrAgencyId
  }
}

// TODO: Creación de medios
export const createMedia = async (
  subaccountId: string,
  mediaFile: createMediaType
) => {
  try {
    
    // Verificamos si se proporcionó un agencyId directamente
    if (mediaFile.agencyId) {
      
      const response = await db.media.create({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
          agencyId: mediaFile.agencyId,
        }
      })
      
      return response
    }
    
    // Si no se proporcionó agencyId, intentamos obtenerlo de la tienda
    const subaccount = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
      select: {
        agencyId: true
      }
    })

    if (!subaccount) {
      const response = await db.media.create({
        data: {
          link: mediaFile.link,
          name: mediaFile.name,
          subAccountId: subaccountId,
          // No incluimos agencyId ya que no está disponible
        }
      })
      
      return response
    }
    
    // Si encontramos la tienda, procedemos normalmente
    
    const response = await db.media.create({
      data: {
        link: mediaFile.link,
        name: mediaFile.name,
        subAccountId: subaccountId,
        agencyId: subaccount.agencyId, // Agregamos el agencyId obtenido de la tienda
      }
    })
    
    return response
  } catch (error) {
    console.error('Error al crear media:', error)
    throw error
  }
}

// TODO: Eliminación de medios
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

// TODO: Gestión de pipelines
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

// TODO: Obtención de carriles con tickets y etiquetas
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

// TODO: Creación y actualización de embudos
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

// TODO: Creación y actualización de pipelines
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

// TODO: Eliminación de pipeline
export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: {
      id: pipelineId
    }
  })
  return response
}

// TODO: Actualización de orden de carriles
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
  } catch (error) {
    // Eliminado console.log(error, 'ERROR UPDATE LANES ORDER')
  }
}

// TODO: Actualización de orden de tickets
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
    // Eliminado console.log('🟢 Done reordered 🟢')
  } catch (error) {
    // Eliminado console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  }
}

// TODO: Creación y actualización de carriles
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

// TODO: Eliminación de carril
export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } })
  return resposne
}

export const deleteTicket = async (ticketId: string) => {
  const resposne = await db.ticket.delete({ where: { id: ticketId } })
  return resposne
}

// TODO: Obtención de tickets con etiquetas
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

// TODO: Obtención de tickets con todas las relaciones
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

// TODO: Obtención de miembros del equipo de tienda
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

// TODO: Búsqueda de contactos
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

// TODO: Edición de información usuario
export const editUser = async (
  userId: string,
  userData: Prisma.UserUncheckedUpdateInput
) => {
  const response = await db.user.update({
    where: { id: userId },
    data: userData,
  })
  return response
}   

// TODO: Creación y actualización de tickets
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

// TODO: Creación y actualización de etiquetas
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

// TODO: Eliminación de etiqueta
export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

// TODO: Obtención de etiquetas para tienda
export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

// TODO: Creación y actualización de contactos
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

// TODO: Obtención de embudos
export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  })

  return funnels
}

// TODO: Obtención de embudo específico
export const getFunnel = async (funnelId:string) => {
  const funnel = await db.funnel.findUnique({
    where :{id: funnelId},
    include:{
      FunnelPages:{
        orderBy:{
          order:'asc'
        }
      }
    }
  })
  return funnel
}

// TODO: Actualización de productos de embudo
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

// TODO: Creación y actualización de página de embudo
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


// TODO: Eliminación de página de embudo
export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

// TODO: Obtención de detalles de página de embudo
export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}

// TODO: Gestión de horarios
export const createSchedule = async (schedule: {
  userId: string
  agencyId: string
  startTime: string
  endTime: string
  breakTime: string
  isOvertime: boolean
  hourlyRate: number
  days: string // JSON string array
}) => {
  const response = await db.schedule.create({
    data: {
      ...schedule,
    },
  })
  return response
}

//TODO: Obtener horario 
export const getSchedules = async (agencyId: string, userId?: string) => {
  const whereClause: any = {
    agencyId,
  }
  
  if (userId) {
    whereClause.userId = userId
  }
  
  const response = await db.schedule.findMany({
    where: whereClause,
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return response
}

//TODO: Obtener horario por el ID
export const getScheduleById = async (scheduleId: string) => {
  const response = await db.schedule.findUnique({
    where: {
      id: scheduleId,
    },
    include: {
      user: true,
    },
  })
  return response
}


//TODO: Actualizar horario
export const updateSchedule = async (
  scheduleId: string,
  scheduleData: Partial<{
    startTime: string
    endTime: string
    breakTime: string
    isOvertime: boolean
    hourlyRate: number
    days: string
  }>
) => {
  const response = await db.schedule.update({
    where: {
      id: scheduleId,
    },
    data: scheduleData,
  })
  return response
}

//TODO: Eliminar horario
export const deleteSchedule = async (scheduleId: string) => {
  const response = await db.schedule.delete({
    where: {
      id: scheduleId,
    },
  })
  return response
}