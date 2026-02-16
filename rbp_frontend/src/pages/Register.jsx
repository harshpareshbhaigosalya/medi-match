import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Register() {
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
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:5173/" },
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
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
          Create Account
        </h1>

        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
        {info && <p className="text-green-600 mb-3 text-center">{info}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="border w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="border w-full py-3 rounded-xl mt-4 flex justify-center items-center gap-3 hover:bg-blue-50 transition disabled:opacity-50"
        >
          <img
            src="https://rawsvg.com/images/file/simple-google-logo-jbxog2xijvoc76nf.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Continue with Google"}
        </button>

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <a className="text-blue-600 font-semibold" href="/login">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
