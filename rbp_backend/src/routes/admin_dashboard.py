from flask import Blueprint, jsonify, request
from src.db import supabase
from src.auth import require_auth
from src.admin_guard import admin_required
from collections import defaultdict
from datetime import datetime, timedelta
from src.ai.llm_base import LLMClient
import os
import requests

dashboard_bp = Blueprint("admin_dashboard", __name__, url_prefix="/api/admin/dashboard")


@dashboard_bp.get("/")
@require_auth
@admin_required
def dashboard():
    today = datetime.utcnow().date()

    # TOTAL ORDERS
    orders = supabase.table("orders").select("id, total, status, created_at").execute().data

    total_orders = len(orders)
    revenue = sum(float(o["total"]) for o in orders)

    # ORDERS TODAY
    orders_today = [
        o for o in orders
        if o["created_at"][:10] == str(today)
    ]

    pending = len([o for o in orders if o["status"] == "pending"])

    # USERS
    users = supabase.table("user_profiles").select("id, blocked").execute().data
    active_users = len([u for u in users if not u["blocked"]])

    # GROUP — revenue last 30 days
    last_30 = datetime.utcnow() - timedelta(days=30)

    

    revenue_trend = defaultdict(float)

    for o in orders:
        d = o["created_at"][:10]
        revenue_trend[d] += float(o["total"])

    revenue_trend = [
        {"date": d, "amount": revenue_trend[d]}
        for d in sorted(revenue_trend.keys())
    ]



    last_week_values = [d["amount"] for d in revenue_trend[-7:]]

    avg_last_week = sum(last_week_values) / max(len(last_week_values), 1)
    
    prev_week_values = [d["amount"] for d in revenue_trend[-14:-7]]
    
    avg_prev_week = sum(prev_week_values) / max(len(prev_week_values), 1)

    growth = 0
    if avg_prev_week > 0:
        growth = round(((avg_last_week - avg_prev_week) / avg_prev_week) * 100, 2)

    # TOP PRODUCTS
    top = (
        supabase.table("order_items")
        .select("product_name, quantity")
        .execute()
        .data
    )

    product_totals = {}
    for t in top:
        product_totals[t["product_name"]] = product_totals.get(t["product_name"], 0) + t["quantity"]

    top_products = sorted(product_totals.items(), key=lambda x: x[1], reverse=True)[:5]

    # LOW STOCK
    low_stock = (
        supabase.table("product_variants")
        .select("id, variant_name, stock")
        .lte("stock", 5)
        .execute()
        .data
    )

    return jsonify({
        "kpis": {
            "total_orders": total_orders,
            "revenue": revenue,
            "orders_today": len(orders_today),
            "pending_orders": pending,
            "active_users": active_users
        },
        "charts": {
            "revenue_last_30": revenue_trend,
            "orders_by_status": {
                "pending": len([o for o in orders if o["status"] == "pending"]),
                "confirmed": len([o for o in orders if o["status"] == "confirmed"]),
                "shipped": len([o for o in orders if o["status"] == "shipped"]),
                "delivered": len([o for o in orders if o["status"] == "delivered"]),
                "cancelled": len([o for o in orders if o["status"] == "cancelled"]),
            },
            "top_products": [
                {"product": name, "sold": qty}
                for name, qty in top_products
            ]
        },
        "alerts": {
            "low_stock": low_stock
        },
        "insights": {
            "revenue_growth": growth
        }
    })



