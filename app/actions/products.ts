"use server"

import { db } from "@/lib/db"
import { products, stores } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function requireMyStore() {
  const user = await requireUser()
  const rows = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1)
  if (rows.length === 0) throw new Error("Je hebt nog geen winkel. Open eerst een kraam.")
  return rows[0]
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
}

async function uniqueProductSlug(base: string) {
  let slug = base || "product"
  let n = 1
  while (true) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1)
    if (existing.length === 0) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

async function syncProductCount(storeId: number) {
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.status, "published")))
  await db
    .update(stores)
    .set({ productCount: Number(rows[0]?.c ?? 0) })
    .where(eq(stores.id, storeId))
}

export type ProductInput = {
  name: string
  price: number
  oldPrice?: number | null
  category: string
  description?: string
  image?: string
  stock?: number
  status?: "draft" | "published"
}

export async function createProduct(input: ProductInput) {
  const store = await requireMyStore()
  const name = input.name.trim()
  if (!name) throw new Error("Productnaam is verplicht")
  if (!(input.price >= 0)) throw new Error("Ongeldige prijs")

  const discount =
    input.oldPrice && input.oldPrice > input.price
      ? Math.round(((input.oldPrice - input.price) / input.oldPrice) * 100)
      : null

  const slug = await uniqueProductSlug(slugify(name))
  const inserted = await db
    .insert(products)
    .values({
      slug,
      name,
      price: input.price,
      oldPrice: input.oldPrice ?? null,
      discount,
      image: input.image?.trim() || "/assorted-products-display.png",
      category: input.category || store.category,
      storeId: store.id,
      description: input.description ?? "",
      stock: input.stock ?? 1,
      status: input.status ?? "published",
    })
    .returning({ id: products.id, slug: products.slug })

  await syncProductCount(store.id)
  revalidatePath("/dashboard")
  revalidatePath(`/kramen/${store.slug}`)
  revalidatePath("/")
  return inserted[0]
}

export async function updateProduct(id: number, input: ProductInput) {
  const store = await requireMyStore()
  const owned = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.storeId, store.id)))
    .limit(1)
  if (owned.length === 0) throw new Error("Product niet gevonden")

  const discount =
    input.oldPrice && input.oldPrice > input.price
      ? Math.round(((input.oldPrice - input.price) / input.oldPrice) * 100)
      : null

  await db
    .update(products)
    .set({
      name: input.name.trim(),
      price: input.price,
      oldPrice: input.oldPrice ?? null,
      discount,
      category: input.category,
      description: input.description ?? "",
      image: input.image?.trim() || owned[0].image,
      stock: input.stock ?? owned[0].stock,
      status: input.status ?? owned[0].status,
    })
    .where(eq(products.id, id))

  await syncProductCount(store.id)
  revalidatePath("/dashboard")
  revalidatePath(`/kramen/${store.slug}`)
  revalidatePath(`/product/${owned[0].slug}`)
  return { ok: true }
}

export async function deleteProduct(id: number) {
  const store = await requireMyStore()
  await db.delete(products).where(and(eq(products.id, id), eq(products.storeId, store.id)))
  await syncProductCount(store.id)
  revalidatePath("/dashboard")
  revalidatePath(`/kramen/${store.slug}`)
  return { ok: true }
}

export async function duplicateProduct(id: number) {
  const store = await requireMyStore()
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.storeId, store.id)))
    .limit(1)
  if (rows.length === 0) throw new Error("Product niet gevonden")
  const p = rows[0]
  const slug = await uniqueProductSlug(slugify(p.name + "-kopie"))
  await db.insert(products).values({
    slug,
    name: p.name + " (kopie)",
    price: p.price,
    oldPrice: p.oldPrice,
    discount: p.discount,
    image: p.image,
    category: p.category,
    storeId: store.id,
    description: p.description,
    stock: p.stock,
    status: "draft",
  })
  await syncProductCount(store.id)
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function setProductStatus(id: number, status: "draft" | "published") {
  const store = await requireMyStore()
  await db
    .update(products)
    .set({ status })
    .where(and(eq(products.id, id), eq(products.storeId, store.id)))
  await syncProductCount(store.id)
  revalidatePath("/dashboard")
  revalidatePath(`/kramen/${store.slug}`)
  return { ok: true }
}
