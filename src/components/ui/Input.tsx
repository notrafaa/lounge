import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-10 w-full rounded-md border border-white/15 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-lounge-mist/60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-md border border-white/15 bg-black/20 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-lounge-mist/60",
        className
      )}
      {...props}
    />
  );
}

