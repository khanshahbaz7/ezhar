"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toggleFollow } from "@/app/actions/user.action";
import toast from "react-hot-toast";
import { Spinner } from "./ui/spinner";

type FollowButtonProps = {
  userId: string;
  name: string;
  /** Whether the signed-in user already follows this user when the component mounts. */
  initialFollowing?: boolean;
};

const FollowButton = ({
  userId,
  name,
  initialFollowing = false,
}: FollowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(initialFollowing);

  const handleFollow = async () => {
    if (loading) return;

    setFollowing((prev) => !prev);
    setLoading(true);

    try {
      const result = await toggleFollow(userId);

      if (result?.success) {
        toast.success(
          following ? `Unfollowed ${name}` : `Started following ${name}`,
        );
      } else {
        // Revert the optimistic state on failure.
        setFollowing(following);
        toast.error(result?.error ?? "Failed to update follow");
      }
    } catch (error) {
      console.error(error);
      // Revert the optimistic state on failure.
      setFollowing(following);
      toast.error("Failed to update follow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "default"}
      className={
        following
          ? "h-7 cursor-pointer bg-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          : "h-7 cursor-pointer bg-blue-600 px-4 text-xs text-white hover:bg-blue-700"
      }
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : following ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
};

export default FollowButton;
