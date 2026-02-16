from flask import Blueprint, request, jsonify
from src.db import supabase
from src.auth import require_auth

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/ensure-profile")
@require_auth
def ensure_profile():
    user_id = request.user_id

    res = (
        supabase.table("user_profiles")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if res.data:
        return jsonify(res.data[0])

    created = (
        supabase.table("user_profiles")
        .insert({
            "id": user_id,
            "role": "user",
            "full_name": "",
            "org_type": None,
            "specialization": None
        })
        .execute()
    )

    return jsonify(created.data[0])