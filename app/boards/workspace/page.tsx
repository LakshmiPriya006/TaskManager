"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import CreateBoardModal from "../../components/CreateBoard/page";
import{ jwtDecode} from "jwt-decode";

export default function WorkspaceEmpty() {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [username, setUsername] = useState<string | null>(null);

    type BoardType = {
    id: string;
    title: string;
    };

  useEffect(() => {
  async function fetchBoards() {
    try {
      const res = await fetch("/api/boards/workspace"); 
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log(data);
      // Map backend _id to id and keep only id and title for frontend
      const formattedBoards = data.map((board: any) => ({
        id: board._id,
        title: board.title,
      }));

      setBoards(formattedBoards);
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  }
  fetchBoards();
}, []);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      const email = decoded.email || "";
      const namePart = email.split("@")[0];
      setUsername(namePart);
    }
  }, []);


const addBoard = (board: { id: string; title: string }) => {
  setBoards((prev) => [...prev, board]);
};

    return (
        <div className="h-screen bg-[#0079BF] text-white flex flex-col">
            {/* Top Navbar */}
            <div className="flex justify-between items-center px-6 py-3 bg-[#026AA7] shadow-md">
                {/* 🔷 Left Side: Icons */}
                <div className="flex items-center space-x-2">
                    <Link
                        href="/boards/workspace"
                        className={`px-2 py-1 rounded text-sm font-medium ${
                            isActive("/boards/workspace") ? "bg-[#2fa9f1]" : "bg-[#4e97c2]"
                        }`}
                    >
                        🏠
                    </Link>
                </div>

                {/* 🔷 Center Title */}
                <div className="flex justify-center items-center">
                    <img src = "https://res.cloudinary.com/ds9pcviv3/image/upload/v1747817474/Screenshot_2025-05-21_142053_ikolhy.png" className="h-4 w-4 mr-2"/>
                    <h1 className="text-xl font-bold opacity-70">Task Manager</h1>
                </div>

                {/* 🔷 Right Side: Search, Logout, Avatar */}
                <div className="flex items-center space-x-4">
                    <div className="bg-[#4e97c2] flex justify-center rounded-sm">
                    <input
                        type="text"
                        placeholder="Search"
                        className="px-2 py-1 rounded text-black text-sm text-white"
                    />
                    <img src = "https://res.cloudinary.com/ds9pcviv3/image/upload/v1747817862/Screenshot_2025-05-21_142717_lzppka.png" className="h-6"/>
                    </div>
                    <button className="text-sm"onClick={() => {
    window.location.href = "/";
  }}
   >Log Out</button>
                    <div className="bg-[#bae3ff] text-[#0079BF] w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {username ? username.charAt(0).toUpperCase() : "?"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
            <div className="flex items-center justify-center space-x-2 text-lg font-medium m-3 mb-24">
                <div className="bg-orange-600 w-8 h-8 flex items-center justify-center rounded text-white font-bold">{username ? username.charAt(0).toUpperCase() : "?"}</div>
                <span>
                    {username ? `${username}’s Workspace` : "Workspace"}
                </span>
            </div>
            <div className="flex flex-col justify-start space-y-6 ml-20">
                <div className="space-y-4">
                    { boards.length === 0 ? (<div className="flex items-center space-x-2 text-white">
                        <span>👤</span>
                        <span>You Don’t have any board in workspace</span>
                    </div> ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {boards.map((board) => (
                        <Link
                            key={board.id} // use title as key
                            href={`/boards/${encodeURIComponent(board.id)}`} // use title in URL (encode for safety)
                            className="bg-white flex justify-center items-center text-center w-[250px] h-[100px] text-blue-700 p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
                            >
                           {typeof board.title === 'string' ? board.title : JSON.stringify(board.title)}
                        </Link>
                        ))}
                    </div> )}
                    <button onClick={() => setIsModalOpen(true)} className="bg-white text-gray-700 w-[250px] h-[100px] font-medium px-6 py-4 rounded-lg shadow hover:bg-gray-100">
                        + Create new board
                    </button>
                    <CreateBoardModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCreate={(board: { id: string; title: string }) => {
                            addBoard(board); // pass the whole object with id and title
                            setIsModalOpen(false);
                        }}
                        />
                </div>
            </div>
        </div>
        </div>
    );
}
