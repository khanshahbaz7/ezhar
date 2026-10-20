import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export async function deleteImage(fileId: string) {
  return imagekit.files.delete(fileId);
}