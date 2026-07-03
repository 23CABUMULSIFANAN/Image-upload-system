import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const AMOUNT_PER_SLOT_SET = 100; 
const SLOTS_PER_SET = 5;

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
    const sets = Number(body.sets) || 1; // how many sets of 5 slots (default 1)

    if (sets < 1) {
      return Response.json({ success: false, message: "Invalid quantity" });
    }

    const amount = AMOUNT_PER_SLOT_SET * sets; // in rupees
    const slots = SLOTS_PER_SET * sets;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      notes: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        slots: String(slots),
      },
    });

  
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        amount,
        slotsPurchased: slots,
        transactionId: order.id,
        status: "PENDING",
      },
    });

    return Response.json({
      success: true,
      order,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}