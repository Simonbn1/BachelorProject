import { useState, useRef, useEffect } from "react";

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
    <div
      ref={ref}
      style={{ position: "relative", width: "fit-content", minWidth: "350px" }}
    >
      <div
        className="dark-input"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        <span
          style={{
            color: selectedLabels ? "inherit" : "rgba(255,255,255,0.4)",
          }}
        >
          {selectedLabels || placeholder}
        </span>
        <span style={{ fontSize: "0.7rem" }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            background: "#16213a",
            border: "1px solid rgba(138, 92, 246, 0.5)",
            borderRadius: "6px",
            zIndex: 100,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((option) => (
            <label
              key={option.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                width: "100%",
                boxSizing: "border-box",
                cursor: option.disabled ? "not-allowed" : "pointer",
                opacity: option.disabled ? 0.4 : 1,
                color: "white",
                fontSize: "0.95rem",
                background: "transparent",
                transition: "background 0.15s",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                if (!option.disabled)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(138,92,246,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                disabled={option.disabled}
                onChange={() => !option.disabled && toggleOption(option.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ accentColor: "rgba(138,92,246,0.9)" }}
              />
              {option.title} {option.disabled ? "(lagt til)" : ""}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
