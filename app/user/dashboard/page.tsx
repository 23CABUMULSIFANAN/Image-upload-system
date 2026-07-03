"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type QuotaData = {
  used: number;
  total: number;
  remaining: number;
};

export default function UserDashboard() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchQuota = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/image");
      const data = await res.json();
      if (data.success) {
        setQuota({ used: data.used, total: data.total, remaining: data.remaining });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const quotaExceeded = quota ? quota.remaining <= 0 : false;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Image Quota</CardTitle>
            <CardDescription>Your current upload usage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-slate-500">Loading...</p>}

            {!loading && quota && (
              <div className="space-y-3">
                <p className="text-lg font-medium">
                  {quota.used} / {quota.total} images used
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((quota.used / quota.total) * 100, 100)}%` }}
                  />
                </div>

                {quotaExceeded && (
                  <p className="text-red-500 text-sm">
                    You've used all your free slots. Purchase more to keep uploading.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => router.push("/user/upload")} disabled={quotaExceeded}>
                    Upload Image
                  </Button>
                  {quotaExceeded && (
                    <Button variant="outline" onClick={() => router.push("/payment")}>
                      Purchase Slots
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/gallery">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Gallery</CardTitle>
                  <CardDescription>View all images from your organisation</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/notification">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>Tagged uploads and org announcements</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/payment">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Purchase Slots</CardTitle>
                  <CardDescription>Buy more upload slots via Razorpay</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
