import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useGamification = () => {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return;
    }

    setBadges(data || []);
  };

  const fetchUserBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user badges:', error);
      return;
    }

    setUserBadges(data || []);
  };

  const addActivity = async (activityType: string, points: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Use server-side atomic point addition
      const { data, error } = await supabase.rpc('add_user_points', {
        _user_id: user.id,
        _activity_type: activityType,
        _points: points,
      });

      if (error) throw error;

      // Check for new badges
      await checkAndAwardBadges();

      // Refresh profile
      await fetchProfile();

      toast({
        title: `+${points} points!`,
        description: `You earned ${points} wellness points`,
      });
    } catch (error: any) {
      console.error('Error adding activity:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add activity',
        variant: 'destructive',
      });
    }
  };

  const checkAndAwardBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Use server-side badge validation
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        _user_id: user.id,
      });

      if (error) throw error;

      // Show notifications for newly awarded badges
      const result = data as any;
      if (result?.awarded_badges && result.awarded_badges.length > 0) {
        result.awarded_badges.forEach((badge: any) => {
          toast({
            title: '🏆 New Badge Unlocked!',
            description: `You earned the "${badge.name}" badge!`,
          });
        });
        await fetchUserBadges();
      }
    } catch (error: any) {
      console.error('Error checking badges:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProfile(), fetchBadges(), fetchUserBadges()]);
      setLoading(false);
    };

    init();
  }, []);

  return {
    profile,
    badges,
    userBadges,
    loading,
    addActivity,
    refreshProfile: fetchProfile,
  };
};
