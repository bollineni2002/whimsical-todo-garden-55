
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TaskInput } from "@/components/todos/TaskInput";
import { TaskList } from "@/components/todos/TaskList";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
  const { tasks, addTask, toggleTask, removeTask, editTask, clearCompletedTasks } = useTasks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">
              Manage your tasks with simplicity and elegance.
            </p>
          </div>
          
          <TaskInput onAddTask={addTask} />
          
          <div className="mt-8">
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onRemove={removeTask}
              onEdit={editTask}
              onClearCompleted={clearCompletedTasks}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
