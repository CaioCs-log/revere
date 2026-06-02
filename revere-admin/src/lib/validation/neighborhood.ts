import { z } from "zod";

export const deliveryDayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const deliveryWindowSchema = z
  .object({
    label: z.string().min(1, "Rótulo é obrigatório"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato HH:mm"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato HH:mm"),
    active: z.boolean().default(true),
  })
  .refine(
    (w) => {
      const [h1, m1] = w.startTime.split(":").map(Number);
      const [h2, m2] = w.endTime.split(":").map(Number);
      return h2 > h1 || (h2 === h1 && m2 > m1);
    },
    { message: "Horário de término deve ser após o início", path: ["endTime"] },
  );

export const neighborhoodSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    slug: z.string().min(1, "Slug é obrigatório").toLowerCase(),
    city: z.string().min(1, "Cidade é obrigatória").default("Blumenau"),
    state: z.string().length(2, "Estado deve ter 2 caracteres").default("SC"),
    status: z.enum(["active", "inactive"]).default("active"),
    deliveryFeeCents: z.number().int().min(0, "Taxa não pode ser negativa"),
    freeShippingMinimumCents: z
      .number()
      .int()
      .min(1, "Mínimo deve ser positivo")
      .nullable()
      .default(19900),
    deliveryDays: z
      .array(deliveryDayEnum)
      .min(1, "Selecione pelo menos um dia de entrega"),
    deliveryWindows: z
      .array(deliveryWindowSchema)
      .refine(
        (windows) => windows.some((w) => w.active),
        "Pelo menos uma janela de entrega deve estar ativa",
      ),
    minimumLeadTimeDays: z.number().int().min(0).default(5),
    sortOrder: z.number().int().default(0),
  })
  .refine(
    (data) => {
      if (data.status === "active") {
        return (
          data.deliveryDays.length > 0 &&
          data.deliveryWindows.some((w) => w.active)
        );
      }
      return true;
    },
    {
      message:
        "Bairros ativos precisam de pelo menos um dia e uma janela de entrega ativos.",
      path: ["status"],
    },
  );

export type DeliveryDay = z.infer<typeof deliveryDayEnum>;
export type DeliveryWindow = z.infer<typeof deliveryWindowSchema>;
export type Neighborhood = z.infer<typeof neighborhoodSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
