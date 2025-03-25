
import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-border py-4 px-4 sm:px-6 md:px-8 mt-auto bg-white/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Essence. All rights reserved.
        </p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <span className="text-xs text-muted-foreground/60">
            Designed for clarity
          </span>
        </div>
      </div>
    </footer>
  );
};
