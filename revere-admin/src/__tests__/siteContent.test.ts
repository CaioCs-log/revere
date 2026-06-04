import { beforeEach, describe, expect, it } from "vitest";
import {
  createSiteContent,
  getSiteContents,
  getSiteContentById,
  updateSiteContent,
  updateSiteContentStatus,
  archiveSiteContent,
  publishSiteContent,
  unpublishSiteContent,
  resetSiteContents,
} from "@/lib/data/siteContent";
import {
  siteContentSchema,
  SiteContentInput,
} from "@/lib/validation/siteContent";

const buildInput = (
  overrides: Partial<SiteContentInput> = {},
): SiteContentInput => ({
  key: `test-${Math.random().toString(36).slice(2, 8)}`,
  type: "home_hero",
  status: "draft",
  title: "Título de teste",
  subtitle: "Subtítulo de teste",
  body: "Corpo do texto de teste",
  imageId: null,
  imageAlt: null,
  imageMode: "brand_placeholder",
  ctaLabel: null,
  ctaHref: null,
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
  ...overrides,
});

describe("M7 — SiteContent Data Layer", () => {
  beforeEach(() => {
    resetSiteContents();
  });

  it("should create a site content block", async () => {
    const input = buildInput({ key: "test-hero" });
    const created = await createSiteContent(input);

    expect(created.id).toBeDefined();
    expect(created.key).toBe("test-hero");
    expect(created.status).toBe("draft");
    expect(created.createdBy).toBeDefined();
    expect(created.createdAt).toBeDefined();
  });

  it("should create a block with published status and set publishedAt", async () => {
    const input = buildInput({
      key: "test-published",
      status: "published",
    });
    const created = await createSiteContent(input);

    expect(created.status).toBe("published");
    expect(created.publishedAt).toBeDefined();
  });

  it("should reject duplicate keys", async () => {
    const input = buildInput({ key: "key-duplicada" });
    await createSiteContent(input);

    await expect(createSiteContent(input)).rejects.toThrow("Key já existe");
  });

  it("should get site contents excluding archived", async () => {
    const draft = await createSiteContent(buildInput({ key: "draft-block" }));
    const published = await createSiteContent(
      buildInput({ key: "pub-block", status: "published" }),
    );
    await createSiteContent(
      buildInput({ key: "archive-block", status: "archived" }),
    );

    const items = await getSiteContents();
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === draft.id)).toBeDefined();
    expect(items.find((i) => i.id === published.id)).toBeDefined();
  });

  it("should get site content by id", async () => {
    const created = await createSiteContent(buildInput({ key: "get-by-id" }));
    const found = await getSiteContentById(created.id);
    expect(found).toBeDefined();
    expect(found?.key).toBe("get-by-id");
  });

  it("should update site content", async () => {
    const created = await createSiteContent(
      buildInput({ key: "to-update", title: "Old Title" }),
    );
    const updated = await updateSiteContent(created.id, {
      title: "New Title",
    });

    expect(updated.title).toBe("New Title");
    expect(updated.updatedAt).not.toBe(created.updatedAt);
  });

  it("should reject duplicate key on create", async () => {
    await createSiteContent(buildInput({ key: "my-unique-key" }));
    await expect(
      createSiteContent(buildInput({ key: "my-unique-key" })),
    ).rejects.toThrow("Key já existe");
  });

  it("should reject duplicate key on update", async () => {
    const first = await createSiteContent(
      buildInput({ key: "existing-key-1" }),
    );
    const second = await createSiteContent(buildInput({ key: "my-block-1" }));

    const firstId = first.id;
    const secondId = second.id;

    // Ensure they are different IDs
    expect(firstId).not.toBe(secondId);
    expect(first.key).toBe("existing-key-1");
    expect(second.key).toBe("my-block-1");

    // Verify the internal state by reading back
    const all = await getSiteContents();
    expect(all).toHaveLength(2);

    // Now try the update that should fail
    await expect(
      updateSiteContent(secondId, { key: "existing-key-1" }),
    ).rejects.toThrow("Key já existe");
  });

  it("should change status via updateSiteContentStatus", async () => {
    const created = await createSiteContent(
      buildInput({ key: "status-test", status: "draft" }),
    );

    const published = await updateSiteContentStatus(created.id, "published");
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeDefined();

    const inactive = await updateSiteContentStatus(created.id, "inactive");
    expect(inactive.status).toBe("inactive");
    expect(inactive.publishedAt).toBeNull();
  });

  it("should publish and unpublish correctly", async () => {
    const created = await createSiteContent(
      buildInput({ key: "pub-unpub-test" }),
    );

    const published = await publishSiteContent(created.id);
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeDefined();

    const unpublished = await unpublishSiteContent(created.id);
    expect(unpublished.status).toBe("draft");
    expect(unpublished.publishedAt).toBeNull();
  });

  it("should archive and exclude from list", async () => {
    const created = await createSiteContent(buildInput({ key: "archivable" }));

    await archiveSiteContent(created.id);
    const items = await getSiteContents();
    expect(items.find((i) => i.id === created.id)).toBeUndefined();
  });

  it("should validate CTA requires both label and href", () => {
    const valid = siteContentSchema.safeParse(
      buildInput({ ctaLabel: "Ver", ctaHref: "/ver" }),
    );
    expect(valid.success).toBe(true);

    const missingHref = siteContentSchema.safeParse(
      buildInput({ ctaLabel: "Ver", ctaHref: null }),
    );
    expect(missingHref.success).toBe(false);

    const missingLabel = siteContentSchema.safeParse(
      buildInput({ ctaLabel: null, ctaHref: "/ver" }),
    );
    expect(missingLabel.success).toBe(false);
  });

  it("should validate key as required", () => {
    const result = siteContentSchema.safeParse({
      ...buildInput({ key: "" }),
      key: "",
    });
    expect(result.success).toBe(false);
  });

  it("should validate type as required", () => {
    const result = siteContentSchema.safeParse({
      ...buildInput(),
      type: undefined,
    });
    expect(result.success).toBe(false);
  });
});
