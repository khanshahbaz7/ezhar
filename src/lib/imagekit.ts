import { upload } from "@imagekit/next";

export async function uploadImage(file: File) {
  const response = await fetch("/api/upload-auth");

  if (!response.ok) {
    throw new Error("Failed to authenticate ImageKit upload");
  }

  const auth = await response.json();

  const result = await upload({
    file,
    fileName: file.name,
    token: auth.token,
    signature: auth.signature,
    expire: auth.expire,
    publicKey: auth.publicKey,
    folder: "/posts",
    useUniqueFileName: true,
  });

  return result;
}