import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <h1 className="text-5xl font-bold mb-4">
        Image Upload System
      </h1>

      <p className="text-lg text-gray-300 mb-8 max-w-xl text-center">
        Secure image upload, quota management, notifications and payment system
        built with Next.js, Prisma, AWS S3 and Razorpay.
      </p>

      <Link
        href="/login"
        className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Login
      </Link>
    </main>
  );
}