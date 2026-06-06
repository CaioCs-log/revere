type StepItemProps = {
  number: number
  label: string
  description: string
}

export function StepItem({ number, label, description }: StepItemProps) {
  return (
    <div className="text-center">
      <div className="bg-brand-100 text-brand-700 mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900">{label}</h3>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </div>
  )
}