@dashboard_bp.get("/predictions")
@require_auth
@admin_required
def predictions():
    """Return AI-driven suggestions and richer analytics for admin UI.

    Outputs a JSON object with:
    - kpis: basic numbers
    - top_products: list with totals and recent trends
    - least_sellers: bottom items
    - monthly_seasonality: last 12 months sales totals
    - peak_hours: orders count by hour
    - new_arrivals: recently added products
    - recommendations: structured suggestions
    - text_insights: short textual summary
    """
    # Gather data
    orders = supabase.table("orders").select("id, total, created_at").execute().data or []
    order_items = supabase.table("order_items").select("order_id, product_name, variant_name, quantity, price").execute().data or []
    low_stock = supabase.table("product_variants").select("id, variant_name, stock").lte("stock", 10).execute().data or []
    products_recent = supabase.table("products").select("id, name, created_at").order("created_at", desc=True).limit(50).execute().data or []
    users = supabase.table("user_profiles").select("id, created_at").execute().data or []

    # map order_id -> created_at
    order_map = {o["id"]: o.get("created_at") for o in orders}

    # inventory aging (days since last sale)
    last_sold_date = {}
    for it in order_items:
        name = it.get("product_name") or "Unknown"
        oid = it.get("order_id")
        created = order_map.get(oid)
        if created:
            try:
                dt = datetime.fromisoformat(created).date()
                if name not in last_sold_date or dt > last_sold_date[name]:
                    last_sold_date[name] = dt
            except Exception: pass

    now = datetime.utcnow()
    inventory_aging = []
    for p in products_recent:
        name = p.get("name")
        last_date = last_sold_date.get(name)
        days = (now.date() - last_date).days if last_date else 999
        inventory_aging.append({"name": name, "days_idle": days})
    inventory_aging = sorted(inventory_aging, key=lambda x: x["days_idle"], reverse=True)[:10]

    # sales by product and time
    sales_count = {}
    sales_by_day = defaultdict(int)
    sales_by_month = defaultdict(int)
    sales_by_hour = defaultdict(int)

    for it in order_items:
        name = it.get("product_name") or "Unknown"
        qty = int(it.get("quantity") or 0)
        sales_count[name] = sales_count.get(name, 0) + qty

        oid = it.get("order_id")
        created = order_map.get(oid)
        if created:
            try:
                dt = datetime.fromisoformat(created)
            except Exception:
                # attempt without timezone
                try:
                    dt = datetime.strptime(created[:19], "%Y-%m-%dT%H:%M:%S")
                except Exception:
                    dt = None

            if dt:
                day = dt.date().isoformat()
                month = dt.strftime("%Y-%m")
                hour = dt.hour
                sales_by_day[day] += qty
                sales_by_month[month] += qty
                sales_by_hour[hour] += qty

    # top and least sellers
    top_products = sorted(sales_count.items(), key=lambda x: x[1], reverse=True)[:10]
    least_sellers = sorted(sales_count.items(), key=lambda x: x[1])[:10]

    # monthly seasonality - last 12 months
    
    months = []
    for i in range(11, -1, -1):
        m = (now.replace(day=1) - timedelta(days=30 * i)).strftime("%Y-%m")
        months.append(m)

    monthly_series = [{"month": m, "sales": sales_by_month.get(m, 0)} for m in months]

    # peak hours sorted
    peak_hours = sorted([{"hour": h, "orders": sales_by_hour[h]} for h in sales_by_hour], key=lambda x: x["orders"], reverse=True)

    # recent new arrivals (last 90 days)
    cutoff = now - timedelta(days=90)
    new_arrivals = [p for p in products_recent if p.get("created_at") and p.get("created_at")[:10] >= cutoff.date().isoformat()]

    # order value distribution
    order_values = [float(o.get("total") or 0) for o in orders]
    buckets = {"0-1k": 0, "1k-5k": 0, "5k-20k": 0, "20k+": 0}
    for v in order_values:
        if v < 1000: buckets["0-1k"] += 1
        elif v < 5000: buckets["1k-5k"] += 1
        elif v < 20000: buckets["5k-20k"] += 1
        else: buckets["20k+"] += 1
    
    order_value_dist = [{"bucket": k, "count": v} for k, v in buckets.items()]

    # USER METRICS
    total_users = len(users)
    last_30_cut = (now - timedelta(days=30)).date().isoformat()
    prev_30_cut = (now - timedelta(days=60)).date().isoformat()
    new_last_30 = [u for u in users if u.get("created_at") and u["created_at"][:10] >= last_30_cut]
    new_prev_30 = [u for u in users if u.get("created_at") and prev_30_cut <= u["created_at"][:10] < last_30_cut]
    growth_pct = round((len(new_last_30) - len(new_prev_30)) / max(1, len(new_prev_30)) * 100, 2) if len(new_prev_30) > 0 else 0
    
    sources = {}
    for u in users:
        s = u.get("signup_source") or "Direct"
        sources[s] = sources.get(s, 0) + 1
    top_sources = sorted(sources.items(), key=lambda x: x[1], reverse=True)[:5]

    # repeat rate
    user_order_counts = {}
    for o in orders:
        uid = o.get("user_id")
        user_order_counts[uid] = user_order_counts.get(uid, 0) + 1
    repeaters = len([u for u, c in user_order_counts.items() if c > 1])
    repeat_rate = round(repeaters / max(1, total_users) * 100, 2) if total_users else 0

    # prepare compact context for LLM
    ctx = {
        "kpis": {
            "total_orders": len(orders),
            "total_revenue": sum(order_values),
            "avg_order_value": sum(order_values) / max(1, len(orders)),
            "total_users": total_users,
            "repeat_rate": repeat_rate
        },
        "top_products": [{"name": n, "sold": q} for n, q in top_products],
        "least_sellers": [{"name": n, "sold": q} for n, q in least_sellers],
        "inventory_aging": inventory_aging,
        "order_value_dist": order_value_dist,
        "monthly_series": monthly_series,
        "peak_hours": peak_hours[:6],
        "low_stock": low_stock,
        "new_arrivals": [{"id": p.get("id"), "name": p.get("name"), "created_at": p.get("created_at")} for p in new_arrivals],
        "user_insights": {
            "growth_pct": growth_pct,
            "new_last_30": len(new_last_30),
            "top_sources": [{"source": s, "count": c} for s, c in top_sources]
        }
    }

    llm = LLMClient(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = (
        "You are a strategic business consultant for a medical supplies e-commerce platform. "
        "Analyze the provided JSON context and return a JSON object with these keys:\n"
        "- 'recommendations': array of {type, product, suggestion, reason} focused on inventory turnover and profitability.\n"
        "- 'growth_tactics': array of 3 specific actions to improve Average Order Value (AOV).\n"
        "- 'expected_sales': array of {product, expected_next_30_days} based on current trends.\n"
        "- 'text_insights': a friendly, formatted analysis (markdown-like but clean) about business performance, inventory aging risks, and high-value customer segments.\n"
        "- 'signals': array of business health flags like ['low_inventory_turnover', 'healthy_aov', 'high_churn_risk'].\n"
        "Return ONLY valid JSON. Context: " + str(ctx)
    )

    ai_resp = llm.extract_json(prompt, max_tokens=1200, retries=1)

    # Heuristic fallback if LLM fails or returns an error dict
    if not ai_resp or not isinstance(ai_resp, dict) or 'text_insights' not in ai_resp:
        recommendations = []
        for v in low_stock:
            suggested = max(20, (10 - (v.get("stock") or 0)) * 10)
            recommendations.append({
                "type": "restock",
                "product": v.get("variant_name"),
                "suggestion": suggested,
                "reason": f"Low stock ({v.get('stock')})"
            })

        text_insights = []
        text_insights.append(f"Top product: {top_products[0][0]} ({top_products[0][1]} units)" if top_products else "No sales yet")
        text_insights.append(f"Peak hour(s): {', '.join(str(h['hour']) for h in peak_hours[:3])}" if peak_hours else "No peak hour data")

        expected_sales = [{"product": n, "expected_next_30_days": int(q * 1.05)} for n, q in top_products]

        return jsonify({
            "source": "heuristic",
            "ctx": ctx,
            "recommendations": recommendations,
            "expected_sales": expected_sales,
            "text_insights": text_insights,
            "monthly_series": monthly_series,
            "peak_hours": peak_hours,
            "least_sellers": [{"name": n, "sold": q} for n, q in least_sellers]
        })

    # merge LLM output with computed analytics
    out = {
        "source": "llm",
        "ctx": ctx,
        "monthly_series": monthly_series,
        "peak_hours": peak_hours,
        "least_sellers": [{"name": n, "sold": q} for n, q in least_sellers],
    }
    out.update(ai_resp)
    return jsonify(out)


@dashboard_bp.get("/llm-check")
@require_auth
@admin_required
def llm_check():
    """Return available Generative API models (debug only, admin-only).

    Useful to verify whether the API key has access to specific models.
    """
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return jsonify({"error": "GEMINI_API_KEY not set in environment"}), 400

    url = f"https://generativelanguage.googleapis.com/v1/models?key={key}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        return jsonify({"ok": True, "models": r.json()}), 200
    except requests.exceptions.HTTPError as e:
        body = e.response.text if getattr(e, 'response', None) is not None else str(e)
        return jsonify({"ok": False, "error": f"HTTP {e.response.status_code}", "details": body}), 502
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@dashboard_bp.get("/user-insights")
@require_auth
@admin_required
def user_insights():
    """Compute user growth metrics and ask LLM for growth suggestions."""
    users = supabase.table("user_profiles").select("id, created_at, signup_source").execute().data or []
    orders = supabase.table("orders").select("id, user_id, total, created_at").execute().data or []

    total_users = len(users)

    # new users last 30 days vs previous 30
    now = datetime.utcnow()
    last_30_cut = (now - timedelta(days=30)).date().isoformat()
    prev_30_cut = (now - timedelta(days=60)).date().isoformat()

    new_last_30 = [u for u in users if u.get("created_at") and u["created_at"][:10] >= last_30_cut]
    new_prev_30 = [u for u in users if u.get("created_at") and prev_30_cut <= u["created_at"][:10] < last_30_cut]

    growth_pct = None
    if len(new_prev_30) > 0:
        growth_pct = round((len(new_last_30) - len(new_prev_30)) / max(1, len(new_prev_30)) * 100, 2)

    # repeat purchase rate
    user_order_counts = {}
    for o in orders:
        uid = o.get("user_id")
        user_order_counts[uid] = user_order_counts.get(uid, 0) + 1

    repeaters = len([u for u, c in user_order_counts.items() if c > 1])
    repeat_rate = round(repeaters / max(1, total_users) * 100, 2) if total_users else 0

    # avg order value
    totals = [float(o.get("total") or 0) for o in orders]
    avg_order_value = round(sum(totals) / max(1, len(totals)), 2) if totals else 0

    # top signup sources
    sources = {}
    for u in users:
        s = u.get("signup_source") or "organic"
        sources[s] = sources.get(s, 0) + 1

    top_sources = sorted(sources.items(), key=lambda x: x[1], reverse=True)[:5]

    ctx = {
        "total_users": total_users,
        "new_last_30": len(new_last_30),
        "new_prev_30": len(new_prev_30),
        "growth_pct": growth_pct,
        "repeat_rate": repeat_rate,
        "avg_order_value": avg_order_value,
        "top_sources": [{"source": s, "count": c} for s, c in top_sources]
    }

    # ask LLM for textual suggestions
    llm = LLMClient(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = (
        "You are a growth advisor for a medical supplies e-commerce business. "
        "Given the context JSON below, return a JSON with keys: 'suggestions' (array of textual suggestions), 'quick_actions' (array of {action, description}). "
        "Return only valid JSON. Context: " + str(ctx)
    )

    ai = llm.extract_json(prompt, max_tokens=800, retries=1)

    if not ai or not isinstance(ai, dict) or 'suggestions' not in ai:
        # heuristic suggestions
        suggestions = []
        if ctx["growth_pct"] is not None and ctx["growth_pct"] < 0:
            suggestions.append("Improve acquisition: run targeted ads for top categories and offer first-order discounts.")
        suggestions.append("Increase repeat purchases via 10% off for next order and email reminders.")

        quick_actions = [
            {"action": "create_promo", "description": "Create a first-time buyer promo code (10% off)"},
            {"action": "email_campaign", "description": "Send re-engagement email to customers without orders in 90 days"}
        ]

        return jsonify({"source": "heuristic", "ctx": ctx, "suggestions": suggestions, "quick_actions": quick_actions})

    return jsonify({"source": "llm", "ctx": ctx, **ai})


@dashboard_bp.post("/predictions")
@require_auth
@admin_required
def ask_predictions():
    """Handle POST requests for Gemini prompts."""
    body = request.get_json()
    prompt = body.get("prompt")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    # Query Gemini via LLMClient
    llm = LLMClient(api_key=os.getenv("GEMINI_API_KEY"))
    try:
        llm_resp = llm.completion(prompt)
        return jsonify({"llm_response": llm_resp}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to query Gemini API: {str(e)}"}), 500


@dashboard_bp.post("/ask")
@require_auth
@admin_required
def ask_gemini():
    """Handle POST requests to query Gemini API."""
    body = request.get_json()
    prompt = body.get("prompt")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    # Use LLMClient to query Gemini
    from ..ai.llm_base import LLMClient

    llm = LLMClient(api_key=os.getenv("GEMINI_API_KEY"))
    try:
        # Use LLMClient to query Gemini dynamically
        response = llm.completion(prompt)
        return jsonify({"llm_response": response}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to query Gemini API: {str(e)}"}), 500
