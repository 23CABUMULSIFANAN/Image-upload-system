"use client";

import { signOut } from "next-auth/react";

export default function Navbar() {
  return (
    <header className="h-16 border-b flex justify-between items-center px-6 bg-white">
      <h2 className="text-xl font-semibold">
        Admin Dashboard
      </h2>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
}