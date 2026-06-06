type SectionVariant = "default" | "muted" | "brand"

type SectionProps = {
  variant?: SectionVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<SectionVariant, string> = {
  default: "bg-white px-6 py-20",
  muted: "bg-zinc-50 px-6 py-20",
  brand: "bg-brand-700 px-6 py-24 text-white",
}

export function Section({
  variant = "default",
  className = "",
  children,
}: SectionProps) {
  const styles = [variantStyles[variant], className].filter(Boolean).join(" ")

  return <section className={styles}>{children}</section>
}
