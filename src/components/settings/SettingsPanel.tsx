import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './AccountSettings';
import { PrivacySettings } from './PrivacySettings';
import { SoundHaptics } from './SoundHaptics';
import { NotificationsSettings } from './NotificationsSettings';

export const SettingsPanel = () => (
  <Tabs defaultValue="account" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="privacy">Privacy</TabsTrigger>
      <TabsTrigger value="sound">Sound</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
  </Tabs>
);
