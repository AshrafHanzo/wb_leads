import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: 'Settings saved' });
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your application preferences</p>
        </div>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Email notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email alerts for new leads</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Follow-up reminders</Label>
                <p className="text-xs text-muted-foreground">Daily digest of upcoming follow-ups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Weekly reports</Label>
                <p className="text-xs text-muted-foreground">Summary of leads and revenue</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Compact tables</Label>
                <p className="text-xs text-muted-foreground">Use smaller row height in tables</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Show lead IDs</Label>
                <p className="text-xs text-muted-foreground">Display ID column in lead tables</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Auto-save forms</Label>
                <p className="text-xs text-muted-foreground">Save form drafts automatically</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Export with headers</Label>
                <p className="text-xs text-muted-foreground">Include column headers in CSV exports</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
