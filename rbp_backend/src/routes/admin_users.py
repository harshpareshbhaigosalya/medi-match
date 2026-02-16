from flask import Blueprint, jsonify
from src.auth import require_auth
from src.admin_guard import admin_required
from src.db import supabase

admin_users_bp = Blueprint(
    "admin_users",
    __name__,
    url_prefix="/api/admin/users"
)


# 🔹 List all users with order stats
@admin_users_bp.get("/")
@require_auth
@admin_required
def list_users():
    try:
        users = (
            supabase.table("user_profiles")
            .select(
                """
                id,
                full_name,
                role,
                blocked,
                created_at
                """
            )
            .order("created_at", desc=True)
            .execute()
        ).data

        # Compute order stats per user
        for u in users:
            orders = (
                supabase.table("orders")
                .select("total")
                .eq("user_id", u["id"])
                .execute()
            ).data or []

            u["total_orders"] = len(orders)
            u["total_spent"] = sum(o.get("total", 0) for o in orders)

        return jsonify(users), 200
    except Exception as e:
        print("LIST USERS ERROR:", e)
        return jsonify({"error": "Failed to fetch users"}), 500


# 🔹 Get single user with addresses
@admin_users_bp.get("/<user_id>")
@require_auth
@admin_required
def get_user(user_id):
    try:
        # 1️⃣ User profile
        user = (
            supabase.table("user_profiles")
            .select(
                """
                id,
                full_name,
                role,
                blocked,
                created_at,
                specialization,
                org_type
                """
            )
            .eq("id", user_id)
            .single()
            .execute()
        ).data

        if not user:
            return jsonify({"error": "User not found"}), 404

        # 2️⃣ All addresses (phone included)
        addresses = (
            supabase.table("user_addresses")
            .select(
                """
                id,
                full_name,
                phone,
                address_line1,
                address_line2,
                city,
                state,
                pincode,
                created_at
                """
            )
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        ).data or []

        user["addresses"] = addresses

        return jsonify(user), 200

    except Exception as e:
        print("GET USER ERROR:", e)
        return jsonify({"error": "Failed to fetch user"}), 500


# 🔹 Get user orders with nested items
@admin_users_bp.get("/<user_id>/orders")
@require_auth
@admin_required
def get_user_orders(user_id):
    try:
        # Fetch all orders for this user
        orders = (
            supabase.table("orders")
            .select(
                """
                id,
                status,
                total,
                created_at,
                order_items(
                    id,
                    product_name,
                    price,
                    quantity,
                    line_total
                )
                """
            )
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        ).data or []

        # Calculate total spent
        total_spent = sum(o.get("total", 0) for o in orders)

        # Flatten order items to ensure frontend receives an array
        for o in orders:
            o["order_items"] = o.get("order_items", [])  # empty array if none

        return jsonify({
            "orders": orders,
            "total_orders": len(orders),
            "total_spent": total_spent
        }), 200

    except Exception as e:
        print("USER ORDERS ERROR:", e)
        return jsonify({"error": "Failed to fetch orders"}), 500
