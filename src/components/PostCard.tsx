"use client";

import Image from "next/image";
import {
  Heart,
  HeartIcon,
  MessageCircle,
  MoreHorizontal,
  ReceiptTurkishLira,
  Send,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRef, useState } from "react";
import Link from "next/link";
import { createComment, getPosts, toggleLike } from "@/app/actions/post.action";
import toast from "react-hot-toast";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";
import { Spinner } from "./ui/spinner";
import PostPreview from "./PostPreview";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

type PostCardProps = {
  post: Post;
  dbUserId: string;
};

export default function PostCard({ post, dbUserId }: PostCardProps) {
  const initials =
    post.author.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.authorId == dbUserId),
  );
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);

  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleLike = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);

      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));

      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.authorId === dbUserId));

      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    setIsCommenting(true);
    try {
      const result = await createComment(comment, post.id);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Avatar + name + username — all link to the author's profile */}
            <Link
              href={`/profile/${post.author.id}`}
              className="flex items-center gap-3 rounded-sm "
            >
              <Avatar className="size-10">
                <AvatarImage
                  src={post.author.avatarUrl ?? undefined}
                  alt={post.author.name ?? "User"}
                />

                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {/* User information */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold hover:underline hover:underline-offset-2">
                    {post.author.name}
                  </span>

                  <span className="text-xs text-muted-foreground">·</span>

                  <span className="text-xs text-muted-foreground">
                    {formattedDate}
                  </span>
                </div>

                <span className="text-xs text-muted-foreground">
                  @{post.author.username}
                </span>
              </div>
            </Link>
          </div>

          {/* More button */}
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-5" />

            <span className="sr-only">Post options</span>
          </Button>
        </CardHeader>

        {/* Image */}
        {post.image && (
          <div className="p-3">
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image
                src={post.image}
                alt="Post image"
                width={800}
                height={500}
                className="h-auto max-h-[600px] w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-neutral-200">
            {post.content}
          </p>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2"
              onClick={handleLike}
            >
              {hasLiked ? (
                <HeartIcon className="size-5 fill-red-500 text-red-500" />
              ) : (
                <HeartIcon className="size-5 text-slate-600 dark:text-neutral-400" />
              )}

              <span>{optimisticLikes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2"
              onClick={() => {
                if (!isSignedIn) {
                  openSignIn();
                  return;
                }

                setShowComments(true);
              }}
            >
              <MessageCircle className="size-4" />

              <span>{post._count.comments}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <PostPreview
        post={post}
        dbUserId={dbUserId}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </>
  );
}
