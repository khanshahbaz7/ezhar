import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-5 py-3 text-xl border-b">
      <Link href={"/"}>
      <div className="text-xl font-bold">Ezhar</div>
      </Link>
      <div className="flex  items-center gap-3">
        <div className="bg-gray-200 p-1 rounded-full">
          <Bell />
        </div>
        <Show when="signed-out">
              <SignInButton>
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant={"outline"}>Sing Up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
      </div>
    </div>
  );
}
