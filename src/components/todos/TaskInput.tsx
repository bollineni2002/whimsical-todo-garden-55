
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { CustomButton } from "../ui/custom-button";

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue);
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-in">
      <div className="glass rounded-xl p-1 flex items-center overflow-hidden shadow-sm">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-foreground placeholder-muted-foreground/70"
          aria-label="Add a new task"
        />
        <CustomButton 
          type="submit"
          variant="primary"
          size="md"
          className="ml-1 rounded-lg transition-all duration-300"
          disabled={!inputValue.trim()}
          leftIcon={<PlusCircle className="h-4 w-4" />}
        >
          Add
        </CustomButton>
      </div>
    </form>
  );
};
