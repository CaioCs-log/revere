export type TagStatus = "active" | "inactive"

export type TagType =
  | "nutrition"
  | "restriction"
  | "commercial"
  | "preference"
  | "operational"

export type Tag = {
  id: string
  name: string
  slug: string
  status: TagStatus
  type: TagType
  description: string | null
  color: string | null
  showInFilters: boolean
  showInProductCard: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function isPublicTag(tag: Tag): boolean {
  return tag.status === "active"
}
