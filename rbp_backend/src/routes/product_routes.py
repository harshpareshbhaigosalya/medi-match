from flask import Blueprint, jsonify, request
from src.db import supabase

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.get("/")
def list_products():
    category = request.args.get("category")

    query = (
        supabase.table("products")
        .select(
            """
            id,
            name,
            description,
            product_images ( image_url ),
            product_variants (
                id,
                stock,
                variant_name,
                price,
                description,
                product_images ( image_url )
            )
            """
        )
    )

    if category:
        query = query.eq("category_id", category)

    res = query.execute()
    # filter out variants with no stock
    products = res.data or []
    for p in products:
        variants = p.get("product_variants") or []
        p["product_variants"] = [v for v in variants if (v.get("stock") or 0) > 0]

    return jsonify(products)


@product_bp.get("/<product_id>")
def get_product(product_id):
    if not product_id or product_id == "undefined":
        return jsonify({"error": "Invalid product id"}), 400

    res = (
        supabase.table("products")
        .select(
            """
            id,
            name,
            description,
            product_images ( image_url ),
            product_variants (
                id,
                stock,
                variant_name,
                price,
                description,
                product_images ( image_url )
            )
            """
        )
        .eq("id", product_id)
        .single()
        .execute()
    )

    product = res.data or {}
    variants = product.get("product_variants") or []
    product["product_variants"] = [v for v in variants if (v.get("stock") or 0) > 0]

    return jsonify(product)
