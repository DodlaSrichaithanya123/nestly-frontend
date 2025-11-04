import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form, {
        headers: { "Content-Type": "application/json" },
      });

      // ✅ Save token and user info in localStorage
      console.log("✅ Login response:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.id?.toString() || "");
      localStorage.setItem("userEmail", res.data.email || "");
      localStorage.setItem("userRole", res.data.role || "");

      alert("Login successful!");
      navigate("/"); // redirect to homepage
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data || "Login failed. Please check your credentials.");
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
        <h1 className="text-3xl font-bold mb-6 text-white text-center">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="mt-4 text-gray-300 text-center">
          Don’t have an account?{" "}
          <span
            className="underline cursor-pointer hover:text-white"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
        <p
          className="mt-2 text-gray-300 text-center underline cursor-pointer hover:text-white"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>
      </motion.div>
    </div>
  );
}
