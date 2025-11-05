import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, BookHeart, BarChart3, LifeBuoy, Sparkles, 
  Trophy, Dumbbell, ClipboardList, Calendar, Palette, 
  Waves, FileText, Home, Menu, X, LogOut, Settings as SettingsIcon, TrendingUp, BookOpen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/guide", label: "How It Works", icon: BookOpen },
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/journal", label: "Journal", icon: BookHeart },
    { path: "/exercises", label: "Exercises", icon: Dumbbell },
    { path: "/assessments", label: "Assessments", icon: ClipboardList },
    { path: "/mood-calendar", label: "Mood Calendar", icon: Calendar },
    { path: "/cogniarts", label: "CogniArts", icon: Palette },
    { path: "/sensory-healing", label: "Sensory Healing", icon: Waves },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/insights", label: "Insights", icon: TrendingUp },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/wellness-reports", label: "Reports", icon: FileText },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      {/* Clean Top Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <Heart className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="w-3 h-3 text-accent absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:inline">Luna Soul Guide</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Crisis Button - Always Visible */}
            <Link to="/crisis">
              <Button 
                variant="destructive" 
                size="sm"
                className="animate-pulse"
              >
                <LifeBuoy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Crisis Help</span>
              </Button>
            </Link>

            {/* Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent/10 transition-colors border border-border/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              className="fixed top-16 right-4 w-72 bg-background border border-border/50 rounded-2xl shadow-2xl z-50"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Menu Items - Scrollable Area */}
              <div 
                className="max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden scrollbar-thin"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Navigation
                  </p>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions - Fixed at bottom */}
              <div className="p-4 pt-2 border-t border-border/50 space-y-1 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  Account
                </p>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
};

export default Navigation;
