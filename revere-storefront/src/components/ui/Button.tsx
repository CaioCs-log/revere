type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-500",
  secondary: "bg-white text-brand-800 hover:bg-brand-50",
  outline: "border border-brand-600 text-brand-700 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-sm font-medium",
  md: "px-8 py-3 text-base font-semibold",
  lg: "px-10 py-4 text-lg font-semibold",
}

const focusStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"

export function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
}: ButtonProps) {
  const styles = [
    "inline-block rounded-full transition-colors",
    variantStyles[variant],
    sizeStyles[size],
    focusStyles,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    )
  }

  return <button className={styles}>{children}</button>
}
