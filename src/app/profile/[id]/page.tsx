import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  // Use the standard select instead of relational query to avoid "decoder" error
  const users = await db.select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);

  const user = users[0];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Hello {user.name || user.username}, your ID is {id}</h1>
    </div>
  );
}
