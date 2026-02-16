from flask import Blueprint, request, jsonify, Response
from src.db import supabase
from src.auth import require_auth
from src.admin_guard import admin_required
import csv
import io
from datetime import datetime

reports_bp = Blueprint("admin_reports", __name__, url_prefix="/api/admin/reports")

def make_csv(filename, headers, rows):
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(headers)
    cw.writerows(rows)

    output = si.getvalue()
    si.close()

    return Response(
        output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@reports_bp.get("/sales")
@require_auth
@admin_required
def sales_report():
    start = request.args.get("start")
    end = request.args.get("end")

    if not start or not end:
        return jsonify({"error": "start and end required"}), 400

    res = supabase.table("orders") \
        .select("id, total, status, created_at") \
        .gte("created_at", start) \
        .lte("created_at", end) \
        .execute()

    rows = []
    for o in res.data:
        rows.append([
            o["id"],
            o["total"],
            o["status"],
            o["created_at"]
        ])

    return make_csv(
        "sales_report.csv",
        ["Order ID", "Total", "Status", "Date"],
        rows
    )


@reports_bp.get("/products")
@require_auth
@admin_required
def product_report():
    res = supabase.table("order_items") \
        .select("product_name, quantity, price") \
        .execute()

    totals = {}

    for row in res.data:
        name = row["product_name"]
        qty = row["quantity"]
        revenue = float(row["price"]) * qty

        if name not in totals:
            totals[name] = {"qty": 0, "revenue": 0}

        totals[name]["qty"] += qty
        totals[name]["revenue"] += revenue

    rows = []
    for name, d in totals.items():
        rows.append([name, d["qty"], d["revenue"]])

    return make_csv(
        "product_performance.csv",
        ["Product", "Total Sold", "Total Revenue"],
        rows
    )



@reports_bp.get("/customers")
@require_auth
@admin_required
def customer_report():
    users = supabase.table("user_profiles") \
        .select("id, full_name, blocked, created_at") \
        .execute()

    rows = []

    for u in users.data:
        rows.append([
            u["id"],
            u.get("full_name", ""),
            "Yes" if u["blocked"] else "No",
            u["created_at"]
        ])

    return make_csv(
        "customers.csv",
        ["User ID", "Name", "Blocked", "Joined"],
        rows
    )



@reports_bp.get("/orders")
@require_auth
@admin_required
def orders_report():
    orders = supabase.table("orders") \
        .select("id, status, total, created_at") \
        .execute()

    items = supabase.table("order_items") \
        .select("order_id, product_name, quantity, price") \
        .execute()

    grouped = {}

    for i in items.data:
        grouped.setdefault(i["order_id"], []).append(i)

    rows = []

    for o in orders.data:
        order_items = grouped.get(o["id"], [])

        for it in order_items:
            rows.append([
                o["id"],
                o["status"],
                o["total"],
                o["created_at"],
                it["product_name"],
                it["quantity"],
                it["price"]
            ])

    return make_csv(
        "orders_detailed.csv",
        [
            "Order ID",
            "Status",
            "Order Total",
            "Date",
            "Product",
            "Qty",
            "Price"
        ],
        rows
    )



