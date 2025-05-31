"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1976ad] text-white">
      {/* Logo + Title */}
      <div className="flex items-center space-x-2 mb-6">
        <img src="https://res.cloudinary.com/ds9pcviv3/image/upload/v1747808561/Screenshot_2025-05-21_115219_ujwhvb.png" alt="Trello Logo" width={32} height={32} />
        <h1 className="text-3xl font-bold font-cursive">Task Manager</h1>
      </div>

      {/* Card */}
      <div className="bg-white text-center rounded-lg p-6 shadow-md w-full max-w-md text-black">
        <img
          src="https://res.cloudinary.com/ds9pcviv3/image/upload/v1747808662/Screenshot_2025-05-21_115406_ravv27.png" // Save your image as public/illustration.png
          alt="Illustration"
          width={400}
          height={200}
          className="mx-auto mb-4"
        />

        <p className="mb-6 text-gray-700">
          Task tracking for your everyday needs
        </p>

        {/* Log in with Trello */}
        <Link href="/signin">
        <button className="bg-[#1976ad] text-white px-5 py-2 rounded-full text-sm font-semibold mb-2 w-full hover:opacity-90">
          LOG IN WITH TRELLO
        </button>
        </Link>

        {/* Sign up link */}
        <Link href="/signup">
          <button className="border border-[#1976ad] text-[#1976ad] w-full px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#1976ad] hover:text-white transition-all">
            SIGN UP
          </button>
        </Link>

      </div>
    </div>
  );
}
