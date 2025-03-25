
import React from "react";
import { CheckCheck } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-border shadow-sm py-4 px-4 sm:px-6 md:px-8 transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCheck className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <h1 className="text-xl font-medium tracking-tight">Essence</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">Simplicity in Task Management</span>
        </div>
      </div>
    </header>
  );
};
