import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    
    const notifications = await prisma.notification.findMany({
      where: {
        receiverIds: {
          has: userId,
        },
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
        image: {
          select: { id: true, imageUrl: true, fileName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}