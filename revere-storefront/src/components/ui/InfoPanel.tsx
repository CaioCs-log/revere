type InfoPanelProps = {
  className?: string
  children: React.ReactNode
}

export function InfoPanel({ className = "", children }: InfoPanelProps) {
  const styles = [
    "rounded-[var(--radius-card)] border border-zinc-200 bg-white p-6 text-left text-zinc-700",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={styles}>{children}</div>
}
