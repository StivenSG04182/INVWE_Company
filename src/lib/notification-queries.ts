"use server";

import { db } from "./db";
import { currentUser } from "@clerk/nextjs/server";

// Obtener notificaciones del usuario
export const getUserNotifications = async (agencyId: string, subAccountId?: string) => {
  const user = await currentUser();
  if (!user) return [];

  const whereClause: any = {
    agencyId,
    userId: user.id,
    isDeleted: false,
  };

  if (subAccountId) {
    whereClause.subAccountId = subAccountId;
  }

  return await db.notification.findMany({
    where: whereClause,
    include: {
      User: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      SubAccount: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Obtener notificaciones no leídas
export const getUnreadNotifications = async (agencyId: string, subAccountId?: string) => {
  const user = await currentUser();
  if (!user) return [];

  const whereClause: any = {
    agencyId,
    userId: user.id,
    isRead: false,
    isDeleted: false,
  };

  if (subAccountId) {
    whereClause.subAccountId = subAccountId;
  }

  return await db.notification.findMany({
    where: whereClause,
    include: {
      User: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      SubAccount: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  return await db.notification.update({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (agencyId: string, subAccountId?: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  const whereClause: any = {
    agencyId,
    userId: user.id,
    isRead: false,
    isDeleted: false,
  };

  if (subAccountId) {
    whereClause.subAccountId = subAccountId;
  }

  return await db.notification.updateMany({
    where: whereClause,
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// Eliminar notificación (soft delete)
export const deleteNotification = async (notificationId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  return await db.notification.update({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

// Eliminar todas las notificaciones (soft delete)
export const deleteAllNotifications = async (agencyId: string, subAccountId?: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Usuario no autenticado");

  const whereClause: any = {
    agencyId,
    userId: user.id,
    isDeleted: false,
  };

  if (subAccountId) {
    whereClause.subAccountId = subAccountId;
  }

  return await db.notification.updateMany({
    where: whereClause,
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

// Crear nueva notificación
export const createNotification = async (
  agencyId: string,
  userId: string,
  notification: string,
  subAccountId?: string
) => {
  return await db.notification.create({
    data: {
      notification,
      agencyId,
      userId,
      subAccountId,
    },
  });
};

// Obtener contador de notificaciones no leídas
export const getUnreadNotificationCount = async (agencyId: string, subAccountId?: string) => {
  const user = await currentUser();
  if (!user) return 0;

  const whereClause: any = {
    agencyId,
    userId: user.id,
    isRead: false,
    isDeleted: false,
  };

  if (subAccountId) {
    whereClause.subAccountId = subAccountId;
  }

  return await db.notification.count({
    where: whereClause,
  });
};