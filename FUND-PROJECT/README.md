# 🏦 Fund Transfer System

A modern, full-stack digital banking web application built for college-level demonstration.

## Features

### User Features
- 🔐 Secure JWT login (accounts created by admin)
- 💸 Fund transfers via NEFT, RTGS, IMPS, Mobile Pay
- 🔑 OTP verification for every transaction
- 👥 Beneficiary management (add, edit, delete, favorite)
- 📊 Dashboard with balance, charts, recent transactions
- 📜 Transaction history with filters, search, pagination
- 📄 PDF receipt download
- 🌙 Dark/Light theme toggle
- 📱 Fully responsive design

### Admin Features
- 🏦 **Create user accounts** (like a real bank)
- 👥 Manage users (block/unblock/delete)
- 💰 Credit/debit user balances
- 📊 Analytics dashboard with charts
- 🔍 Transaction monitoring
- ✅ Approve/reject/flag transactions
- 📨 Send notifications to users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| PDF | jsPDF |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fund-transfer
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- **Admin**: admin@fundtransfer.com / Admin@123
- **5 Users**: rahul@example.com / User@123 (and 4 more)
- Sample beneficiaries, transactions, and notifications

### 4. Start Development

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Usage Flow

1. **Admin** logs in → Creates user accounts (like a real bank)
2. **User** receives credentials → Logs in
3. User adds beneficiaries → Initiates transfers
4. OTP verification → Transaction completed
5. Download PDF receipt → View in transaction history
6. Admin monitors all transactions → Approves/rejects

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | User |
| POST | /api/auth/forgot-password | Public |
| POST | /api/auth/reset-password | Public |
| POST | /api/auth/change-password | User |
| GET | /api/users/profile | User |
| GET | /api/users/dashboard | User |
| CRUD | /api/beneficiaries | User |
| POST | /api/transfer/neft,rtgs,imps,mobile | User |
| POST | /api/transfer/verify-otp | User |
| GET | /api/transactions | User |
| POST | /api/admin/users | Admin |
| GET | /api/admin/analytics | Admin |
| GET/PUT | /api/admin/transactions | Admin |

## Project Structure

```
FUND-PROJECT/
├── client/           # React + Vite Frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth & Theme contexts
│       ├── pages/        # All pages + admin/
│       └── services/     # Axios API client
├── server/           # Express.js Backend
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middlewares/   # Auth, rate limit, error
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── seed/         # Sample data
│   └── utils/        # Helpers
└── README.md
```

## License
MIT
