from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime


def generate_invoice_pdf(file_path, order):
    c = canvas.Canvas(file_path, pagesize=A4)

    width, height = A4
    y = height - 50

    # ===== HEADER =====
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, y, "RB Panchal — Medical Equipment Supplier")
    y -= 20

    c.setFont("Helvetica", 10)
    c.drawString(40, y, "Email: info@rbpanchal.com   Phone: +91-XXXXXXXXXX")
    y -= 14
    c.drawString(40, y, "Address: (Add full address later)")
    y -= 25

    c.line(40, y, width - 40, y)
    y -= 25

    # ===== INVOICE INFO =====
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "INVOICE")
    y -= 20

    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Invoice No: {order['invoice_number']}")
    y -= 14
    c.drawString(40, y, f"Order No: {order['order_number']}")
    y -= 14
    c.drawString(40, y, f"Date: {datetime.now().strftime('%d-%m-%Y')}")
    y -= 25

    # ===== ITEMS HEADER =====
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Product")
    c.drawString(300, y, "Qty")
    c.drawRightString(width - 40, y, "Amount (₹)")
    y -= 15

    c.setStrokeColor(colors.grey)
    c.line(40, y, width - 40, y)
    y -= 15

    c.setFont("Helvetica", 10)

    total = 0

    cart = order.get("cart_snapshot")

    if not cart or "items" not in cart:
        # fail gracefully instead of crashing
        raise ValueError("Invoice cannot be generated — cart snapshot missing")

    for item in cart["items"]:
        line_name = f"{item['product_name']} — {item['variant_name']}"
        qty = item["quantity"]
        amt = item["line_total"]

        c.drawString(40, y, line_name)
        c.drawString(300, y, str(qty))
        c.drawRightString(width - 40, y, f"₹ {amt:.2f}")

        total += amt
        y -= 18

        if y < 120:
            c.showPage()
            y = height - 80
            c.setFont("Helvetica", 10)

    # ===== TOTAL =====
    y -= 10
    c.setStrokeColor(colors.black)
    c.line(40, y, width - 40, y)
    y -= 25

    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 40, y, f"TOTAL: ₹ {total:.2f}")
    y -= 30

    # ===== FOOTER =====
    c.setStrokeColor(colors.grey)
    c.line(40, 90, width - 40, 90)

    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(width / 2, 75, "Official tax invoice — keep for your records")

    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, 60, "Returns subject to company policy")

    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2, 45, "Thank you for your purchase!")

    c.save()
