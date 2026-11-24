# Marketplace — Full-Stack E-Commerce Platform

A modern, responsive, full-stack multi-vendor e-commerce platform connecting buyers, sellers, and administrators. Built with a React 19 single-page frontend featuring a custom, lightweight design system, and a Django 5 REST Framework backend powered by Django's built-in SQL database (SQLite), native JWT authentication, and local media storage.

---

## Key Features

### 🛍️ Customer Experience (Buyers)

- **Product Discovery & Search**: Fast catalog search with multi-attribute filtering (category, price range, brand, ratings), sorting (newest, price, rating), and paginated browsing.
- **Cart & Server-Side Verification**: Real-time cart management with server-side stock validation, price calculations, bulk discount tiers, and configurable taxes & shipping.
- **Seamless Checkout**: Address management, order review, payment method selection, and instant order confirmation with unique order reference codes (`ORD-XXXXXXXX`).
- **Order Tracking & History**: Complete order lifecycle tracking (Pending, Processing, Shipped, Delivered, Cancelled) with detailed order summaries.
- **Wishlist & Recently Viewed**: One-click product wishlisting and persistent browsing history.
- **Reviews & Ratings**: Verified customer reviews with 1–5 star ratings and feedback.
- **Direct Store Messaging**: In-app chat connecting customers directly with sellers for product inquiries.

### 🏪 Seller Hub

- **Store Profile & Branding**: Custom store name, description, logo, banner, and verified merchant status.
- **Inventory & Catalog Management**: Full CRUD product management, category assignment, compare-at pricing, image uploads, and real-time inventory tracking with low-stock alerts.
- **Batch Inventory Tools**: CSV batch export and import utilities for bulk catalog updates.
- **Order Processing**: View incoming store orders, inspect customer shipping details, and transition order fulfillment statuses.
- **Performance Analytics**: Revenue graphs, total distinct orders, sales velocity, customer breakdown, and inventory health metrics.

### ⚙️ Administrator Controls

- **Platform Analytics**: High-level platform metrics including total users, active merchant stores, product counts, aggregate order volume, and gross revenue.
- **User & Store Governance**: Role-based access control (Admin, Seller, Customer), account status toggling, and merchant store verification/moderation.
- **Platform Configuration**: Global settings for taxes, flat shipping rates, and transaction fee management.

---

## Tech Stack

| Domain                | Technology                              | Description                                                                                               |
| :-------------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Frontend**          | **React 19**, React Router v7           | Single-page application using React Context API for state management                                      |
| **UI & Styling**      | **Modern Custom CSS Design System**     | Indigo/Slate/Emerald design system, accessible typography, frosted glassmorphism, responsive grid layouts |
| **Backend**           | **Django 5**, **Django REST Framework** | Robust RESTful API architecture with serialized validation and role-based permissions                     |
| **Database**          | **Django SQL Engine (SQLite)**          | Built-in relational database (`db.sqlite3`) with zero external DB dependencies                            |
| **Authentication**    | **Native JWT (PyJWT)**                  | Stateless Bearer token authentication with PBKDF2/SHA256 password hashing                                 |
| **Media Storage**     | **Local File Storage**                  | Django media engine serving uploaded store logos and product images (`/media/`)                           |
| **Testing & Quality** | **PyTest / Django Test / RTL / Jest**   | Comprehensive backend integration checks and React Testing Library suites                                 |

---

## Project Structure

