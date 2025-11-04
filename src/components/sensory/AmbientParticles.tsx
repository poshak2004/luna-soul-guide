import { motion } from 'framer-motion';

interface AmbientParticlesProps {
  amplitude?: number;
}

export const AmbientParticles = ({ amplitude = 0 }: AmbientParticlesProps) => {
  const particles = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => {
        const size = Math.random() * 200 + 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 20 + Math.random() * 20;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              background: `radial-gradient(circle, 
                hsl(var(--primary) / ${0.05 + amplitude * 0.1}), 
                transparent)`,
            }}
            animate={{
              y: ['-20vh', '120vh'],
              x: [
                `${Math.sin(i) * 10}vw`,
                `${Math.sin(i + Math.PI) * 10}vw`,
              ],
              scale: [1, 1.5, 1],
              opacity: [0, 0.3 + amplitude * 0.3, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
};
