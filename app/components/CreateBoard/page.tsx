"use client";

import { useState } from "react";

type CreateBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (board: { id: string; title: string; backgroundColor: string }) => void;
};

// Predefined board colors
const BOARD_COLORS = [
  { name: "Blue", value: "#0079BF" },
  { name: "Orange", value: "#D29034" },
  { name: "Green", value: "#519839" },
  { name: "Red", value: "#B04632" },
  { name: "Purple", value: "#89609E" },
  { name: "Pink", value: "#CD5A91" },
  { name: "Lime", value: "#4BBF6B" },
  { name: "Sky", value: "#00AECC" },
  { name: "Grey", value: "#838C91" },
];

export default function CreateBoardModal({ isOpen , onClose, onCreate } : CreateBoardModalProps) {
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0].value);

  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) {
      alert("Please enter a board title");
      return;
    }
    
    const token = localStorage.getItem("token");
    const res = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({ title: boardTitle, backgroundColor: selectedColor }),
    });

    const data = await res.json(); 
    if (data.success) {
      onCreate({
        id: data.board._id, 
        title: data.board.title,
        backgroundColor: data.board.backgroundColor || selectedColor
      });
      setBoardTitle("");
      setSelectedColor(BOARD_COLORS[0].value);
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
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        {/* Board Preview */}
        <div 
          className="rounded-lg h-24 mb-4 flex items-center justify-center"
          style={{ backgroundColor: selectedColor }}
        >
          <span className="text-white font-semibold text-lg">
            {boardTitle || "Board Preview"}
          </span>
        </div>
        
        {/* Board Title Input */}
        <input
          type="text"
          placeholder="Add board title"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Color Picker */}
        <label className="block mb-2 text-sm text-gray-600 font-semibold">Background Color</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {BOARD_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`w-8 h-8 rounded-md transition-all ${
                selectedColor === color.value 
                  ? "ring-2 ring-offset-2 ring-gray-800 scale-110" 
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        
        <button
          onClick={handleCreateBoard}
          disabled={!boardTitle.trim()}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Create Board
        </button>
      </div>
    </div>
  );
}
