# src/ai/tools.py
"""Collection of small tool functions used by the AI agent.

These wrap database access and small business logic so the agent can
call them safely and deterministically.
"""
from typing import List, Dict, Any
from src.db import supabase


def fetch_products(limit: int = 100) -> List[Dict[str, Any]]:
    res = (
        supabase
        .table("products")
        .select(
            "id, name, description, base_price, is_active, product_images(image_url,is_primary)"
        )
        .eq("is_active", True)
        .limit(limit)
        .execute()
    )
    products = res.data or []
    for p in products:
        images = p.get("product_images", [])
        primary = next((img for img in images if img.get("is_primary")), images[0] if images else None)
        p["image"] = primary["image_url"] if primary else None
        p.pop("product_images", None)
    return products


def search_products_by_name(name: str) -> List[Dict[str, Any]]:
    if not name or name.strip().lower() == "all":
        return fetch_products()
    res = (
        supabase.table("products").select("*").ilike("name", f"%{name}%").eq("is_active", True).execute()
    )
    return res.data or []


def fetch_variants(product_id: str) -> List[Dict[str, Any]]:
    res = (
        supabase.table("product_variants").select("id, variant_name, price, stock").eq("product_id", product_id).execute()
    )
    return res.data or []


def get_variant_by_id(variant_id: str) -> Dict[str, Any]:
    res = supabase.table("product_variants").select("*").eq("id", variant_id).maybe_single().execute()
    return res.data or None


def get_product_by_id(product_id: str) -> Dict[str, Any]:
    res = (
        supabase
        .table("products")
        .select("id, name, description, base_price, is_active, product_images(image_url,is_primary)")
        .eq("id", product_id)
        .maybe_single()
        .execute()
    )
    p = res.data or None
    if p:
        images = p.get("product_images", [])
        primary = next((img for img in images if img.get("is_primary")), images[0] if images else None)
        p["image"] = primary["image_url"] if primary else None
        p.pop("product_images", None)
    return p


def get_or_create_cart(user_id: str) -> Dict[str, Any]:
    cart_res = (
        supabase.table("carts").select("*").eq("user_id", user_id).maybe_single().execute()
    )
    if cart_res.data:
        return cart_res.data
    new_cart = supabase.table("carts").insert({"user_id": user_id}).execute()
    return new_cart.data[0]


def add_variant_to_cart(user_id: str, variant_id: str, qty: int = 1) -> None:
    cart = get_or_create_cart(user_id)
    supabase.table("cart_items").insert({
        "cart_id": cart["id"],
        "variant_id": variant_id,
        "quantity": qty,
    }).execute()


def suggest_bulk_products_for_context(context_text: str, limit: int = 20) -> List[Dict[str, Any]]:
    """A simple heuristic: if context mentions common needs, return relevant products.

    This is intentionally simple and deterministic: it searches product names for keywords
    found in the context. A future improvement is to use the LLM to expand keywords.
    """
    keywords = [w.strip() for w in context_text.lower().split() if len(w) > 3]
    if not keywords:
        return fetch_products(limit)

    # build ilike chains - Supabase client does not support OR across many items easily,
    # so do multiple small queries and dedupe results.
    seen = {}
    for kw in keywords[:6]:
        # search by name first
        res = supabase.table("products").select("id, name, base_price, description, product_images(image_url,is_primary)").ilike("name", f"%{kw}%").limit(limit).execute()
        if not (res.data or []):
            # try description search as fallback
            res = supabase.table("products").select("id, name, base_price, description, product_images(image_url,is_primary)").ilike("description", f"%{kw}%").limit(limit).execute()
        for p in (res.data or []):
            pid = p["id"]
            if pid in seen:
                continue
            images = p.get("product_images", [])
            primary = next((img for img in images if img.get("is_primary")), images[0] if images else None)
            p["image"] = primary["image_url"] if primary else None
            p.pop("product_images", None)
            seen[pid] = p

    return list(seen.values())[:limit]


def clear_cart(user_id: str) -> None:
    cart = get_or_create_cart(user_id)
    supabase.table("cart_items").delete().eq("cart_id", cart["id"]).execute()


def create_quotation_for_user(user_id: str) -> Dict[str, Any]:
    # replicate logic from cart_routes.create_quotation
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
        return None

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
            "line_total": line_total,
        })

    snapshot = {"items": snapshot_items, "generated_at": cart["created_at"]}

    res = (
        supabase.table("quotations")
        .insert({"user_id": user_id, "cart_snapshot": snapshot, "total": total, "status": "generated"})
        .execute()
    )

    return res.data[0] if res.data else None


def fetch_orders_for_user(user_id: str) -> List[Dict[str, Any]]:
    res = (
        supabase.table("orders")
        .select("id, order_number, total, status, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []

