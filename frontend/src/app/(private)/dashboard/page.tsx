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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back, {user.name}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You are successfully logged in.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Email Verified:</strong>{" "}
                {user.emailVerified ? "Yes" : "No"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>
                  <a href="/profile" className="text-blue-600 hover:underline">
                    View Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/auth/signout"
                    className="text-blue-600 hover:underline"
                  >
                    Sign Out
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
