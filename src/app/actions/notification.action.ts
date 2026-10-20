'use server'

import { db } from "@/db/drizzle"
import { getDbUserId } from "./user.action"
import { notifications } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const getNotifications = async () => {
    try {
        const userId = await getDbUserId();
        if (!userId) return [];
        const notifications = await db.query.notifications.findMany({
            where: { receivedById: userId },
            orderBy: { createdAt: "desc" },
            with: {
                createdBy: {
                    columns: { id: true, name: true, username: true, avatarUrl: true }
                },
                post: {
                    columns: { id: true, content: true, image: true }
                },
                comment: {
                    columns: { id: true, content: true, createdAt: true }
                }
            }
        });
        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new Error("Failed to fetch notifications");
    }
}

export async function markNotifications(notificationsIds: string[]) {
    try {
        const userId = await getDbUserId();
        if (!userId) return { success: false };

        if (notificationsIds.length === 0) return { success: true };

        await db.update(notifications)
            .set({ read: true })
            .where(
                and(
                    inArray(notifications.id, notificationsIds),
                    eq(notifications.receivedById, userId)
                )
            )
        return { success: true };
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return { success: false };
    }
}