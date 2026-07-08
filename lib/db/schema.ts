import { pgTable, text, timestamp, boolean, serial, integer, doublePrecision, unique } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  // Rollen: "user" | "admin" | "superadmin"
  role: text("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // Soort verkoper: "kraam" | "winkel" | "bedrijf"
  type: text("type").notNull().default("kraam"),
  location: text("location").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  productCount: integer("productCount").notNull().default(0),
  followers: text("followers").notNull().default("0"),
  badge: text("badge"),
  logoText: text("logoText").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  ownerId: text("ownerId"),
  bannerImage: text("bannerImage"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  plan: text("plan").notNull().default("gratis"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("oldPrice"),
  discount: integer("discount"),
  image: text("image").notNull(),
  category: text("category").notNull(),
  storeId: integer("storeId").notNull(),
  description: text("description").notNull().default(""),
  stock: integer("stock").notNull().default(1),
  status: text("status").notNull().default("published"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull(),
    productId: integer("productId").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqUserProduct: unique().on(t.userId, t.productId),
  }),
)

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  storeId: integer("storeId"),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("active"),
  price: doublePrecision("price").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  status: text("status").notNull().default("nieuw"),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  shipping: doublePrecision("shipping").notNull().default(0),
  tax: doublePrecision("tax").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  paymentMethod: text("paymentMethod"),
  shippingName: text("shippingName"),
  shippingAddress: text("shippingAddress"),
  shippingPostal: text("shippingPostal"),
  shippingCity: text("shippingCity"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId"),
  storeId: integer("storeId").notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  image: text("image"),
})

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    storeId: integer("storeId").notNull(),
    productId: integer("productId"),
    userId: text("userId").notNull(),
    authorName: text("authorName").notNull(),
    rating: integer("rating").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqUserStore: unique().on(t.userId, t.storeId),
  }),
)

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull(),
    storeId: integer("storeId").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqUserStore: unique().on(t.userId, t.storeId),
  }),
)

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull(),
    productId: integer("productId").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqUserProduct: unique().on(t.userId, t.productId),
  }),
)

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    buyerId: text("buyerId").notNull(),
    storeId: integer("storeId").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqBuyerStore: unique().on(t.buyerId, t.storeId),
  }),
)

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  senderId: text("senderId").notNull(),
  senderRole: text("senderRole").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  readAt: timestamp("readAt"),
})

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// --- Support (interne chat tussen gebruikers en admins) --------------------

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("algemeen"),
  status: text("status").notNull().default("open"), // open | in_behandeling | gesloten
  priority: text("priority").notNull().default("normaal"), // laag | normaal | hoog
  assignedTo: text("assignedTo"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticketId").notNull(),
  senderId: text("senderId").notNull(),
  senderRole: text("senderRole").notNull(), // user | admin
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  readByUser: boolean("readByUser").notNull().default(false),
  readByAdmin: boolean("readByAdmin").notNull().default(false),
})

// --- Live aanwezigheid (echte bezoekers per kraam) -------------------------
// Elke actieve bezoeker stuurt een heartbeat met een anonieme token.
// Een kraam is "actief bekeken" als er een rij is met lastSeen in de recente venstertijd.

export const storePresence = pgTable(
  "store_presence",
  {
    id: serial("id").primaryKey(),
    storeId: integer("storeId").notNull(),
    token: text("token").notNull(),
    lastSeen: timestamp("lastSeen").notNull().defaultNow(),
  },
  (t) => ({
    uniqStoreToken: unique("store_presence_store_token_unique").on(t.storeId, t.token),
  }),
)
