export type CategoryStatus = "active" | "inactive"

export type Category = {
  id: string
  name: string
  slug: string
  status: CategoryStatus
  description: string | null
  parentCategoryId: string | null
  imageId: string | null
  showInMenu: boolean
  showInHome: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function isPublicCategory(category: Category): boolean {
  return category.status === "active"
}
