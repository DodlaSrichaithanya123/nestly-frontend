import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  username: string;
  email: string;
  role: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setUserRole(role);

    const fetchUserRole = async () => {
      if (!token) return;
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      try {
        const res = await axios.get<User>(
          `${API_BASE_URL}/api/auth/me?email=${email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    if (isLoggedIn) navigate(path);
    else {
      alert("Please login first!");
      navigate("/login");
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="homepage"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="h-screen w-full flex flex-col justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white"
      >
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-8 py-4">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold cursor-pointer hover:text-indigo-400 transition-all duration-300"
          >
            Nestly
          </h1>

          <div className="flex gap-6 items-center">
            {isLoggedIn ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate("/profile")}
                  className="underline text-white hover:text-indigo-400 transition-colors"
                >
                  Profile
                </motion.button>

                {userRole === "ADMIN" && (
                  <motion.button
                    onClick={() => navigate("/addroom")}
                    whileHover={{ scale: 1.05 }}
                    className="underline text-white hover:text-indigo-500"
                  >
                    Add Room
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate("/mybookings")}
                  className="underline text-white hover:text-indigo-400 transition-colors"
                >
                  My Bookings
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="underline text-red-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="underline text-white hover:text-indigo-400 transition-colors"
                >
                  Login
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  className="underline text-white hover:text-indigo-400 transition-colors"
                >
                  Signup
                </motion.button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-center px-8 text-center md:text-left gap-12 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-lg">
              Welcome to Nestly
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Discover and book the best rooms for your perfect stay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigate("/roomlisting")}
                className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300"
              >
                Let&apos;s Start <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Hotel illustration"
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>

        <footer className="w-full text-center py-4 text-white/70">
          © 2025 Nestly. All rights reserved.
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
