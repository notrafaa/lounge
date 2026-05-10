"use client";

import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  title,
  open,
  onClose,
  children
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="glass w-full max-w-lg rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button onClick={onClose} aria-label="Fermer" className="h-9 w-9 px-0">
            <X size={16} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

