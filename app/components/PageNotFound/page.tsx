"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import{ jwtDecode} from "jwt-decode";



export default function PageNotFound() {

  return (
    <div className="h-screen bg-[#0079BF] text-white flex flex-col">
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#026AA7] shadow-md">
        {/* Left Side: Navigation */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="px-2 py-1 rounded text-sm font-medium bg-[#4e97c2] hover:bg-[#5aa3c9] transition-colors"
          >
            🏠
          </Link>
          <Link
            href="/boards/workspace"
            className="px-2 py-1 rounded text-sm font-medium flex items-center space-x-1 bg-[#2fa9f1] hover:bg-[#42b3f3] transition-colors"
          >
            <span>📋</span><span>Boards</span>
          </Link>
        </div>

        {/* Center Title */}
        <div className="flex justify-center items-center">
          <img 
            src="https://res.cloudinary.com/ds9pcviv3/image/upload/v1747817474/Screenshot_2025-05-21_142053_ikolhy.png" 
            className="h-4 w-4 mr-2"
            alt="Logo"
          />
          <h1 className="text-xl font-bold opacity-70">Task Manager</h1>
        </div>

        {/* Right Side: Search, Logout, Avatar */}
        <div className="flex items-center space-x-4">
          <div className="bg-[#4e97c2] flex justify-center rounded-sm">
            <input
              type="text"
              placeholder="Search"
              className="px-2 py-1 rounded text-black text-sm text-white bg-transparent placeholder-white"
            />
            <img 
              src="https://res.cloudinary.com/ds9pcviv3/image/upload/v1747817862/Screenshot_2025-05-21_142717_lzppka.png" 
              className="h-6"
              alt="Search"
            />
          </div>
          <button className="text-sm hover:text-white/80 transition-colors" onClick={() => {
    window.location.href = "/";
  }}>Log Out</button>
          <div className="bg-[#bae3ff] text-[#0079BF] w-8 h-8 rounded-full flex items-center justify-center font-bold">
            L
          </div>
        </div>
      </div>

      {/* Page Not Found Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6">
            Page Not Found
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            This page may be private. If someone gave you this link,
            <br />
            they may need to invite you to one of their boards or teams.
          </p>
          
          {/* Optional: Add a button to go back to home */}
          <Link
            href="/boards/workspace"
            className="inline-block bg-white/20 hover:bg-white/30 text-white rounded-lg px-6 py-3 font-medium transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}