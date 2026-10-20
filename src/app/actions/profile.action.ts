'use server'

import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

/**
 * Whether the signed-in user already follows the given profile user.
 * Returns false for guests or when viewing your own profile.
 */
export const isFollowing = async (targetUserId: string) => {
    try {
        const dbUserId = await getDbUserId();

        if (!dbUserId || dbUserId === targetUserId) return false;

        const existingFollow = await db.query.follows.findFirst({
            where: { accountId: targetUserId, followedById: dbUserId }
        })

        return Boolean(existingFollow);
    } catch (error) {
        console.log("Error in isFollowing");
        console.log(error);
        return false;
    }
}

/**
 * Update the signed-in user's profile (name, username, bio, location).
 * Accepts FormData from an edit-profile form.
 */
export const updateProfile = async (formData: FormData) => {
    try {
        const dbUserId = await getDbUserId();
        if (!dbUserId) return { success: false, error: "Unauthorized" };

        const name = (formData.get("name") as string | null)?.trim() ?? "";
        const username = (formData.get("username") as string | null)?.trim() ?? "";
        const bio = (formData.get("bio") as string | null)?.trim() ?? "";
        const location = (formData.get("location") as string | null)?.trim() ?? "";
        const website = (formData.get("website") as string | null)?.trim() ?? "";

        if (!name || name.length > 50) {
            return { success: false, error: "Name is required and must be 50 characters or less" };
        }

        if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return { success: false, error: "Username must be 3-20 characters (letters, numbers, underscores)" };
        }

        if (bio.length > 160) {
            return { success: false, error: "Bio must be 160 characters or less" };
        }

        if (location.length > 60) {
            return { success: false, error: "Location must be 60 characters or less" };
        }

        if (website.length > 100) {
            return { success: false, error: "Website must be 100 characters or less" };
        }



        // Username is unique in the DB — only reject it if a *different* user already has it.
        if (username) {
            const taken = await db.query.users.findFirst({
                where: { username },
                columns: { id: true },
            })

            if (taken && taken.id !== dbUserId) {
                return { success: false, error: "Username is already taken" };
            }
        }

        const [user] = await db.update(schema.users).set({
            name: name || null,
            username: username || null,
            bio: bio || null,
            location: location || null,
            updatedAt: new Date(),
            website: website || null,
        }).where(eq(schema.users.id, dbUserId)).returning();

        revalidatePath(`/profile/${dbUserId}`);
        revalidatePath("/");

        return { success: true, user };
    } catch (error) {
        console.log("Error in updateProfile");
        console.log(error);
        return { success: false, error: "Failed to update profile" };
    }
}
