import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface PersistentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
}

export const PersistentInput: React.FC<PersistentInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  // Create a ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track if the input is focused
  const [isFocused, setIsFocused] = useState(false);
  
  // Track cursor position
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Save cursor position
    setCursorPosition(e.target.selectionStart);
    
    // Call the onChange handler with the new value
    onChange(e.target.value);
  };
  
  // Restore focus and cursor position after value changes
  useEffect(() => {
    if (isFocused && inputRef.current) {
      // Focus the input
      inputRef.current.focus();
      
      // Restore cursor position if we have one
      if (cursorPosition !== null) {
        try {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        } catch (e) {
          // Ignore errors for non-text inputs
        }
      }
    }
  }, [isFocused, value, cursorPosition]);
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

interface PersistentTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PersistentTextarea: React.FC<PersistentTextareaProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  // Create a ref for the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track if the textarea is focused
  const [isFocused, setIsFocused] = useState(false);
  
  // Track cursor position
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Save cursor position
    setCursorPosition(e.target.selectionStart);
    
    // Call the onChange handler with the new value
    onChange(e.target.value);
  };
  
  // Restore focus and cursor position after value changes
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      // Focus the textarea
      textareaRef.current.focus();
      
      // Restore cursor position if we have one
      if (cursorPosition !== null) {
        try {
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }, [isFocused, value, cursorPosition]);
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};
