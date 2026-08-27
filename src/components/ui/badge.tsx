import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-slate-900 text-white": variant === "default",
          "border-transparent bg-slate-100 text-slate-900": variant === "secondary",
          "text-slate-950": variant === "outline",
          "border-transparent bg-red-100 text-red-800": variant === "destructive",
          "border-transparent bg-green-100 text-green-800": variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
