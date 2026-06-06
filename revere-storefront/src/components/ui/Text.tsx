type TextVariant = "body" | "muted" | "caption" | "eyebrow"

type TextProps = {
  variant?: TextVariant
  className?: string
  children: React.ReactNode
  as?: "p" | "span" | "div"
}

const variantStyles: Record<TextVariant, string> = {
  body: "text-base text-text-main",
  muted: "text-base text-text-muted",
  caption: "text-sm text-text-muted",
  eyebrow: "text-sm font-semibold uppercase tracking-widest text-brand-600",
}

export function Text({
  variant = "body",
  className = "",
  children,
  as: Tag = "p",
}: TextProps) {
  const styles = [variantStyles[variant], className].filter(Boolean).join(" ")
  return <Tag className={styles}>{children}</Tag>
}
