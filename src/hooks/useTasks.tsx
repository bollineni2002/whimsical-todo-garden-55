
import { useState, useEffect } from "react";
import { toast } from "sonner";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string) => {
    if (!text.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    setTasks((prev) => [newTask, ...prev]);
    toast.success("Task added", {
      description: `"${text.slice(0, 20)}${text.length > 20 ? "..." : ""}" has been added`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: string) => {
    const taskToRemove = tasks.find(task => task.id === id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    
    if (taskToRemove) {
      toast.success("Task removed", {
        description: `"${taskToRemove.text.slice(0, 20)}${taskToRemove.text.length > 20 ? "..." : ""}" has been removed`,
      });
    }
  };

  const editTask = (id: string, newText: string) => {
    if (!newText.trim()) return;
    
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: newText.trim() } : task
      )
    );
  };

  const clearCompletedTasks = () => {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) return;
    
    setTasks((prev) => prev.filter((task) => !task.completed));
    toast.success(`Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`);
  };

  return {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearCompletedTasks,
  };
}
