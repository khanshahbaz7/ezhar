
import { getRandomUsers } from "@/app/actions/user.action";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FollowButton from "./FollowButton";

export default async function RightSidebar() {
  const randomUsers = await getRandomUsers();

  
  

  return (
    <aside className="hidden lg:block">
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Discover</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find people and discover new posts.
          </p>

          <div className="mt-4 space-y-4">
            {randomUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? "User"} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <FollowButton userId={user.id} name={user.name || ""}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
