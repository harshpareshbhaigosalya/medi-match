from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@orders_bp.get("/")
@require_auth
def list_orders():
    user_id = request.user_id

    res = (
        supabase.table("orders")
        .select(
            """
            id,
            order_number,
            total,
            status,
            created_at
            """
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify(res.data)


@orders_bp.get("/<order_id>")
@require_auth
def order_details(order_id):
    user_id = request.user_id

    order = (
        supabase.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    ).data

    if not order:
        return jsonify({"error": "Order not found"}), 404

    items = (
        supabase.table("order_items")
        .select("*")
        .eq("order_id", order_id)
        .execute()
    ).data

    order["items"] = items

    return jsonify(order)


