// =============================================================
// Workspace Page - Shows all boards with colors and star status
// =============================================================

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CreateBoardModal from "../../components/CreateBoard/page";
import { jwtDecode } from "jwt-decode";

// Type for Board data
type BoardType = {
  id: string;
  title: string;
  backgroundColor?: string;  // NEW: Board background color
  isStarred?: boolean;       // NEW: Whether board is starred
};

// Type for assigned task data
type AssignedTask = {
  _id: string;
  title: string;
  dueDate?: string;
  labels?: string[];
  boardId: string;
  boardTitle: string;
  listTitle: string;
};

export default function WorkspaceEmpty() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [openBoardMenu, setOpenBoardMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenBoardMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================================================
  // Fetch boards when component loads
  // =============================================================
  useEffect(() => {
    async function fetchBoards() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/signin";
          return;
        }
        const res = await fetch("/api/boards/workspace", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          // Token invalid, redirect to signin
          localStorage.removeItem("token");
          window.location.href = "/signin";
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Map backend data to frontend format
        const formattedBoards = data.map((board: any) => ({
          id: board._id,
          title: board.title,
          backgroundColor: board.backgroundColor || "#0079BF",  // Default blue
          isStarred: board.isStarred || false,
        }));

        setBoards(formattedBoards);
      } catch (error) {
        console.error("Error loading boards:", error);
      }
    }
    fetchBoards();
  }, []);

  // =============================================================
  // Fetch tasks assigned to current user
  // =============================================================
  useEffect(() => {
    async function fetchAssignedTasks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // Skip if no token (will be redirected by other effect)
        const res = await fetch("/api/task?assigned=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignedTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Error fetching assigned tasks:", error);
      }
    }
    fetchAssignedTasks();
  }, []);

  // =============================================================
  // Get username from JWT token
  // =============================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const email = decoded.email || "";
        const namePart = email.split("@")[0];
        setUsername(namePart);
      } catch {
        // Invalid token, will be handled by fetchBoards redirect
      }
    }
  }, []);

  // =============================================================
  // Toggle star status for a board
  // =============================================================
  async function toggleStar(boardId: string, event: React.MouseEvent) {
    // Prevent navigating to the board when clicking the star
    event.preventDefault();
    event.stopPropagation();

    try {
      const token = localStorage.getItem("token");
      const board = boards.find((b) => b.id === boardId);
      if (!board) return;

      // Update the star status in the database
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isStarred: !board.isStarred }),
      });

      if (res.ok) {
        // Update local state
        setBoards(
          boards.map((b) =>
            b.id === boardId ? { ...b, isStarred: !b.isStarred } : b
          )
        );
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  }

  // Add a new board to the list
  const addBoard = (board: { id: string; title: string; backgroundColor?: string }) => {
    setBoards((prev) => [...prev, { ...board, backgroundColor: board.backgroundColor || "#0079BF", isStarred: false }]);
  };

  // =============================================================
  // Delete a board
  // =============================================================
  async function deleteBoard(boardId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const boardToDelete = boards.find(b => b.id === boardId);
    if (!boardToDelete) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${boardToDelete.title}"? This will also delete all lists and tasks in this board.`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/board", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ boardId }),
      });

      if (res.ok) {
        setBoards(boards.filter((b) => b.id !== boardId));
        setOpenBoardMenu(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete board");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Failed to delete board");
    }
  }

  // =============================================================
  // Separate starred and unstarred boards
  // =============================================================
  const starredBoards = boards.filter((b) => b.isStarred);
  const unstarredBoards = boards.filter((b) => !b.isStarred);

  return (
    <div className="h-screen bg-[#0079BF] text-white flex flex-col">
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#026AA7] shadow-md">
        {/* Left Side: Home Icon */}
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
              className="px-2 py-1 rounded text-sm text-white bg-transparent"
            />
            <img
              src="https://res.cloudinary.com/ds9pcviv3/image/upload/v1747817862/Screenshot_2025-05-21_142717_lzppka.png"
              className="h-6"
              alt="Search"
            />
          </div>
          <button
            className="text-sm hover:underline"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            Log Out
          </button>
          <div className="bg-[#bae3ff] text-[#0079BF] w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 overflow-y-auto flex-1">
        {/* Workspace Header */}
        <div className="flex items-center justify-center space-x-2 text-lg font-medium m-3 mb-8">
          <div className="bg-orange-600 w-8 h-8 flex items-center justify-center rounded text-white font-bold">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </div>
          <span>{username ? `${username}'s Workspace` : "Workspace"}</span>
        </div>

        {/* Two-column layout: Boards on left, Assigned Tasks on right */}
        <div className="max-w-7xl mx-auto flex gap-6">
          {/* Left Side: Boards */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* =============================================================
                Starred Boards Section
                ============================================================= */}
            {starredBoards.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  ⭐ Starred Boards
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  {starredBoards.map((board) => (
                    <div
                      key={board.id}
                      className="relative group rounded-lg shadow hover:shadow-lg transition-all overflow-hidden h-[100px]"
                      style={{ backgroundColor: board.backgroundColor === "#0079BF" ? "#026AA7" : board.backgroundColor }}
                    >
                      <Link
                        href={`/boards/${encodeURIComponent(board.id)}`}
                        className="block p-4 text-white font-semibold h-full"
                      >
                        {board.title}
                      </Link>
                      
                      {/* More Vert Menu Button */}
                      <div className="absolute top-2 right-2" ref={openBoardMenu === board.id ? menuRef : null}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenBoardMenu(openBoardMenu === board.id ? null : board.id);
                          }}
                          className="text-white/70 hover:text-white p-1 rounded hover:bg-white/20 transition-colors"
                          title="Board options"
                        >
                          ⋮
                        </button>
                        {openBoardMenu === board.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-1 z-50 w-36">
                            <button
                              onClick={(e) => deleteBoard(board.id, e)}
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                            >
                              🗑️ Delete Board
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Star Button - Always visible when starred */}
                      <button
                        onClick={(e) => toggleStar(board.id, e)}
                        className="absolute bottom-2 right-2 text-yellow-300 text-xl hover:scale-110 transition-transform"
                        title="Unstar this board"
                      >
                        ⭐
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =============================================================
                All Boards Section
                ============================================================= */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📋 Your Boards
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {/* Show unstarred boards */}
                {unstarredBoards.map((board) => (
                  <div
                    key={board.id}
                    className="relative group rounded-lg shadow hover:shadow-lg transition-all overflow-hidden h-[100px]"
                    style={{ backgroundColor: board.backgroundColor === "#0079BF" ? "#026AA7" : board.backgroundColor }}
                  >
                    <Link
                      href={`/boards/${encodeURIComponent(board.id)}`}
                      className="block p-4 text-white font-semibold h-full"
                    >
                      {board.title}
                    </Link>
                    
                    {/* More Vert Menu Button */}
                    <div className="absolute top-2 right-2" ref={openBoardMenu === board.id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenBoardMenu(openBoardMenu === board.id ? null : board.id);
                        }}
                        className="text-white/70 hover:text-white p-1 rounded hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Board options"
                      >
                        ⋮
                      </button>
                      {openBoardMenu === board.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-1 z-50 w-36">
                          <button
                            onClick={(e) => deleteBoard(board.id, e)}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                          >
                            🗑️ Delete Board
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Star Button - Shows on hover */}
                    <button
                      onClick={(e) => toggleStar(board.id, e)}
                      className="absolute bottom-2 right-2 text-white/50 hover:text-yellow-300 text-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      title="Star this board"
                    >
                      ☆
                    </button>
                  </div>
                ))}

                {/* Create New Board Button - Always visible */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#5BA4CF] hover:bg-[#4A93BE] text-white font-medium rounded-lg shadow hover:shadow-lg h-[100px] flex items-center justify-center transition-all"
                >
                  + Create new board
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Assigned Tasks Sidebar - Always visible */}
          <div className="w-80 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              👤 Tasks Assigned to You
            </h2>
            <div className="bg-white/10 rounded-lg p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {assignedTasks.length === 0 ? (
                <div className="text-white/70 text-center py-4">
                  No tasks assigned to you
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedTasks.map((task) => (
                    <Link
                      key={task._id}
                      href={`/boards/${encodeURIComponent(task.boardId)}`}
                      className="block bg-white rounded-lg p-3 text-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.boardTitle} • {task.listTitle}
                      </div>
                      {task.dueDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.labels.map((label: string) => (
                            <span
                              key={label}
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Board Modal */}
        <CreateBoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={(board: { id: string; title: string }) => {
            addBoard(board);
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
