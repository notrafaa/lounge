"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-lounge-line bg-[#2a3444]/80 px-4 py-2 text-sm font-medium text-lounge-pearl transition hover:border-lounge-champagne/45 hover:bg-[#344052] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
