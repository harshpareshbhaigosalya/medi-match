from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase
from uuid import uuid4
from src.invoice_pdf import generate_invoice_pdf
from flask import send_file
import os
import stripe
from uuid import uuid4

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


def get_or_create_cart(user_id):
    # get existing carts (should be at most 1)
    res = supabase.table("carts").select("*").eq("user_id", user_id).execute()

    # if cart exists, return first
    if res.data and len(res.data) > 0:
        return res.data[0]

    # otherwise create new
    created = supabase.table("carts").insert({"user_id": user_id}).execute()
    return created.data[0]



@cart_bp.get("/")
@require_auth
def get_cart():
    user_id = request.user_id

    cart = get_or_create_cart(user_id)

    # Fetch cart items with variant and product images
    items = (
        supabase.table("cart_items")
        .select(
            """
            id,
            quantity,
            variant_id,
            product_variants (
                id,
                variant_name,
                price,
                description,
                product_id,
                product_images (
                    id,
                    image_url
                ),
                products (
                    id,
                    name,
                    description,
                    product_images (
                        id,
                        image_url
                    )
                )
            )
            """
        )
        .eq("cart_id", cart["id"])
        .execute()
    )

    # Return cart and items
    return jsonify({
        "cart": cart,
        "items": items.data
    })



@cart_bp.post("/add")
@require_auth
def add_to_cart():
    user_id = request.user_id
    data = request.json

    variant_id = data.get("variant_id")
    quantity = int(data.get("quantity", 1))

    if not variant_id:
        return jsonify({"error": "variant_id required"}), 400

    cart = get_or_create_cart(user_id)

    # check if item already exists
    existing = (
        supabase.table("cart_items")
        .select("*")
        .eq("cart_id", cart["id"])
        .eq("variant_id", variant_id)
        .execute()
    )

    # check variant stock
    var_res = supabase.table("product_variants").select("id,stock").eq("id", variant_id).single().execute()
    variant_row = var_res.data
    if not variant_row:
        return jsonify({"error": "Variant not found"}), 404

    if existing.data and len(existing.data) > 0:
        item = existing.data[0]

        new_qty = item["quantity"] + quantity
        if new_qty > (variant_row.get("stock") or 0):
            return jsonify({"error": "Requested quantity exceeds stock"}), 400

        updated = (
            supabase.table("cart_items")
            .update({"quantity": new_qty})
            .eq("id", item["id"]) 
            .execute()
        )

        return jsonify(updated.data)


    # ensure requested quantity available
    if quantity > (variant_row.get("stock") or 0):
        return jsonify({"error": "Requested quantity exceeds stock"}), 400

    new_item = (
        supabase.table("cart_items")
        .insert({
            "cart_id": cart["id"],
            "variant_id": variant_id,
            "quantity": quantity
        })
        .execute()
    )

    return jsonify(new_item.data)




@cart_bp.put("/update")
@require_auth
def update_quantity():
    data = request.json

    item_id = data.get("item_id")
    quantity = int(data.get("quantity", 1))

    if not item_id:
        return jsonify({"error": "item_id required"}), 400

    # check stock for this item's variant
    existing = supabase.table("cart_items").select("*, product_variants(id,stock)").eq("id", item_id).single().execute()
    if not existing.data:
        return jsonify({"error": "Cart item not found"}), 404

    var = existing.data.get("product_variants")
    if not var:
        return jsonify({"error": "Variant not found"}), 404

    if quantity > (var.get("stock") or 0):
        return jsonify({"error": "Requested quantity exceeds stock"}), 400

    updated = (
        supabase.table("cart_items")
        .update({"quantity": quantity})
        .eq("id", item_id)
        .execute()
    )

    return jsonify(updated.data)


@cart_bp.delete("/remove/<item_id>")
@require_auth
def remove_item(item_id):
    deleted = (
        supabase.table("cart_items")
        .delete()
        .eq("id", item_id)
        .execute()
    )

    return jsonify({"deleted": True})



@cart_bp.post("/quotation")
@require_auth
def create_quotation():
    user_id = request.user_id

    # get user cart
    cart = get_or_create_cart(user_id)

    items = (
        supabase.table("cart_items")
        .select(
            """
            id,
            quantity,
            variant_id,
            product_variants (
                id,
                variant_name,
                price,
                description,
                product_id,
                products (
                    id,
                    name
                )
            )
            """
        )
        .eq("cart_id", cart["id"])
        .execute()
    )

    if not items.data:
        return jsonify({"error": "Cart is empty"}), 400

    # build snapshot
    snapshot_items = []
    total = 0

    for item in items.data:
        variant = item["product_variants"]

        line_total = float(variant["price"]) * int(item["quantity"])
        total += line_total

        snapshot_items.append({
            "variant_id": variant["id"],
            "variant_name": variant["variant_name"],
            "product_name": variant["products"]["name"],
            "price": float(variant["price"]),
            "quantity": int(item["quantity"]),
            "line_total": line_total
        })

    snapshot = {
        "items": snapshot_items,
        "generated_at": cart["created_at"]
    }

    res = (
        supabase.table("quotations")
        .insert({
            "user_id": user_id,
            "cart_snapshot": snapshot,
            "total": total,
            "status": "generated"
        })
        .execute()
    )

    return jsonify(res.data)




