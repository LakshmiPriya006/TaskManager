
"use client";
import { useState } from "react";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  boardId: string;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onCreate,
  boardId,
}: CreateListModalProps) {
  const [listTitle, setListTitle] = useState("");

 const handleCreateList = () => {
  if (!listTitle.trim()) return;

  // Let parent handle actual API call
  onCreate(listTitle.trim());
  setListTitle("");
  onClose();
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateList();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-full">
        <input
          type="text"
          placeholder="Enter list title..."
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <div className="flex space-x-2">
          <button
            onClick={handleCreateList}
            className="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Add List
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 py-2 px-4 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}