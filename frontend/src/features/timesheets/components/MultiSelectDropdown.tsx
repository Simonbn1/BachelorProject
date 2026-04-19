import { useState, useRef, useEffect } from "react";
import "../styles/MultiSelectDropdown.css";

type Option = {
  id: number;
  title: string;
  disabled?: boolean;
};

type MultiSelectDropdownProps = {
  options: Option[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
};

export default function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = "Velg...",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  const selectedLabels = options
    .filter((o) => selectedIds.includes(o.id))
    .map((o) => o.title)
    .join(", ");

  return (
    <div ref={ref} className="multiselect-wrapper">
      <div
        className="dark-input multiselect-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={selectedLabels ? "" : "multiselect-placeholder"}>
          {selectedLabels || placeholder}
        </span>
        <span className="multiselect-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="multiselect-dropdown">
          {options.map((option) => (
            <label
              key={option.id}
              className={`multiselect-option${option.disabled ? " multiselect-option--disabled" : ""}`}
            >
              <input
                type="checkbox"
                className="multiselect-checkbox"
                checked={selectedIds.includes(option.id)}
                disabled={option.disabled}
                onChange={() => !option.disabled && toggleOption(option.id)}
                onClick={(e) => e.stopPropagation()}
              />
              {option.title} {option.disabled ? "(lagt til)" : ""}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
