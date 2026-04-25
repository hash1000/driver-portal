import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: DivProps) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={`p-5 pb-2 ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = "", ...props }: DivProps) {
  return <h3 className={`text-lg font-semibold text-slate-900 ${className}`.trim()} {...props} />;
}

export function CardDescription({ className = "", ...props }: DivProps) {
  return <p className={`mt-1 text-sm text-slate-500 ${className}`.trim()} {...props} />;
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={`p-5 pt-2 ${className}`.trim()} {...props} />;
}
