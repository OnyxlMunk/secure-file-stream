
import * as React from "react"
import { cn } from "@/lib/utils"

const NeomorphicCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'inset' | 'pressed'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const shadowClass = {
    default: 'shadow-neomorphic-outset',
    inset: 'shadow-neomorphic-inset',
    pressed: 'shadow-neomorphic-pressed'
  }[variant]

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-0 text-card-foreground transition-all duration-300",
        shadowClass,
        className
      )}
      {...props}
    />
  )
})
NeomorphicCard.displayName = "NeomorphicCard"

const NeomorphicCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
NeomorphicCardHeader.displayName = "NeomorphicCardHeader"

const NeomorphicCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight font-retro text-retro-purple",
      className
    )}
    {...props}
  />
))
NeomorphicCardTitle.displayName = "NeomorphicCardTitle"

const NeomorphicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-pixel", className)}
    {...props}
  />
))
NeomorphicCardDescription.displayName = "NeomorphicCardDescription"

const NeomorphicCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
NeomorphicCardContent.displayName = "NeomorphicCardContent"

const NeomorphicCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
NeomorphicCardFooter.displayName = "NeomorphicCardFooter"

export { 
  NeomorphicCard, 
  NeomorphicCardHeader, 
  NeomorphicCardFooter, 
  NeomorphicCardTitle, 
  NeomorphicCardDescription, 
  NeomorphicCardContent 
}
