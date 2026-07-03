import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tagUserId = searchParams.get("tag"); // filter: only images tagging this user id

    const images = await prisma.image.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(tagUserId ? { tags: { has: tagUserId } } : {}),
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also return the org's users so the frontend can build a
    // human-readable tag filter dropdown (id -> name).
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, name: true },
    });

    return Response.json({ success: true, images, orgUsers });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
