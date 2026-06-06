import React from "react"

type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6"
type HeadingVariant = "display" | "section" | "card"

type HeadingProps = {
  level: HeadingLevel
  variant?: HeadingVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<HeadingVariant, string> = {
  display: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
  section: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
  card: "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight",
}

const levelStyles: Record<HeadingLevel, string> = {
  "1": "text-4xl sm:text-5xl lg:text-6xl",
  "2": "text-3xl sm:text-4xl lg:text-5xl",
  "3": "text-2xl sm:text-3xl lg:text-4xl",
  "4": "text-xl sm:text-2xl lg:text-3xl",
  "5": "text-lg sm:text-xl lg:text-2xl",
  "6": "text-base sm:text-lg lg:text-xl",
}

const HeadingTagMap: Record<HeadingLevel, keyof React.JSX.IntrinsicElements> = {
  "1": "h1",
  "2": "h2",
  "3": "h3",
  "4": "h4",
  "5": "h5",
  "6": "h6",
}

export function Heading({
  level,
  variant = "section",
  className = "",
  children,
}: HeadingProps) {
  const baseClasses = "font-display text-text-main"
  const variantClass = variantStyles[variant]
  const levelClass = levelStyles[level]

  const combinedClasses = [baseClasses, variantClass, levelClass, className]
    .filter(Boolean)
    .join(" ")

  const HeadingTag = HeadingTagMap[level]

  return React.createElement(
    HeadingTag,
    { className: combinedClasses },
    children
  )
}
