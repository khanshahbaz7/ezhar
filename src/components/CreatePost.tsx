"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { useState } from "react";
import { createPost } from "@/app/actions/post.action";
import toast from "react-hot-toast";
import { Spinner } from "./ui/spinner";
import { uploadImage } from "@/lib/imagekit";
import Image from "next/image";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      let imageFileId = "";
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);

        imageUrl = uploaded.url ?? "";
        imageFileId = uploaded.fileId ?? "";
      }

      const result = await createPost(content, imageUrl, imageFileId);
      if (result?.success) {
        toast.success("Post created successfully.");
        setContent("");
        setImageFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
      } else {
        toast.error(result?.error ?? "Failed to create the post.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not create the post.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24 resize-none"
              />

              <Field>
                <FieldLabel htmlFor="picture">Picture</FieldLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="relative mt-3">
                    <img
                      src={imagePreview}
                      alt="Selected image"
                      className="h-48 w-full rounded-lg object-cover"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-sm text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <FieldDescription>Select a picture to upload.</FieldDescription>
              </Field>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (!content.trim() && !imageFile)}
            >
              {loading ? <Spinner className="size-4" /> : "Create Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
