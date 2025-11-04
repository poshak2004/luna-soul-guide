import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, ExternalLink } from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { PrivacySettings } from './PrivacySettings';
import { SoundHaptics } from './SoundHaptics';
import { NotificationsSettings } from './NotificationsSettings';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';

export const SettingsPanel = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="sound">Sound</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
      </TabsList>
      <TabsContent value="account" className="space-y-4">
        <AccountSettings />
      </TabsContent>
      <TabsContent value="privacy" className="space-y-4">
        <PrivacySettings />
      </TabsContent>
      <TabsContent value="sound" className="space-y-4">
        <SoundHaptics />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <NotificationsSettings />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="admin" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Sound Manager</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload and manage therapy sounds for the Sensory Healing module
                  </p>
                  <Button
                    onClick={() => navigate('/admin/sounds')}
                    variant="outline"
                    size="sm"
                  >
                    Open Sound Manager
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};
