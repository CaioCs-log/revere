type ImagePlaceholderProps = {
  className?: string
}

export function ImagePlaceholder({ className = "" }: ImagePlaceholderProps) {
  return (
    <div
      className={`from-brand-100 to-brand-50 aspect-[4/3] rounded-lg bg-gradient-to-br ${className}`}
    />
  )
}
