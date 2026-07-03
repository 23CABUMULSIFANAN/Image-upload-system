import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    
    const organizationId = session.user.organizationId;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        organizationId,
        role: role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        
      },
    });

    return Response.json({
      success: true,
      message: "User created successfully",
      user,
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

    const users = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageQuota: true,
        createdAt: true,
        // password never selected
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, users });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, email, role } = body;

    if (!id) {
      return Response.json({ success: false, message: "User id required" });
    }

    
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser || targetUser.organizationId !== session.user.organizationId) {
      return Response.json(
        { success: false, message: "User not found in your organisation" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageQuota: true,
      },
    });

    return Response.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ success: false, message: "User id required" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser || targetUser.organizationId !== session.user.organizationId) {
      return Response.json(
        { success: false, message: "User not found in your organisation" },
        { status: 404 }
      );
    }

    // A user may have uploaded images and sent notifications — those
    // must be cleared first (notifications before images, since
    // Notification references Image) to avoid FK constraint errors.
    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { senderId: id } });
      await tx.payment.deleteMany({ where: { userId: id } });
      await tx.image.deleteMany({ where: { uploadedById: id } });
      await tx.user.delete({ where: { id } });
    });

    return Response.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}