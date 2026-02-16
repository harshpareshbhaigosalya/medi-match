from flask import Blueprint, jsonify
from src.db import supabase

categories_bp = Blueprint(
    "categories_public",
    __name__,
    url_prefix="/api/categories"
)

@categories_bp.get("/")
def get_categories():
    res = (
        supabase.table("product_categories")
        .select("id, name")
        .order("name")
        .execute()
    )

    return jsonify(res.data)
