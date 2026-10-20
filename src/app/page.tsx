import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import ProfileCard from "@/components/ProfileCard";
import RightSidebar from "@/components/RightSidebar";

import { getPosts } from "./actions/post.action";
import { getDbUserId, getUserByClerkId } from "./actions/user.action";
import { auth, currentUser } from "@clerk/nextjs/server";

const Home = async () => {
  const {userId} = await auth();

  const user = userId ? await getUserByClerkId(userId) : null;
  const posts = await getPosts();
  const dbUserId = await getDbUserId();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div>
              <ProfileCard user={user} />
            </div>
          </aside>

          {/* MOBILE PROFILE */}
          <div className="lg:hidden">
            <ProfileCard user={user} />
          </div>

          {/* MAIN FEED */}
          <section className="min-w-0 space-y-5">
            <CreatePost />

            <div className="space-y-5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    dbUserId={dbUserId || ""}
                  />
                ))
              ) : (
                <div className="rounded-xl border bg-card p-10 text-center">
                  <p className="font-medium">No posts yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the first person to create a post!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <RightSidebar />

        </div>
      </div>
    </main>
  );
};

export default Home;