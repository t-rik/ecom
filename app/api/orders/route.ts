import { NextRequest, NextResponse } from "next/server";
import { OrderSchema, OrderResponse } from "@/lib/validations";
import { dispatchOrder } from "@/lib/webhooks";
import { createOrder } from "@/lib/orders-db";
import { sendMetaServerPurchase } from "@/lib/meta-conversions-api";
import { sendTikTokServerPurchase } from "@/lib/tiktok-events-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;

    const result = OrderSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json<OrderResponse>(
        {
          success: false,
          message: "المرجو التحقق من صحة المعلومات المدخلة",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const orderData = result.data;
    // Generate clean Moroccan COD Order reference code (e.g. PRK-892341)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `PRK-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const createdAt = new Date().toISOString();

    const fullOrder = {
      ...orderData,
      orderId,
      createdAt,
    };

    // Save order in database / store for the /admin dashboard
    await createOrder({
      id: orderId,
      fullName: orderData.fullName,
      phone: orderData.phone,
      city: orderData.city,
      address: orderData.address,
      productId: orderData.productId,
      productTitle: orderData.productTitle || orderData.productId,
      quantity: orderData.quantity,
      unitPrice: orderData.unitPrice,
      deliveryFee: orderData.deliveryFee,
      totalPrice: orderData.totalPrice,
      status: "NEW",
      createdAt,
    });

    // Pluggable background webhook dispatch (Telegram, Sheets, CRM)
    await dispatchOrder(fullOrder);

    // Meta Conversions API (CAPI) - Server-to-Server tracking (100% ad-blocker & iOS Safari immune)
    sendMetaServerPurchase({
      orderId,
      fullName: orderData.fullName,
      phone: orderData.phone,
      city: orderData.city,
      totalPrice: orderData.totalPrice,
      productId: orderData.productId,
      productTitle: orderData.productTitle || orderData.productId,
      quantity: orderData.quantity,
      clientIp,
      clientUserAgent,
      sourceUrl: referer,
    }).catch((capiErr) => console.error("[Orders API] Meta CAPI background error:", capiErr));

    // TikTok Events API - Server-to-Server tracking (100% iOS 14.5+ & ad-blocker immune)
    const ttclid =
      req.cookies.get("ttclid")?.value ||
      new URL(req.url).searchParams.get("ttclid") ||
      undefined;
    const ttp = req.cookies.get("_ttp")?.value || undefined;

    sendTikTokServerPurchase({
      orderId,
      fullName: orderData.fullName,
      phone: orderData.phone,
      city: orderData.city,
      totalPrice: orderData.totalPrice,
      productId: orderData.productId,
      productTitle: orderData.productTitle || orderData.productId,
      quantity: orderData.quantity,
      clientIp,
      clientUserAgent,
      sourceUrl: referer,
      ttclid,
      ttp,
    }).catch((ttErr) => console.error("[Orders API] TikTok Events API background error:", ttErr));

    return NextResponse.json<OrderResponse>(
      {
        success: true,
        orderId,
        message: "شكراً لطلبك! سنتصل بك هاتفياً خلال الساعات القادمة لتأكيد العنوان وموعد التوصيل.",
        order: {
          id: orderId,
          fullName: orderData.fullName,
          phone: orderData.phone,
          city: orderData.city,
          address: orderData.address,
          productTitle: orderData.productTitle || orderData.productId,
          quantity: orderData.quantity,
          totalPrice: orderData.totalPrice,
          createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Orders API] Error processing order:", error);
    return NextResponse.json<OrderResponse>(
      {
        success: false,
        message: "حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 }
    );
  }
}
