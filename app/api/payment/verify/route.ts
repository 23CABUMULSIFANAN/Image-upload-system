import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

   
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
     
      await prisma.payment.updateMany({
        where: { transactionId: razorpay_order_id },
        data: { status: "FAILED" },
      });

      return Response.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

   
    const payment = await prisma.payment.findFirst({
      where: { transactionId: razorpay_order_id, userId: session.user.id },
    });

    if (!payment) {
      return Response.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === "SUCCESS") {
      return Response.json({ success: true, message: "Payment already processed" });
    }

    
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { imageQuota: { increment: payment.slotsPurchased } },
      }),
    ]);

    return Response.json({
      success: true,
      message: "Payment verified successfully. Quota updated.",
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}