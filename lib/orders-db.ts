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
    const initialOrders: OrderRecord[] = [
      {
        id: "PRK-892341",
        fullName: "محمد العلمي",
        phone: "0661234567",
        city: "Casablanca",
        address: "حي المعاريف، زنقة الزرقطوني عمارة 12 شقة 4",
        productId: "aspirateur-sans-fil",
        productTitle: "مكنسة كهربائية لاسلكية محمولة للسيارة والمنزل (قوة 9000Pa)",
        quantity: 2,
        unitPrice: 319,
        deliveryFee: 0,
        totalPrice: 319,
        status: "NEW",
        notes: "زبون جديد، يفضل التوصيل بعد الساعة 17:00",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "PRK-781492",
        fullName: "فاطمة الزهراء بنجلون",
        phone: "0770987654",
        city: "Rabat",
        address: "حي أكدال، شارع فال ولد عمير، إقامة النخيل",
        productId: "aspirateur-sans-fil",
        productTitle: "مكنسة كهربائية لاسلكية محمولة للسيارة والمنزل (قوة 9000Pa)",
        quantity: 1,
        unitPrice: 189,
        deliveryFee: 35,
        totalPrice: 224,
        status: "CONFIRMED",
        notes: "تم التأكيد هاتفياً، جاهز للشحن",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
      {
        id: "PRK-654120",
        fullName: "Youssef Tazi",
        phone: "0665432198",
        city: "Marrakech",
        address: "Guéliz, Bd Mohammed V, Résidence Al Manar Appt 6",
        productId: "armoire-chaussures",
        productTitle: "خزانة أحذية عصرية متعددة الطبقات (سعة 24 حذاء)",
        quantity: 2,
        unitPrice: 469,
        deliveryFee: 0,
        totalPrice: 469,
        status: "SHIPPED",
        notes: "Envoyé avec livreur Cathedis (Track #CTH-9923)",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
      {
        id: "PRK-541289",
        fullName: "Karim Mansouri",
        phone: "0712348765",
        city: "Tanger",
        address: "Malabata, Résidence Bay City Bloc B",
        productId: "aspirateur-sans-fil",
        productTitle: "مكنسة كهربائية لاسلكية محمولة للسيارة والمنزل (قوة 9000Pa)",
        quantity: 1,
        unitPrice: 189,
        deliveryFee: 35,
        totalPrice: 224,
        status: "DELIVERED",
        notes: "Livré et encaissé en espèces",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "PRK-432198",
        fullName: "أمين الصنهاجي",
        phone: "0612987654",
        city: "Fès",
        address: "طريق عين الشقف، إقامة رياض فاس",
        productId: "aspirateur-sans-fil",
        productTitle: "مكنسة كهربائية لاسلكية محمولة للسيارة والمنزل (قوة 9000Pa)",
        quantity: 1,
        unitPrice: 189,
        deliveryFee: 35,
        totalPrice: 224,
        status: "NO_ANSWER",
        notes: "تم الاتصال مرتين بدون رد، إعادة الاتصال بعد الزوال",
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ];

    fs.writeFileSync(STORE_PATH, JSON.stringify(initialOrders, null, 2), "utf-8");
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
      await supabase.from("orders").insert({
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
    } catch (err) {
      console.error("[Orders DB] Failed to insert into Supabase:", err);
    }
  }

  // Local file store persistence / fallback
  try {
    ensureStoreExists();
    const orders = await getAllOrders();
    const filtered = orders.filter((o) => o.id !== newOrder.id);
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
