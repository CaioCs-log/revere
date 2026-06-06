type ContainerVariant = "default" | "narrow" | "wide"

type ContainerProps = {
  variant?: ContainerVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<ContainerVariant, string> = {
  default: "mx-auto max-w-6xl",
  narrow: "mx-auto max-w-3xl",
  wide: "mx-auto max-w-7xl",
}

export function Container({
  variant = "default",
  className = "",
  children,
}: ContainerProps) {
  const styles = [variantStyles[variant], className].filter(Boolean).join(" ")

  return <div className={styles}>{children}</div>
}
