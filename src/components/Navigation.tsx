import { Heart, MessageCircle, BookHeart, BarChart3, LifeBuoy, Sparkles } from "lucide-react";
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
          <span className="font-display font-bold text-xl text-foreground">Lovable</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/chat" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/chat') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            Chat with Luna
          </Link>
          <Link 
            to="/journal" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/journal') ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            <BookHeart className="w-4 h-4 inline mr-1" />
            Journal
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/dashboard') ? 'text-primary' : 'text-foreground/70'
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
