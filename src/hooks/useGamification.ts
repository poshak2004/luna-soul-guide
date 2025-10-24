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
      .single();

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

    // Add activity
    const { error: activityError } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        points_earned: points,
      });

    if (activityError) {
      console.error('Error adding activity:', activityError);
      return;
    }

    // Update total points
    const newTotalPoints = (profile?.total_points || 0) + points;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ total_points: newTotalPoints })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating points:', updateError);
      return;
    }

    // Check for new badges
    await checkAndAwardBadges(newTotalPoints);

    // Refresh profile
    await fetchProfile();

    toast({
      title: `+${points} points!`,
      description: `You earned ${points} wellness points`,
    });
  };

  const checkAndAwardBadges = async (totalPoints: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const badge of badges) {
      if (totalPoints >= badge.points_required) {
        // Check if user already has this badge
        const hasBadge = userBadges.some((ub) => ub.badge_id === badge.id);
        
        if (!hasBadge) {
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: badge.id,
            });

          if (!error) {
            toast({
              title: '🏆 New Badge Unlocked!',
              description: `You earned the "${badge.name}" badge!`,
            });
            await fetchUserBadges();
          }
        }
      }
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
