# Udhaar Ledger 📚

A premium digital credit ledger application for small businesses to manage customer udhaar (credit) and payments.

## ✨ Features

- **Shopkeeper Authentication**: Secure Signup/Login with mobile number and password.
- **Customer Management**: Add, edit, and delete customers.
- **Transaction Tracking**: Record credit (udhaar) and payments for each customer.
- **Automatic Balance**: System automatically calculates if a customer owes you or has an advance.
- **Smart Dashboard**: Overview of total udhaar given, total collected, and customer count.
- **Search & Filters**: Quickly find customers by name/mobile and filter by status (Due/Settled).
- **Responsive UI**: Beautiful, mobile-first design with smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT-based Authentication, Bcrypt password hashing.

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. Clone the repository (or open the folder).
2. Install dependencies:
   ```bash
   # In the root directory
   npm install
   
   # In the server directory
   cd server && npm install
   
   # In the client directory
   cd ../client && npm install
   ```

3. Setup Environment Variables:
   Create a `.env` file in the `server` directory with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/udhaar-ledger
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

### Running the App

Run both frontend and backend concurrently from the root:
```bash
npm run dev
```

The frontend will be at `http://localhost:5173` and backend at `http://localhost:5000`.

## 📱 User Roles

- **Shop Owner**: Full access to manage customers and transactions.
