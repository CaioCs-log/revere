import type { Pillar } from "@/types/site-content"

type Props = {
  pillars: Pillar[]
  className?: string
}

export function TrustBlock({ pillars, className = "" }: Props) {
  return (
    <div
      className={`bg-surface-base border-border rounded-lg border p-8 ${className}`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-text-main mb-4 text-3xl font-bold">
            Por que confiar
          </h2>
          <p className="text-text-muted mx-auto max-w-2xl font-sans text-lg">
            Transparência não é discurso, é como a gente cozinha.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <div key={index} className="text-center">
              <div className="bg-brand-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <span className="text-surface-strong text-lg font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-display text-text-main mb-2 text-xl font-bold">
                {pillar.title}
              </h3>
              <p className="text-text-muted font-sans">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
