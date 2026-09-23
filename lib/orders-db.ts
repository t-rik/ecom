import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type OrderStatus =
  | "NEW" // Nouveau / À confirmer
  | "CONFIRMED" // Confirmé
  | "NO_ANSWER" // Pas de réponse / À rappeler
  | "SHIPPED" // Expédié / En livraison
  | "DELIVERED" // Livré & Encaissé
  | "CANCELLED"; // Annulé

export interface OrderRecord {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  confirmationRate: number; // percentage
  pendingCount: number; // status === 'NEW'
  confirmedCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  noAnswerCount: number;
}

const STORE_PATH = path.join(process.cwd(), "data", "orders-store.json");

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
}

// Helper to ensure store file exists
function ensureStoreExists(): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * Retrieve all orders, sorted newest first
 */
export async function getAllOrders(): Promise<OrderRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          phone: row.phone,
          city: row.city,
          address: row.address,
          productId: row.product_id,
          productTitle: row.product_title,
          quantity: row.quantity,
          unitPrice: row.unit_price,
          deliveryFee: row.delivery_fee,
          totalPrice: row.total_price,
          status: row.status as OrderStatus,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
      console.warn("[Orders DB] Supabase query fallback to file store:", error?.message);
    } catch (err) {
      console.warn("[Orders DB] Supabase connection fallback:", err);
    }
  }

  try {
    ensureStoreExists();
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const orders: OrderRecord[] = JSON.parse(raw);
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[Orders DB] Failed to read orders:", error);
    return [];
  }
}

/**
 * Get single order by ID
 */
export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const orders = await getAllOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * Create a new order
 */
export async function createOrder(
  data: Omit<OrderRecord, "status" | "updatedAt"> & { status?: OrderStatus }
): Promise<OrderRecord> {
  const newOrder: OrderRecord = {
    ...data,
    status: data.status || "NEW",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error: insertErr } = await supabase.from("orders").insert({
        id: newOrder.id,
        full_name: newOrder.fullName,
        phone: newOrder.phone,
        city: newOrder.city,
        address: newOrder.address,
        product_id: newOrder.productId,
        product_title: newOrder.productTitle,
        quantity: newOrder.quantity,
        unit_price: newOrder.unitPrice,
        delivery_fee: newOrder.deliveryFee,
        total_price: newOrder.totalPrice,
        status: newOrder.status,
        notes: newOrder.notes || null,
        created_at: newOrder.createdAt,
        updated_at: newOrder.updatedAt,
      });

      if (insertErr) {
        console.error("[Orders DB] Failed to insert into Supabase:", insertErr.message, insertErr.details);
      }
    } catch (err: any) {
      console.error("[Orders DB] Failed to insert into Supabase:", err?.message || err);
    }
  }

  // Local file store persistence / fallback
  try {
    ensureStoreExists();
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const localOrders: OrderRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = localOrders.filter((o) => o.id !== newOrder.id);
    filtered.unshift(newOrder);
    fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Orders DB] Local store sync notice:", err);
  }

  return newOrder;
}

/**
 * Update order status and/or notes
 */
export async function updateOrder(
  id: string,
  updates: Partial<Pick<OrderRecord, "status" | "notes">>
): Promise<OrderRecord | null> {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();
  let updatedRecord: OrderRecord | null = null;

  if (supabase) {
    try {
      const payload: any = { updated_at: now };
      if (updates.status) payload.status = updates.status;
      if (typeof updates.notes === "string") payload.notes = updates.notes;

      const { data, error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!error && data) {
        updatedRecord = {
          id: data.id,
          fullName: data.full_name,
          phone: data.phone,
          city: data.city,
          address: data.address,
          productId: data.product_id,
          productTitle: data.product_title,
          quantity: data.quantity,
          unitPrice: data.unit_price,
          deliveryFee: data.delivery_fee,
          totalPrice: data.total_price,
          status: data.status as OrderStatus,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } else if (error) {
        console.error("[Orders DB] Supabase update error:", error.message, error.details);
      }
    } catch (err: any) {
      console.error("[Orders DB] Failed to update in Supabase:", err?.message || err);
    }
  }

  // Synchronize or fallback to local JSON store inside safe try/catch
  try {
    ensureStoreExists();
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const localOrders: OrderRecord[] = JSON.parse(raw);
    const idx = localOrders.findIndex((o) => o.id === id);

    if (idx !== -1) {
      localOrders[idx] = {
        ...localOrders[idx],
        ...updates,
        updatedAt: now,
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(localOrders, null, 2), "utf-8");
      if (!updatedRecord) {
        updatedRecord = localOrders[idx];
      }
    } else if (updatedRecord) {
      localOrders.unshift(updatedRecord);
      fs.writeFileSync(STORE_PATH, JSON.stringify(localOrders, null, 2), "utf-8");
    }
  } catch (fsErr) {
    console.warn("[Orders DB] Local store sync notice:", fsErr);
  }

  return updatedRecord;
}

/**
 * Delete an order (e.g. for testing / spam entries)
 */
export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  let deletedFromSupabase = false;

  if (supabase) {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (!error) {
        deletedFromSupabase = true;
      } else {
        console.error("[Orders DB] Failed to delete from Supabase:", error);
      }
    } catch (err) {
      console.error("[Orders DB] Failed to delete from Supabase:", err);
    }
  }

  let deletedFromLocal = false;
  try {
    ensureStoreExists();
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const orders: OrderRecord[] = JSON.parse(raw);
    const filtered = orders.filter((o) => o.id !== id);

    if (filtered.length !== orders.length) {
      deletedFromLocal = true;
      fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[Orders DB] Local store delete error:", err);
  }

  return deletedFromSupabase || deletedFromLocal;
}

/**
 * Clear / empty all orders from database and local storage
 */
export async function clearAllOrders(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("orders").delete().neq("id", "___NEVER_MATCH___");
    } catch (err) {
      console.error("[Orders DB] Failed to empty Supabase orders:", err);
    }
  }

  try {
    ensureStoreExists();
    fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.error("[Orders DB] Failed to empty local store:", err);
  }

  return true;
}

/**
 * Calculate COD analytics and KPI metrics
 */
export function calculateMetrics(orders: OrderRecord[]): OrderMetrics {
  const totalOrders = orders.length;

  let totalRevenue = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;
  let noAnswerCount = 0;

  for (const order of orders) {
    if (order.status === "DELIVERED" || order.status === "CONFIRMED" || order.status === "SHIPPED") {
      totalRevenue += order.totalPrice;
    }

    switch (order.status) {
      case "NEW":
        pendingCount++;
        break;
      case "CONFIRMED":
        confirmedCount++;
        break;
      case "SHIPPED":
        shippedCount++;
        break;
      case "DELIVERED":
        deliveredCount++;
        break;
      case "CANCELLED":
        cancelledCount++;
        break;
      case "NO_ANSWER":
        noAnswerCount++;
        break;
    }
  }

  const processedOrders = totalOrders - pendingCount;
  const successfulConfirmations = confirmedCount + shippedCount + deliveredCount;
  const confirmationRate =
    processedOrders > 0
      ? Math.round((successfulConfirmations / processedOrders) * 100)
      : totalOrders > 0
      ? Math.round((successfulConfirmations / totalOrders) * 100)
      : 0;

  return {
    totalOrders,
    totalRevenue,
    confirmationRate,
    pendingCount,
    confirmedCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    noAnswerCount,
  };
}
