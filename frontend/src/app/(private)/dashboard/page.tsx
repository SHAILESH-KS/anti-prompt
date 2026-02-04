import { getSession } from "@/src/lib/auth-server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {user && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.name}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Test AI prompt injection vulnerabilities in the chat interface.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <strong>Email:</strong> {user.email}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
