import { createAuditFields, updateAuditFields } from "@/lib/audit/auditFields";
import { getCurrentUser } from "@/lib/auth/adminAuth";
import {
  SiteContent,
  SiteContentType,
  SiteContentStatus,
} from "@/lib/firebase/siteContent";
import { SiteContentInput } from "@/lib/validation/siteContent";

let idCounter = 0;

const siteContents: SiteContent[] = [
  {
    id: "sc-hero-1",
    key: "homeHero",
    status: "published",
    type: "home_hero",
    title: "Comida que abraça sua rotina",
    subtitle: "Refeições congeladas saudáveis, práticas e deliciosas.",
    body: null,
    imageId: null,
    imageAlt: "Banner principal da Revere",
    imageMode: "brand_placeholder",
    ctaLabel: "Ver cardápio",
    ctaHref: "/cardapio",
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedKitPresetIds: [],
    displayRules: {
      startsAt: null,
      endsAt: null,
      priority: 10,
      showOnHome: true,
      showOnCheckout: false,
      showOnCatalog: false,
    },
    metadata: {},
    publishedAt: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "sc-how-1",
    key: "homeHowItWorks",
    status: "published",
    type: "home_how_it_works",
    title: "Como funciona",
    subtitle: "Simples, rápido e sem desperdício.",
    body: null,
    imageId: null,
    imageAlt: null,
    imageMode: "illustration",
    ctaLabel: null,
    ctaHref: null,
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedKitPresetIds: [],
    displayRules: {
      startsAt: null,
      endsAt: null,
      priority: 20,
      showOnHome: true,
      showOnCheckout: false,
      showOnCatalog: false,
    },
    metadata: {},
    publishedAt: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "sc-delivery-1",
    key: "deliveryInfo",
    status: "published",
    type: "delivery_info",
    title: "Entrega em Blumenau",
    subtitle: null,
    body: "Entregamos em Blumenau de segunda a sábado. Pedidos com até 5 dias de antecedência.",
    imageId: null,
    imageAlt: null,
    imageMode: "illustration",
    ctaLabel: null,
    ctaHref: null,
    linkedProductIds: [],
    linkedCategoryIds: [],
    linkedKitPresetIds: [],
    displayRules: {
      startsAt: null,
      endsAt: null,
      priority: 60,
      showOnHome: true,
      showOnCheckout: true,
      showOnCatalog: false,
    },
    metadata: {},
    publishedAt: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "system",
  },
];

const isKeyUnique = (key: string, excludeId?: string): boolean => {
  return !siteContents.some((sc) => sc.key === key && sc.id !== excludeId);
};

export const getSiteContents = async (): Promise<SiteContent[]> => {
  return Promise.resolve(siteContents.filter((sc) => sc.status !== "archived"));
};

export const getSiteContentById = async (
  id: string,
): Promise<SiteContent | undefined> => {
  return Promise.resolve(siteContents.find((sc) => sc.id === id));
};

export const createSiteContent = async (
  data: SiteContentInput,
): Promise<SiteContent> => {
  if (!isKeyUnique(data.key)) {
    throw new Error("Key já existe. Escolha uma key diferente.");
  }

  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const now = new Date();

  const newSiteContent: SiteContent = {
    id: `sc-${Date.now()}-${++idCounter}`,
    key: data.key,
    status: data.status,
    type: data.type as SiteContentType,
    title: data.title,
    subtitle: data.subtitle,
    body: data.body,
    imageId: data.imageId,
    imageAlt: data.imageAlt,
    imageMode: data.imageMode as SiteContent["imageMode"],
    ctaLabel: data.ctaLabel,
    ctaHref: data.ctaHref,
    linkedProductIds: data.linkedProductIds,
    linkedCategoryIds: data.linkedCategoryIds,
    linkedKitPresetIds: data.linkedKitPresetIds,
    displayRules: {
      startsAt: data.displayRules.startsAt,
      endsAt: data.displayRules.endsAt,
      priority: data.displayRules.priority ?? 0,
      showOnHome: data.displayRules.showOnHome ?? false,
      showOnCheckout: data.displayRules.showOnCheckout ?? false,
      showOnCatalog: data.displayRules.showOnCatalog ?? false,
    },
    metadata: data.metadata ?? {},
    publishedAt: data.status === "published" ? now.toISOString() : null,
    ...createAuditFields(userId),
  };

  siteContents.push(newSiteContent);
  return Promise.resolve(newSiteContent);
};

