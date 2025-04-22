/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CommentInput = ({
  value,
  onChange,
  placeholder,
  isDark,
  inputRef,
  className,
}) => {
  const navigate = useNavigate();
  const [cursorPosition, setCursorPosition] = useState(0);

  // Handle input changes
  const handleChange = (e) => {
    onChange(e);
    setCursorPosition(e.target.selectionStart);
  };

  // Parse the text to find @mentions and format them
  const parseText = (text) => {
    if (!text) return [];

    // Regex to find @username patterns
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;

    // Split text by the mentions
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.substring(1); // Remove @ symbol
        return (
          <span
            key={index}
            className="font-bold text-blue-500 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${username}`);
            }}
          >
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // Sync cursor position after render
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.selectionStart = cursorPosition;
      inputRef.current.selectionEnd = cursorPosition;
    }
  }, [cursorPosition, inputRef]);

  return (
    <div className="relative w-full">
      {/* Actual textarea for user input (transparent) */}
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} w-full absolute top-0 left-0 bg-transparent z-10 overflow-hidden resize-none`}
        style={{
          color: isDark ? "black" : "white",
          caretColor: isDark ? "white" : "black",
          height: "100%",
        }}
      />

      {/* Display layer with formatted text */}
      <div
        className={`${className} block w-full pointer-events-none whitespace-pre-wrap border-0 focus:ring-0 ${
          !value ? "text-gray-400" : isDark ? "text-gray-300" : "text-gray-800"
        }`}
      >
        {value ? parseText(value) : <span>{placeholder}</span>}
      </div>
    </div>
  );
};

export default CommentInput;
