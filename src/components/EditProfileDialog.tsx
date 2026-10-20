"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile } from "@/app/actions/profile.action";
import toast from "react-hot-toast";

type EditProfileDialogProps = {
  name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website : string | null;
};

export default function EditProfileDialog({
  name,
  username,
  bio,
  location,
  website
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const result = await updateProfile(formData);

      if (result?.success) {
        toast.success("Profile updated");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.error ?? "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="h-7 shrink-0 rounded-full border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-neutral-700 dark:bg-black dark:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-white"
        onClick={() => setOpen(true)}
      >
        Edit Profile
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile. Click save to confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              name="name"
              placeholder="Your name"
              defaultValue={name ?? ""}
              maxLength={50}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              name="username"
              placeholder="username"
              defaultValue={username ?? ""}
              maxLength={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              name="website"
              placeholder="https://example.com"
              defaultValue={website ?? ""}
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              name="bio"
              placeholder="Tell us about yourself"
              defaultValue={bio ?? ""}
              maxLength={160}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              name="location"
              placeholder="City, Country"
              defaultValue={location ?? ""}
              maxLength={60}
            />
          </div>
          

        

            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Spinner className="size-4" /> Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
         
        </form>
      </DialogContent>
    </Dialog>
  );
}
