import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!API_BASE_URL) {
      console.error("❌ VITE_API_BASE_URL is not defined in environment variables.");
      alert("Configuration error: API base URL missing. Please contact the developer.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Attempting user signup");
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, form, {
        headers: { "Content-Type": "application/json" },
      });

      const userData = res.data;
      console.log("✅ User registered successfully:", userData);

      // Persist minimal user info (avoid storing sensitive tokens here unless needed)
      localStorage.setItem("userId", userData.id?.toString() || "");
      localStorage.setItem("userEmail", userData.email || "");
      localStorage.setItem("userRole", userData.role || "");
      localStorage.setItem("username", userData.username || "");

      alert("Signup successful! Redirecting to home...");
      navigate("/");
    } catch (err: any) {
      console.error("❌ Signup Error:", err.response?.data || err.message || err);
      alert(err.response?.data || "Signup failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-white text-center">Sign Up</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={form.username}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.7)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="mt-4 bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-70"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="mt-4 text-gray-300 text-center">
          Already have an account?{" "}
          <span
            className="underline cursor-pointer hover:text-white"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