# download pdf of quotation
import os
from flask import send_file
from src.pdf import generate_quotation_pdf
from uuid import uuid4

@cart_bp.get("/quotation/<quote_id>/pdf")
@require_auth
def download_quotation_pdf(quote_id):
    user_id = request.user_id

    res = (
        supabase.table("quotations")
        .select("*")
        .eq("id", quote_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    quotation = res.data

    if not quotation:
        return jsonify({"error": "Quotation not found"}), 404

    # generate quote number if missing
    if not quotation.get("quote_number"):
        q_num = f"QTN-{str(uuid4())[:8].upper()}"
        supabase.table("quotations") \
            .update({"quote_number": q_num}) \
            .eq("id", quote_id) \
            .execute()

        quotation["quote_number"] = q_num

    file_path = f"/tmp/quotation_{quote_id}.pdf"

    generate_quotation_pdf(file_path, quotation)

    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{quotation['quote_number']}.pdf"
    )





# checkout
@cart_bp.post("/checkout/<quote_id>")
@require_auth
def create_order_from_quote(quote_id):
    user_id = request.user_id

    # fetch quotation (must belong to user)
    res = (
        supabase.table("quotations")
        .select("*")
        .eq("id", quote_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    quote = res.data

    if not quote:
        return jsonify({"error": "Quotation not found"}), 404

    snapshot = quote["cart_snapshot"]
    items = snapshot["items"]

    if not items:
        return jsonify({"error": "Quotation empty"}), 400

    # generate order number
    order_no = f"ORD-{str(uuid4())[:8].upper()}"

    order = (
        supabase.table("orders")
        .insert({
            "user_id": user_id,
            "quotation_id": quote_id,
            "order_number": order_no,
            "total": quote["total"],
            "status": "pending"
        })
        .execute()
    ).data[0]

    order_id = order["id"]

    # insert order items snapshot
    order_items_payload = []

    for item in items:
        # if variant_id present, check stock and decrement
        variant_id = item.get("variant_id")
        if variant_id:
            var_check = supabase.table("product_variants").select("stock").eq("id", variant_id).single().execute()
            var_row = var_check.data
            if not var_row:
                return jsonify({"error": f"Variant {variant_id} not found"}), 404

            qty = int(item.get("quantity", 0))
            if qty > (var_row.get("stock") or 0):
                return jsonify({"error": f"Insufficient stock for variant {item.get('variant_name')}"}), 400

            # decrement stock
            new_stock = (var_row.get("stock") or 0) - qty
            supabase.table("product_variants").update({"stock": new_stock}).eq("id", variant_id).execute()

        order_items_payload.append({
            "order_id": order_id,
            "product_name": item["product_name"],
            "variant_name": item["variant_name"],
            "price": item["price"],
            "quantity": item["quantity"],
            "line_total": item["line_total"]
        })

    supabase.table("order_items").insert(order_items_payload).execute()

    # clear cart after order
    cart = get_or_create_cart(user_id)
    supabase.table("cart_items").delete().eq("cart_id", cart["id"]).execute()

    return jsonify({
        "message": "Order created and cart cleared",
        "order": order
    })




# snapshot of new orders
# checkout (with address, no payment yet)
@cart_bp.post("/checkout-direct")
@require_auth
def checkout_direct():
    user_id = request.user_id
    data = request.json or {}

    address = data.get("address")

    if not address:
        return jsonify({"error": "Address is required"}), 400

    # get cart
    cart = get_or_create_cart(user_id)

    items_res = (
        supabase.table("cart_items")
        .select(
            """
            id,
            quantity,
            variant_id,
            product_variants (
                id,
                variant_name,
                price,
                products (
                    name
                )
            )
            """
        )
        .eq("cart_id", cart["id"])
        .execute()
    )

    items = items_res.data

    if not items:
        return jsonify({"error": "Cart is empty"}), 400

    snapshot_items = []
    total = 0

    for item in items:
        v = item["product_variants"]

        line_total = float(v["price"]) * int(item["quantity"])
        total += line_total

        snapshot_items.append({
            "product_name": v["products"]["name"],
            "variant_name": v["variant_name"],
            "price": float(v["price"]),
            "quantity": item["quantity"],
            "line_total": line_total
        })

    snapshot = {
        "items": snapshot_items,
        "address": address
    }

    order_no = f"ORD-{str(uuid4())[:8].upper()}"

    order = (
        supabase.table("orders")
        .insert({
            "user_id": user_id,
            "order_number": order_no,
            "total": total,
            "status": "pending",
            "cart_snapshot": snapshot
        })
        .execute()
    ).data[0]

    
    order_id = order["id"]
    
    # insert order_items
    order_items_payload = []
    
    for item in snapshot_items:
        order_items_payload.append({
            "order_id": order_id,
            "product_name": item["product_name"],
            "variant_name": item["variant_name"],
            "price": item["price"],
            "quantity": item["quantity"],
            "line_total": item["line_total"]
        })
    
    supabase.table("order_items").insert(order_items_payload).execute()
    
    # CLEAR CART
    supabase.table("cart_items").delete().eq("cart_id", cart["id"]).execute()

    # STRIPE INTEGRATION (Replacing Razorpay)
    payment_method = data.get("payment_method", "cod")
    stripe_session_id = None
    stripe_url = None

    print(f"DEBUG: payment_method from request: {payment_method}")
    if payment_method == "online":
        print(f"DEBUG: total amount: {total}")
        try:
            # Create Stripe Checkout Session
            line_items = []
            for item in snapshot_items:
                line_items.append({
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': f"{item['product_name']} ({item['variant_name']})",
                        },
                        'unit_amount': int(item['price'] * 100),
                    },
                    'quantity': item['quantity'],
                })

            print(f"DEBUG: line_items: {line_items}")
            # Fallback to production URL if env var missing
            frontend_url = os.getenv("FRONTEND_URL", "https://medi-match-8u18.onrender.com")
            frontend_url = frontend_url.rstrip("/")
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f"{frontend_url}/orders/{order_id}",
                cancel_url=f"{frontend_url}/checkout",
                client_reference_id=str(order_id),
                metadata={
                    "order_id": str(order_id)
                }
            )
            print(f"DEBUG: stripe session created: {session.id}")
            stripe_session_id = session.id
            stripe_url = session.url
            
            # Save session_id to order record
            supabase.table("orders").update({"stripe_session_id": stripe_session_id}).eq("id", order_id).execute()
        except Exception as e:
            import traceback
            print(f"STRIPE ERROR: {e}")
            traceback.print_exc()

    return jsonify({
        "message": "Order placed successfully",
        "order": order,
        "stripe_session_id": stripe_session_id,
        "stripe_url": stripe_url,
        "pub_key": os.getenv("STRIPE_PUBLISHABLE_KEY")
    })


