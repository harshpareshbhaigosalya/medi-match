// src/components/Onboarding.jsx
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Confetti from "react-confetti";

export default function Onboarding({ profile }) {
  const cardRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [orgType, setOrgType] = useState(profile.org_type || "");
  const [specialization, setSpecialization] = useState(profile.specialization || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  // Glow effect on welcome
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      glowX.set(e.clientX);
      glowY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const blob1X = useTransform(glowX, [0, window.innerWidth], [-50, 50]);
  const blob1Y = useTransform(glowY, [0, window.innerHeight], [-50, 50]);
  const blob2X = useTransform(glowX, [0, window.innerWidth], [50, -50]);
  const blob2Y = useTransform(glowY, [0, window.innerHeight], [50, -50]);

  useEffect(() => {
    if (step === 2) {
      const width = cardRef.current?.offsetWidth || 400;
      setCardWidth(width);
    }
  }, [step]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!fullName) return setError("Full name is required.");
    if (!orgType) return setError("Please select who you are.");

    setLoading(true);
    try {
      const client = await api();
      await client.post("/profile/onboarding/", {
        full_name: fullName,
        org_type: orgType,
        specialization: orgType === "personal" ? "" : specialization,
      });
      setShowCheck(true);
      // Show checkmark for 1s then go to welcome step
      setTimeout(() => {
        setShowCheck(false);
        setShowConfetti(true);
        setStep(2);
        // Auto-advance to services after 2 seconds
        setTimeout(() => {
          setStep(3);
          setShowConfetti(false);
        }, 6000);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleFinish = () => {
    window.location.reload();
  };

  const isValid = fullName && orgType;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-hidden bg-black/30 backdrop-blur-sm">
      {/* Background animated blobs */}
      <motion.div
        style={{ x: blob1X, y: blob1Y }}
        className="absolute w-[400px] h-[400px] rounded-full bg-blue-400 opacity-40 blur-3xl top-[-20%] left-[-20%]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        style={{ x: blob2X, y: blob2Y }}
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-600 opacity-30 blur-3xl bottom-[-20%] right-[-20%]"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10"
          ref={cardRef}
        >
          {/* STEP 1 — PROFILE INFO */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Complete Your Profile
              </h2>

              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Org Type */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Who are you? <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                  >
                    <option value="">Select who you are</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                {/* Specialization */}
                {orgType !== "personal" && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Specialization
                    </label>
                    <input
                      className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                )}

                <button
                  disabled={!isValid || loading}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                    !isValid || loading
                      ? "bg-gray-400"
                      : "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                  }`}
                >
                  {loading ? "Saving..." : "Save & Continue"}
                </button>
              </form>
            </>
          )}

          {/* STEP 2 — CHECKMARK + WELCOME */}
          {showCheck && (
            <motion.div
              className="flex flex-col items-center justify-center h-[300px]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
              <p className="mt-4 text-green-600 font-medium text-lg">Profile Saved!</p>
            </motion.div>
          )}

          {step === 2 && !showCheck && (
            <div className="relative flex flex-col items-center justify-center h-[500px] overflow-hidden">
              {/* Confetti Sparkles */}
              {showConfetti && cardWidth > 0 && (
                <Confetti
                  width={cardWidth}
                  height={500}
                  numberOfPieces={300}
                  recycle={false}
                  gravity={0.2}
                  initialVelocityY={8}
                  confettiSource={{ x: 0, y: 0, w: cardWidth, h: 1 }}
                  colors={["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"]}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              )}

              {/* Glow behind text */}
              <motion.div
                className="absolute w-64 h-64 rounded-full bg-blue-400 opacity-20 blur-3xl"
                style={{ x: blob1X, y: blob1Y }}
              />

              <motion.div
                initial={{ y: -80, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 140, damping: 16 }}
                className="text-center z-10"
              >
                <h2 className="text-5xl font-extrabold text-blue-600 mb-4 drop-shadow-lg">
                  Welcome, {fullName}!
                </h2>
                <p className="text-gray-700 text-lg">
                  Your journey with <strong>RBPanchal</strong> starts now
                </p>
              </motion.div>
            </div>
          )}

          {/* STEP 3 — SERVICES */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Services We Provide
              </h2>

              <div className="grid gap-4 text-left">
                {[
                  "High-quality medical equipment",
                  "Reliable & fast support",
                  "Surgical & diagnostic tools",
                  "Trusted by hospitals & clinics",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinish}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700"
              >
                Get Started
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
