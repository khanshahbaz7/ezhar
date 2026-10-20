"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type ProfileUser = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
};

type ProfileCardProps = {
  user: ProfileUser | null;
};

export default function ProfileCard({ user }: ProfileCardProps) {
  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Sign in to view your profile.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-6">
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name ?? "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {user.name || "Unknown User"}
          </h2>

          {user.username && (
            <p className="text-sm text-muted-foreground">
              @{user.username}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Location: {user.location || "Not specified"}</span>
        </div>

        {/* Bio */}
        <div className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground/70">Bio</p>
          <p>{user.bio || "No bio provided."}</p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 border-t pt-4">
          <div className="text-center">
            <p className="font-semibold">{user._count.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>

          <div className="border-l text-center">
            <p className="font-semibold">{user._count.following}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}