import * as React from "react";

type ButtonVariant = "default" | "outline";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const palette =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
      : "bg-slate-900 text-white hover:bg-slate-800";

  return <button className={`${base} ${palette} ${className}`.trim()} {...props} />;
}
