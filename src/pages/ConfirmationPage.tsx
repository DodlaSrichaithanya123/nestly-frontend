import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
  amount: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  userId: number;
}

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>No booking information found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-400">
          🎉 Payment Successful!
        </h1>
        <p className="text-lg mb-1">
          Your booking is confirmed.
        </p>

        <div className="text-left mt-4">
          <p><strong>Room ID:</strong> {state.roomId}</p>
          <p><strong>Check-In Date:</strong> {state.checkInDate}</p>
          <p><strong>Check-Out Date:</strong> {state.checkOutDate}</p>
          <p><strong>Amount Paid:</strong> ${state.amount}</p>
        </div>

        <button
          onClick={() => navigate("/")} 
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
