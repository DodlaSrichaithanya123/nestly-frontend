import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

declare global {
  interface Window {
    paypal: any;
  }
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { amount, roomId, userId, checkInDate, checkOutDate } =
    location.state || {};

  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const isValidPaymentData =
    amount && roomId && userId && checkInDate && checkOutDate;

  /** -------------------------------
   * Load PayPal SDK Dynamically
   * ------------------------------- */
  useEffect(() => {
    if (!isValidPaymentData || !PAYPAL_CLIENT_ID) return;

    const loadPayPalScript = async () => {
      try {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        document.body.appendChild(script);
      } catch (err) {
        console.error("❌ Failed to load PayPal SDK:", err);
        alert("Failed to load PayPal SDK. Please refresh and try again.");
      }
    };

    if (!window.paypal) loadPayPalScript();
    else setSdkReady(true);

    return () => {
      const existingScript = document.querySelector(
        `script[src*="paypal.com/sdk/js"]`
      );
      if (existingScript) existingScript.remove();
    };
  }, [isValidPaymentData, PAYPAL_CLIENT_ID]);

  /** -------------------------------
   * Retry booking creation (3 tries)
   * ------------------------------- */
  const createBookingWithRetry = async (payload: any, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.info(`📦 Attempt ${attempt}: Creating booking...`);
        const response = await axios.post(
          `${API_BASE_URL}/api/bookings/create`,
          payload,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        console.info("✅ Booking successfully created:", response.data);
        return response.data;
      } catch (err: any) {
        console.error(`⚠️ Booking creation attempt ${attempt} failed:`, {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });

        if (attempt === retries) throw err;
        console.warn("⏳ Retrying in 1.5s...");
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  };

  /** -------------------------------
   * Initialize PayPal Buttons
   * ------------------------------- */
  useEffect(() => {
    if (!sdkReady || !window.paypal || !isValidPaymentData) return;

    window.paypal
      .Buttons({
        style: { color: "gold", shape: "rect", label: "paypal", height: 45 },

        /** Create PayPal Order */
        createOrder: async () => {
          try {
            const res = await axios.post(
              `${API_BASE_URL}/api/paypal/create-order?amount=${amount}`,
              {},
              { headers: { Authorization: token ? `Bearer ${token}` : "" } }
            );
            return res.data.id;
          } catch (err: any) {
            console.error("❌ Error creating PayPal order:", {
              status: err.response?.status,
              data: err.response?.data,
              message: err.message,
            });
            alert("Unable to start payment. Please try again.");
          }
        },

        /** Capture Payment */
        onApprove: async (data: any) => {
          console.info("🟢 Payment approved. Capturing...");
          setIsProcessing(true);
          try {
            const captureRes = await axios.post(
              `${API_BASE_URL}/api/paypal/capture-order/${data.orderID}`,
              {},
              { headers: { Authorization: token ? `Bearer ${token}` : "" } }
            );

            const captureId = captureRes?.data?.captureId || "UNKNOWN_CAPTURE_ID";
            const numericUserId = Number(userId);

            if (isNaN(numericUserId)) {
              console.error("❌ Invalid userId type:", userId);
              alert("User not logged in properly. Please log in again.");
              navigate("/login");
              return;
            }

            const payload = {
              roomId,
              userId: numericUserId,
              checkInDate,
              checkOutDate,
              paypalCaptureId: captureId,
              amount,
            };

            const bookingData = await createBookingWithRetry(payload);

            navigate("/confirmation", {
              state: {
                bookingId: bookingData.id,
                roomId,
                userId: numericUserId,
                checkInDate,
                checkOutDate,
                amount,
              },
            });
          } catch (err: any) {
            console.error("🚨 Payment captured but booking failed:", {
              status: err.response?.status,
              data: err.response?.data,
              message: err.message,
            });
            alert(
              "Payment captured but booking failed. Please contact support with your PayPal Transaction ID."
            );
          } finally {
            setIsProcessing(false);
          }
        },

        /** Handle PayPal Errors */
        onError: (err: any) => {
          console.error("⚠️ PayPal Error:", err);
          alert("Payment failed. Please try again later.");
        },
      })
      .render("#paypal-button-container");
  }, [sdkReady, amount, roomId, userId, checkInDate, checkOutDate, token]);

  /** -------------------------------
   * Render UI
   * ------------------------------- */
  if (!isValidPaymentData) {
    return (
      <p className="text-white text-center mt-8">
        Invalid payment details. Please go back and try again.
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Complete Your Payment</h1>

        <p className="text-lg mb-1">
          <strong>Amount:</strong> ${amount}
        </p>
        <p className="text-sm text-gray-400 mb-5">
          Room ID: {roomId} <br />
          Check-In: {checkInDate} <br />
          Check-Out: {checkOutDate}
        </p>

        {sdkReady ? (
          <div id="paypal-button-container" className="w-full"></div>
        ) : (
          <p>Loading payment options...</p>
        )}

        {isProcessing && (
          <p className="mt-3 text-yellow-400 font-medium">
            Processing your payment...
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
