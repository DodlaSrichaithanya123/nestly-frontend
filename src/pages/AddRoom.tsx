import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddRoom() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    featured: false,
    description: "",
    city: "",
    address: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image file!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized. Please login as admin.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("price", formData.price);
    data.append("featured", String(formData.featured));
    data.append("description", formData.description);
    data.append("city", formData.city);
    data.append("address", formData.address);
    data.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/rooms/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Room uploaded successfully!");
      setFormData({
        name: "",
        type: "",
        price: "",
        featured: false,
        description: "",
        city: "",
        address: "",
      });
      setFile(null);
      if (import.meta.env.DEV) 
        console.log("Response:", res.data);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Failed to upload room. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-900 flex justify-center items-center p-6"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-3xl p-8 shadow-xl w-full max-w-lg text-white space-y-4"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Add New Room</h1>

        {["name", "type", "price", "city", "address"].map((field) => (
          <input
            key={field}
            type={field === "price" ? "number" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={(formData as any)[field]}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        ))}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-5 h-5 accent-indigo-500"
          />
          Featured
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 text-gray-300 bg-gray-700 rounded-lg"
          required
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-all"
        >
          {loading ? "Uploading..." : "Upload Room"}
        </motion.button>
      </form>
    </motion.div>
  );
}
