'use server';
import { db } from '@/db/drizzle';
import * as schema from '@/db/schema'
import { getDbUserId } from './user.action';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';

export async function createPost(content: string, image?: string, imageFileId?: string) {
    try {
        if (!content?.trim()) throw new Error("content should not be empty.");

        const userId = await getDbUserId();
        if (!userId) {
            return {
                success: false,
                error: "You must be signed in to create a post.",
            };
        }


        const [post] = await db
            .insert(schema.posts)
            .values({
                content: content.trim(),
                image: image || null,
                imageFileId: imageFileId || null,
                authorId: userId,
            })
            .returning();

        revalidatePath("/");

        return { success: true, post };

    } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, error: "Failed to create post" };
    }
}

export async function getPosts() {
    try {
        const posts = await db.query.posts.findMany({
            orderBy: { createdAt: "desc" },
            with: {
                author: {
                    columns: { id: true, name: true, avatarUrl: true, username: true, }
                },
                comments: {
                    orderBy: { createdAt: "asc" },
                    with: {
                        author: {
                            columns: { id: true, name: true, avatarUrl: true, username: true }
                        }
                    }
                },
                likes: {
                    columns: { authorId: true }
                }
            }
        });

        return posts.map((post) => ({
            ...post,
            _count: {
                likes: post.likes.length,
                comments: post.comments.length
            }
        }))
    } catch (error) {
        console.log("Error in getPosts", error);
        throw new Error("Failed to fetch posts");
    }
}

export async function toggleLike(postId: string) {
    try {
        const userId = await getDbUserId();
        if (!userId) return;

        const post = await db.query.posts.findFirst({
            where: { id: postId },
            columns: { authorId: true },
        });

        if (!post) throw new Error("Post not found");

        const existingLike = await db.query.postLikes.findFirst({
            where: { authorId: userId, postId },
            columns: { id: true }
        });

        if (existingLike) {
            await db.delete(schema.postLikes).where(
                and(
                    eq(schema.postLikes.authorId, userId),
                    eq(schema.postLikes.postId, postId)
                )
            )
        } else {

            const insertLike = db.insert(schema.postLikes).values({
                postId,
                authorId: userId
            }).onConflictDoNothing();

            if (post.authorId !== userId) {
                await db.batch([
                    insertLike,
                    db.insert(schema.notifications).values({
                        type: "LIKE",
                        receivedById: post.authorId,
                        createdById: userId,
                        postId,
                        read: false,
                    })
                ])
            } else {
                await insertLike;
            }
        }

        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Failed to toggle like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}


export async function createComment(content: string, postId: string) {
    try {
        const userId = await getDbUserId();

        if (!userId) return;
        if (!content.trim()) throw new Error("Content is required.");

        const post = await db.query.posts.findFirst({
            where: { id: postId },
            columns: { authorId: true }
        });

        if (!post) throw new Error("Post not found");

        const commentId = crypto.randomUUID();

        const insertComment = db.insert(schema.comments).values({
            id: commentId, content, authorId: userId, postId,
        }).returning();

        let comment;

        if (post.authorId !== userId) {
            const [[created]] = await db.batch([
                insertComment,
                db.insert(schema.notifications).values({
                    type: "COMMENT",
                    receivedById: post.authorId,
                    createdById: userId,
                    postId,
                    commentId,
                    read: false
                })
            ]);
            comment = created;
        } else {
            [comment] = await insertComment;
        }

        revalidatePath("/");
        return { sucess: true, comment }
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
}

export async function deletePost(postId: string) {
    try {
        const userId = await getDbUserId();
        if (!userId) throw new Error("Unauthorized");
        const deleted = await db.delete(schema.posts)
            .where(and(eq(schema.posts.id, postId), eq(schema.posts.authorId, userId))).returning({ id: schema.posts.id });

        if (deleted.length === 0) {
            throw new Error("Post not found or unauthorized - no delete permission");
        }

        revalidatePath("/"); // purge the cache
        return { success: true };
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}