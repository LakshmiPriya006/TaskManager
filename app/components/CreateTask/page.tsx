"use client";

import { useState } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  boardId: string;
  listId: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  boardId,
  listId,
}: CreateTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState("");

  const handleCreateTask = () => {
  if (!taskTitle.trim()) return;

  // Let parent handle actual API call
  onCreate(taskTitle.trim());
  setTaskTitle("");
  onClose();
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateTask();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Add a Task</h3>

        <textarea
          placeholder="Enter a title for this task..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          autoFocus
        />

        <div className="flex space-x-2">
          <button
            onClick={handleCreateTask}
            className="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Add Task
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
