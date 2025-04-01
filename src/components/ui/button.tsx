
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 sm:h-9",
        lg: "h-10 rounded-md px-6 sm:h-11 sm:px-8",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
      },
      hasIcon: {
        true: "",
        false: "",
      }
    },
    compoundVariants: [
      {
        hasIcon: true,
        size: "default",
        className: "gap-2",
      },
      {
        hasIcon: true,
        size: "sm",
        className: "gap-1.5",
      },
      {
        hasIcon: true,
        size: "lg",
        className: "gap-2.5",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      hasIcon: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  hasIcon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, hasIcon, asChild = false, ...props }, ref) => {
    // Check if the button has svg children to auto-detect icons
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [autoDetectedHasIcon, setAutoDetectedHasIcon] = React.useState(false);

    React.useEffect(() => {
      if (buttonRef.current) {
        const hasSvg = buttonRef.current.querySelector('svg') !== null;
        setAutoDetectedHasIcon(hasSvg);
      }
    }, [props.children]);
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          hasIcon: hasIcon !== undefined ? hasIcon : autoDetectedHasIcon,
          className 
        }))}
        ref={(node) => {
          // Assign both refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          buttonRef.current = node;
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
