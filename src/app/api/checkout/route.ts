import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { CheckoutSchema } from '@/src/lib/validations/order';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Received:", JSON.stringify(body, null, 2));

    const formValidation = CheckoutSchema.safeParse(body);
    if (!formValidation.success) {
      const errors = formValidation.error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      return NextResponse.json({ 
        success: false, 
        message: `Validation failed: ${errors}` 
      }, { status: 400 });
    }

    const { customer_name, phone_number, area, delivery_address } = formValidation.data;
    const incomingItems = body.items;

    if (!incomingItems || incomingItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Cart is empty" 
      }, { status: 400 });
    }

    const supabase = await createClient();

    const productIds = incomingItems.map((item: any) => item.product_id);
    const { data: databaseProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, price, stock, title')
      .in('id', productIds);

    if (fetchError || !databaseProducts) {
      return NextResponse.json({ 
        success: false, 
        message: "Database error" 
      }, { status: 500 });
    }

    let calculatedTotalBill = 0;
    for (const item of incomingItems) {
      const liveProduct = databaseProducts.find(p => p.id === item.product_id);
      if (!liveProduct) {
        return NextResponse.json({ 
          success: false, 
          message: `Product not found` 
        }, { status: 400 });
      }
      if (liveProduct.stock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Out of stock: ${liveProduct.title}` 
        }, { status: 400 });
      }
      calculatedTotalBill += Number(liveProduct.price) * item.quantity;
    }

    const deliveryCharges = calculatedTotalBill > 5000 ? 0 : 250;
    const finalBill = calculatedTotalBill + deliveryCharges;

    const { data: orderData, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        phone_number,
        delivery_address,
        area,
        total_amount: finalBill,
        payment_method: 'COD',
        order_status: 'pending',
        items: incomingItems,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    for (const item of incomingItems) {
      const liveProduct = databaseProducts.find(p => p.id === item.product_id);
      await supabase
        .from('products')
        .update({ stock: (liveProduct?.stock ?? 0) - item.quantity })
        .eq('id', item.product_id);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderData?.id,
      total: finalBill,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error" 
    }, { status: 500 });
  }
}