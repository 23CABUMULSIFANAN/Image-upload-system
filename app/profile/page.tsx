import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user) {
    redirect("/login");
  }

  const roleLabel: Record<string, string> = {
    PRODUCT_OWNER: "Product Owner",
    ADMIN: "Admin",
    USER: "User",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-slate-500">Role</span>
              <span className="font-medium text-slate-800">
                {roleLabel[user.role] || user.role}
              </span>
            </div>

            <div className="flex justify-between text-sm border-b pb-2">
              <span className="text-slate-500">Organisation</span>
              <span className="font-medium text-slate-800">
                {user.organization?.name || "—"}
              </span>
            </div>

            {user.role === "USER" && (
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-slate-500">Image Quota</span>
                <span className="font-medium text-slate-800">{user.imageQuota}</span>
              </div>
            )}

            <div className="flex justify-between text-sm pb-2">
              <span className="text-slate-500">Member Since</span>
              <span className="font-medium text-slate-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}