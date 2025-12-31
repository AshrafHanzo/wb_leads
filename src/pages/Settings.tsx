import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MasterTableManager } from '@/components/settings/MasterTableManager';

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in max-w-5xl">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your application master data and preferences</p>
        </div>

        <MasterTableManager />
      </div>
    </AppLayout>
  );
}
