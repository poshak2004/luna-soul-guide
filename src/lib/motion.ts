// Global motion design system with 120Hz optimization

export const easing = {
  smooth: [0.25, 0.1, 0.25, 1],
  spring: [0.4, 0, 0.2, 1],
  inOutCirc: [0.85, 0, 0.15, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
};

export const spring = {
  soft: { type: "spring" as const, stiffness: 60, damping: 15 },
  medium: { type: "spring" as const, stiffness: 80, damping: 18 },
  snappy: { type: "spring" as const, stiffness: 120, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 150, damping: 12 },
};

export const transitions = {
  fast: { duration: 0.2, ease: easing.smooth },
  medium: { duration: 0.4, ease: easing.smooth },
  slow: { duration: 0.6, ease: easing.smooth },
  page: { duration: 0.5, ease: easing.inOutCirc },
};

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: transitions.medium,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: transitions.medium,
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: transitions.medium,
};

// Optimized card hover for 120Hz displays
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: spring.soft,
};

// GPU-accelerated floating animation
export const floating = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: easing.inOutCirc,
  },
};

// Breathing glow effect
export const breathe = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: easing.inOutCirc,
  },
};

// Check if device supports 120Hz+
export const isHighRefreshRate = () => {
  return window.matchMedia('(min-resolution: 120dpi)').matches;
};

// Adaptive animation config based on device
export const getAdaptiveConfig = () => {
  const highRefresh = isHighRefreshRate();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) {
    return {
      duration: 0.01,
      enabled: false,
    };
  }
  
  return {
    duration: highRefresh ? 0.3 : 0.4,
    enabled: true,
  };
};
