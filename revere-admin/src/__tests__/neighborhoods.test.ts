import { describe, it, expect, beforeEach } from "vitest";
import { collection, getDocs } from "firebase/firestore";
import {
  createNeighborhood,
  getNeighborhoods,
  checkSlugUnique,
  updateNeighborhood,
} from "@/lib/data/neighborhoods";
import { neighborhoodSchema, DeliveryDay } from "@/lib/validation/neighborhood";
import type { Neighborhood } from "@/lib/validation/neighborhood";
import { clearFirestoreEmulator } from "./firestoreTestUtils";
import { getDb } from "@/lib/firebase/client";

describe("M5 — Neighborhoods Data Layer", () => {
  beforeEach(async () => {
    await clearFirestoreEmulator();
  });

  const mockNeighborhood = {
    name: "Velha",
    slug: "velha",
    city: "Blumenau",
    state: "SC",
    status: "active" as const,
    deliveryFeeCents: 1500,
    freeShippingMinimumCents: 19900,
    deliveryDays: ["monday", "tuesday"] as DeliveryDay[],
    deliveryWindows: [
      { label: "Manhã", startTime: "08:00", endTime: "12:00", active: true },
    ],
    minimumLeadTimeDays: 5,
    sortOrder: 0,
  };

  it("should create a neighborhood correctly in cents", async () => {
    const created = await createNeighborhood(
      mockNeighborhood as unknown as Omit<
        Neighborhood,
        "id" | "createdAt" | "updatedAt"
      >,
    );
    expect(created.deliveryFeeCents).toBe(1500);
    expect(created.city).toBe("Blumenau");

    const snapshot = await getDocs(collection(getDb(), "neighborhoods"));
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0]?.data().slug).toBe("velha");
  });

  it("should prevent duplicate slugs", async () => {
    await createNeighborhood(
      mockNeighborhood as unknown as Omit<
        Neighborhood,
        "id" | "createdAt" | "updatedAt"
      >,
    );
    const isUnique = await checkSlugUnique("velha");
    expect(isUnique).toBe(false);
  });

  it("should fail Zod validation if endTime is before startTime", () => {
    const invalidWindow = {
      label: "Invalida",
      startTime: "12:00",
      endTime: "08:00",
      active: true,
    };
    const result = neighborhoodSchema.safeParse({
      ...mockNeighborhood,
      deliveryWindows: [invalidWindow],
    });
    expect(result.success).toBe(false);
  });

  it("should perform logical inactivation instead of physical delete", async () => {
    const created = await createNeighborhood({
      ...mockNeighborhood,
      slug: "to-inactivate",
    } as unknown as Omit<Neighborhood, "id" | "createdAt" | "updatedAt">);
    const updated = await updateNeighborhood(created.id, {
      status: "inactive",
    });
    expect(updated.status).toBe("inactive");
    const list = await getNeighborhoods();
    expect(list.find((n) => n.id === created.id)).toBeDefined();
  });
});
