import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, put } from "../api"; 

interface Booking {
  id: number;
  room: { id: number };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  refundStatus?: string;
  paypalCaptureId: string;
}

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (!token || !storedUserId) {
      navigate("/login");
      return;
    }

    setUserId(parseInt(storedUserId));
  }, [navigate]);

  // ✅ Fetch user's bookings
  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        const res = await get(`/bookings/my-bookings?userId=${userId}`);
        setBookings(res);
        console.log("✅ Bookings fetched successfully:", res);
      } catch (err) {
        console.error("❌ Failed to fetch bookings:", err);
        alert("Error loading your bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  // ✅ Handle booking cancellation
  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await put(`/bookings/cancel/${id}`, {});
      const updatedBooking: Booking = res;

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? updatedBooking : b))
      );

      alert(
        `Booking cancelled successfully. Refund status: ${updatedBooking.refundStatus}`
      );
    } catch (err) {
      console.error("❌ Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  // ✅ Loading state
  if (loading) {
    return <p className="text-white text-center mt-8">Loading your bookings...</p>;
  }

  // ✅ Empty state
  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gray-900">
        <h2 className="text-2xl font-semibold mb-3">No Bookings Found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-3 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ✅ Bookings list
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">My Bookings</h1>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <p>
              <strong>Order ID:</strong> {booking.id}
            </p>
            <p>
              <strong>Room ID:</strong> {booking.room.id}
            </p>
            <p>
              <strong>Check-In:</strong> {booking.checkInDate}
            </p>
            <p>
              <strong>Check-Out:</strong> {booking.checkOutDate}
            </p>
            <p>
              <strong>PayPal Capture ID:</strong> {booking.paypalCaptureId || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
            <p>
              <strong>Refund Status:</strong> {booking.refundStatus || "N/A"}
            </p>

            {booking.status === "CONFIRMED" &&
              booking.refundStatus !== "COMPLETED" && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel Booking
                </button>
              )}
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default MyBookingsPage;
