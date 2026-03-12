import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.number(),
    desc: v.string(),
    hasFillings: v.boolean(),
    fillings: v.array(v.string()),
  }),

  orders: defineTable({
    client: v.string(),
    phone: v.optional(v.string()),
    obs: v.optional(v.string()),
    lines: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      qty: v.number(),
      filling: v.optional(v.string()),
    })),
    total: v.number(),
    status: v.string(), // Pendente | Pago | Pronto | Entregue
    date: v.string(),
    deliveryDate: v.optional(v.string()),
  }),
});
