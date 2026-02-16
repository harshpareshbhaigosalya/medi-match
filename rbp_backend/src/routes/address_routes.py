from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase


address_bp = Blueprint("address", __name__, url_prefix="/api/address")


@address_bp.get("/")


@require_auth

def list_addresses():
    res = supabase.table("user_addresses") \
        .select("*") \
        .eq("user_id", request.user_id) \
        .order("created_at", desc=True) \
        .execute()

    return jsonify(res.data)


@address_bp.post("/")

@require_auth

def add_address():
    data = request.json

    payload = {
        "user_id": request.user_id,
        "full_name": data["full_name"],
        "phone": data["phone"],
        "address_line1": data["address_line1"],
        "address_line2": data.get("address_line2"),
        "city": data["city"],
        "state": data["state"],
        "pincode": data["pincode"],
    }

    res = supabase.table("user_addresses").insert(payload).execute()

    return jsonify(res.data[0])
