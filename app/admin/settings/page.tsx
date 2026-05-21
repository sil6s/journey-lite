import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Admin preferences and integration status. Sensitive tokens stay server-side in environment variables.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="guided-mode">Guided editing mode</Label>
            <p className="text-sm text-muted-foreground">Keep non-technical fields visible by default.</p>
          </div>
          <Switch id="guided-mode" defaultChecked />
        </div>
        <Separator />
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sanity project</span>
            <span>Configured through environment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Write token</span>
            <span>{process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN ? "Available server-side" : "Missing"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authorization</span>
            <span>TODO: connect app auth before production admin access</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
