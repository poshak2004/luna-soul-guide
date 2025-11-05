import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, ExternalLink, Sparkles } from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { PrivacySettings } from './PrivacySettings';
import { SoundHaptics } from './SoundHaptics';
import { NotificationsSettings } from './NotificationsSettings';
import { PerformanceSettings } from './PerformanceSettings';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

export const SettingsPanel = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <>
      <OnboardingTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      
      <Tabs defaultValue="account" className="w-full">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="sound">Sound</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
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
      <TabsContent value="performance" className="space-y-4">
        <PerformanceSettings />
        
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-2">Interactive Tutorial</h3>
          <p className="text-muted-foreground mb-4">
            Want to explore Luna's features again? Take the guided tour anytime.
          </p>
          <Button 
            onClick={() => setTourOpen(true)}
            className="bg-gradient-to-r from-primary to-accent text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Replay Tutorial
          </Button>
        </Card>
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
    </>
  );
};
