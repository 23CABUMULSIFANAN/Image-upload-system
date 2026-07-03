import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, fileName, description, tags } = body;

    if (!imageUrl || !fileName) {
      return Response.json({
        success: false,
        message: "imageUrl and fileName are required",
      });
    }

    const userId = session.user.id;
    const organizationId = session.user.organizationId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { imageQuota: true, name: true },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const uploadedCount = await prisma.image.count({
      where: { uploadedById: userId },
    });

    if (uploadedCount >= user.imageQuota) {
      return Response.json(
        {
          success: false,
          message: "Quota exceeded. Please purchase additional slots to upload more images.",
          quotaExceeded: true,
        },
        { status: 403 }
      );
    }

    const tagList: string[] = Array.isArray(tags) ? tags : [];

    
    const result = await prisma.$transaction(async (tx) => {
      const image = await tx.image.create({
        data: {
          imageUrl,
          fileName,
          description: description || null,
          tags: tagList,
          uploadedById: userId,
          organizationId,
        },
      });

      let receiverIds: string[] = [];
      let message = "";

      if (tagList.length > 0) {
        
        receiverIds = tagList;
        message = `${user.name} tagged you in a new image: ${fileName}`;
      } else {
       
        const orgUsers = await tx.user.findMany({
          where: {
            organizationId,
            id: { not: userId },
          },
          select: { id: true },
        });
        receiverIds = orgUsers.map((u) => u.id);
        message = `${user.name} uploaded a new image: ${fileName}`;
      }

      let notification = null;
      if (receiverIds.length > 0) {
        notification = await tx.notification.create({
          data: {
            organizationId,
            senderId: userId,
            receiverIds,
            imageId: image.id,
            message,
          },
        });
      }

      return { image, notification };
    });

    return Response.json({
      success: true,
      message: "Image uploaded successfully",
      image: result.image,
      remainingQuota: user.imageQuota - (uploadedCount + 1),
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { imageQuota: true },
    });

    const uploadedCount = await prisma.image.count({
      where: { uploadedById: userId },
    });

    return Response.json({
      success: true,
      used: uploadedCount,
      total: user?.imageQuota ?? 5,
      remaining: (user?.imageQuota ?? 5) - uploadedCount,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}