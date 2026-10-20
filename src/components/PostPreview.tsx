"use client";

import Image from "next/image";
import { Heart, Send, X } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import {
  createComment,
  getPosts,
} from "@/app/actions/post.action";
import { Spinner } from "./ui/spinner";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

type PostPreviewProps = {
  post: Post;
  dbUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PostPreview({
  post,
  dbUserId,
  open,
  onOpenChange,
}: PostPreviewProps) {
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const initials =
    post.author.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const timeAgo = getTimeAgo(post.createdAt);

  const handleComment = async () => {
    if (!comment.trim() || isCommenting) return;

    setIsCommenting(true);

    try {
      const result = await createComment(comment.trim(), post.id);

      if (result?.success) {
        setComment("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCommenting(false);
      setComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          !w-[95vw]
          !max-w-6xl
          h-[90vh]
          max-h-[850px]
          overflow-hidden
          rounded-xl
          border-0
          bg-background
          p-0
          shadow-2xl
        "
      >
        <DialogTitle className="sr-only">
          Post by {post.author.username}
        </DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="
            absolute
            right-3
            top-3
            z-50
            size-9
            rounded-full
            bg-black/50
            text-white
            hover:bg-black/70
            hover:text-white
          "
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="flex h-full w-full overflow-hidden">
          
          {/* ========================= */}
          {/* LEFT — IMAGE */}
          {/* ========================= */}

          <div className="relative flex-1 h-full bg-black">
            {post.image ? (
              <Image
                src={post.image}
                alt="Post image"
                fill
                priority
                sizes="(max-width: 768px) 95vw, calc(100vw - 380px)"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-10">
                <p className="max-w-lg whitespace-pre-wrap text-center text-lg text-white">
                  {post.content}
                </p>
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* RIGHT — POST INFO */}
          {/* ========================= */}

          <div className="hidden md:flex w-[380px] shrink-0 flex-col bg-background">
            
            {/* User header */}
            <div className="flex shrink-0 items-center gap-3 p-4">
              <Avatar className="size-10">
                <AvatarImage
                  src={post.author.avatarUrl ?? undefined}
                  alt={post.author.name ?? "User"}
                />

                <AvatarFallback>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  @{post.author.username}
                </p>

                <p className="text-xs text-muted-foreground">
                  {post.author.name}
                </p>
              </div>
            </div>

            <Separator />

            {/* Content + comments */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              
              {/* Post content */}
              <div className="flex gap-3 p-4">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage
                    src={post.author.avatarUrl ?? undefined}
                    alt={post.author.name ?? "User"}
                  />

                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-sm leading-6">
                    <span className="mr-2 font-semibold">
                      {post.author.username}
                    </span>

                    {post.content}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {timeAgo}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div className="space-y-5 p-4">
                {post.comments.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium">
                      No comments yet
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Start the conversation.
                    </p>
                  </div>
                ) : (
                  post.comments.map((comment) => {
                    const commentInitials =
                      comment.author.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "U";

                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3"
                      >
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage
                            src={
                              comment.author.avatarUrl ??
                              undefined
                            }
                            alt={
                              comment.author.name ?? "User"
                            }
                          />

                          <AvatarFallback className="text-xs">
                            {commentInitials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm leading-5">
                              <span className="mr-2 font-semibold">
                                {comment.author.username}
                              </span>

                              {comment.content}
                            </p>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 shrink-0"
                            >
                              <Heart className="size-3.5" />
                            </Button>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {getTimeAgo(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ========================= */}
            {/* COMMENT INPUT */}
            {/* ========================= */}

            <div className="shrink-0 border-t bg-background p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="
                    min-h-[42px]
                    max-h-28
                    resize-none
                    rounded-xl
                  "
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />

                <Button
                  size="icon"
                  disabled={
                    !comment.trim() || isCommenting
                  }
                  onClick={handleComment}
                  className="size-10 shrink-0 rounded-full"
                >
                  {isCommenting ? <Spinner/> : <Send className="size-4" />}
                  
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ========================= */
/* TIME AGO */
/* ========================= */

function getTimeAgo(date: Date | string) {
  const now = new Date();
  const created = new Date(date);

  const seconds = Math.floor(
    (now.getTime() - created.getTime()) / 1000
  );

  if (seconds < 60) {
    return `${Math.max(seconds, 1)}m ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);

  return `${years}y ago`;
}