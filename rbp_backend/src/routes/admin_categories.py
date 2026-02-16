from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase

admin_categories_bp = Blueprint(
    "admin_categories",
    __name__,
    url_prefix="/api/admin/categories"
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


@admin_categories_bp.get("/")


@require_auth

def list_categories():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    res = (
        supabase.table("product_categories")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify(res.data)


@admin_categories_bp.post("/")


@require_auth

def create_category():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    res = (
        supabase.table("product_categories")
        .insert({
            "name": data["name"],
            "description": data.get("description")
        })
        .execute()
    )

    return jsonify(res.data[0])


@admin_categories_bp.put("/<cat_id>")


@require_auth

def update_category(cat_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    res = (
        supabase.table("product_categories")
        .update({
            "name": data["name"],
            "description": data.get("description")
        })
        .eq("id", cat_id)
        .execute()
    )

    return jsonify(res.data[0])


@admin_categories_bp.delete("/<cat_id>")


@require_auth

def delete_category(cat_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    supabase.table("product_categories").delete().eq("id", cat_id).execute()

    return jsonify({"deleted": True})