export const updateSiteContent = async (
  id: string,
  data: Partial<SiteContentInput>,
): Promise<SiteContent> => {
  const index = siteContents.findIndex((sc) => sc.id === id);
  if (index === -1) {
    throw new Error("Conteúdo não encontrado.");
  }

  if (data.key && !isKeyUnique(data.key, id)) {
    throw new Error("Key já existe. Escolha uma key diferente.");
  }

  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const now = new Date();

  const updatedSiteContent: SiteContent = {
    ...siteContents[index],
    key: data.key ?? siteContents[index].key,
    status: (data.status ?? siteContents[index].status) as SiteContentStatus,
    type: (data.type ?? siteContents[index].type) as SiteContentType,
    title: data.title !== undefined ? data.title : siteContents[index].title,
    subtitle:
      data.subtitle !== undefined
        ? data.subtitle
        : siteContents[index].subtitle,
    body: data.body !== undefined ? data.body : siteContents[index].body,
    imageId:
      data.imageId !== undefined ? data.imageId : siteContents[index].imageId,
    imageAlt:
      data.imageAlt !== undefined
        ? data.imageAlt
        : siteContents[index].imageAlt,
    imageMode: (data.imageMode ??
      siteContents[index].imageMode) as SiteContent["imageMode"],
    ctaLabel:
      data.ctaLabel !== undefined
        ? data.ctaLabel
        : siteContents[index].ctaLabel,
    ctaHref:
      data.ctaHref !== undefined ? data.ctaHref : siteContents[index].ctaHref,
    linkedProductIds:
      data.linkedProductIds ?? siteContents[index].linkedProductIds,
    linkedCategoryIds:
      data.linkedCategoryIds ?? siteContents[index].linkedCategoryIds,
    linkedKitPresetIds:
      data.linkedKitPresetIds ?? siteContents[index].linkedKitPresetIds,
    displayRules: {
      startsAt:
        data.displayRules?.startsAt !== undefined
          ? data.displayRules.startsAt
          : siteContents[index].displayRules.startsAt,
      endsAt:
        data.displayRules?.endsAt !== undefined
          ? data.displayRules.endsAt
          : siteContents[index].displayRules.endsAt,
      priority:
        data.displayRules?.priority ??
        siteContents[index].displayRules.priority,
      showOnHome:
        data.displayRules?.showOnHome ??
        siteContents[index].displayRules.showOnHome,
      showOnCheckout:
        data.displayRules?.showOnCheckout ??
        siteContents[index].displayRules.showOnCheckout,
      showOnCatalog:
        data.displayRules?.showOnCatalog ??
        siteContents[index].displayRules.showOnCatalog,
    },
    metadata: data.metadata ?? siteContents[index].metadata,
    publishedAt:
      data.status === "published" && siteContents[index].status !== "published"
        ? now.toISOString()
        : data.status !== "published" &&
            siteContents[index].status === "published"
          ? null
          : siteContents[index].publishedAt,
    ...updateAuditFields(userId),
  };

  siteContents[index] = updatedSiteContent;
  return Promise.resolve(updatedSiteContent);
};

export const updateSiteContentStatus = async (
  id: string,
  status: SiteContentStatus,
): Promise<SiteContent> => {
  return updateSiteContent(id, { status });
};

export const publishSiteContent = async (id: string): Promise<SiteContent> => {
  return updateSiteContentStatus(id, "published");
};

export const unpublishSiteContent = async (
  id: string,
): Promise<SiteContent> => {
  return updateSiteContentStatus(id, "draft");
};

export const archiveSiteContent = async (id: string): Promise<SiteContent> => {
  return updateSiteContentStatus(id, "archived");
};

export const resetSiteContents = () => {
  siteContents.length = 0;
  idCounter = 0;
};
