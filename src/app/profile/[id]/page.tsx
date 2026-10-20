import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import PostTabs from "@/components/PostTabs";
import ProfileCard from "@/components/ProfileCard";
import FollowButton from "@/components/FollowButton";
import RightSidebar from "@/components/RightSidebar";
import { getMyLikePosts, getMyPost } from "@/app/actions/post.action";
import { getDbUserId } from "@/app/actions/user.action";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const users = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);

  const user = users[0];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-black dark:text-neutral-100">
        <p>User not found</p>
      </div>
    );
  }

  const [followers, following, postCount, posts, likedPosts, dbUserId] = await Promise.all([
    db.$count(schema.follows, eq(schema.follows.accountId, id)),
    db.$count(schema.follows, eq(schema.follows.followedById, id)),
    db.$count(schema.posts, eq(schema.posts.authorId, id)),
    getMyPost(),
    getMyLikePosts(),
    getDbUserId(),
  ]);

  const profileCardUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    _count: { followers, following, posts: postCount },
  };

  // Own profile? Then it's "Edit Profile". Otherwise check if we already follow them.
  const isMe = dbUserId === id;
  const isFollowing = !isMe && dbUserId
    ? Boolean(
        await db.query.follows.findFirst({
          where: { accountId: id, followedById: dbUserId },
        }),
      )
    : false;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          {/* LEFT SIDEBAR — sticky profile summary */}
          <aside className="hidden lg:col-start-1 lg:block">
            <div className="sticky top-4">
              <ProfileCard user={profileCardUser} />
            </div>
          </aside>

          {/* Middle column — same width as the home feed, so PostCards match exactly. */}
          <div className="min-w-0 lg:col-start-2">
            <div className="border-x border-slate-200 bg-card shadow-sm dark:border-neutral-800">
              {/* Background Header — black banner, or the user's cover image if they have one */}
              <div
                className={
                  user.coverUrl
                    ? "relative h-40 w-full bg-black"
                    : "relative h-40 w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700"
                }
              >
                {user.coverUrl && (
                  <Image
                    src={user.coverUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Avatar — overlaps the cover like X does */}
              <div className="px-4">
                <div className="-mt-12 w-fit">
                  <Avatar className="size-24 rounded-full border-4 border-white bg-slate-100 dark:border-black dark:bg-neutral-800">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? "User"} />
                    <AvatarFallback className="text-2xl font-semibold text-slate-500 dark:text-neutral-400">
                      {user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Profile Section */}
              <div className="px-4 pb-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-neutral-100">
                    {user.name || "Unknown User"}
                  </h1>

                  {isMe ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 rounded-full border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-neutral-700 dark:bg-black dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <FollowButton
                      userId={user.id}
                      name={user.name ?? "this user"}
                      initialFollowing={isFollowing}
                    />
                  )}
                </div>

                <p className="mt-0.5 text-sm text-slate-500 dark:text-neutral-400">@{user.username}</p>

                {user.bio && (
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-700 dark:text-neutral-300">
                    {user.bio}
                  </p>
                )}

                <p className="mt-3 flex items-center gap-1 text-sm text-slate-500 dark:text-neutral-400">
                  <CalendarDays className="size-4" />
                  Joined {format(user.createdAt, "MMMM yyyy")}
                  <ChevronRight className="size-4" />
                </p>

                {user.location && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-neutral-400">
                    <MapPin className="size-4" />
                    {user.location}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-5 text-sm">
                  <span>
                    <span className="font-bold text-slate-900 dark:text-neutral-100">{following}</span>{" "}
                    <span className="text-slate-500 dark:text-neutral-400">Following</span>
                  </span>
                  <span>
                    <span className="font-bold text-slate-900 dark:text-neutral-100">{followers}</span>{" "}
                    <span className="text-slate-500 dark:text-neutral-400">Followers</span>
                  </span>
                </div>
              </div>

              {/* Posts / Liked tabs */}
              <PostTabs posts={posts} likedPosts={likedPosts} dbUserId={dbUserId || ""} />
            </div>
          </div>

          {/* RIGHT SIDEBAR — sticky */}
          <aside className="hidden lg:col-start-3 lg:block">
            <div className="sticky top-4">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
