import { getSession } from "@/src/lib/auth-server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
