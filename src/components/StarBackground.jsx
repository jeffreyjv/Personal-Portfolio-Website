export const StarBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient orbs — light mode soft, dark mode deeper */}
      <div
        className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(211 100% 70%) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(280 80% 70%) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(190 80% 65%) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};
