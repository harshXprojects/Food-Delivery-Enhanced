# Food Delivery Enhanced — Setup Guide

---

## Step 1 — Connect MongoDB

### Option A: MongoDB Atlas (Free Cloud, Recommended)

1. Go to **https://cloud.mongodb.com** → Sign up / Log in (free)
2. Click **"Build a Database"** → Choose **Free (M0)** tier → Select region → Create
3. Create a **Database User** (username + password — save these!)
4. Under **Network Access** → Add IP Address → **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Connect"** → **"Drivers"** → Copy the connection string

It looks like this:
```
mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/food-delivery?retryWrites=true&w=majority
```

6. Paste it into `backend/.env`:
```
MONGO_URL=mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/food-delivery?retryWrites=true&w=majority
```

### Option B: Local MongoDB

Install MongoDB locally, then set:
```
MONGO_URL=mongodb://localhost:27017/food-delivery
```

---

## Step 2 — Configure Backend

Edit `backend/.env` with your values:
```env
MONGO_URL=mongodb+srv://...   ← your Atlas URI
JWT_SECRET=any_long_random_string_here
SALT=10
STRIPE_SECRET_KEY=sk_test_...
PORT=4000
```

Install and start:
```bash
cd backend
npm install
npm run server
```

You should see:
```
Server Started on port: 4000
DB Connected
```

---

## Step 3 — Create Your First Admin

Edit the credentials in `backend/scripts/seedAdmin.js`:
```js
const ADMIN_NAME     = "Super Admin";
const ADMIN_EMAIL    = "admin@yourdomain.com";
const ADMIN_PASSWORD = "YourPassword123";
```

Then run:
```bash
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
✅ Admin created successfully!
   Email:    admin@yourdomain.com
   Password: YourPassword123
```

---

## Step 4 — Start the Frontends

Open 4 separate terminals:

```bash
# Terminal 1 — Admin Panel → http://localhost:5173
cd admin && npm install && npm run dev

# Terminal 2 — Restaurant Portal → http://localhost:5174
cd restaurant && npm install && npm run dev

# Terminal 3 — Delivery Portal → http://localhost:5175
cd delivery && npm install && npm run dev

# Terminal 4 — Customer App → http://localhost:5176
cd frontend && npm install && npm run dev
```

---

## Step 5 — Create Restaurant & Delivery Users

1. Open **http://localhost:5173** → Login with your seeded admin credentials
2. Click **"Manage Users"** in the left sidebar
3. Use the **tabs** to switch between: Admins / Restaurants / Delivery Partners
4. Fill the form → click **Create**
5. Give the email + password to the restaurant/delivery partner

They can now log in at:
- Restaurant: **http://localhost:5174**
- Delivery:   **http://localhost:5175**

---

## New API Endpoints

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| POST | `/api/user/seed-admin` | None | Create first admin (one-time only) |
| POST | `/api/user/login` | None | Login (all roles) |
| POST | `/api/user/register` | None | Register customer |
| POST | `/api/user/register/admin` | Admin token | Create admin |
| POST | `/api/user/register/restaurant` | Admin token | Create restaurant user |
| POST | `/api/user/register/delivery` | Admin token | Create delivery user |
| GET | `/api/user/list?role=restaurant` | Admin token | List users by role |
| PUT | `/api/user/toggle-active/:id` | Admin token | Activate / deactivate user |
| DELETE | `/api/user/:id` | Admin token | Delete user |

---

## Roles

| Role | Portal URL |
|---|---|
| `admin` | http://localhost:5173 |
| `restaurant` | http://localhost:5174 |
| `delivery` | http://localhost:5175 |
| `user` (customer) | http://localhost:5176 |
