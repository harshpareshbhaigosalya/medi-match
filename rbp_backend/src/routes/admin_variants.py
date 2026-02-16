from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase


admin_variants_bp = Blueprint(
    "admin_variants",
    __name__,
    url_prefix="/api/admin/variants"
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


# LIST – by product
@admin_variants_bp.get("/")


@require_auth

def list_variants():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    product_id = request.args.get("product_id")

    q = supabase.table("product_variants").select("*")

    if product_id:
        q = q.eq("product_id", product_id)

    res = q.execute()

    return jsonify(res.data or [])


# CREATE
@admin_variants_bp.post("/")


@require_auth

def create_variant():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    variant = (
        supabase.table("product_variants")
        .insert({
            "product_id": data.get("product_id"),
            "variant_name": data.get("variant_name"),
            "price": data.get("price") or 0,
            "stock": data.get("stock") or 0,
            "description": data.get("description") or "",
            "variant_type": data.get("variant_type") or "variant"
        })
        .execute()
        .data[0]
    )

    # image if provided
    if data.get("image_url"):
        supabase.table("product_images").insert({
        "variant_id": variant["id"],
        "image_url": data["image_url"],
        "is_primary": False
    }).execute()


    return jsonify(variant)


# UPDATE
@admin_variants_bp.put("/<variant_id>")


@require_auth

def update_variant(variant_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    # fields that actually exist in product_variants
    variant_update = {
        "variant_name": data.get("variant_name"),
        "price": data.get("price"),
        "stock": data.get("stock"),
        "description": data.get("description"),
        "variant_type": data.get("variant_type")
    }

    # remove None keys
    variant_update = {
        k: v for k, v in variant_update.items()
        if v is not None
    }

    supabase.table("product_variants") \
        .update(variant_update) \
        .eq("id", variant_id) \
        .execute()

    # ----- IMAGE HANDLING -----
    image_url = data.get("image_url")

    if image_url:
        # check if image already exists for this variant
        existing = supabase.table("product_images") \
            .select("*") \
            .eq("variant_id", variant_id) \
            .limit(1) \
            .execute()

        if existing.data:
            # update existing image
            supabase.table("product_images") \
                .update({"image_url": image_url}) \
                .eq("variant_id", variant_id) \
                .execute()
        else:
            # insert new
            supabase.table("product_images") \
                .insert({
                    "variant_id": variant_id,
                    "image_url": image_url,
                    "is_primary": False
                }) \
                .execute()

    return jsonify({"updated": True})


# quick stock update endpoint used by admin dashboard UI
@admin_variants_bp.post("/<variant_id>/stock")
@require_auth
def update_variant_stock(variant_id):
    # admin check
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    if "stock" not in data:
        return jsonify({"error": "stock required"}), 400

    try:
        new_stock = int(data.get("stock") or 0)
    except Exception:
        return jsonify({"error": "invalid stock"}), 400

    supabase.table("product_variants").update({"stock": new_stock}).eq("id", variant_id).execute()
    return jsonify({"updated": True, "stock": new_stock})



# DELETE
@admin_variants_bp.delete("/<variant_id>")


@require_auth

def delete_variant(variant_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    supabase.table("product_variants").delete().eq("id", variant_id).execute()

    return jsonify({"deleted": True})
