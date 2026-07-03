"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        Image Upload
      </h1>

      <nav className="space-y-4">
        <Link href="/admin" className="block hover:text-blue-400">
          Dashboard
        </Link>

        <Link href="/admin/employees" className="block hover:text-blue-400">
          Employees
        </Link>

        <Link href="/admin/gallery" className="block hover:text-blue-400">
          Gallery
        </Link>

        <Link href="/admin/profile" className="block hover:text-blue-400">
          Profile
        </Link>
      </nav>
    </aside>
  );
}