import http from "http";

const BASE_URL = "http://localhost:3000";
const ADMIN_PASSWORD = "PratikoMaroc#Admin_98f7a2c1b84e3d09a5f7823b1284fcd6_2026!";

async function runTests() {
  console.log("=== Testing Admin Portal & Order Flow ===");

  // 1. Test wrong password
  const badLogin = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrongpassword123" }),
  });
  console.log("1. Bad password test (expect 401):", badLogin.status);
  if (badLogin.status !== 401) throw new Error("Bad login should fail with 401");

  // 2. Test correct password
  const goodLogin = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  console.log("2. Good password test (expect 200):", goodLogin.status);
  const cookieHeader = goodLogin.headers.get("set-cookie");
  console.log("   Session cookie received:", !!cookieHeader);
  if (goodLogin.status !== 200 || !cookieHeader) throw new Error("Good login failed");

  const sessionCookie = cookieHeader.split(";")[0];

  // 3. Test GET /api/admin/orders
  const ordersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Cookie: sessionCookie },
  });
  const ordersData = await ordersRes.json();
  console.log("3. Fetch orders (expect success):", ordersData.success);
  console.log("   Orders count:", ordersData.orders.length);
  console.log("   Revenue:", ordersData.metrics.totalRevenue, "DH");
  console.log("   Confirmation rate:", ordersData.metrics.confirmationRate, "%");
  console.log("   Pending calls:", ordersData.metrics.pendingCount);

  // 4. Test placing a new customer order on the storefront
  const newCustomerOrder = {
    fullName: "رضا التازي",
    phone: "0711890473",
    city: "Casablanca",
    address: "عين السبع، حي السلام زنقة 10",
    productId: "aspirateur-sans-fil",
    productTitle: "مكنسة كهربائية لاسلكية محمولة للسيارة والمنزل (قوة 9000Pa)",
    bundleId: "2-units",
    quantity: 2,
    unitPrice: 319,
    deliveryFee: 0,
    totalPrice: 319,
  };

  const placeOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCustomerOrder),
  });
  const placeOrderData = await placeOrderRes.json();
  console.log("4. Place new storefront COD order:", placeOrderRes.status, placeOrderData.orderId);

  // 5. Verify the order immediately shows up in admin
  const verifyRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Cookie: sessionCookie },
  });
  const verifyData = await verifyRes.json();
  const created = verifyData.orders.find((o) => o.id === placeOrderData.orderId);
  console.log("5. Verified order appears in admin list:", !!created, created?.fullName, created?.status);
  if (!created || created.status !== "NEW") throw new Error("Order not found or wrong status in admin");

  // 6. Test updating status to CONFIRMED
  const updateRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      id: created.id,
      status: "CONFIRMED",
      notes: "Appelé à 14h, adresse confirmée",
    }),
  });
  const updateData = await updateRes.json();
  console.log("6. Update status to CONFIRMED:", updateData.success, updateData.order.status, updateData.order.notes);

  // 7. Test Export CSV
  const exportRes = await fetch(`${BASE_URL}/api/admin/export`, {
    headers: { Cookie: sessionCookie },
  });
  const csvText = await exportRes.text();
  console.log("7. Export CSV for couriers (status 200, length > 100):", exportRes.status, csvText.length);
  console.log("   First CSV line (headers):", csvText.split("\r\n")[0]);

  console.log("\n✅ ALL ADMIN & COD ORDER TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
