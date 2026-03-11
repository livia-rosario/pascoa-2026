import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async ({ db }) => {
  return await db.query("products").collect();
});

export const add = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    desc: v.string(),
    hasFillings: v.boolean(),
    fillings: v.array(v.string()),
  },
  handler: async ({ db }, args) => {
    return await db.insert("products", args);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});

export const seed = mutation(async ({ db }) => {
  const existing = await db.query("products").collect();
  if (existing.length > 0) return;
  await db.insert("products", {
    name: "Petisqueira Coelhinho",
    price: 79,
    desc: "4 mini ovos, Marshmallow, Morango e Uva, Mini Oreo, Bala Fini, Granulado, Confete, Recheio de Brigadeiro",
    hasFillings: false,
    fillings: [],
  });
  await db.insert("products", {
    name: "Ovo Plano Nuts",
    price: 49,
    desc: "Chocolate nobre coberto com mix de nuts e frutas secas",
    hasFillings: false,
    fillings: [],
  });
  await db.insert("products", {
    name: "Ovo Plano Recheado",
    price: 55,
    desc: "Chocolate nobre com recheio à escolha",
    hasFillings: true,
    fillings: [
      "Baunilha & Geleia de Frutas Vermelhas",
      "Ferrero Rocher",
      "Nozes & Doce de Leite",
      "Cocada Cremosa",
      "Caramelo Salgado & Speculoos Crocante",
    ],
  });
});
