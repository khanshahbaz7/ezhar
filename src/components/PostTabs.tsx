'use client'

import { useState } from "react";
import { cn } from "cn";
import PostCard from "./PostCard";
import type { getPosts } from "@/app/actions/post.action";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

type PostTabsProps = {
  posts: Post[];
  likedPosts: Post[];
  dbUserId: string;
};

const PostTabs = ({ posts, likedPosts, dbUserId }: PostTabsProps) => {
    const [showLikedPost, setShowLikedPost] = useState(false);

    const tabClass = (isSelected: boolean) =>
        cn(
            "flex w-1/2 flex-col items-center gap-2 px-4 pt-3 pb-1.5 text-sm font-bold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/60",
            isSelected ? "text-slate-900 dark:text-neutral-100" : "text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        );

  return (
    <div>
        <div role="tablist" aria-label="User posts" className="relative flex w-full border-b border-slate-200 dark:border-neutral-800">
            <button
                id="tab-posts"
                type="button"
                role="tab"
                aria-selected={!showLikedPost}
                aria-controls="panel-posts"
                onClick={() => setShowLikedPost(false)}
                className={tabClass(!showLikedPost)}
            >
                <span>Posts</span>
            </button>
            <button
                id="tab-liked"
                type="button"
                role="tab"
                aria-selected={showLikedPost}
                aria-controls="panel-liked"
                onClick={() => setShowLikedPost(true)}
                className={tabClass(showLikedPost)}
            >
                <span>Liked</span>
            </button>

            {/* Sliding indicator — a single bar that glides between tabs with a springy overshoot */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 flex h-1 w-1/2 justify-center"
                style={{
                    transform: showLikedPost ? "translateX(100%)" : "translateX(0)",
                    transition: "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                <span className="h-1 w-12 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </span>
        </div>

        <div
            key={showLikedPost ? "panel-posts-idle" : "panel-posts-active"}
            id="panel-posts"
            role="tabpanel"
            aria-labelledby="tab-posts"
            hidden={showLikedPost}
            className="animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out"
        >
            {posts.length > 0 ? (
                <div className="space-y-3 p-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
                    ))}
                </div>
            ) : (
                <p className="px-4 py-6 text-sm text-slate-500 dark:text-neutral-400">
                    No posts yet.
                </p>
            )}
        </div>

        <div
            key={showLikedPost ? "panel-liked-active" : "panel-liked-idle"}
            id="panel-liked"
            role="tabpanel"
            aria-labelledby="tab-liked"
            hidden={!showLikedPost}
            className="animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out"
        >
            {likedPosts.length > 0 ? (
                <div className="space-y-3 p-4">
                    {likedPosts.map((post) => (
                        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
                    ))}
                </div>
            ) : (
                <p className="px-4 py-6 text-sm text-slate-500 dark:text-neutral-400">
                    You haven&apos;t liked any posts yet.
                </p>
            )}
        </div>
    </div>
  )
}

export default PostTabs
