"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toggleFollow } from "@/app/actions/user.action";
import toast from "react-hot-toast";
import { Spinner } from "./ui/spinner";

type FollowButtonProps = {
  userId: string;
  name: string;
};

const FollowButton = ({ userId, name }: FollowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    if (loading || following) return;

    setLoading(true);

    try {
      const result = await toggleFollow(userId);

      if (result?.success) {
        // Change the button locally.
        setFollowing(true);

        toast.success(`Started following ${name}`);
      } else {
        toast.error(result?.error ?? "Failed to follow");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to follow");
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
          ? "h-8 cursor-default bg-slate-200 text-xs text-slate-600 hover:bg-slate-200"
          : "h-8 cursor-pointer bg-blue-600 text-xs text-white hover:bg-blue-700"
      }
      onClick={handleFollow}
      disabled={loading || following}
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