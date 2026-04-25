import * as React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 ${className}`.trim()}
      {...props}
    />
  );
}
