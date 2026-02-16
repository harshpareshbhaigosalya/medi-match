import requests
import jwt
from flask import request, jsonify
from functools import wraps
from config import Config
from src.db import supabase  # make sure this is your Supabase client

JWKS_URL = f"{Config.SUPABASE_URL}/auth/v1/.well-known/jwks.json"


def fetch_jwks():
    res = requests.get(
        JWKS_URL,
        headers={"apikey": Config.SUPABASE_ANON_KEY}
    )
    res.raise_for_status()
    return res.json()


def get_public_key(token):
    jwks = fetch_jwks()
    header = jwt.get_unverified_header(token)

    for key in jwks["keys"]:
        if key["kid"] == header["kid"]:
            return jwt.algorithms.ECAlgorithm.from_jwk(key)

    raise Exception("Matching JWK not found")


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # -------------------- Step 1: Get token --------------------
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            token = request.args.get("token")

        if not token:
            return jsonify({"error": "Missing token"}), 401

        # -------------------- Step 2: Verify token --------------------
        try:
            public_key = get_public_key(token)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["ES256"],
                audience="authenticated",
            )
            request.user_id = payload["sub"]
        except Exception as e:
            return jsonify({"error": "Invalid token", "detail": str(e)}), 401

        user_id = request.user_id

        # -------------------- Step 3: Fetch user profile --------------------
        try:
            profile_res = (
                supabase.table("user_profiles")
                .select("*")
                .eq("id", user_id)
                .maybe_single()  # ✅ safe even if 0 rows
                .execute()
            )
            profile = profile_res.data if profile_res else None
        except Exception as e:
            # If something goes wrong with Supabase
            return jsonify({"error": "Failed to fetch profile", "detail": str(e)}), 500

        # -------------------- Step 4: Check if blocked --------------------
        if profile and profile.get("blocked"):
            return jsonify({"error": "Account blocked"}), 403

        if payload.get("email") == "admin@gmail.com":
            # Auto-promote to admin
            supabase.table("user_profiles").update({"role": "admin"}).eq("id", request.user_id).execute()

        # -------------------- Step 5: Call the actual route --------------------
        return fn(*args, **kwargs)

    return wrapper


def get_current_user():
    """
    Return current user profile from request.user_id
    Must be used inside a route wrapped with @require_auth
    """
    user_id = getattr(request, "user_id", None)
    if not user_id:
        return None

    res = (
        supabase.table("user_profiles")
        .select("*")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return res.data if res.data else None