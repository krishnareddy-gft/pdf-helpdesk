import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

const Loading: React.FC<LoadingProps> = ({ size = "md", className, text }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          <div className={cn("absolute inset-0 rounded-full border-2 border-primary/20", sizeClasses[size])}></div>
        </div>
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    </div>
  )
}

export { Loading }
