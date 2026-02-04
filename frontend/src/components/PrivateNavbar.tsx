"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";

interface PrivateNavbarProps {
  userName: string;
}

export default function PrivateNavbar({ userName }: PrivateNavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    toast.loading("Signing out…", { id: "logout" });

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out", { id: "logout" });
          router.push("/signin");
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to sign out", { id: "logout" });
        },
      },
    });
  };

  return (
    <nav className="fixed py-5 top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm px-4 ">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center font-semibold hover:text-primary transition-colors"
          >
            PromptGuard
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link
              href="/chat"
              className="text-sm hover:text-primary transition-colors"
            >
              Chat
            </Link>
            <Link
              href="/dashboard"
              className="text-sm hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-sm hover:text-primary transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/prompt-input"
              className="text-sm hover:text-primary transition-colors"
            >
              Prompt Input
            </Link>
            <Link
              href="/prompt-output"
              className="text-sm hover:text-primary transition-colors"
            >
              Prompt Output
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {userName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
