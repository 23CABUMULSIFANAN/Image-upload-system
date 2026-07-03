import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PRODUCT_OWNER") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { organisationName, adminName, adminEmail, password } =
      await request.json();

    if (!organisationName || !adminEmail || !adminName || !password) {
      return Response.json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password.length < 6) {
      return Response.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    if (!adminEmail.includes("@")) {
      return Response.json({
        success: false,
        message: "Invalid Email",
      });
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return Response.json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: { name: organisationName },
      });

      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          organizationId: organisation.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
          
        },
      });

      return { organisation, admin };
    });

    return Response.json({
      success: true,
      message: "Organisation created successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PRODUCT_OWNER") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const organisations = await prisma.organisation.findMany({
      include: {
        users: {
          where: { role: "ADMIN" },
          select: { id: true, name: true, email: true },
          take: 1,
        },
        _count: {
          select: { users: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, organisations });
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

    if (!session || session.user.role !== "PRODUCT_OWNER") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id, name, address, phone, logoUrl } = await request.json();

    if (!id) {
      return Response.json({
        success: false,
        message: "Organisation id is required",
      });
    }

    const updated = await prisma.organisation.update({
      where: { id },
      data: { name, address, phone, logoUrl },
    });

    return Response.json({
      success: true,
      message: "Organisation updated successfully",
      organisation: updated,
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

    if (!session || session.user.role !== "PRODUCT_OWNER") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({
        success: false,
        message: "Organisation id is required",
      });
    }

    // Deleting an org will fail if users/images still reference it
    // (FK constraint). Notification references Image, so notifications
    // must be deleted BEFORE images, not after.
    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { organizationId: id } });
      await tx.payment.deleteMany({ where: { organizationId: id } });
      await tx.image.deleteMany({ where: { organizationId: id } });
      await tx.user.deleteMany({ where: { organizationId: id } });
      await tx.organisation.delete({ where: { id } });
    });

    return Response.json({
      success: true,
      message: "Organisation deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}