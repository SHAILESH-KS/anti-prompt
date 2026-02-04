import { redirect } from "next/navigation";

export default function ModelsPage() {
  // This page is not relevant for anti-prompt injection project
  // Redirecting to chat
  redirect("/chat");
}
