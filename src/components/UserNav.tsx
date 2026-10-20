"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bell } from "lucide-react";

type UserNavProps = {
  user: any;
  unreadCount: number;
};

export default function UserNav({ user, unreadCount }: UserNavProps) {
  return (
    <div className="flex h-8 items-center gap-4">
      <Link
        href="/notifications"
        className="relative flex items-center justify-center rounded-l p-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      <div className="group flex items-center gap-3 rounded-md p-1 pl-2 transition-colors hover:bg-slate-100 cursor-pointer">
        <div className="relative size-8 shrink-0">
          <UserButton />
        </div>
        <Link
          href={`/profile/${user?.id}`}
          className="flex flex-col leading-tight pr-2"
        >
          <span className="text-sm font-bold text-slate-900">
            {user?.name || "User"}
          </span>
          <span className="text-xs text-slate-500">
            @{user?.username || "username"}
          </span>
        </Link>
      </div>
    </div>
  );
}
