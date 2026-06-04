import type { ImageMode } from "./product"

export type SiteContentStatus = "draft" | "published" | "inactive" | "archived"

export type SiteContentType =
  | "home_hero"
  | "home_how_it_works"
  | "home_product_highlight"
  | "home_kit_highlight"
  | "home_category_highlight"
  | "campaign_banner"
  | "notice"
  | "delivery_info"
  | "checkout_notice"
  | "final_cta"
  | "faq_preview"
  | "social_proof"
  | "generic"

export type SiteContentDisplayRules = {
  startsAt: string | null
  endsAt: string | null
  priority: number
  showOnHome: boolean
  showOnCheckout: boolean
  showOnCatalog: boolean
}

export type SiteContentBlock = {
  id: string
  key: string
  status: SiteContentStatus
  type: SiteContentType
  title: string | null
  subtitle: string | null
  body: string | null
  imageId: string | null
  imageAlt: string | null
  imageMode: ImageMode
  ctaLabel: string | null
  ctaHref: string | null
  linkedProductIds: string[]
  linkedCategoryIds: string[]
  linkedKitPresetIds: string[]
  displayRules: SiteContentDisplayRules
  metadata: Record<string, unknown>
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export function isPublishedSiteContent(
  block: SiteContentBlock,
  now: Date = new Date()
): boolean {
  if (block.status !== "published") return false
  if (!block.displayRules.showOnHome) return false

  const { startsAt, endsAt } = block.displayRules
  const nowIso = now.toISOString()

  if (startsAt && startsAt > nowIso) return false
  if (endsAt && endsAt < nowIso) return false

  return true
}
