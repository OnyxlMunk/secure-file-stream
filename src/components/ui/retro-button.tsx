
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const retroButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold font-pixel ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-retro-pink to-retro-purple text-white shadow-neomorphic-outset hover:shadow-neomorphic-pressed border-2 border-retro-pink/20",
        cyber: "bg-gradient-to-r from-retro-cyan to-retro-green text-black shadow-neomorphic-outset hover:shadow-neomorphic-pressed border-2 border-retro-cyan/20",
        outline: "border-2 border-retro-purple bg-transparent text-retro-purple shadow-neomorphic-inset hover:bg-retro-purple/10",
        ghost: "bg-transparent text-retro-pink hover:bg-retro-pink/10 hover:text-retro-purple",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof retroButtonVariants> {
  asChild?: boolean
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(retroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
RetroButton.displayName = "RetroButton"

export { RetroButton, retroButtonVariants }
