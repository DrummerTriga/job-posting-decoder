"use client";

import { CATEGORIES, categoryButton } from "@/lib/types";

export default function CategoryButtons({
  category,
  updating,
  onChange,
}: {
  category: string | null;
  updating: boolean;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          disabled={updating}
          aria-pressed={category === c.value}
          className={`px-3 py-1.5 rounded text-xs disabled:opacity-50 ${categoryButton[c.value]} ${
            category === c.value ? "ring-1 ring-inset ring-current" : ""
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
