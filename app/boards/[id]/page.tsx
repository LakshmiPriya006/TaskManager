// =============================================================
// Board Detail Page - With Drag-and-Drop & List Management
// =============================================================

"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import CreateListModal from "@/app/components/CreateList/page";
import CreateTaskModal from "@/app/components/CreateTask/page";
import TaskModal from "@/app/components/TaskModal/page";
import { jwtDecode } from "jwt-decode";

// =============================================================
// Type Definitions - Define what our data looks like
// =============================================================

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
  assignedTo?: string | null;
  listId: string;
}

interface List {
  _id: string;
  title: string;
  tasks: Task[];
}

interface Board {
  _id: string;
  title: string;
  backgroundColor?: string;
  lists: List[];
}

// =============================================================
// Main Component
// =============================================================

export default function BoardDetail() {
  // Get the board ID from the URL
  const { id: boardId } = useParams();
  
  // State variables
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  // State for the task detail modal
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // State for list menu dropdown
  const [openListMenu, setOpenListMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get current user ID from token for "Assigned to You" badge
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // =============================================================
  // Get current user ID on mount
  // =============================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id || null);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  // =============================================================
  // Close menu when clicking outside
  // =============================================================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenListMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================================================
  // Fetch board data when component loads
  // =============================================================
  useEffect(() => {
    async function fetchBoard() {
      if (typeof boardId !== "string") {
        setBoard(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}`);
        if (res.ok) {
          const data = await res.json();
          // Make sure lists is always an array
          setBoard({
            ...data,
            lists: data.lists ?? [],
          });
        } else {
          setBoard(null);
        }
      } catch (error) {
        console.error("Error fetching board:", error);
        setBoard(null);
      }
      setIsLoading(false);
    }
    fetchBoard();
  }, [boardId]);

  // =============================================================
  // DRAG AND DROP HANDLER - This is the magic!
  // Called when user finishes dragging a task
  // =============================================================
  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    // If dropped outside a valid area, do nothing
    if (!destination) return;

    // If dropped in same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (!board) return;

    // Find the source and destination lists
    const sourceListIndex = board.lists.findIndex((l) => l._id === source.droppableId);
    const destListIndex = board.lists.findIndex((l) => l._id === destination.droppableId);

    if (sourceListIndex === -1 || destListIndex === -1) return;

    // Create copies of the lists to modify
    const newLists = [...board.lists];
    const sourceList = { ...newLists[sourceListIndex], tasks: [...newLists[sourceListIndex].tasks] };
    const destList = source.droppableId === destination.droppableId 
      ? sourceList 
      : { ...newLists[destListIndex], tasks: [...newLists[destListIndex].tasks] };

    // Remove the task from source list
    const [movedTask] = sourceList.tasks.splice(source.index, 1);

    // Add the task to destination list
    destList.tasks.splice(destination.index, 0, { ...movedTask, listId: destination.droppableId });

    // Update the lists array
    newLists[sourceListIndex] = sourceList;
    if (source.droppableId !== destination.droppableId) {
      newLists[destListIndex] = destList;
    }

    // Update state immediately for smooth UX
    setBoard({ ...board, lists: newLists });

    // If the task moved to a different list, update in database
    if (source.droppableId !== destination.droppableId) {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/task", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskId: movedTask._id,
            listId: destination.droppableId,
          }),
        });
      } catch (error) {
        console.error("Error moving task:", error);
        // You might want to revert the state here on error
      }
    }
  }

  // =============================================================
  // Create a new list
  // =============================================================
  async function addList(title: string) {
    if (!board) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const res = await fetch("/api/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), boardId: board._id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create list");
      }

      const data = await res.json();
      // Add the new list with empty tasks array
      setBoard({
        ...board,
        lists: [...(board.lists || []), { ...data.list, tasks: [] }],
      });
    } catch (error) {
      console.error("Error creating list:", error);
      alert(error instanceof Error ? error.message : "Failed to create list");
    }
  }

  // =============================================================
  // Create a new task
  // =============================================================
  async function addTask(title: string, listId: string) {
    if (!board) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const res = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          boardId: board._id,
          listId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create task");
        return;
      }

      const data = await res.json();
      // Add the new task to the correct list
      const updatedLists = board.lists.map((list) => {
        if (list._id === listId) {
          return {
            ...list,
            tasks: [...(list.tasks || []), data.task],
          };
        }
        return list;
      });

      setBoard({ ...board, lists: updatedLists });
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  }

  // =============================================================
  // Handle clicking on a task to open detail modal
  // =============================================================
  function handleTaskClick(task: Task) {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  }

  // =============================================================
  // Handle task update from modal
  // =============================================================
  function handleTaskUpdate(updatedTask: Task) {
    if (!board) return;
    
    const updatedLists = board.lists.map((list) => ({
      ...list,
      tasks: list.tasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      ),
    }));
    
    setBoard({ ...board, lists: updatedLists });
  }

  // =============================================================
  // Handle task deletion from modal
  // =============================================================
  function handleTaskDelete(taskId: string) {
    if (!board) return;
    
    const updatedLists = board.lists.map((list) => ({
      ...list,
      tasks: list.tasks.filter((task) => task._id !== taskId),
    }));
    
    setBoard({ ...board, lists: updatedLists });
  }

  // Open the "Add Task" modal for a specific list
  function handleAddTask(listId: string) {
    setSelectedListId(listId);
    setIsTaskModalOpen(true);
  }

  // =============================================================
  // Delete a list (and all its tasks)
  // =============================================================
  async function deleteList(listId: string) {
    if (!board) return;
    
    const listToDelete = board.lists.find(l => l._id === listId);
    if (!listToDelete) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${listToDelete.title}" and all its tasks?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/list", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete list");
      }

      // Remove list from state
      setBoard({
        ...board,
        lists: board.lists.filter((l) => l._id !== listId),
      });
      setOpenListMenu(null);
    } catch (error) {
      console.error("Error deleting list:", error);
      alert(error instanceof Error ? error.message : "Failed to delete list");
    }
  }

  // =============================================================
  // Helper function to get label color
  // =============================================================
  function getLabelColor(label: string): string {
    const colors: Record<string, string> = {
      urgent: "bg-red-500",
      important: "bg-orange-500",
      "in-progress": "bg-yellow-500",
      review: "bg-blue-500",
      done: "bg-green-500",
      bug: "bg-purple-500",
    };
    return colors[label] || "bg-gray-500";
  }

  // =============================================================
  // Loading state
  // =============================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0079BF]">
        <div className="text-white text-xl animate-pulse">Loading board...</div>
      </div>
    );
  }

  // =============================================================
  // Board not found
  // =============================================================
  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0079BF]">
        <div className="text-white text-xl">Board not found</div>
      </div>
    );
  }

  // =============================================================
  // Main Render
  // =============================================================
  return (
    <div
      className="h-screen text-white flex flex-col"
      style={{ backgroundColor: board.backgroundColor || "#0079BF" }}
    >
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-3 bg-black/20">
        <div className="flex items-center gap-4">
          <Link
            href="/boards/workspace"
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
          >
            ← Back to Workspace
          </Link>
          <h1 className="text-xl font-bold">{board.title}</h1>
        </div>
      </div>

      {/* Main Board Content with Drag and Drop */}
      <div className="flex-1 p-4 overflow-x-auto">
        {(board.lists?.length ?? 0) === 0 ? (
          // Empty state - no lists yet
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-2xl font-bold">No lists in "{board.title}" yet</h2>
            <p className="text-white/80">Start organizing by adding your first list!</p>
            <button
              onClick={() => setIsListModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              + Add your first list
            </button>
          </div>
        ) : (
          // DragDropContext wraps everything that can be dragged
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-4 h-full">
              {/* Render each list */}
              {(board.lists ?? []).map((list) => (
                // Droppable makes this list a drop target for tasks
                <Droppable key={list._id} droppableId={list._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-[#E4E6EA] rounded-lg p-3 w-72 flex-shrink-0 h-fit text-gray-800 transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-100" : ""
                      }`}
                    >
                      {/* List Header */}
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">{list.title}</h3>
                        <div className="relative" ref={openListMenu === list._id ? menuRef : null}>
                          <button 
                            className="text-gray-600 hover:text-gray-800 px-2"
                            onClick={() => setOpenListMenu(openListMenu === list._id ? null : list._id)}
                          >
                            ⋯
                          </button>
                          {openListMenu === list._id && (
                            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg py-1 z-50 w-40">
                              <button
                                onClick={() => deleteList(list._id)}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                              >
                                🗑️ Delete List
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tasks Container */}
                      <div className="space-y-2 min-h-[20px]">
                        {(list.tasks?.length ?? 0) === 0 ? (
                          <div className="text-gray-500 text-sm py-2 text-center">
                            No tasks yet
                          </div>
                        ) : (
                          // Render each task as a Draggable
                          (list.tasks ?? []).map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleTaskClick(task)}
                                  className={`bg-white rounded-md p-2 shadow-sm cursor-pointer transition-all ${
                                    snapshot.isDragging
                                      ? "shadow-lg rotate-2 scale-105"
                                      : "hover:shadow-md"
                                  } ${task.assignedTo === currentUserId ? "border-2 border-green-500" : ""}`}
                                >
                                  {/* Assigned to You Badge */}
                                  {task.assignedTo === currentUserId && (
                                    <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mb-2 inline-block">
                                      👤 Assigned to You
                                    </div>
                                  )}
                                  
                                  {/* Task Labels */}
                                  {task.labels && task.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {task.labels.map((label) => (
                                        <span
                                          key={label}
                                          className={`${getLabelColor(label)} text-white text-xs px-2 py-0.5 rounded`}
                                        >
                                          {label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Task Title */}
                                  <div className="text-gray-800">{task.title}</div>
                                  
                                  {/* Task Due Date (if set) */}
                                  {task.dueDate && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      📅 {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {/* This placeholder makes sure there's space for dropped items */}
                        {provided.placeholder}
                      </div>

                      {/* Add Task Button */}
                      <button
                        onClick={() => handleAddTask(list._id)}
                        className="w-full mt-2 text-left text-gray-600 hover:text-gray-800 text-sm py-1 px-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        + Add a task
                      </button>
                    </div>
                  )}
                </Droppable>
              ))}

              {/* Add Another List Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsListModalOpen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 w-72 text-left transition-colors"
                >
                  + Add another list
                </button>
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onCreate={async (title) => {
          await addList(title);
          setIsListModalOpen(false);
        }}
        boardId={boardId as string}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={async (title) => {
          if (selectedListId) {
            await addTask(title, selectedListId);
          }
          setIsTaskModalOpen(false);
        }}
        boardId={boardId as string}
        listId={selectedListId as string}
      />

      {/* Task Detail Modal - Opens when task is clicked */}
      <TaskModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setIsTaskDetailModalOpen(false)}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </div>
  );
}
