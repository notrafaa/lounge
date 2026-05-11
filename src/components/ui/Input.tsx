import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "min-h-10 w-full rounded-md border border-lounge-line bg-[#151b24]/72 px-3 text-sm text-lounge-pearl outline-none transition placeholder:text-white/35 focus:border-lounge-champagne/55",
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
        "w-full rounded-md border border-lounge-line bg-[#151b24]/72 px-3 py-3 text-sm text-lounge-pearl outline-none transition placeholder:text-white/35 focus:border-lounge-champagne/55",
        className
      )}
      {...props}
    />
  );
}
