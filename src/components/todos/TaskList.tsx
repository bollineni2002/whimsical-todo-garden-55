
import React, { useState } from "react";
import { TaskItem } from "./TaskItem";
import { CustomButton } from "../ui/custom-button";
import { Task } from "@/hooks/useTasks";
import { CheckCheck, ListTodo, Trash } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onClearCompleted: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onRemove,
  onEdit,
  onClearCompleted,
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="w-full animate-fade-in">
      {tasks.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    filter === "all"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    filter === "active"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    filter === "completed"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>
            {completedCount > 0 && (
              <CustomButton
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
                leftIcon={<Trash className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                Clear completed
              </CustomButton>
            )}
          </div>

          <ul className="space-y-1">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onEdit={onEdit}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No {filter} tasks found.</p>
              </div>
            )}
          </ul>
        </>
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <ListTodo className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Add your first task using the form above to get started.
          </p>
        </div>
      )}
    </div>
  );
};
