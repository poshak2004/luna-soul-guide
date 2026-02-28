import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SoundUpload } from '@/components/admin/SoundUpload';
import { SoundList } from '@/components/admin/SoundList';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';

export default function SoundManager() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSounds = async () => {
    try {
      const { data, error } = await supabase
        .from('sound_therapy')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSounds(data || []);
    } catch (error) {
      console.error('Error fetching sounds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchSounds();
    }
  }, [adminLoading, isAdmin]);

  if (adminLoading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sound Manager</h1>
                <p className="text-muted-foreground">
                  Upload and manage therapy sounds
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="manage">
                Manage ({sounds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <SoundUpload onUploadComplete={fetchSounds} />
              </motion.div>
            </TabsContent>

            <TabsContent value="manage">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <SoundList sounds={sounds} onDelete={fetchSounds} />
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
