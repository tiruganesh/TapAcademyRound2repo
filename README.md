Name: Pasupuleti tiru ganesh

College: Vignan's Lara institute of technology & science

Contact Number: 9121556689

# Employee Attendance System

Full-stack Employee Attendance System with roles *Employee* and *Manager*.

## Tech Stack
- Frontend: React + Redux Toolkit + Tailwind CSS (Vite recommended)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT
- Other: CSV export, Seed script

---

## Repo layout
(See project root layout in the repo)

---

## Quick Setup (Local)

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- MongoDB running locally or MongoDB Atlas connection string

### 1) Backend Setup
# open terminal in backend
cd backend
cp .env.example .env
# update .env with real values
npm install
npm run seed       
npm run dev


### 2) Front setup
# open terminal in frontend/
cd frontend
cp .env.example .env
npm install
npm run dev

##Environments variables

Backend .env(example in .env.example)
example : PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

##Frontend .env

example : VITE_API_URL=http://localhost:5000/api

Seed data

Run npm run seed in backend/. Seed creates:

Manager: manager@company.com / Password: Password123

Employee: alice@company.com / Password: Password123

Employee: bob@company.com / Password: Password123

Sample attendance records for the current month



---

How to use

Register (employee) or login (manager using seeded credentials)

Employee can Check-in and Check-out

Manager can view team attendance, filter, and export CSV

---

Scripts

Backend package.json scripts:

npm run dev — run with nodemon

npm run start — production start

npm run seed — run seed script

Frontend package.json scripts:

npm run dev — start dev server

npm run build — build for production

npm run preview — preview build

