from functools import wraps
from flask import request, jsonify
from src.db import supabase
from src.auth import require_auth


def admin_required(fn):
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
