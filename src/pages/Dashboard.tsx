import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Heart, BookOpen, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">Your Wellness Insights</h1>
          <p className="text-muted-foreground">
            Track your emotional journey and celebrate your progress
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: MessageCircle,
              label: "Conversations",
              value: "12",
              change: "+3 this week",
              color: "text-primary"
            },
            {
              icon: BookOpen,
              label: "Journal Entries",
              value: "8",
              change: "+2 this week",
              color: "text-accent"
            },
            {
              icon: TrendingUp,
              label: "Mood Trend",
              value: "Improving",
              change: "+15% this month",
              color: "text-secondary"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-xs text-secondary font-medium">{stat.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mood Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass p-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl font-semibold">Mood Timeline</h2>
            </div>
            
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Your mood insights will appear here as you use Lovable
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep journaling and chatting with Luna to see patterns emerge
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="font-display text-2xl font-semibold mb-4">Recent Reflections</h2>
          <div className="space-y-4">
            {[
              {
                type: "journal",
                content: "Feeling more at peace today after our conversation...",
                time: "2 hours ago"
              },
              {
                type: "chat",
                content: "Talked through some anxious thoughts with Luna",
                time: "Yesterday"
              },
              {
                type: "journal",
                content: "Grateful for small moments of joy today",
                time: "2 days ago"
              }
            ].map((activity, index) => (
              <Card key={index} className="glass p-4 hover:glow transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  {activity.type === "journal" ? (
                    <BookOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/80 truncate">{activity.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
