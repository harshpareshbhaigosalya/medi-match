from src.db import supabase


def save_message(user_id, role, content):
    try:
        supabase.table("chat_messages").insert({
            "user_id": user_id,
            "role": role,
            "content": content,
        }).execute()
    except Exception:
        # non-fatal: ensure AI agent continues even if logging fails
        pass
