import { Heart, MessageCircle, BookHeart, BarChart3, LifeBuoy, Sparkles, Trophy, Dumbbell, ClipboardList, Calendar, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Heart className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
            <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse-gentle" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">MindfulMe</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/chat" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/chat') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            Chat
          </Link>
          <Link 
            to="/journal" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/journal') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <BookHeart className="w-4 h-4 inline mr-1" />
            Journal
          </Link>
          <Link 
            to="/exercises" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/exercises') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <Dumbbell className="w-4 h-4 inline mr-1" />
            Exercises
          </Link>
          <Link 
            to="/assessments" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/assessments') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1" />
            Assessments
          </Link>
          <Link 
            to="/mood-calendar" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/mood-calendar') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Mood
          </Link>
          <Link 
            to="/biomarkers" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/biomarkers') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" />
            Biomarkers
          </Link>
          <Link 
            to="/leaderboard" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/leaderboard') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1" />
            Leaderboard
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
              isActive('/dashboard') ? 'text-primary font-semibold' : 'text-foreground/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Insights
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/crisis">
            <Button 
              variant="destructive" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 animate-pulse-gentle"
            >
              <LifeBuoy className="w-4 h-4 mr-2" />
              Crisis Help
            </Button>
          </Link>
          <Link to="/onboarding">
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
