import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      setInfo(
        "Account created. Check your email and verify your account before logging in."
      );
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to register");
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    setLoading(true);
    const redirectUrl = window.location.origin + "/";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-tr from-blue-50 to-blue-100 overflow-hidden">
      {/* Floating background blobs */}
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute w-72 h-72 bg-blue-200 rounded-full opacity-30 -top-20 -left-20"
      />
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        className="absolute w-72 h-72 bg-blue-300 rounded-full opacity-30 -bottom-24 -right-24"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 font-heading">
          Join Medi-Match
        </h1>

        {error && <p className="text-red-500 mb-3 text-center text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
        {info && <p className="text-green-600 mb-3 text-center text-sm font-bold bg-green-50 p-3 rounded-xl">{info}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="border-2 border-gray-100 w-full p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border-2 border-gray-100 w-full p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            placeholder="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-blue-100 disabled:opacity-50"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="border-2 border-gray-100 w-full py-4 rounded-xl mt-4 flex justify-center items-center gap-3 hover:bg-gray-50 transition-all font-bold text-gray-600 disabled:opacity-50"
        >
          <img
            src="https://rawsvg.com/images/file/simple-google-logo-jbxog2xijvoc76nf.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Continue with Google"}
        </button>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Already a member?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-600 font-black hover:underline transition-all">
            Login Now
          </button>
        </p>
      </motion.div>
    </div>
  );
}
