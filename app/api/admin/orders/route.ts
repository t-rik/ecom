import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  updateOrder,
  deleteOrder,
  calculateMetrics,
  OrderStatus,
} from "@/lib/orders-db";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * GET orders with optional status filter & search
 */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") as OrderStatus | null;
  const search = searchParams.get("search")?.toLowerCase().trim();

  const allOrders = await getAllOrders();
  const metrics = calculateMetrics(allOrders);

  let filtered = allOrders;

  if (statusFilter && statusFilter !== ("ALL" as any)) {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }

  if (search) {
    filtered = filtered.filter(
      (o) =>
        o.fullName.toLowerCase().includes(search) ||
        o.phone.includes(search) ||
        o.city.toLowerCase().includes(search) ||
        o.id.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    orders: filtered,
    metrics,
  });
}

/**
 * PATCH: Update order status and/or notes
 */
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, message: "Session expirée. Veuillez vous reconnecter." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID commande requis" },
        { status: 400 }
      );
    }

    const updated = await updateOrder(id, {
      ...(status ? { status } : {}),
      ...(typeof notes === "string" ? { notes } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Commande "${id}" introuvable.` },
        { status: 404 }
      );
    }

    const allOrders = await getAllOrders();
    const metrics = calculateMetrics(allOrders);

    return NextResponse.json({
      success: true,
      order: updated,
      metrics,
    });
  } catch (error: any) {
    console.error("[Admin Orders API] Update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur interne lors de la mise à jour." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove order (e.g. spam/test)
 */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID commande requis" },
      { status: 400 }
    );
  }

  const deleted = await deleteOrder(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Commande introuvable" },
      { status: 404 }
    );
  }

  const allOrders = await getAllOrders();
  const metrics = calculateMetrics(allOrders);

  return NextResponse.json({
    success: true,
    message: "Commande supprimée avec succès",
    metrics,
  });
}
