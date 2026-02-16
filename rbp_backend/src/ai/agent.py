from src.ai.llm_base import LLMClient
from src.ai.memory import save_message
from src.ai import tools
import json
import re


def run_agent(user_id: str, message: str):
    """Hybrid AI Agent for Medi-Match.
    Uses rules first to save API quota, falling back to LLM ONLY when needed.
    """
    try:
        save_message(user_id, "user", message)
    except: pass

    client = LLMClient()
    print(f"--- AGENT SESSION: {message} ---")
    msg = message.lower().strip()
    print(f"DEBUG: Processing message: '{msg}'")
    
    intent = None
    product_name = None
    quantity = 1
    hospital_type = None
    response = ""
    actions = []

    # 1. IMMEDIATE RULE-BASED REPLIES (Zero LLM cost)
    # Using regex \b for whole word matching to avoid triggers inside words like "which" or "hospital"
    if re.search(r"\b(hi|hello|hey|hii|hola|greetings)\b", msg):
        return {
            "response": "Hi there! 👋 I'm your Medi-Match assistant, powered by RB Panchal. I can help you setup a new clinic, find specialized equipment, or manage your orders. What's on your mind?",
            "actions": [{"type": "SUGGEST_CHIPS", "chips": ["Show All Products", "Suggest for Clinic", "Physiotherapy Setup", "Contact Support"]}]
        }
    
    # 1b. CUSTOMER SUPPORT / COMPLAINTS / HELP (Prompt Support)
    support_keywords = ["damage", "broken", "return", "refund", "not working", "complain", "support", "help", "issue", "contact", "phone", "complain"]
    if any(re.search(rf"\b{k}\b", msg) for k in support_keywords):
        return {
            "response": "I'm sorry to hear you're having an issue. Our priority is to help you get back to serving your patients. 🩺\n\nPlease contact our Support Team directly:\n📞 **Call/WhatsApp: +91-9876543210**\n📧 **Email: support@rbpanchal.com**\n(Mon-Sat, 9 AM - 7 PM)",
            "actions": [{"type": "SUGGEST_CHIPS", "chips": ["My Orders", "Return Policy", "Speak to Agent"]}]
        }

    if any(w in msg for w in ["thank", "thanks"]):
        return {"response": "You're very welcome! Let me know if you need anything else to get your facility running smoothly. 😊", "actions": []}

    # 2. RULE-BASED INTENT DETECTION
    if re.search(r"\b(show|list|all|browse|view|get|see)\b.*\b(product|item|supply|medical|medic|catalog|equipment)\b", msg) or msg in ["products", "items"]:
        intent = "SHOW_PRODUCTS"
    elif re.search(r"\b(compare|versus|vs|difference|between)\b", msg):
        intent = "COMPARE"
    elif re.search(r"\b(bundle|package|set|deal|startup|complete)\b", msg):
        intent = "BUNDLE"
    elif re.search(r"\b(search|find|where is|look for)\b", msg):
        intent = "SEARCH_PRODUCT"
    elif re.search(r"\b(add|put|buy|order)\b.*\b(cart|basket)\b", msg):
        intent = "ADD_TO_CART"
    elif re.search(r"\b(hospital|clinic|opening|setup|suggest|recommend|physio|therapy|specialty|ward)\b", msg):
        intent = "SUGGEST_HOSPITAL_EQUIPMENT"
    elif re.search(r"\b(clear|empty|delete|remove)\b.*\b(cart|basket)\b", msg):
        intent = "CLEAR_CART"
    elif re.search(r"\b(order|past|history|my orders)\b", msg):
        intent = "SHOW_ORDERS"

    print(f"DEBUG: Rule-based intent detected: {intent}")

    # 3. LLM ASSISTED EXTRACTION
    if intent in ["ADD_TO_CART", "SEARCH_PRODUCT", "SUGGEST_HOSPITAL_EQUIPMENT", "COMPARE", "BUNDLE"] or not intent:
        try:
            print("DEBUG: Calling LLM for specific extraction...")
            system_prompt = (
                "You are Medi-Match AI, the intelligent procurement brain of RB Panchal Medical Supplies. "
                "Intents: SHOW_PRODUCTS, SEARCH_PRODUCT, ADD_TO_CART, SUGGEST_HOSPITAL_EQUIPMENT, COMPARE, BUNDLE, CLEAR_CART, SHOW_ORDERS, CHAT. "
                "For COMPARE: product_names = [A, B]. For BUNDLE: department = 'ICU'. "
                "Return ONLY JSON: {\"intent\": \"...\", \"product_names\": [], \"department\": \"...\", \"product_name\": \"...\", \"quantity\": 1, \"hospital_type\": \"...\"}"
            )
            ext = client.extract_json(f"{system_prompt}\nUser: {message}") or {}
            print(f"DEBUG: LLM Result: {ext}")
            if not intent or intent == "CHAT": intent = ext.get("intent")
            product_name = ext.get("product_name") or product_name
            product_names = ext.get("product_names") or []
            department = ext.get("department") or ext.get("hospital_type")
            quantity = int(ext.get("quantity") or 1)
            hospital_type = ext.get("hospital_type") or hospital_type
        except Exception as e:
            print(f"DEBUG: LLM extraction failed: {e}")
            pass

    # 4. INTENT HANDLERS
    if intent == "COMPARE":
        names = product_names or [w for w in msg.split() if len(w) > 4][:2]
        products = []
        for n in names[:2]:
            res = tools.search_products_by_name(n)
            if res: products.append(res[0])
        
        if len(products) < 2:
            response = "I need two specific products to compare. Try 'Compare Semi-Fowler vs Full-Fowler'."
        else:
            response = f"Here is a side-by-side comparison of the **{products[0]['name']}** and **{products[1]['name']}**."
            actions.append({
                "type": "COMPARE",
                "data": {
                    "products": [{"name": p["name"], "price": p.get("base_price"), "id": p["id"]} for p in products],
                    "features": ["description"]
                }
            })

    elif intent == "BUNDLE":
        dept = department or msg
        response = f"I've designed a professional **{dept.upper()} Startup Bundle** for you. This includes all essentials save you up to 15% on wholesale."
        
        # Bundle logic
        bundle_keywords = ["bed", "monitor", "furniture", "surgical"]
        if "icu" in dept.lower(): bundle_keywords = ["icu bed", "monitor", "ventilator", "infusion"]
        elif "physio" in dept.lower(): bundle_keywords = ["traction", "ultrasound", "tms", "wax bath"]
        
        items = []
        for kw in bundle_keywords:
            res = tools.search_products_by_name(kw)
            if res: items.append(res[0])
            
        actions.append({
            "type": "SHOW_PRODUCTS",
            "products": [{"id": p["id"], "title": p["name"], "price": p.get("base_price"), "image": p.get("image")} for p in items]
        })

    elif intent == "SHOW_PRODUCTS":
        products = tools.fetch_products(limit=40)
        if not products:
            response = "I couldn't find any products in our catalog right now. Contact support for offline catalog."
        else:
            response = "Here are our latest medical supplies and equipment. Tap any to see details!"
            actions.append({
                "type": "SHOW_PRODUCTS",
                "products": [{"id": p["id"], "title": p["name"], "price": p.get("base_price"), "image": p.get("image")} for p in products]
            })

    elif intent == "SEARCH_PRODUCT":
        term = product_name
        if not term:
            for trigger in ["show me", "search for", "find", "search", "where is"]:
                if trigger in msg:
                    term = msg.split(trigger)[-1].strip()
                    break
        
        term = term or msg
        results = tools.search_products_by_name(term)
        if results:
            response = f"I found {len(results)} matches for '{term}'. These are verified medical-grade items."
            actions.append({
                "type": "SHOW_PRODUCTS",
                "products": [{"id": p["id"], "title": p["name"], "price": p.get("base_price"), "image": p.get("image")} for p in results]
            })
        else:
            response = f"I couldn't find '{term}' in our online list. Please contact our sales team at +91-9876543210 for bespoke sourcing."

    elif intent == "ADD_TO_CART":
        term = product_name
        if not term:
            m = re.search(r"add (.+?) to", msg)
            if m: term = m.group(1)
        
        matched = None
        if term:
            candidates = tools.search_products_by_name(term)
            if candidates: matched = candidates[0]
        
        if matched:
            variants = tools.fetch_variants(matched["id"])
            if variants:
                response = f"🛒 Added {quantity} × {matched['name']} to your professional cart!"
                actions.append({"type": "ADD_TO_CART", "variants": [{"variant_id": variants[0]["id"], "qty": quantity}], "confirm": False})
            else:
                response = f"I found '{matched['name']}', but it's currently on back-order."
        else:
            response = "Which specific product would you like to add? (e.g., 'Add a Fowler Bed')"

    elif intent == "SUGGEST_HOSPITAL_EQUIPMENT":
        ctx = hospital_type or msg
        response = f"Setting up a **{ctx.upper()}** facility is a big step! Based on medical standards, here are the essential items you will need:"
        
        # Smart Keyword Mapping
        hk = []
        c_low = ctx.lower()
        if "physio" in c_low or "rehab" in c_low or "therapy" in c_low:
            hk = ["table", "traction", "ultrasound", "tms", "exercise", "physio", "gym"]
        elif "clinic" in c_low or "opd" in c_low:
            hk = ["examination", "stethoscope", "bp monitor", "furniture", "weighing"]
        elif "icu" in c_low or "critical" in c_low:
            hk = ["ventilator", "monitor", "icu bed", "infusion", "defibrillator"]
        elif "maternity" in c_low or "gynec" in c_low:
            hk = ["delivery", "incubator", "warmer", "foetal", "maternity"]
        elif "surgical" in c_low or "ot" in c_low or "theatre" in c_low:
            hk = ["operating", "anesthesia", "surgical", "light", "autoclave"]
        elif "eye" in c_low or "ophthal" in c_low or "vision" in c_low:
            hk = ["slit lamp", "ophthalmoscope", "vision", "eye", "lens", "trial", "chair"]
        else:
            # Try to use the original context words as keywords
            hk = [w for w in c_low.split() if len(w) > 3]

        suggestions = []
        seen = set()
        for k in hk:
            for p in tools.suggest_bulk_products_for_context(k):
                if p["id"] not in seen:
                    suggestions.append(p)
                    seen.add(p["id"])
        
        if not suggestions:
            # If no matches, fetch general equipment
            suggestions = tools.fetch_products(15)

        actions.append({
            "type": "SHOW_PRODUCTS",
            "products": [{"id": p["id"], "title": p["name"], "price": p.get("base_price"), "image": p.get("image")} for p in (suggestions)[:12]]
        })

    elif intent == "SHOW_ORDERS":
        orders = tools.fetch_orders_for_user(user_id)
        if not orders: 
            response = "We don't see any orders associated with your account yet. Let's place your first one!"
        else:
            response = "Here are your recent procurement records with RB Panchal:"
            actions.append({
                "type": "SHOW_ORDERS", 
                "orders": orders
            })

    elif intent == "CLEAR_CART":
        response = "Ready to clear your cart. Are you sure?"
        actions.append({"type": "CLEAR_CART", "confirm": True})

    else:
        # DEFAULT CHAT - Using fixed response to save quota
        response = "I'm here to help! I can show products, search for equipment, or manage your cart. What's on your mind?"

    try:
        save_message(user_id, "assistant", response)
    except: pass

    return {"response": response, "actions": actions}
