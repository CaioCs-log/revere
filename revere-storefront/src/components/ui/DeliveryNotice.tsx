import { InfoPanel } from "./InfoPanel"

type DeliveryNoticeProps = {
  title: string | null
  subtitle: string | null
  body: string | null
}

export function DeliveryNotice({ title, subtitle, body }: DeliveryNoticeProps) {
  return (
    <div className="text-center">
      {title && <h2 className="text-3xl font-bold text-zinc-900">{title}</h2>}
      {subtitle && <p className="mt-2 text-zinc-600">{subtitle}</p>}
      {body && <InfoPanel className="mt-6">{body}</InfoPanel>}
    </div>
  )
}
