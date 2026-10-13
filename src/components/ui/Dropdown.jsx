import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

export const Dropdown = ({
  trigger,
  items,
  align = "right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
      >
        {trigger}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 min-w-[160px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden animate-in ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-sm text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 ${item.disabled ? "opacity-50 pointer-events-none" : ""} ${item.destructive ? "text-red-600 dark:text-red-400" : ""}`}
              disabled={item.disabled}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
              {item.shortcut && (
                <span className="ml-auto text-xs text-neutral-400">
                  {item.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const SelectDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  searchable = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-left transition-colors flex items-center justify-between ${
          disabled
            ? "bg-neutral-100 text-neutral-500 border-neutral-200 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700"
            : "bg-white border-neutral-300 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-900 dark:border-neutral-600 dark:hover:border-primary-500"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={
            value
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-400"
          }
        >
          {selectedOption?.label || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-auto bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg animate-in">
          {searchable && (
            <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
            </div>
          )}
          <ul role="listbox" aria-label={placeholder}>
            {filteredOptions.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  role="option"
                  aria-selected={value === option.value}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-2 ${
                    value === option.value
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                </button>
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
