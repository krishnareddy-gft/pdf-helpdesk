import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = "default", onClose, className, ...props }, ref) => {
    const variantClasses = {
      default: "bg-card border-border",
      destructive: "bg-destructive text-destructive-foreground border-destructive",
      success: "bg-green-600 text-white border-green-600",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-4 shadow-xl max-w-sm w-full pointer-events-auto",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <div className="font-semibold text-sm mb-1">{title}</div>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
