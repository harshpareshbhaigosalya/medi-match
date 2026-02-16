from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# load environment from .env into os.environ
load_dotenv()

from src.routes import profile_bp, product_bp, cart_bp
from src.routes.order_routes import orders_bp
from src.routes.address_routes import address_bp
from src.routes.auth_routes import auth_bp
from src.routes.admin_routes import admin_bp
from src.routes.admin_categories import admin_categories_bp
from src.routes.admin_products import admin_products_bp
from src.routes.admin_variants import admin_variants_bp
from src.routes.admin_orders import admin_orders_bp
from src.routes.admin_users import admin_users_bp
from src.routes.admin_dashboard import dashboard_bp
from src.routes.admin_reports import reports_bp
from src.routes.ai_routes import ai_bp

from src.routes.categories_routes import categories_bp   # <-- NEW


def create_app():
    app = Flask(__name__)

    # show whether Gemini key loaded (do NOT log the key itself)
    if os.getenv("GEMINI_API_KEY"):
        app.logger.info("GEMINI_API_KEY detected in environment")
    else:
        app.logger.warning("GEMINI_API_KEY NOT found in environment")

    # 🔥 prevent redirect /api/products → /api/products/
    app.url_map.strict_slashes = False

    # 🔥 Allow production and local origins
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        expose_headers=["Authorization"]
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(address_bp)
    app.register_blueprint(ai_bp)
    # ADMIN
    app.register_blueprint(admin_bp)
    app.register_blueprint(admin_categories_bp)
    app.register_blueprint(admin_products_bp)
    app.register_blueprint(admin_variants_bp)
    app.register_blueprint(admin_orders_bp)
    app.register_blueprint(admin_users_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(reports_bp)

    # PUBLIC categories API
    app.register_blueprint(categories_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
