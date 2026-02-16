import { motion } from "framer-motion";

export default function Loader() {
  const letters = "RB Panchal".split("");
  const particleCount = 8; // number of orbiting particles
  const particles = Array.from({ length: particleCount });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Spinner Container */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Rotating Dashed Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-dashed border-blue-400 border-opacity-30"
        />

        {/* Orbiting Particles */}
        {particles.map((_, i) => {
          const angle = (360 / particleCount) * i;
          return (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                x: 0,
                y: -22, // orbit radius
                rotate: angle,
                originX: 0,
                originY: 22,
              }}
              animate={{ rotate: [angle, angle + 360] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "linear" }}
            >
              <motion.div
                className="w-3 h-3 rounded-full"
                animate={{
                  y: [-10, 0, -10], // move from orbit into center
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                  backgroundColor: ["#60A5FA", "#3B82F6", "#6366F1", "#22D3EE", "#60A5FA"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + i * 0.3,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          );
        })}

        {/* Center Hospital Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], backgroundColor: ["#60A5FA", "#3B82F6", "#6366F1", "#60A5FA"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative flex items-center justify-center w-24 h-24 rounded-full shadow-xl"
        >
          {/* Inner Plus */}
          <div className="w-12 h-12 flex items-center justify-center">
            <div className="relative w-6 h-6">
              <div className="absolute bg-white rounded-full w-1 h-6 left-1/2 -translate-x-1/2"></div>
              <div className="absolute bg-white rounded-full h-1 w-6 top-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Brand Name */}
      <div className="flex mt-10 space-x-2 text-3xl font-extrabold text-blue-600">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Loading Text */}
      <motion.p
        className="mt-3 text-gray-500 font-medium text-lg"
        animate={{ opacity: [0, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Loading Life-saving Instruments...
      </motion.p>
    </div>
  );
}
