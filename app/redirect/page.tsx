import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "PRODUCT_OWNER":
      redirect("/product-owner/dashboard");
    case "ADMIN":
      redirect("/admin/dashboard");
    case "USER":
      redirect("/user/dashboard");
    default:
      redirect("/login");
  }
}