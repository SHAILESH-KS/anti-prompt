"use client";

import Link from "next/link";
import React, { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    toast.loading("Signing out...", { id: "logout" });

    // Add a small delay for smooth experience
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully", { id: "logout" });
          setTimeout(() => {
            router.push("/signin");
            router.refresh();
          }, 500);
        },
        onError: () => {
          setIsLoggingOut(false);
          toast.error("Failed to sign out", { id: "logout" });
        },
      },
    });
  };

  return (
    <nav className="flex items-center justify-between w-full h-16 px-4 md:px-8 bg-background text-foreground border-b">
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="text-xl font-bold hover:text-primary transition-colors"
        >
          Anti-Prompt Injection
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/"
            className="text-sm hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/models"
            className="text-sm hover:text-primary transition-colors"
          >
            Models
          </Link>
          {session && (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
        {isPending ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : session ? (
          <>
            <span className="hidden md:inline text-sm text-muted-foreground">
              Welcome, {session.user.name || session.user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
          </>
        ) : (
          <>
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          </>
        )}
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b shadow-lg">
          <div className="flex flex-col space-y-2 p-4">
            <Link
              href="/"
              className="text-sm hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/models"
              className="text-sm hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Models
            </Link>
            {session && (
              <>
                <Link
                  href="/chat"
                  className="text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/prompt-input"
                  className="text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prompt Input
                </Link>
                <Link
                  href="/prompt-output"
                  className="text-sm hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prompt Output
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
