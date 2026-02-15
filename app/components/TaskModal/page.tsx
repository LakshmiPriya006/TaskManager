// =============================================================
// TaskModal Component - Shows task details and allows editing
// This opens when you click on a task card
// =============================================================

"use client";
import { useState, useEffect } from "react";

// Define what a Task looks like
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
  assignedTo?: string | null;
  listId: string;
}

// Define what a User looks like (for assignment dropdown)
interface User {
  _id: string;
  email: string;
}

// Props that this component accepts
interface TaskModalProps {
  isOpen: boolean;           // Whether the modal is visible
  onClose: () => void;       // Function to close the modal
  task: Task | null;         // The task to display/edit
  onUpdate: (updatedTask: Task) => void;  // Called when task is updated
  onDelete: (taskId: string) => void;     // Called when task is deleted
}

// Available label colors for tasks
const LABEL_OPTIONS = [
  { name: "urgent", color: "bg-red-500" },
  { name: "important", color: "bg-orange-500" },
  { name: "in-progress", color: "bg-yellow-500" },
  { name: "review", color: "bg-blue-500" },
  { name: "done", color: "bg-green-500" },
  { name: "bug", color: "bg-purple-500" },
];

export default function TaskModal({ isOpen, onClose, task, onUpdate, onDelete }: TaskModalProps) {
  // State for form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // When the task changes, update the form fields
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      // Format date for input field (YYYY-MM-DD)
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setLabels(task.labels || []);
      setAssignedTo(task.assignedTo || "");
    }
  }, [task]);

  // Fetch users when modal opens (for the assignment dropdown)
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Get list of users from the API
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }

  // Toggle a label on/off
  function toggleLabel(labelName: string) {
    if (labels.includes(labelName)) {
      setLabels(labels.filter((l) => l !== labelName));
    } else {
      setLabels([...labels, labelName]);
    }
  }

  // Save changes to the task
  async function handleSave() {
    if (!task) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/task", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: task._id,
          title,
          description,
          dueDate: dueDate || null,
          labels,
          assignedTo: assignedTo || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.task);
        onClose();
      } else {
        alert("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  }

  // Delete the task
  async function handleDelete() {
    if (!task) return;
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/task", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId: task._id }),
      });

      if (res.ok) {
        onDelete(task._id);
        onClose();
      } else {
        alert("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render anything if modal is closed or no task
  if (!isOpen || !task) return null;

  return (
    // Dark overlay behind the modal
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Modal container */}
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form content */}
        <div className="p-4 space-y-4">
          {/* Title field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Task title..."
            />
          </div>

          {/* Description field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Add a description..."
            />
          </div>

          {/* Due Date field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Labels section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => (
                <button
                  key={label.name}
                  onClick={() => toggleLabel(label.name)}
                  className={`px-3 py-1 rounded-full text-sm text-white transition-all ${label.color} ${
                    labels.includes(label.name)
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          {/* Assign To dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Delete Task
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
