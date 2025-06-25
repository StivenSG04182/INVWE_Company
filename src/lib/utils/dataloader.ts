import DataLoader from 'dataloader';
import { db } from '../db';

// Loader para usuarios
export const userLoader = new DataLoader(async (userIds: readonly string[]) => {
    const users = await db.user.findMany({
        where: { id: { in: [...userIds] } },
    });
    return userIds.map(id => users.find(user => user.id === id));
});

// Loader para agencias
export const agencyLoader = new DataLoader(async (agencyIds: readonly string[]) => {
    const agencies = await db.agency.findMany({
        where: { id: { in: [...agencyIds] } },
    });
    return agencyIds.map(id => agencies.find(agency => agency.id === id));
});

// Loader para subaccounts
export const subaccountLoader = new DataLoader(async (subaccountIds: readonly string[]) => {
    const subaccounts = await db.subAccount.findMany({
        where: { id: { in: [...subaccountIds] } },
    });
    return subaccountIds.map(id => subaccounts.find(sub => sub.id === id));
});