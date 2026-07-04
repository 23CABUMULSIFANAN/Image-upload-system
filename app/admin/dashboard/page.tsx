import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [userCount, imageCount, pendingUsers] = await Promise.all([
    prisma.user.count({ where: { organizationId } }),
    prisma.image.count({ where: { organizationId } }),
    prisma.user.count({ where: { organizationId, role: "USER" } }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {session.user.name}
            </p>
          </div>

          <Link href="/admin/users">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Manage Users
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{userCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Active Members</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{pendingUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Total Images</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{imageCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <Link href="/admin/users">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Manage Users</CardTitle>
                  <CardDescription>Add, edit or remove users in your organisation</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/gallery">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Image Gallery</CardTitle>
                  <CardDescription>Browse all images uploaded across your organisation</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/notification">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>See recent activity and tagged uploads</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/profile">
  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
    <CardHeader>
      <CardTitle className="text-base">Profile</CardTitle>
      <CardDescription>View your account and organisation details</CardDescription>
    </CardHeader>
  </Card>
</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
