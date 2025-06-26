"use server";

import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { User, Schedule, Holiday, Notification } from "@prisma/client";

// === EMPLEADOS ===
export const getTeamMembers = async (agencyId: string) => {
  return await db.user.findMany({
    where: { agencyId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });
};

// === HORARIOS ===
export const getSchedules = async (agencyId: string, userId?: string) => {
  const where: any = { agencyId };
  if (userId) where.userId = userId;
  return await db.schedule.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const createSchedule = async (schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">) => {
  return await db.schedule.create({ data: schedule });
};

export const updateSchedule = async (scheduleId: string, data: Partial<Schedule>) => {
  return await db.schedule.update({ where: { id: scheduleId }, data });
};

export const deleteSchedule = async (scheduleId: string) => {
  return await db.schedule.delete({ where: { id: scheduleId } });
};

// === PLANTILLAS DE HORARIO ===
// export const getScheduleTemplates = async (agencyId: string) => {
//   return await db.scheduleTemplate.findMany({ where: { agencyId } });
// };

// export const createScheduleTemplate = async (template: Omit<ScheduleTemplate, "id" | "createdAt" | "updatedAt">) => {
//   return await db.scheduleTemplate.create({ data: template });
// };

// export const updateScheduleTemplate = async (templateId: string, data: Partial<ScheduleTemplate>) => {
//   return await db.scheduleTemplate.update({ where: { id: templateId }, data });
// };

// export const deleteScheduleTemplate = async (templateId: string) => {
//   return await db.scheduleTemplate.delete({ where: { id: templateId } });
// };

// === NOTIFICACIONES ===
export const getNotifications = async (agencyId: string) => {
  return await db.notification.findMany({
    where: { agencyId },
    include: { User: true },
    orderBy: { createdAt: "desc" },
  });
};

export const createNotification = async (notification: Omit<Notification, "id" | "createdAt" | "updatedAt">) => {
  return await db.notification.create({ data: notification });
};

// === DÍAS FESTIVOS ===
export const getHolidays = async (agencyId: string) => {
  return await db.holiday.findMany({ where: { agencyId } });
};

// === MÉTRICAS Y REPORTES ===
// Aquí puedes agregar funciones para cálculos analíticos, reportes PDF, etc.
// Por ejemplo:
export const getPayrollSummary = async (agencyId: string, period: string) => {
  // Implementa lógica para calcular nómina real según los horarios y el período
  // ...
  return {};
};

// === UTILIDADES ===
// Puedes agregar funciones auxiliares para cálculos, validaciones, etc.

// === EXPORTS ===
// Exporta todas las funciones necesarias para los componentes de horarios y nómina 