import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <motion.div
      className={`relative ${sizes[size]} ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer circle - calm gradient */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="fill-primary/20"
        />
        
        {/* Inner flowing shape - represents mind/consciousness */}
        <path
          d="M50 20 C65 20, 75 30, 75 45 C75 60, 65 70, 50 70 C35 70, 25 60, 25 45 C25 30, 35 20, 50 20 Z"
          className="fill-primary"
        />
        
        {/* Center dot - mindfulness point */}
        <circle
          cx="50"
          cy="47"
          r="8"
          className="fill-accent"
        />
        
        {/* Subtle sparkle */}
        <circle
          cx="65"
          cy="35"
          r="3"
          className="fill-secondary animate-pulse-gentle"
        />
      </svg>
    </motion.div>
  );
};
