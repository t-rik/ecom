import { NextRequest, NextResponse } from "next/server";
import { OrderSchema, OrderResponse } from "@/lib/validations";
import { dispatchOrder } from "@/lib/webhooks";
import { createOrder } from "@/lib/orders-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
