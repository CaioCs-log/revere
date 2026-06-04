import { AuditFields } from "../audit/auditFields";

export type SiteContentStatus = "draft" | "published" | "inactive" | "archived";

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
  | "generic";

export type ImageMode =
  | "real_photo"
  | "brand_placeholder"
  | "editorial"
  | "illustration";

export interface DisplayRules {
  startsAt: string | null;
  endsAt: string | null;
  priority: number;
  showOnHome: boolean;
  showOnCheckout: boolean;
  showOnCatalog: boolean;
}

export interface SiteContent extends AuditFields {
  id: string;
  key: string;
  status: SiteContentStatus;
  type: SiteContentType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageId: string | null;
  imageAlt: string | null;
  imageMode: ImageMode;
  ctaLabel: string | null;
  ctaHref: string | null;
  linkedProductIds: string[];
  linkedCategoryIds: string[];
  linkedKitPresetIds: string[];
  displayRules: DisplayRules;
  metadata: Record<string, unknown>;
  publishedAt: string | null;
}
