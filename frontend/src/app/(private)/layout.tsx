import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth-server";
import Navbar from "@/src/components/Navbar";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
