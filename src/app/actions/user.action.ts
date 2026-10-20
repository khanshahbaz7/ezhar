'use server'
import { db } from "@/db/drizzle";
import { auth, currentUser } from "@clerk/nextjs/server";
import * as schema from '../../db/schema';
import { and, eq, getColumns, ne, notExists, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
        console.log("inside syncUser");
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) return;

        const existingUser = await db.query.users.findFirst({
            where: { clerkId: userId }
        })

        if (existingUser) return existingUser;

        const email = user.emailAddresses[0].emailAddress;

        const [dbUser] = await db.insert(schema.users).values({
            clerkId: userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            username: user.username ?? email.split("@")[0],
            email,
            avatarUrl: user.imageUrl,
        }).returning();

        return dbUser;

    } catch (error) {
        console.log("Error in syncUser", error);
        console.log("inside the syncUser error")
    }
}

export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await db.query.users.findFirst({
            where: { clerkId },
            extras: {
                followers: (user) => db.$count(schema.follows, eq(schema.follows.accountId, user.id)),
                following: (user) => db.$count(schema.follows, eq(schema.follows.followedById, user.id)),
                posts: (user) => db.$count(schema.posts, eq(schema.posts.authorId, user.id))
            }
        })

        if (!user) return null;

        const { followers, following, posts, ...userData } = user;

        return {
            ...userData,
            _count: {
                followers, following, posts
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }

}

export const getDbUserId = async () => {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const user = await db.query.users.findFirst({
        where: { clerkId },
        columns: { id: true },
    })

    if (!user) throw new Error("User not found");

    return user.id;
}

export const getRandomUsers = async () => {
    try {
        const userId = await getDbUserId();
        if (!userId) return [];

        const rows = await db.select({
            id: schema.users.id,
            name: schema.users.name,
            username: schema.users.username,
            avatarUrl: schema.users.avatarUrl,
            followers: sql<number>`(
                select count(*) from ${schema.follows} where ${schema.follows.accountId} = ${schema.users.id}
            )`.mapWith(Number),
        })
            .from(schema.users)
            .where(
                and(
                    ne(schema.users.id, userId),
                    notExists(
                        db
                            .select({ one: sql`1` })
                            .from(schema.follows)
                            .where(
                                and(
                                    eq(schema.follows.accountId, schema.users.id),
                                    eq(schema.follows.followedById, userId),
                                ),
                            ),
                    )
                )
            )
            .orderBy(sql`random()`)
            .limit(3);

        return rows.map(({ followers, ...u }) => ({
            ...u,
            _count: { followers },
        }));

    } catch (error) {
        console.log("Error fetching random users", error);
        return [];
    }
}


export const toggleFollow = async (targetUserId: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        if (userId === targetUserId) throw new Error("You cannot follow yourself");

        const existingFollow = await db.query.follows.findFirst({
            where: { accountId: targetUserId, followedById: userId }
        })

        if (existingFollow) {
            await db.delete(schema.follows).where(
                and(
                    eq(schema.follows.accountId, targetUserId),
                    eq(schema.follows.followedById, userId)
                )
            )
        } else {
            await db.batch([
                db.insert(schema.follows).values({
                    accountId: targetUserId,
                    followedById: userId
                }),
                db.insert(schema.notifications).values({
                    type: "FOLLOW",
                    receivedById: targetUserId,
                    createdById: userId,
                    read: false
                })
            ])
        }
        // revalidatePath("/");
        return { success: true }
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }
}