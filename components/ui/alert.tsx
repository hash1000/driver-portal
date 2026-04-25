import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Alert({ className = "", ...props }: DivProps) {
  return <div className={`rounded-lg border border-emerald-200 bg-emerald-50 p-4 ${className}`.trim()} {...props} />;
}

export function AlertTitle({ className = "", ...props }: DivProps) {
  return <h4 className={`text-sm font-semibold text-emerald-800 ${className}`.trim()} {...props} />;
}

export function AlertDescription({ className = "", ...props }: DivProps) {
  return <p className={`mt-1 text-sm text-emerald-700 ${className}`.trim()} {...props} />;
}
