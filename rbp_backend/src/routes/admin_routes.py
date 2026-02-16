from flask import Blueprint, jsonify
from src.auth import require_auth
from src.db import supabase

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def is_admin(user_id):
    res = (
        supabase.table("profiles")
        .select("role")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return res.data and res.data["role"] == "admin"


@admin_bp.get("/check")


@require_auth

def check_admin():
    if not is_admin(request.user_id):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify({"ok": True})
