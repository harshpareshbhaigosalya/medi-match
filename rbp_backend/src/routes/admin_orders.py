from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase



admin_orders_bp = Blueprint(
    "admin_orders",
    __name__,
    url_prefix="/api/admin/orders"
)


def require_admin(user_id):
    res = (
        supabase.table("user_profiles")
        .select("role")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return res.data and res.data["role"] == "admin"


# -------------------------------
# LIST ORDERS
# -------------------------------
@admin_orders_bp.get("/")


@require_auth

def list_orders():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    status = request.args.get("status")

    query = (
        supabase.table("orders")
        .select("*, order_items(*)")
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq("status", status)

    res = query.execute()
    return jsonify(res.data), 200


# -------------------------------
# GET SINGLE ORDER
# -------------------------------
@admin_orders_bp.get("/<order_id>")
@require_auth
def get_order(order_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    try:
        # 1️⃣ Order + items
        order = (
            supabase.table("orders")
            .select("""
                *,
                order_items(
                    id,
                    product_name,
                    variant_name,
                    price,
                    quantity,
                    line_total
                )
            """)
            .eq("id", order_id)
            .single()
            .execute()
        ).data

        # 2️⃣ Latest user address
        addresses = (
            supabase.table("user_addresses")
            .select("*")
            .eq("user_id", order["user_id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        ).data

        order["user_addresses"] = addresses[0] if addresses else None

        return jsonify(order), 200

    except Exception as e:
        print("GET ORDER ERROR:", e)
        return jsonify({"error": "Failed to fetch order"}), 500

# -------------------------------
# UPDATE STATUS
# -------------------------------
@admin_orders_bp.put("/<order_id>/status")


@require_auth

def update_status(order_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    new_status = request.json.get("status")

    allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

    if new_status not in allowed:
        return jsonify({"error": "Invalid status"}), 400

    # Remove transition restrictions to allow admin full control
    res = supabase.table("orders") \
        .update({"status": new_status}) \
        .eq("id", order_id) \
        .execute()

    return jsonify({"updated": True, "data": res.data}), 200
