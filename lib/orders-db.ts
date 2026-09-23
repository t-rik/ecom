import fs from "fs";
import path from "path";

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
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
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
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
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
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
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
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
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
  ensureStoreExists();
  const orders = await getAllOrders();

  const newOrder: OrderRecord = {
    ...data,
    status: data.status || "NEW",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  fs.writeFileSync(STORE_PATH, JSON.stringify(orders, null, 2), "utf-8");
  return newOrder;
}

/**
 * Update order status and/or notes
 */
export async function updateOrder(
  id: string,
  updates: Partial<Pick<OrderRecord, "status" | "notes">>
): Promise<OrderRecord | null> {
  ensureStoreExists();
  const orders = await getAllOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return null;
  }

  const updated: OrderRecord = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  orders[index] = updated;
  fs.writeFileSync(STORE_PATH, JSON.stringify(orders, null, 2), "utf-8");
  return updated;
}

/**
 * Delete an order (e.g. for testing / spam entries)
 */
export async function deleteOrder(id: string): Promise<boolean> {
  ensureStoreExists();
  const orders = await getAllOrders();
  const filtered = orders.filter((o) => o.id !== id);

  if (filtered.length === orders.length) {
    return false;
  }

  fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
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
    // Only count delivered/confirmed/shipped in valid revenue or active pipeline
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

  // Confirmation rate: (Confirmed + Shipped + Delivered) / (Total - Pending)
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