```text
Marketplace/
├── backend/
│   ├── api/                    # Django application
│   │   ├── migrations/         # Database migrations
│   │   ├── management/         # Management commands (e.g., seed_data)
│   │   ├── authentication.py   # Native JWT authentication backend
│   │   ├── models.py           # Relational schema (User, Store, Product, Order, Review, etc.)
│   │   ├── serializers.py      # Request validation & JSON serialization
│   │   ├── views.py            # ViewSets & API endpoints
│   │   └── urls.py             # Route definitions
│   ├── marketplace/            # Django project settings & root routing
│   │   ├── settings.py         # App configuration, SQLite DB, JWT settings
│   │   └── urls.py             # Root URL router & static/media serving
│   ├── media/                  # Local media directory for product & store images
│   ├── check_api.py            # Automated API health & assertion test script
│   ├── verify_flow.py          # End-to-end integration & transaction test suite
│   ├── manage.py               # Django management CLI
│   ├── requirements.txt        # Python backend dependencies
│   └── .env.example            # Backend environment template
├── frontend/
│   ├── public/                 # HTML shell, favicons, web manifest
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Navbar, ChatBox, Reviews, Skeletons)
│   │   ├── context/            # React state providers (AuthContext, CartContext)
│   │   ├── hooks/              # Custom React hooks (useDocumentTitle)
│   │   ├── pages/              # Views (Home, Products, ProductDetail, Cart, Checkout, Seller, Admin)
│   │   ├── services/           # Axios API client configured with auth interceptors
│   │   ├── App.js              # Application routes & layout wrapper
│   │   └── index.css           # Modern design tokens, resets, and core utility classes
│   ├── package.json            # Frontend scripts & dependencies
│   └── .env.example            # Frontend environment template
├── package.json                # Root workspace orchestration scripts
├── .gitignore                  # Git ignore rules for Python, Node, media, and build artifacts
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites

- **Python**: `>= 3.10` and `pip`
- **Node.js**: `>= 18.0.0` and `npm`

---

### Step 1: Install Dependencies

You can install all dependencies across the root workspace, backend, and frontend with a single command:

```bash
npm run install-all
```

Or install them individually:

```bash
# 1. Install backend dependencies
cd backend
python -m pip install -r requirements.txt

# 2. Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Database Setup & Demo Data

Initialize the built-in SQLite database and populate sample products, stores, and accounts:

```bash
cd backend
python manage.py migrate
python manage.py seed_data
```

#### Pre-configured Demo Accounts:

| Role         | Email                  | Password      | Access / Capabilities                                           |
| :----------- | :--------------------- | :------------ | :-------------------------------------------------------------- |
| **Admin**    | `admin@example.com`    | `admin123`    | Full administrative controls, user management, platform metrics |
| **Seller**   | `seller@example.com`   | `seller123`   | Store inventory management, product CRUD, order processing      |
| **Customer** | `customer@example.com` | `customer123` | Product browsing, wishlist, cart, orders, reviews               |

---

### Step 3: Run the Development Servers

Start both the Django backend and React frontend concurrently from the root directory:

```bash
npm run dev
```

Alternatively, run each service in a separate terminal:

```bash
# Terminal 1: Django Backend (port 5000)
npm run server

# Terminal 2: React Frontend (port 3000)
npm run client
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Base**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Available Workspace Scripts

Run these scripts from the project root directory:

| Script          | Command                 | Action                                                                |
| :-------------- | :---------------------- | :-------------------------------------------------------------------- |
| `dev`           | `npm run dev`           | Runs backend (port 5000) and frontend (port 3000) concurrently        |
| `server`        | `npm run server`        | Starts the Django development server on `0.0.0.0:5000`                |
| `client`        | `npm run client`        | Starts the React development server on port 3000                      |
| `build`         | `npm run build`         | Builds the optimized React frontend production bundle                 |
| `test`          | `npm test`              | Runs the full verification pipeline (backend API tests + React tests) |
| `test:backend`  | `npm run test:backend`  | Runs the Django API assertion test script (`check_api.py`)            |
| `test:frontend` | `npm run test:frontend` | Runs the React Testing Library test suite                             |
| `lint`          | `npm run lint`          | Runs ESLint on frontend source files                                  |
| `lint:fix`      | `npm run lint:fix`      | Automatically fixes autofixable ESLint issues                         |
| `format`        | `npm run format`        | Formats all code using Prettier                                       |

---

## Testing & Quality Assurance

To verify system functionality and end-to-end integration:

```bash
# 1. Run backend unit tests
python backend/manage.py test api

# 2. Run API route validation
python backend/check_api.py

# 3. Run end-to-end transaction flow (login -> cart -> order -> seller update)
python backend/verify_flow.py

# 4. Run frontend test suite
npm --prefix frontend test -- --watchAll=false
```
