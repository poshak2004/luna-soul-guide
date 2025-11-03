import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, BookHeart, BarChart3, LifeBuoy, Sparkles, 
  Trophy, Dumbbell, ClipboardList, Calendar, Activity, Palette, 
  Waves, Moon, FileText, Home, Menu, X, LogOut, Settings
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
    { path: "/chat", label: "Chat", icon: MessageCircle },
    { path: "/journal", label: "Journal", icon: BookHeart },
    { path: "/exercises", label: "Exercises", icon: Dumbbell },
    { path: "/assessments", label: "Assessments", icon: ClipboardList },
    { path: "/mood-calendar", label: "Mood Calendar", icon: Calendar },
    { path: "/cogniarts", label: "CogniArts", icon: Palette },
    { path: "/sensory-healing", label: "Sensory Healing", icon: Waves },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/dashboard", label: "Insights", icon: BarChart3 },
    { path: "/wellness-reports", label: "Reports", icon: FileText },
  ];

  return (
    <>
      {/* Compact Top Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <Heart className="w-7 h-7 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="w-3 h-3 text-accent absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">Luna Soul Guide</span>
          </Link>

          {/* Desktop Navigation - Horizontal */}
          <div className="hidden lg:flex items-center gap-4">
            {menuItems.slice(0, 6).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}
            
            {/* Crisis Button - Always Visible */}
            <Link to="/crisis">
              <Button 
                variant="destructive" 
                size="sm"
                className="ml-2 animate-pulse"
              >
                <LifeBuoy className="w-4 h-4 mr-1.5" />
                <span className="hidden xl:inline">Crisis</span>
              </Button>
            </Link>
          </div>

          {/* Hamburger Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent/10 transition-colors"
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
      </motion.nav>

      {/* Mobile/Full Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-14 right-0 bottom-0 w-full sm:w-80 bg-background border-l border-border/50 z-50 overflow-y-auto shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6 space-y-6">
                {/* Menu Items */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Navigation
                  </p>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-foreground/70 hover:text-primary hover:bg-accent/50"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-1 pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Actions
                  </p>
                  
                  <Link to="/crisis" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start gap-3 animate-pulse"
                    >
                      <LifeBuoy className="w-5 h-5" />
                      Crisis Help
                    </Button>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-accent/50 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-14" />
    </>
  );
};

export default Navigation;
