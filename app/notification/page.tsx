"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Image as ImageIcon,
  User,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
  image: {
    id: string;
    imageUrl: string;
    fileName: string;
  };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notification");
        const data = await res.json();

        if (data.success) {
          setNotifications(data.notifications);
        } else {
          setError(data.message);
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Bell className="h-8 w-8 text-blue-600" />
              Notifications
            </h1>

            <p className="mt-2 text-gray-500">
              View all image approval and rejection updates.
            </p>
          </div>

          <Badge className="px-4 py-2 text-base">
            {notifications.length} Notifications
          </Badge>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center">
              Loading notifications...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-10 text-center text-red-500">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="mb-4 h-14 w-14 text-gray-400" />
              <h2 className="text-xl font-semibold">
                No Notifications
              </h2>
              <p className="text-gray-500">
                Notifications will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">

          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="transition hover:shadow-lg"
            >
              <CardContent className="p-6">

                <div className="flex flex-col gap-5 md:flex-row">

                  <img
                    src={notification.image.imageUrl}
                    alt={notification.image.fileName}
                    className="h-40 w-full rounded-lg border object-cover md:w-60"
                  />

                  <div className="flex-1">

                    <h2 className="text-lg font-semibold">
                      {notification.message}
                    </h2>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">

                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {notification.sender.name}
                      </div>

                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} />
                        {notification.image.fileName}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </div>

                    </div>

                  </div>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </main>
  );
}