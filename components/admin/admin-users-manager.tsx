"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminUser } from "@/lib/admin/users";
import type { AdminRole } from "@/lib/auth/session";

export function AdminUsersManager({ initialUsers, currentEmail }: { initialUsers: AdminUser[]; currentEmail: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [isInviting, setIsInviting] = useState(false);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);

  async function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsInviting(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = (await response.json()) as { users?: AdminUser[]; error?: string; inviteSent?: boolean; inviteError?: string };
      if (!response.ok || !payload.users) throw new Error(payload.error || "Could not invite admin.");
      setUsers(payload.users);
      setEmail("");
      setRole("admin");
      if (payload.inviteSent) toast.success("Admin invited and Supabase email sent.");
      else toast.warning(payload.inviteError || "Admin saved, but Supabase invite email was not sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite admin.");
    } finally {
      setIsInviting(false);
    }
  }

  async function updateAdmin(targetEmail: string, patch: { role?: AdminRole; status?: "active" | "disabled" }) {
    setSavingEmail(targetEmail);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetEmail)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as { users?: AdminUser[]; error?: string };
      if (!response.ok || !payload.users) throw new Error(payload.error || "Could not update admin.");
      setUsers(payload.users);
      toast.success("Admin updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update admin.");
    } finally {
      setSavingEmail(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Invite admin
          </CardTitle>
          <CardDescription>Creates or activates an admin record and sends the Supabase invite email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={inviteAdmin}>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-role">Role</Label>
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm"
                id="admin-role"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <Button disabled={isInviting} type="submit">
              {isInviting ? "Sending..." : "Send invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Admin access
          </CardTitle>
          <CardDescription>Change roles, disable access, or restore access for staff admins.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.email === currentEmail;
                return (
                  <TableRow key={user.email}>
                    <TableCell className="whitespace-normal">
                      <div className="font-medium">{user.email}</div>
                      {user.invited_by ? <div className="text-xs text-muted-foreground">Invited by {user.invited_by}</div> : null}
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-9 rounded-md border bg-white px-2 text-sm"
                        disabled={savingEmail === user.email || (isSelf && user.role === "superadmin")}
                        value={user.role}
                        onChange={(event) => updateAdmin(user.email, { role: event.target.value as AdminRole })}
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.invited_at ? new Date(user.invited_at).toLocaleDateString() : "Not invited"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        disabled={savingEmail === user.email || isSelf}
                        size="sm"
                        variant={user.status === "active" ? "outline" : "default"}
                        onClick={() => updateAdmin(user.email, { status: user.status === "active" ? "disabled" : "active" })}
                      >
                        {savingEmail === user.email ? "Saving..." : user.status === "active" ? "Disable" : "Restore"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
