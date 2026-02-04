import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth-server";
import PrivateNavbar from "@/src/components/PrivateNavbar";

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
      <PrivateNavbar userName={session.user.name} />
      <div className="">{children}</div>
    </>
  );
}
