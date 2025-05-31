"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import CreateListModal from "@/app/components/CreateList/page";
import CreateTaskModal from "@/app/components/CreateTask/page";

interface Task {
  _id: string;
  title: string;
}

interface List {
  _id: string;
  title: string;
  tasks: Task[];
}

interface Board {
  _id: string;
  title: string;
  lists: List[];
}

export default function BoardDetail() {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

useEffect(() => {
  async function fetchBoardTitle() {
    if (typeof boardId !== "string") {
      setBoard(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const encodedId = encodeURIComponent(boardId);
    
    const res = await fetch(`/api/boards/${encodedId}`);
      if (!res.ok) throw new Error("Failed to fetch board");
    if (res.ok) {
      const data = await res.json();
      // Only set board with title and empty lists (ignore full lists/tasks)
      setBoard({
    ...data,
    lists: data.lists ?? [],  // Force lists to be array even if missing
  });
    } else {
      setBoard(null);
    }
    setIsLoading(false);
  }
  fetchBoardTitle();
}, [boardId]);



  const addList = async (title: string) => {
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
    
    // Update board state with the new list from server (with empty tasks array)
    setBoard({
      ...board,
      lists: [...(board.lists || []), { ...data.list, tasks: [] }],
    });
    
  } catch (error) {
    console.error("Error creating list:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create list";
    alert(errorMessage);
  }
};


  const addTask = async (title: string, listId: string) => {
  if (!board) return;
  
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");

    // Make API call to create task in database
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
    
    // Update local state with the task returned from server
    const updatedLists = board.lists.map((list) => {
      if (list._id === listId) {
        return { 
          ...list, 
          tasks: [...(list.tasks || []), data.task] 
        };
      }
      return list;
    });
    
    setBoard({ ...board, lists: updatedLists });
    
  } catch (error) {
    console.error("Error creating task:", error);
    alert("Failed to create task");
  }
};

  const handleAddTask = (listId: string) => {
    setSelectedListId(listId);
    setIsTaskModalOpen(true);
  };

  if (isLoading) {
    return (
    <div className="flex items-center justify-center h-full">
      <div className="text-white animate-pulse">Loading...</div>
    </div>
  );
  }

  if (!board) {
    return <div className="p-6 text-white">Board not found</div>;
  }

  return (
    <div className="h-screen bg-[#0079BF] text-white flex flex-col">
      {/* Navbar code same as before */}

      <div className="flex-1 p-4 overflow-x-auto">
        {(board.lists?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-2xl font-bold">No lists in "{board.title}" yet</h2>
            <p className="text-gray-300">Start organizing by adding your first list!</p>
            <button
              onClick={() => setIsListModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              + Add your first list
            </button>
          </div>
        ) : (
          <div className="flex space-x-4 h-full">
            {(board.lists ?? []).map((list) => (
              <div key={list._id} className="bg-[#E4E6EA] rounded-lg p-3 w-72 flex-shrink-0 h-fit text-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">{list.title}</h3>
                  <button className="text-gray-600 hover:text-gray-800">⋯</button>
                </div>
                <div className="space-y-2">
                  {(list.tasks?.length ?? 0) === 0 ? (
                    <div className="text-gray-500 text-sm py-2 text-center">No tasks yet</div>
                  ) : (
                    (list.tasks ?? []).map((task) => (
                      <div key={task._id} className="bg-white rounded-md p-2 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                        {task.title}
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => handleAddTask(list._id)}
                  className="w-full mt-2 text-left text-gray-600 hover:text-gray-800 text-sm py-1 px-2 hover:bg-gray-200 rounded transition-colors"
                >
                  + Add a task
                </button>
              </div>
            ))}
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsListModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 w-72 text-left transition-colors"
              >
                + Add another list
              </button>
            </div>
          </div>
        )}
      </div>
      
      <CreateListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onCreate={async (title) => {
          await addList(title);
          setIsListModalOpen(false);
        }}
        boardId={boardId as string}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={async (title) => {
          if (selectedListId) {
            await addTask(title, selectedListId);
          }
          setIsTaskModalOpen(false);
        }}
        boardId={boardId as string}  // Pass boardId
        listId={selectedListId as string}  // Pass selected listId
      />

    </div>
  );
}
