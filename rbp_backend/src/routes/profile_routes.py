from flask import Blueprint, request, jsonify
from src.auth import require_auth
from src.db import supabase

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

# Get profile
@profile_bp.get("/")
@require_auth
def get_profile():
    res = supabase.table("user_profiles") \
        .select("*") \
        .eq("id", request.user_id) \
        .single() \
        .execute()
    return jsonify(res.data)

# Update profile
@profile_bp.put("/")
@require_auth
def update_profile():
    data = request.json
    res = supabase.table("user_profiles") \
        .update({
            "full_name": data.get("full_name"),
            "org_type": data.get("org_type"),
            "specialization": data.get("specialization")
        }) \
        .eq("id", request.user_id) \
        .execute()

    return jsonify(res.data)

# Onboarding route
@profile_bp.post("/onboarding/")
@require_auth
def onboarding():
    data = request.json

    full_name = data.get("full_name")
    org_type = data.get("org_type")
    specialization = data.get("specialization")

    # Validate required fields
    if not full_name:
        return jsonify({"error": "full_name is required"}), 400
    if not org_type:
        return jsonify({"error": "org_type is required"}), 400

    # Update user profile with onboarding data
    res = supabase.table("user_profiles") \
        .update({
            "full_name": full_name,
            "org_type": org_type,
            "specialization": specialization
        }) \
        .eq("id", request.user_id) \
        .execute()

    return jsonify({"success": True, "profile": res.data})
