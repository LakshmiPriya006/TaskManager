"use client";

import { useState } from "react";

type CreateBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (board: { id: string; title: string }) => void;
};

export default function CreateBoardModal({ isOpen , onClose, onCreate } : CreateBoardModalProps) {
  const [boardTitle, setBoardTitle] = useState("");

  const handleCreateBoard = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/board", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({ title : boardTitle}),
  });

  const data = await res.json(); 
  if (data.success) {
    onCreate({id: data.board._id, title: data.board.title}); // pass created board back
    setBoardTitle("");
    onClose();
  } else {
    alert(data.error || "Failed to create board");
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Create New Board</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <input
          type="text"
          placeholder="Add board title"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1 text-[#1976ad] focus:outline-none focus:ring focus:ring-blue-500"
        />
        <label className="block mb-4 text-sm text-gray-600 font-bold"> William John's Workspace </label>
        <button
          onClick={handleCreateBoard}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Create Board
        </button>
      </div>
    </div>
  );
}
