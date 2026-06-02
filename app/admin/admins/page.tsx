import { ShieldAlert } from "lucide-react";
import { AdminUsersManager } from "@/components/admin/admin-users-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminAccess, listAdminUsers } from "@/lib/admin/users";

export const dynamic = "force-dynamic";

export default async function AdminManagementPage() {
  const access = await getCurrentAdminAccess();

  if (!access || access.role !== "superadmin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5" />
            Superadmin access required
          </CardTitle>
          <CardDescription>Only superadmins can invite admins or change admin roles.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ask a superadmin to make changes to admin access.
        </CardContent>
      </Card>
    );
  }

  const users = await listAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Management</h1>
        <p className="mt-2 text-muted-foreground">
          Invite staff, assign roles, and disable admin access without editing environment variables.
        </p>
      </div>
      <AdminUsersManager currentEmail={access.email} initialUsers={users} />
    </div>
  );
}
