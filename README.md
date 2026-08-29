# 🚗 Vehicle Service & Repair Workshop Management CRM

An enterprise-grade, full-stack Role-Based Vehicle Service & Repair Workshop CRM built with **Next.js 14 (App Router)**, **Node.js/Express with TypeScript**, and **MongoDB**.

---

## 🌟 Key Highlights & Features

- **Strict Role-Based Access Control (RBAC)**:
  - 👨‍💼 **Admin / Workshop Manager**: Full system oversight, job card assignment/reassignment, SLA policy configuration, reports, revenue tracking, employee and customer management.
  - 🔧 **Technician / Mechanic**: Isolated view of only assigned vehicles, diagnosis and repair notes, parts & labor calculation, customer communication, follow-up scheduler.
  - 🚗 **Customer (Vehicle Owner)**: Self-service portal to register vehicles, book service requests, track real-time repair progress, approve cost estimates, chat with workshop staff, and rate completed work.

- **Automated SLA & Time Tracking Engine**:
  - Live First Response Time, Turnaround Time, and Delivery Time tracking.
  - Configurable SLA thresholds per priority (`Low`, `Medium`, `High`, `Critical`).
  - Automatic SLA breach detection and critical escalation workflow.

- **Interactive Workshop Modules**:
  - Itemized Parts & Labor Estimate Calculator with customer approval/rejection.
  - Internal Staff Notes (strictly hidden from customers) vs Public Communication.
  - Service follow-up scheduling with agenda and completion status.
  - Dynamic interactive charts (Recharts) for job volume, status distributions, and technician performance.
  - Comprehensive Audit / Activity Logs recording all state changes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

### 2. Backend Setup & Database Seeding

Open a terminal in the `backend/` directory:

```bash
cd backend
npm install
```

#### Seed Database (Sample Users, Vehicles, Job Cards, SLA rules)
```bash
npm run seed
```

#### Run Backend Server
```bash
npm run dev
# Server will start on http://localhost:5000
```

---

### 3. Frontend Setup

Open a separate terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
# Next.js will start on http://localhost:3000
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workshop.com` | `password123` | Full Workshop Management & Analytics |
| **Technician 1** | `ali@workshop.com` | `password123` | Engine Repair Specialist |
| **Technician 2** | `ahmed@workshop.com` | `password123` | Electrical & Diagnostics |
| **Customer 1** | `usman@gmail.com` | `password123` | Vehicle Owner (Toyota Corolla & Civic) |
| **Customer 2** | `sara@gmail.com` | `password123` | Vehicle Owner (Kia Sportage) |

*(The login screen also includes convenient **1-click quick login buttons** for instant demo access).*

---

## 📁 Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & env config
│   │   ├── controllers/     # Auth, Users, Customers, Vehicles, JobCards, SLA, Reports...
│   │   ├── middlewares/     # JWT Auth, Role check, JobCard ownership, Multer upload
│   │   ├── models/          # 11 Mongoose schema definitions
│   │   ├── routes/          # Express REST API routes
│   │   ├── services/        # SLA engine, notifications, activity logger
│   │   ├── utils/           # Database seeder & JWT utils
│   │   ├── app.ts           # Express application configuration
│   │   └── server.ts        # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── login/       # Universal Login page with demo fillers
    │   │   ├── admin/       # 13 Admin routes (Dashboard, Jobcards, Technicians, SLA, etc.)
    │   │   ├── technician/  # 8 Technician routes (Dashboard, My Jobs, Follow-ups, etc.)
    │   │   └── portal/      # 8 Customer portal routes (Dashboard, Book Service, etc.)
    │   ├── components/      # UI components, Status Badges, Charts, Modals, Timelines
    │   ├── context/         # AuthContext & ToastContext
    │   ├── services/        # Axios API client
    │   └── types/           # TypeScript interfaces
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.mjs
```