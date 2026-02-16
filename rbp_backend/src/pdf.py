from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime


def generate_quotation_pdf(file_path, quotation):
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

    # Line
    c.setStrokeColor(colors.black)
    c.line(40, y, width - 40, y)
    y -= 25

    # ===== QUOTATION INFO =====
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Quotation")
    y -= 20

    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Quote No: {quotation['quote_number']}")
    y -= 14
    c.drawString(40, y, f"Date: {datetime.now().strftime('%d-%m-%Y')}")
    y -= 25

    # ===== ITEMS HEADER =====
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Product / Variant")
    c.drawString(300, y, "Qty")
    c.drawRightString(width - 40, y, "Amount (₹)")
    y -= 15

    c.setStrokeColor(colors.grey)
    c.line(40, y, width - 40, y)
    y -= 15

    c.setFont("Helvetica", 10)

    total = 0

    for item in quotation["cart_snapshot"]["items"]:
        line = f"{item['product_name']} — {item['variant_name']}"
        qty = item["quantity"]
        amt = item["line_total"]

        c.drawString(40, y, line)
        c.drawString(300, y, str(qty))
        c.drawRightString(width - 40, y, f"₹ {amt:.2f}")

        total += amt
        y -= 18

        # new page check
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
    c.drawCentredString(width / 2, 75, "Trusted by hospitals & clinics across India")

    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, 60, "Affordable • Reliable • Best Price • Best Service")

    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2, 45, "Thank you for choosing RB Panchal!")

    c.save()
