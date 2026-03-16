import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
  return await db.query("orders").order("desc").collect();
});

export const add = mutation({
  args: {
    client: v.string(),
    phone: v.optional(v.string()),
    obs: v.optional(v.string()),
    deliveryDate: v.optional(v.string()),
    lines: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      qty: v.number(),
      filling: v.optional(v.string()),
    })),
    total: v.number(),
    status: v.string(),
    date: v.string(),
  },
  handler: async ({ db }, args) => {
    return await db.insert("orders", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    client: v.string(),
    phone: v.optional(v.string()),
    obs: v.optional(v.string()),
    deliveryDate: v.optional(v.string()),
    lines: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      price: v.number(),
      qty: v.number(),
      filling: v.optional(v.string()),
    })),
    total: v.number(),
  },
  handler: async ({ db }, { id, ...rest }) => {
    await db.patch(id, rest);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: v.string() },
  handler: async ({ db }, { id, status }) => {
    await db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});
