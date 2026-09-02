"use client"

import { memo } from "react"
import { cn } from "../../lib/utils"

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string
  children: React.ReactNode
}

const keyframesStyle = `
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`

const GradientText = memo(function GradientText({
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframesStyle }} />
      <span
        className={cn("inline-block text-transparent bg-clip-text pb-1", className)}
        style={{
          backgroundImage: "linear-gradient(90deg, #cc0000, #1a1a1a, #ff3333, #000000, #cc0000)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 4s ease infinite",
        }}
        {...props}
      >
        {children}
      </span>
    </>
  )
})

GradientText.displayName = "GradientText"

export { GradientText }
export default GradientText
