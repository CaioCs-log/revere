type CardVariant = "default" | "muted"

type CardProps = {
  variant?: CardVariant
  href?: string
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white",
  muted: "bg-zinc-50",
}

export function Card({
  variant = "default",
  href,
  className = "",
  children,
}: CardProps) {
  const base = "rounded-xl border border-zinc-200"
  const interactive = href ? "group transition-shadow hover:shadow-lg" : ""
  const styles = [base, variantStyles[variant], interactive, className]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    )
  }

  return <div className={styles}>{children}</div>
}
