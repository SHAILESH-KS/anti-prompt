import { Sidebar } from "@/src/components/chat/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
