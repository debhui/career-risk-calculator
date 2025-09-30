import React, { useState, useRef, useEffect, useCallback } from "react";

import { Triangle } from "lucide-react";

// --- Type Definitions ---
interface CustomSelectProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
}

/**
 * A fully custom, accessible dropdown component that replaces the native <select> tag.
 * It manages its own open state and closes when a click occurs outside the element.
 */
const CustomSelect: React.FC<CustomSelectProps> = ({ id, value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Handler to close the dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Effect to attach and cleanup the outside click listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // --- Keyboard Accessibility ---

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(prev => !prev);
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
        }
        break;
      // Note: Focus management for arrow keys inside the list can be added here
      // but requires tracking active index/focused element.
      default:
        break;
    }
  };

  // --- Render Logic ---

  return (
    <div className="relative w-full " ref={selectRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1"
      >
        {label}
      </label>

      {/* Custom Button/Display Area */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full h-10 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-400 dark:border-gray-600 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer transition duration-150 ease-in-out hover:border-teal-500  hover:dark:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:dark:ring-indigo-500 focus:border-teal-500  focus:dark:border-indigo-500 sm:text-sm"
      >
        <span className="block truncate">{value}</span>

        {/* Dropdown Arrow Icon (Chevron) */}
        <span
          className={`absolute right-2 top-4 flex items-center pr-2 pointer-events-none `} //  ${
        >
          <Triangle
            className={`transition-transform duration-300 fill-teal-500 dark:fill-white text-teal-500 dark:text-white ${
              isOpen ? "rotate-0" : "-rotate-180"
            }`}
            fill="white"
            size={10}
          />
        </span>
      </button>

      {/* Custom Options List */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-200 dark:bg-gray-800 shadow-lg rounded-lg border border-gray-400 dark:border-gray-600 ring-1 ring-gray-200 dark:ring-black ring-opacity-5 overflow-auto max-h-60">
          <ul
            tabIndex={-1}
            role="listbox"
            aria-labelledby={id}
            className="py-1 text-base ring-1 ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {options.map(option => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                onClick={() => handleOptionClick(option)}
                className={`
                  text-gray-700 dark:text-gray-300 cursor-default select-none relative py-2 pl-3 pr-9
                  ${
                    option === value
                      ? "font-semibold text-gray-800 dark:text-white bg-teal-600 dark:bg-indigo-600"
                      : "hover:bg-teal-500 hover:dark:bg-gray-700"
                  }
                `}
              >
                <div className="flex items-center">
                  <span
                    className={`block truncate ${
                      option === value ? "font-semibold text-white" : "font-normal"
                    }`}
                  >
                    {option}
                  </span>
                  {/* Checkmark icon for selected option */}
                  {option === value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.142z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
