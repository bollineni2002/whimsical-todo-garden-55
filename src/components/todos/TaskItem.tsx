
import React, { useState, useRef, useEffect } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onRemove,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(task.text);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== task.text) {
      onEdit(task.id, editValue);
    } else {
      setEditValue(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(task.text);
    }
  };

  return (
    <li className="group animate-slide-up bg-white border border-border/50 shadow-sm rounded-xl p-4 mb-3 transition-all duration-300 hover:shadow-md hover:border-border">
      <div className="flex items-center">
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "checkbox-custom flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/30",
            task.completed && "checkbox-custom-checked"
          )}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 ml-3">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 border border-primary/30 rounded input-focus"
            />
          </div>
        ) : (
          <span
            className={cn(
              "flex-1 ml-3 transition-all duration-300",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.text}
          </span>
        )}

        <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isEditing ? (
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValue(task.text);
              }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(task.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-1"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
};
