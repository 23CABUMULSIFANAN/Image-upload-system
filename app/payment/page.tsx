"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePurchase = async (sets: number) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sets }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Image Upload System",
        description: `${sets * 5} additional upload slots`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setMessage("Payment successful! Your quota has been updated.");
          } else {
            setError(verifyData.message || "Payment verification failed");
          }
        },
        theme: { color: "#000000" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Purchase Upload Slots</h1>

      <Card>
        <CardHeader>
          <CardTitle>5 Slots</CardTitle>
          <CardDescription>₹100 — adds 5 more image uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => handlePurchase(1)} disabled={loading}>
            {loading ? "Processing..." : "Buy 5 Slots"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10 Slots</CardTitle>
          <CardDescription>₹200 — adds 10 more image uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => handlePurchase(2)} disabled={loading}>
            {loading ? "Processing..." : "Buy 10 Slots"}
          </Button>
        </CardContent>
      </Card>

      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </main>
  );
}