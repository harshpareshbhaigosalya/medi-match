# RB Panchal - Hospital & Pharmaceutical Equipment E-Commerce Platform | Bechlors-Final year project 

<div align="center">

[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-Latest-green?logo=flask)](https://flask.palletsprojects.com)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-purple?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)](https://python.org)

A modern, full-stack e-commerce platform specializing in hospital and pharmaceutical equipment with AI-powered features, admin dashboard, and seamless payment integration.

[**Live Demo**](#) • [**Features**](#features) • [**Tech Stack**](#tech-stack) • [**Quick Start**](#quick-start)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Admin Features](#admin-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

RB Panchal is a comprehensive e-commerce solution designed specifically for the hospital and pharmaceutical equipment industry. Built with modern technologies, it offers customers an intuitive shopping experience and administrators powerful management tools.

**Key Highlights:**
- ✅ **20+ Years of Industry Experience** - Trusted solutions for hospital & pharma equipment
- ✅ **500+ Products** - Wide range of ISO-certified equipment
- ✅ **ISO Certified** - SS 304 grade materials & quality assurance
- ✅ **AI-Powered Chatbot** - Intelligent customer support using Google Gemini
- ✅ **Comprehensive Admin Dashboard** - Real-time analytics and management tools

---

## ⚡ Features

### 🛒 **Customer Features**

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse 500+ hospital & pharmaceutical equipment products |
| **Smart Search & Filter** | Find products by category, specifications, and price |
| **Shopping Cart** | Persistent cart with real-time updates |
| **Checkout** | Secure payment processing with Stripe |
| **Order Management** | Track orders, view history, and download invoices |
| **User Profiles** | Manage personal information and addresses |
| **AI Chatbot** | Get instant support powered by Google Gemini |
| **Product Reviews** | Leave feedback and read customer reviews |
| **Wishlist** | Save favorite products for later |

### 👨‍💼 **Admin Features**

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time analytics and KPI monitoring |
| **Product Management** | Create, update, delete products with variants |
| **Inventory Management** | Stock tracking and management |
| **Order Management** | View, process, and fulfill orders |
| **User Management** | Manage customer accounts and roles |
| **Reports & Analytics** | Sales, revenue, and customer insights |
| **Category Management** | Organize products into categories |
| **AI Suggestions** | Get AI-powered insights and recommendations |

### 🔐 **Security Features**

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- CORS protection
- Input validation & sanitization

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Routing:** React Router DOM 7.11.0
- **UI Components:** Lucide React, Framer Motion
- **State Management:** React Context API
- **Charts:** Recharts 3.6.0
- **PDF Generation:** jsPDF 2.5.2
- **HTTP Client:** Axios 1.13.2
- **Database:** Supabase (PostgreSQL)

### **Backend**
- **Framework:** Flask with Flask-CORS
- **Authentication:** PyJWT
- **Database:** Supabase (PostgreSQL) with psycopg2
- **ORM:** Supabase Python Client
- **AI/ML:** Google Generative AI (Gemini)
- **Payment:** Stripe API
- **PDF Generation:** ReportLab
- **Server:** Gunicorn
- **Environment:** Python-dotenv

### **Infrastructure**
- **Hosting:** Heroku (Backend)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth
- **Payment Gateway:** Stripe
- **AI Services:** Google Generative AI

---

## 📁 Project Structure

```
rb-panchal/
├── rbp_backend/                  # Flask API Server
│   ├── app.py                    # Flask application entry point
│   ├── config.py                 # Configuration management
│   ├── requirements.txt           # Python dependencies
│   ├── Procfile                  # Heroku deployment config
│   └── src/
│       ├── auth.py               # Authentication logic
│       ├── db.py                 # Database connections
│       ├── admin_guard.py         # Admin middleware
│       ├── invoice_pdf.py         # Invoice generation
│       ├── pdf.py                # PDF utilities
│       ├── ai/
│       │   ├── agent.py          # AI agent orchestration
│       │   ├── llm_base.py        # LLM base classes
│       │   ├── memory.py          # AI memory management
│       │   └── tools.py           # AI tools
│       └── routes/
│           ├── auth_routes.py     # Authentication endpoints
│           ├── product_routes.py  # Product endpoints
│           ├── cart_routes.py     # Shopping cart endpoints
│           ├── order_routes.py    # Order endpoints
│           ├── profile_routes.py  # User profile endpoints
│           ├── address_routes.py  # Address management
│           ├── ai_routes.py       # AI chatbot endpoints
│           ├── admin_routes.py    # Admin endpoints
│           ├── admin_products.py  # Product management
│           ├── admin_categories.py# Category management
│           ├── admin_orders.py    # Order management
│           ├── admin_users.py     # User management
│           ├── admin_dashboard.py # Dashboard data
│           ├── admin_reports.py   # Reports & analytics
│           └── admin_variants.py  # Product variants
│
├── rbp_frontend/                 # React + Vite Application
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js          # ESLint configuration
│   ├── package.json              # Node dependencies
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Root component
│       ├── App.css               # Global styles
│       ├── index.css             # Base styles
│       ├── components/
│       │   ├── ChatBot.jsx        # AI chatbot component
│       │   ├── ChatBotWrapper.jsx # Chatbot wrapper
│       │   ├── Loader.jsx         # Loading component
│       │   ├── Onboarding.jsx     # Onboarding flow
│       │   └── ProtectedRoute.jsx # Route protection
│       ├── context/
│       │   └── AuthContext.jsx    # Authentication context
│       ├── layouts/
│       │   ├── MainLayout.jsx     # Main layout
│       │   └── PublicLayout.jsx   # Public layout
│       ├── lib/
│       │   ├── api.js             # API client
│       │   ├── http.js            # HTTP utilities
│       │   └── supabase.js         # Supabase client
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Products.jsx
│       │   ├── ProductDetails.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── Orders.jsx
│       │   ├── OrderDetails.jsx
│       │   ├── Profile.jsx
│       │   ├── Addresses.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Contact_US.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminProducts.jsx
│       │       ├── AdminCategories.jsx
│       │       ├── AdminOrders.jsx
│       │       ├── AdminUsers.jsx
│       │       ├── AdminVariants.jsx
│       │       ├── AdminReports.jsx
│       │       └── AdminAISuggestions.jsx
│       └── assets/               # Static assets
│
└── README.md                     # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### **Required Software**
- **Node.js** 18+ ([Download](https://nodejs.org))
- **Python** 3.8+ ([Download](https://python.org))
- **pip** (comes with Python)
- **npm** or **yarn** (comes with Node.js)

### **Required Accounts & Services**
- **Supabase Account** - [Create Free Account](https://supabase.com)
- **Stripe Account** - [Create Account](https://stripe.com)
- **Google Generative AI API Key** - [Get API Key](https://makersuite.google.com/app/apikey)
- **Git** - [Download](https://git-scm.com)

---

## 🚀 Installation & Setup

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/rb-panchal.git
cd rb-panchal
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd rbp_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **3. Frontend Setup**

```bash
# Navigate to frontend directory
cd ../rbp_frontend

# Install dependencies
npm install

# or with yarn
yarn install
```

---

## 🔑 Environment Configuration

### **Backend Environment Variables** (`.env`)

Create a `.env` file in the `rbp_backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Google Generative AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# Data API
DATA_API_URL=https://your-data-api.com

# Environment
FLASK_ENV=development
FLASK_DEBUG=1
```

### **Frontend Environment Variables** (`.env.local`)

Create a `.env.local` file in the `rbp_frontend` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

**How to Get These Values:**

1. **Supabase Keys:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Settings → API → Copy URL and keys

2. **Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the generated key

3. **Stripe Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Developers → API Keys
   - Copy Secret and Public keys

---

## ▶️ Running the Application

### **Development Mode**

**Terminal 1 - Backend:**
```bash
cd rbp_backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd rbp_frontend
npm run dev
# or
yarn dev
```
Frontend runs on: `http://localhost:5173`

### **Production Build**

**Frontend:**
```bash
cd rbp_frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd rbp_backend
gunicorn app:app
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### **Products**
- `GET /products` - Get all products
- `GET /products/:id` - Get product details
- `GET /categories` - Get all categories
- `POST /products/search` - Search products

### **Cart & Orders**
- `GET /cart` - Get shopping cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item
- `DELETE /cart/remove/:id` - Remove from cart
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

### **User**
- `GET /profile` - Get user profile
- `PUT /profile/update` - Update profile
- `GET /addresses` - Get user addresses
- `POST /addresses/add` - Add address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address

### **AI Chatbot**
- `POST /ai/chat` - Send message to AI chatbot
- `GET /ai/suggestions` - Get AI product suggestions

### **Admin** (Protected Routes)
- `GET /admin/dashboard` - Dashboard analytics
- `GET /admin/products` - Manage products
- `POST /admin/products/create` - Create product
- `PUT /admin/products/:id` - Update product
- `GET /admin/orders` - Manage orders
- `GET /admin/users` - Manage users
- `GET /admin/reports` - Generate reports

---

## 👨‍💼 Admin Features

### Access Admin Panel
1. Login with admin credentials
2. Navigate to `/admin/dashboard`
3. Access the following sections:

| Section | Capabilities |
|---------|--------------|
| **Dashboard** | View KPIs, revenue, orders, customer metrics |
| **Products** | Create, edit, delete products with variants |
| **Categories** | Manage product categories |
| **Orders** | View, process, and fulfill orders |
| **Users** | Manage customer accounts and permissions |
| **Variants** | Manage product specifications and options |
| **Reports** | Generate sales and analytics reports |
| **AI Insights** | Get AI-powered business recommendations |

---

## 🚀 Deployment

### **Heroku Deployment (Backend)**

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App:**
   ```bash
   cd rbp_backend
   heroku create your-app-name
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set SUPABASE_URL=your_value
   heroku config:set SUPABASE_ANON_KEY=your_value
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_value
   heroku config:set GEMINI_API_KEY=your_value
   heroku config:set STRIPE_SECRET_KEY=your_value
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### **Frontend Deployment (Netlify/Vercel)**

**Using Netlify:**
```bash
npm install -g netlify-cli
cd rbp_frontend
npm run build
netlify deploy --prod --dir=dist
```

**Using Vercel:**
```bash
npm install -g vercel
cd rbp_frontend
vercel --prod
```

### **Database Setup (Supabase)**

1. Create tables from SQL migrations
2. Enable Row Level Security (RLS) on all tables
3. Set up appropriate policies for data access
4. Enable real-time subscriptions if needed

---

## 🧪 Testing

```bash
# Backend Testing
cd rbp_backend
python -m pytest

# Frontend Testing (if configured)
cd rbp_frontend
npm run test

# Linting
npm run lint
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/rb-panchal.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and feedback

### **Code Style Guidelines**
- **Python:** Follow PEP 8
- **JavaScript/React:** Use ESLint configuration
- **Comments:** Write clear, concise comments
- **Commits:** Use meaningful commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

### **Get Help**
- 📧 Email: support@rbpanchal.com
- 💬 Chat with AI: Use the built-in chatbot on the website
- 📖 Documentation: [Full Docs](https://docs.rbpanchal.com)
- 🐛 Report Issues: [GitHub Issues](https://github.com/yourusername/rb-panchal/issues)

### **Business Information**
- **Website:** https://rbpanchal.com
- **Address:** [Your Address]
- **Phone:** [Your Phone]
- **Email:** contact@rbpanchal.com

---

## 🎓 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Supabase Guide](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Google Generative AI](https://ai.google.dev)

---

## 📊 Project Statistics

- **Total Components:** 40+
- **API Endpoints:** 30+
- **Database Tables:** 15+
- **Lines of Code:** 10,000+
- **Test Coverage:** XX%

---

## Youtube demo video

link: https://youtu.be/Z6H7n8i_QTk

---

## 🎉 Acknowledgments

- Built with ❤️ for the RB Panchal 
- Powered by [Supabase](https://supabase.com), [Stripe](https://stripe.com), and [Google AI](https://ai.google.dev)
- UI Components from [Lucide React](https://lucide.dev) and [Framer Motion](https://www.framer.com/motion)

---

<div align="center">

**Made with ❤️ for the Healthcare Industry**

Give us a ⭐ if you find this project helpful!

[⬆ Back to top](#rb-panchal---hospital--pharmaceutical-equipment-e-commerce-platform)

</div>
