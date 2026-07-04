import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// TEMPORARY DEBUG ROUTE — delete this file after debugging.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  const result: Record<string, unknown> = {};

  try {
    result.step = "connecting to db";
    const userCount = await prisma.user.count();
    result.dbConnected = true;
    result.totalUsersInDb = userCount;

    if (email) {
      result.step = "looking up user";
      const user = await prisma.user.findUnique({ where: { email } });
      result.userFound = !!user;

      if (user) {
        result.userRole = user.role;
        result.passwordHashLength = user.password.length;
        result.passwordHashPrefix = user.password.substring(0, 7);

        if (password) {
          result.step = "comparing password";
          const isMatch = await bcrypt.compare(password, user.password);
          result.passwordMatch = isMatch;
        }
      }
    }

    result.step = "done";
    return Response.json(result);
  } catch (error: any) {
    result.step = "ERROR";
    result.errorMessage = error?.message || String(error);
    result.errorName = error?.name;
    return Response.json(result, { status: 500 });
  }
}