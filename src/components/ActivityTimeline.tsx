import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, Dumbbell, ClipboardList, Palette, 
  Waves, Award, TrendingUp, CheckCircle2 
} from "lucide-react";

interface Activity {
  id: string;
  activity_type: string;
  points_earned: number;
  completed_at: string;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }

    setActivities(data || []);
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('exercise') || type.includes('breathing') || type.includes('meditation')) {
      return <Dumbbell className="w-5 h-5" />;
    }
    if (type.includes('assessment')) {
      return <ClipboardList className="w-5 h-5" />;
    }
    if (type.includes('art') || type.includes('cogni')) {
      return <Palette className="w-5 h-5" />;
    }
    if (type.includes('sensory') || type.includes('sound')) {
      return <Waves className="w-5 h-5" />;
    }
    if (type.includes('badge')) {
      return <Award className="w-5 h-5" />;
    }
    return <TrendingUp className="w-5 h-5" />;
  };

  const getActivityColor = (type: string) => {
    if (type.includes('exercise') || type.includes('breathing')) return 'text-primary bg-primary/10';
    if (type.includes('assessment')) return 'text-secondary bg-secondary/10';
    if (type.includes('art')) return 'text-accent bg-accent/10';
    if (type.includes('sensory')) return 'text-support bg-support/10';
    return 'text-primary bg-primary/10';
  };

  const formatActivityName = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const groupByDate = (activities: Activity[]) => {
    const groups: Record<string, Activity[]> = {};
    activities.forEach(activity => {
      const date = new Date(activity.completed_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    return groups;
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No activities yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete exercises and assessments to build your timeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedActivities = groupByDate(activities);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities], dateIndex) => (
            <div key={date}>
              <p className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                {date}
              </p>
              <div className="space-y-2 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                <AnimatePresence>
                  {dateActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dateIndex * 0.1) + (index * 0.05) }}
                      className="flex items-start gap-3 pl-0 relative"
                    >
                      {/* Timeline dot */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>

                      {/* Activity card */}
                      <div className="flex-1 min-w-0 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {formatActivityName(activity.activity_type)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(activity.completed_at)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            +{activity.points_earned} pts
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