@cart_bp.post("/stripe-webhook")
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('STRIPE_SIGNATURE')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('client_reference_id')
        payment_intent = session.get('payment_intent')

        if order_id:
            supabase.table("orders").update({
                "status": "paid",
                "payment_id": payment_intent
            }).eq("id", order_id).execute()

    return jsonify({"status": "success"})


# clear cart endpoint for AI / UI
@cart_bp.post("/clear")
@require_auth
def clear_cart_route():
    user_id = request.user_id
    cart = get_or_create_cart(user_id)
    supabase.table("cart_items").delete().eq("cart_id", cart["id"]).execute()
    return jsonify({"message": "Cart cleared"})



# invoice 
@cart_bp.get("/order/<order_id>/invoice")
@require_auth
def download_invoice(order_id):
    user_id = request.user_id

    res = (
        supabase.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    order = res.data

    if not order:
        return jsonify({"error": "Order not found"}), 404

    # generate invoice number if missing
    if not order.get("invoice_number"):
        from uuid import uuid4
        inv = f"INV-{str(uuid4())[:8].upper()}"

        supabase.table("orders") \
            .update({"invoice_number": inv}) \
            .eq("id", order_id) \
            .execute()

        order["invoice_number"] = inv

    # build invoice data source
    invoice_source = None
    
    if order.get("cart_snapshot"):
        invoice_source = order["cart_snapshot"]
    else:
        # fallback — load quotation snapshot
        if order.get("quotation_id"):
            q = (
                supabase.table("quotations")
                .select("*")
                .eq("id", order["quotation_id"])
                .single()
                .execute()
            ).data
    
            invoice_source = q["cart_snapshot"]
    
    # attach snapshot field used by invoice generator
    if not invoice_source:
        return jsonify({"error": "No cart snapshot found for this order"}), 400
    
    order["cart_snapshot"] = invoice_source

    
    file_path = f"/tmp/invoice_{order_id}.pdf"
    
    generate_invoice_pdf(file_path, order)


    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{order['invoice_number']}.pdf"
    )
