import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { format, parseISO } from "date-fns";

interface Room {
  id: number;
  name: string;
  type: string;
  city: string;
  address: string;
  price: number;
  featured: boolean;
  description: string;
  imageUrl: string;
}

interface BookedDate {
  checkInDate: string;
  checkOutDate: string;
}

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const token = localStorage.getItem("token");
  console.log("🔑 Initial token loaded:", token);
console.log("📁 Full localStorage content at mount:", { ...localStorage });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔹 Fetch room details + booked dates
  useEffect(() => {
    if (!id) return;

    const fetchRoomDetails = async () => {
      try {
        console.log(`🏠 Fetching room details for ID=${id}`);
        const res = await axios.get(`${API_BASE_URL}/api/rooms/${id}`);
        setRoom(res.data);
        console.log("✅ Room details fetched successfully");
      } catch (err: any) {
        console.error("❌ Failed to load room details:", err.response || err);
        alert("Failed to load room details. Please try again later.");
      }
    };

    const fetchBookedDates = async () => {
      try {
        console.log(`📅 Fetching booked dates for room ID=${id}`);
        const res = await axios.get(
          `${API_BASE_URL}/api/bookings/room/${id}/booked-dates`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        setBookedDates(res.data);
        console.log("✅ Booked dates fetched successfully");
      } catch (err: any) {
        console.error("⚠️ Error fetching booked dates:", err.response || err);
        if (err.response?.status === 403) {
          console.warn("🚨 Authorization failed — invalid or expired token.");
        }
        setBookedDates([]);
      }
    };

    fetchRoomDetails();
    fetchBookedDates();
  }, [id, token, API_BASE_URL]);

  if (!room) {
    return <div className="text-white p-8">Loading...</div>;
  }

  const imageSrc = `${API_BASE_URL}${room.imageUrl}`;

  // 🔹 Check date availability
  const isDateAvailable = () => {
    if (!checkIn || !checkOut) return false;

    const checkInDate = parseISO(checkIn);
    const checkOutDate = parseISO(checkOut);

    return !bookedDates.some((b) => {
      const bookedStart = parseISO(b.checkInDate);
      const bookedEnd = parseISO(b.checkOutDate);
      return checkInDate < bookedEnd && checkOutDate > bookedStart;
    });
  };

  // 🔹 Handle booking navigation
  const handleBooking = () => {
    console.log("🟢 handleBooking triggered");

    console.log("🗓️ Selected Dates:", { checkIn, checkOut });
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (new Date(checkIn) < new Date()) {
      alert("Check-in date cannot be in the past.");
      return;
    }

    if (!isDateAvailable()) {
      alert("Selected dates are already booked. Please choose different ones.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.warn("⚠️ No userId found in localStorage. User session likely expired.");
      console.log("🧠 localStorage keys available:", Object.keys(localStorage));
      console.log("🧠 Token value:", localStorage.getItem("token"));
      alert("User session expired. Please log in again.");
      navigate("/login");
      return;
    }

    console.log("✅ Booking validation passed. Redirecting to /payment with data:", {
      amount: room.price,
      roomId: room.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      userId,
    });

    navigate("/payment", {
      state: {
        amount: room.price,
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        userId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 🖼 Image Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <motion.img
              key={idx}
              src={imageSrc}
              alt={`${room.name}-${idx}`}
              whileHover={{ scale: 1.05 }}
              className="object-cover h-48 w-full rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
          ))}
        </div>

        {/* 🏡 Room Info */}
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-2">{room.name}</h1>
          <p className="text-gray-300 mb-1">{room.city}</p>
          <p className="text-gray-300 mb-2">{room.address}</p>
          <p className="text-gray-300 mb-4">{room.description}</p>
          <p className="text-2xl font-semibold mb-4">💰 ${room.price}/night</p>
          <p className="text-lg text-gray-400 mb-6">🏠 Type: {room.type}</p>

          <p
            className={`mb-4 font-semibold ${
              room.featured ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {room.featured ? "✨ Featured Room" : "Standard Room"}
          </p>

          {/* 📅 Date Selection */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <label>Check-in:</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="px-3 py-2 rounded-lg text-black"
              />
            </div>
            <div>
              <label>Check-out:</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="px-3 py-2 rounded-lg text-black"
              />
            </div>
          </div>

          {/* 📋 Booked Dates */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Already Booked Dates:</h3>
            <ul className="list-disc list-inside text-gray-300">
              {bookedDates.length > 0 ? (
                bookedDates.map((b, idx) => (
                  <li key={idx}>
                    {format(parseISO(b.checkInDate), "yyyy-MM-dd")} →{" "}
                    {format(parseISO(b.checkOutDate), "yyyy-MM-dd")}
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>

          {/* 🛎 Buttons */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBooking}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            Book Now
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="ml-4 underline text-gray-300 hover:text-white transition-colors"
          >
            Back to rooms
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
