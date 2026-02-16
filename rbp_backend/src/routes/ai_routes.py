from flask import Blueprint, request, jsonify
from src.ai.agent import run_agent
import jwt
from src.auth import get_public_key
from config import Config


ai_bp = Blueprint("ai", __name__, url_prefix="/ai")


@ai_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "")

    # Try to infer authenticated user from Authorization header (optional)
    user_id = None
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

    if token:
        try:
            public_key = get_public_key(token)
            payload = jwt.decode(token, public_key, algorithms=["ES256"], audience="authenticated")
            user_id = payload.get("sub")
        except Exception:
            user_id = None

    # fallback to provided user_id in body or anonymous uuid
    if not user_id:
        user_id = data.get("user_id")
    if not user_id:
        import uuid
        user_id = str(uuid.uuid4())

    try:
        result = run_agent(user_id, message)
        return jsonify(result)
    except Exception:
        # fallback safe response
        return jsonify({"response": "Sorry, I couldn't process that right now.", "actions": []}), 500
