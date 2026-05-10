# 🍅 Tomato — Food Delivery Platform (Enhanced)

A full-stack MERN food delivery platform with **four separate portals**, role-based authentication, Stripe payments, and a complete DevOps pipeline — Docker Compose for local dev, Kubernetes + Ingress for production, and ArgoCD GitOps for automated deployments.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start — Local Dev](#quick-start--local-dev-docker-compose)
- [Manual Local Setup (No Docker)](#manual-local-setup-no-docker)
- [Kubernetes Deployment](#kubernetes-deployment)
- [ArgoCD GitOps](#argocd-gitops)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Tech Stack](#tech-stack)

---

## Features

**Customer App**
- Browse and filter food items by category
- Add to cart, place orders, track order status
- Stripe payment integration
- Favourite items, JWT-authenticated sessions

**Admin Panel**
- Manage food items (add, update, delete with image upload)
- View and manage all orders
- Manage users — create Admins, Restaurant owners, Delivery partners
- Activate / deactivate user accounts

**Restaurant Portal**
- View incoming orders assigned to the restaurant
- Update order status (preparing, ready, etc.)

**Delivery Portal**
- View orders ready for pickup
- Mark orders as delivered

**Backend**
- REST API with role-based access control (`admin`, `restaurant`, `delivery`, `user`)
- JWT authentication across all roles
- Bcrypt password hashing
- Multer file uploads for food images
- Favorites route
- One-time admin seed script for first-run setup

---

## Architecture

```
                        ┌─────────────────────────────────────────┐
                        │            NGINX Ingress                │
                        │  food.local / admin / restaurant /      │
                        │  delivery / api.food.local              │
                        └────────────────┬────────────────────────┘
                                         │
          ┌──────────────┬───────────────┼───────────────┬──────────────┐
          ▼              ▼               ▼               ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐
    │ Frontend │  │  Admin   │  │ Restaurant  │  │ Delivery │  │ Backend  │
    │ :5173    │  │  :5174   │  │   :5175     │  │  :5176   │  │  :4000   │
    │ React    │  │  React   │  │   React     │  │  React   │  │ Express  │
    └──────────┘  └──────────┘  └─────────────┘  └──────────┘  └────┬─────┘
                                                                      │
                                                               ┌──────▼──────┐
                                                               │   MongoDB   │
                                                               │   :27017    │
                                                               └─────────────┘
```

---

## Project Structure

```
Food-Delivery-Enhanced-fixed/
├── frontend/               # Customer app — React + Vite
├── admin/                  # Admin panel — React + Vite
├── restaurant/             # Restaurant portal — React + Vite
├── delivery/               # Delivery partner portal — React + Vite
├── backend/
│   ├── controllers/        # Business logic (food, user, cart, order, favorites)
│   ├── middleware/         # JWT auth + admin guard
│   ├── models/             # Mongoose models (User, Food, Order)
│   ├── routes/             # Express routers
│   ├── scripts/
│   │   └── seedAdmin.js    # One-time first admin creation script
│   └── server.js           # App entry point
├── kubernetes/
│   ├── Namespace.yml
│   ├── secrets.yml         # MongoDB + JWT + Stripe secrets (base64)
│   ├── mongodb.yml         # StatefulSet + Service
│   ├── mongodb-pvc.yml     # Persistent Volume Claim
│   ├── backend.yml
│   ├── frontend.yml
│   ├── admin.yml
│   ├── restaurant-delivery.yml
│   ├── ingress.yml         # NGINX Ingress with host-based routing
│   └── kind/
│       └── kind-cluster.yml  # Local kind cluster config (1 control-plane + 2 workers)
├── ArgoCd/
│   └── application.yml     # ArgoCD Application manifest
├── docker-compose.yml      # Full local stack (all services + MongoDB)
├── SETUP.md                # Detailed first-run setup guide
└── bug report/             # Bug report docs
```

---

## Quick Start — Local Dev (Docker Compose)

### 1. Clone and configure

```bash
git clone https://github.com/harshXprojects/Food-Delivery-Enhanced-fixed.git
cd Food-Delivery-Enhanced-fixed
```

Create `backend/.env`:

```env
MONGO_URL=mongodb://admin:password@mongodb:27017/tomato?authSource=admin
JWT_SECRET=your_long_random_secret_here
SALT=10
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PORT=4000
```

### 2. Start all services

```bash
docker compose up --build
```

| Portal | URL |
|---|---|
| Customer App | http://localhost:5173 |
| Admin Panel | http://localhost:5174 |
| Restaurant Portal | http://localhost:5175 |
| Delivery Portal | http://localhost:5176 |
| Backend API | http://localhost:4000 |
| MongoDB | localhost:27018 (host-mapped) |

### 3. Seed the first admin

```bash
docker compose exec backend npm run seed
```

Or edit `backend/scripts/seedAdmin.js` first to set your preferred credentials, then run it.

### 4. Create restaurant and delivery users

Log in to the Admin Panel at **http://localhost:5174** → **Manage Users** → use the tabs to create Restaurant and Delivery accounts, then share their credentials.

---

## Manual Local Setup (No Docker)

> See [SETUP.md](./SETUP.md) for full step-by-step instructions. Quick version below.

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

```bash
# Backend
cd backend && npm install
# create backend/.env with MONGO_URL, JWT_SECRET, SALT, STRIPE_SECRET_KEY
npm run server          # runs on :4000

# Seed first admin (in a second terminal)
cd backend && npm run seed

# Frontends — open 4 terminals
cd admin       && npm install && npm run dev   # :5173
cd restaurant  && npm install && npm run dev   # :5174
cd delivery    && npm install && npm run dev   # :5175
cd frontend    && npm install && npm run dev   # :5176
```

---

## Kubernetes Deployment

### Option A — Local cluster with kind

```bash
# Install kind if needed: https://kind.sigs.k8s.io/docs/user/quick-start/
kind create cluster --config kubernetes/kind/kind-cluster.yml

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Option B — Cloud cluster (EKS / GKE / AKS)

Provision your cluster and configure `kubectl` to point to it, then install the NGINX Ingress Controller for your provider.

### Deploy the app

```bash
# Update secrets first — replace base64 values in kubernetes/secrets.yml
# Defaults encode: admin / password / tomato / your_secret_key_here / your_stripe_secret_key_here
echo -n "your_jwt_secret" | base64
echo -n "your_stripe_key" | base64

# Apply all manifests
kubectl apply -f kubernetes/Namespace.yml
kubectl apply -f kubernetes/secrets.yml
kubectl apply -f kubernetes/mongodb-pvc.yml
kubectl apply -f kubernetes/mongodb.yml
kubectl apply -f kubernetes/backend.yml
kubectl apply -f kubernetes/frontend.yml
kubectl apply -f kubernetes/admin.yml
kubectl apply -f kubernetes/restaurant-delivery.yml
kubectl apply -f kubernetes/ingress.yml

# Watch pods come up
kubectl get pods -n food-delivery -w
```

### Add local DNS (for kind / local cluster)

```bash
# Add to /etc/hosts
echo "127.0.0.1  food.local admin.food.local restaurant.food.local delivery.food.local api.food.local" | sudo tee -a /etc/hosts
```

| Portal | URL |
|---|---|
| Customer App | http://food.local:8081 |
| Admin Panel | http://admin.food.local:8081 |
| Restaurant Portal | http://restaurant.food.local:8081 |
| Delivery Portal | http://delivery.food.local:8081 |
| Backend API | http://api.food.local:8081 |

---

## ArgoCD GitOps

The `ArgoCd/application.yml` manifest configures ArgoCD to watch this repo and auto-sync the `kubernetes/` directory to your cluster.

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the application manifest
kubectl apply -f ArgoCd/application.yml
```

ArgoCD will automatically deploy and keep the `food-delivery` namespace in sync with the `main` branch. Any push to `kubernetes/` triggers a reconciliation.

> **Note:** If you fork this repo, update the `repoURL` in `ArgoCd/application.yml` to point to your fork.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/register` | Register a new customer |
| POST | `/api/user/login` | Login (all roles — returns JWT) |
| POST | `/api/user/seed-admin` | Create first admin (one-time only) |

### Admin-Only Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/register/admin` | Create a new admin |
| POST | `/api/user/register/restaurant` | Create a restaurant user |
| POST | `/api/user/register/delivery` | Create a delivery partner |
| GET | `/api/user/list?role=restaurant` | List users, optionally filtered by role |
| PUT | `/api/user/toggle-active/:userId` | Activate or deactivate a user |
| DELETE | `/api/user/:userId` | Delete a user |

### Authenticated Endpoints (any logged-in user)

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/food` | Browse or manage food items |
| GET/POST/DELETE | `/api/cart` | Cart operations |
| POST | `/api/order` | Place an order |
| GET | `/api/order/userorders` | Get current user's orders |
| GET/POST | `/api/favorites` | Get or toggle favourite items |

All authenticated requests require the JWT token in the `token` header.

---

## Environment Variables

**`backend/.env`**

| Variable | Description | Example |
|---|---|---|
| `MONGO_URL` | MongoDB connection string | `mongodb://admin:password@mongodb:27017/tomato?authSource=admin` |
| `JWT_SECRET` | Secret key for signing JWTs | `any_long_random_string` |
| `SALT` | Bcrypt salt rounds | `10` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `PORT` | Backend port | `4000` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (×4 portals) | React 18, Vite, CSS Modules |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB 7 + Mongoose |
| Auth | JWT + Bcrypt |
| Payments | Stripe |
| File Uploads | Multer |
| Containerization | Docker, Docker Compose |
| Web Server (containers) | NGINX |
| Orchestration | Kubernetes (kind / EKS / GKE) |
| Ingress | NGINX Ingress Controller |
| GitOps / CD | ArgoCD |
