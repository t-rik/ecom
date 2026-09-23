import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, OrderStatus } from "@/lib/orders-db";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Clean string for CSV escaping
 */
function cleanCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export orders as Moroccan Courier Manifest (CSV with UTF-8 BOM for Excel)
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

  let orders = await getAllOrders();

  // If a specific status is filtered (e.g. export only CONFIRMED orders for shipment)
  if (statusFilter && statusFilter !== ("ALL" as any)) {
    orders = orders.filter((o) => o.status === statusFilter);
  }

  // Moroccan Courier Format (Compatible with Cathedis, Ameex, Ozone, Sendit)
  const headers = [
    "Reference_Commande",
    "Nom_Destinataire",
    "Telephone",
    "Ville",
    "Adresse_Complete",
    "Produit",
    "Quantite",
    "Prix_Total_DH",
    "Statut",
    "Notes_Livraison",
    "Date_Commande",
  ];

  const rows = orders.map((order) => {
    return [
      cleanCsv(order.id),
      cleanCsv(order.fullName),
      cleanCsv(order.phone),
      cleanCsv(order.city),
      cleanCsv(order.address),
      cleanCsv(order.productTitle || order.productId),
      cleanCsv(order.quantity),
      cleanCsv(order.totalPrice),
      cleanCsv(order.status),
      cleanCsv(order.notes || ""),
      cleanCsv(new Date(order.createdAt).toLocaleDateString("fr-FR")),
    ].join(",");
  });

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens Arabic and French accents cleanly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  const filename = `pratiko-maroc-commandes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
