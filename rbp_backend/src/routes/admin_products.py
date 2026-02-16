from flask import Blueprint, request, jsonify
from functools import wraps
from src.auth import require_auth
from src.db import supabase


admin_products_bp = Blueprint(
    "admin_products",
    __name__,
    url_prefix="/api/admin/products"
)


def require_admin(fn):
    @wraps(fn)
    @require_auth

    def wrapper(*args, **kwargs):
        user_id = request.user_id

        res = (
            supabase.table("user_profiles")
            .select("role")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not res.data or res.data["role"] != "admin":
            return jsonify({"error": "Forbidden"}), 403

        return fn(*args, **kwargs)

    return wrapper


# LIST products
@admin_products_bp.get("/")
@require_admin
def list_products():
    category_id = request.args.get("category_id")

    query = (
        supabase.table("products")
        .select("*, product_images(image_url)")
    )

    if category_id:
        query = query.eq("category_id", category_id)

    res = query.execute()

    for p in res.data:
        if p.get("product_images"):
            p["image_url"] = p["product_images"][0]["image_url"]

    return jsonify(res.data)


# CREATE
@admin_products_bp.post("/")


@require_auth

def create_product():
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    name = data.get("name")
    category_id = data.get("category_id")
    description = data.get("description")
    base_price = data.get("base_price") or 0
    sku = data.get("sku")
    image_url = data.get("image_url")

    if not name or not category_id:
        return jsonify({"error": "Missing fields"}), 400

    # 1) create product
    product_res = (
        supabase.table("products")
        .insert({
            "name": name,
            "category_id": category_id,
            "description": description,
            "base_price": base_price,
            "sku": sku,
            "is_active": True
        })
        .execute()
    )

    product = product_res.data[0]

    # 2) default variant
    supabase.table("product_variants").insert({
        "product_id": product["id"],
        "variant_name": "Default",
        "price": base_price,
        "stock": 0,
        "description": description,
        "variant_type": "default"
    }).execute()

    # 3) optional image
    if image_url:
        supabase.table("product_images").insert({
            "product_id": product["id"],
            "image_url": image_url,
            "is_primary": True
        }).execute()

    return jsonify(product)



# UPDATE
@admin_products_bp.put("/<prod_id>")


@require_auth

def update_product(prod_id):
    if not require_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    image_url = data.pop("image_url", None)   # remove from product fields

    try:
        # 1) update product fields
        if data:
            supabase.table("products") \
                .update(data) \
                .eq("id", prod_id) \
                .execute()

        # 2) update / insert primary image if provided
        if image_url:
            existing = (
                supabase.table("product_images")
                .select("id")
                .eq("product_id", prod_id)
                .eq("is_primary", True)
                .maybe_single()
                .execute()
            )

            if existing.data:
                supabase.table("product_images") \
                    .update({"image_url": image_url}) \
                    .eq("id", existing.data["id"]) \
                    .execute()
            else:
                supabase.table("product_images") \
                    .insert({
                        "product_id": prod_id,
                        "image_url": image_url,
                        "is_primary": True
                    }) \
                    .execute()

        # 3) return updated view
        product = (
            supabase.table("products")
            .select("*, product_images(image_url)")
            .eq("id", prod_id)
            .single()
            .execute()
            .data
        )

        if product.get("product_images"):
            product["image_url"] = product["product_images"][0]["image_url"]

        return jsonify(product), 200

    except Exception as e:
        print("UPDATE PRODUCT ERROR:", e)
        return jsonify({"error": "Failed to update"}), 500




# DELETE
@admin_products_bp.delete("/<prod_id>")
@require_admin
def delete_product(prod_id):
    supabase.table("products").delete().eq("id", prod_id).execute()
    return jsonify({"deleted": True})
