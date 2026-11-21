"use client";

import type { ReactNode } from "react";

/** Submit button that asks for confirmation first (for deletes). */
export function ConfirmButton({ message, children, className = "" }: { message: string; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={`action rounded-sm border border-danger/50 px-4 py-2.5 text-danger transition-colors hover:bg-danger/10 ${className}`}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
