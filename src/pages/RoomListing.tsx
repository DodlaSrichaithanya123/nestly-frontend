import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

interface Room {
  id: number;
  name: string;
  price: number;
  type: string;
  city: string;
  address: string;
  imageUrl: string;
  available: boolean;
}

export default function RoomListing() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  const navigate = useNavigate();
  const debounceRef = useRef<number | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔹 Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log("🏠 Fetching rooms list...");
        const res = await axios.get(`${API_BASE_URL}/api/rooms`);
        console.log("✅ Rooms fetched:", res.data);
        setRooms(res.data);
        setFilteredRooms(res.data);
      } catch (err: any) {
        console.error("❌ Error fetching rooms:", err.response || err);
        alert("Failed to load rooms. Please try again later.");
      }
    };

    fetchRooms();

    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [API_BASE_URL]);

  // 🔹 Apply filters with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      let temp = [...rooms];

      if (filters.city)
        temp = temp.filter((r) =>
          r.city.toLowerCase().includes(filters.city.toLowerCase())
        );

      if (filters.type)
        temp = temp.filter((r) =>
          r.type.toLowerCase().includes(filters.type.toLowerCase())
        );

      if (filters.minPrice)
        temp = temp.filter((r) => r.price >= Number(filters.minPrice));

      if (filters.maxPrice)
        temp = temp.filter((r) => r.price <= Number(filters.maxPrice));

      setFilteredRooms(temp);
    }, 300);
  }, [filters, rooms]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = { duration: 0.4 };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gray-900 text-white py-12 px-16"
    >
      {/* 🔹 Page Heading */}
      <h1 className="text-4xl font-bold mb-16 text-center">Available Rooms</h1>

      {/* 🔹 Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* 🔹 Filters */}
        <div className="bg-gray-900 p-6 rounded-3xl shadow-md w-full lg:w-[20%] ml-8 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-2 text-center">Filter Rooms</h2>

          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 rounded-2xl text-black w-[85%] mx-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 rounded-2xl text-black w-[85%] mx-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            className="px-4 py-2 rounded-2xl text-black w-[85%] mx-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            className="px-4 py-2 rounded-2xl text-black w-[85%] mx-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() =>
              setFilters({ city: "", type: "", minPrice: "", maxPrice: "" })
            }
            className="px-6 py-2 bg-gradient-to-r from-[#2C3E50] to-[#1A237E] rounded-3xl hover:opacity-90 transition-all font-semibold text-white w-[85%] mx-auto"
          >
            Clear Filters
          </button>

          <button
            onClick={() => navigate("/mybookings")}
            className="px-6 py-2 bg-gradient-to-r from-[#2C3E50] to-[#1A237E] rounded-3xl hover:opacity-90 transition-all font-semibold text-white w-[85%] mx-auto"
          >
            My Bookings
          </button>
        </div>

        {/* 🔹 Rooms Grid */}
        <div className="flex-1 pr-12 pl-8">
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6">
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 bg-gray-900 shadow-lg border border-gray-900 hover:shadow-2xl hover:border-indigo-600 w-[90%] mx-auto"
                >
                  <img
                    src={`${API_BASE_URL}${room.imageUrl}`}
                    alt={room.name}
                    className="w-full h-44 object-cover rounded-3xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />

                  <div className="p-3 text-white text-sm">
                    <h2
                      className="text-base font-semibold mb-1 truncate"
                      title={room.name}
                    >
                      {room.name}
                    </h2>
                    <p className="text-gray-300 truncate">City: {room.city}</p>
                    <p className="text-gray-300 truncate">{room.address}</p>
                    <p className="truncate">Type: {room.type}</p>
                    <p className="font-semibold truncate">Price: ${room.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-lg mt-12">
              No rooms available for the selected filters.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
