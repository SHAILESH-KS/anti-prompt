"use client";

import Link from "next/link";
import React, { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, Menu, X } from "lucide-react";
import clsx from "clsx";

const navItem =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    toast.loading("Signing out…", { id: "logout" });

    await new Promise((r) => setTimeout(r, 1200));

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out", { id: "logout" });
          router.push("/signin");
          router.refresh();
        },
        onError: () => {
          setIsLoggingOut(false);
          toast.error("Failed to sign out", { id: "logout" });
        },
      },
    });
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-4 left-4 right-4 z-50 mx-auto flex h-16 max-w-7xl items-center rounded-2xl border border-border/30 bg-background/80 px-6 backdrop-blur-xl shadow-lg">
        {/* LEFT — Logo (always visible) */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight hover:text-primary transition-colors"
          >
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg">PromptGuard</span>
          </Link>
        </div>

        {/* CENTER — Desktop nav only */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          {session && (
            <>
              <Link href="/chat" className={navItem}>
                Chat
              </Link>
              <Link href="/dashboard" className={navItem}>
                Dashboard
              </Link>
              <Link href="/prompt-input" className={navItem}>
                Prompt Input
              </Link>
              <Link href="/prompt-output" className={navItem}>
                Prompt Output
              </Link>
            </>
          )}
        </div>

        {/* RIGHT — Desktop auth / Mobile menu */}
        <div className="ml-auto flex items-center gap-3">
          {/* Desktop auth */}
          {!isPending && session && (
            <>
              <span className="hidden lg:block text-xs text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="hidden md:inline-flex"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          )}

          {!isPending && !session && (
            <Link href="/signin" className="hidden md:inline-flex">
              <Button size="sm">Sign in</Button>
            </Link>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 hover:bg-muted transition"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE COLLAPSIBLE MENU */}
      <div
        className={clsx(
          "fixed inset-x-4 top-24 z-40 rounded-2xl border border-border/30 bg-background shadow-xl transition-all duration-300 md:hidden",
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-4",
        )}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          {!session && (
            <MobileLink href="/signin" close={setIsMenuOpen}>
              Sign in
            </MobileLink>
          )}

          {session && (
            <>
              <MobileLink href="/chat" close={setIsMenuOpen}>
                Chat
              </MobileLink>
              <MobileLink href="/dashboard" close={setIsMenuOpen}>
                Dashboard
              </MobileLink>
              <MobileLink href="/profile" close={setIsMenuOpen}>
                Profile
              </MobileLink>
              <MobileLink href="/prompt-input" close={setIsMenuOpen}>
                Prompt Input
              </MobileLink>
              <MobileLink href="/prompt-output" close={setIsMenuOpen}>
                Prompt Output
              </MobileLink>

              <div className="my-2 h-px w-full bg-border" />

              <Button
                size="sm"
                variant="outline"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

function MobileLink({
  href,
  close,
  children,
}: {
  href: string;
  close: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => close(false)}
      className="w-full rounded-lg px-3 py-2 text-center text-sm hover:bg-muted transition"
    >
      {children}
    </Link>
  );
}

export default Navbar;
