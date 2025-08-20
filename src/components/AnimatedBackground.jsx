// src/components/AnimatedBackground.jsx
export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-black">
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white w-1 h-1 animate-pulse-subtle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Floating purple orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-500 opacity-30 w-32 h-32 animate-float blur-xl"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}

      {/* Meteors */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white w-2 h-2 rounded-full animate-meteor"
          style={{
            top: `${Math.random() * 50 + 10}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
};
