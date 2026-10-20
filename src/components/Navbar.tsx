import { Suspense } from "react";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { syncUser, getUserByClerkId } from "@/app/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import UserNav from "./UserNav";
import { getNotifications } from "@/app/actions/notification.action";
import ThemeToggle from "./ThemeToggle";

export default async function Navbar() {
  const { userId } = await auth();
  if (userId) await syncUser();

  const notifications = userId ? await getNotifications() : [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const user = userId ? await getUserByClerkId(userId) : null;

  return (
    <nav className="w-full border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <div className="flex items-center">
          <Link href={'/'}>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-neutral-100">
            Ezhar
          </span>
          </Link>
        </div>

        {/* Clerk */}
        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-8 w-16" />}>
            <Show when="signed-out">
              <SignInButton>
                <button className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-slate-600 dark:hover:bg-neutral-800 dark:hover:text-white">
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="h-8 rounded-md bg-blue-600 px-3.5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:bg-blue-800">
                  Sign up
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserNav
                user={user}
                unreadCount={unreadCount}
              />
            </Show>
          </Suspense>

          {/* Signed-out visitors get the toggle here; signed-in users get it in UserNav. */}
          {!userId && <ThemeToggle />}
        </div>
      </div>
    </nav>
  );
}
