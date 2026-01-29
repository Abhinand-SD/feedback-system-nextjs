# 🔐 Full Stack Authentication & Admin Dashboard

A secure full‑stack web application built with **Next.js** that includes user authentication, admin authorization, feedback management, and session handling. This project focuses on **real‑world app security**, role‑based access control, and clean architecture.

---

## 🚀 Features

### 👤 User Side

* User signup & login
* Secure authentication using cookies / tokens
* Session‑based access control
* Feedback submission
* Protected routes

### 🛡️ Admin Side

* Admin login
* Admin dashboard
* View all user feedback
* Role‑based UI rendering (admin vs user)
* Protected admin routes

### 🔐 Security Highlights

* HTTP‑only cookies for auth tokens
* Proper logout handling
* Token refresh handling
* Prevention of infinite refresh loops
* Route protection via middleware / proxy
* Role validation on both **client & server**

---

## 🧱 Tech Stack

* **Frontend:** Next.js (App Router)
* **Backend:** Next.js API Routes
* **Authentication:** Cookie‑based / JWT
* **Database:** MongoDB
* **State Management:** React Hooks
* **Styling:** CSS / Tailwind (if applicable)
* **Version Control:** Git & GitHub

---

## 📂 Project Structure

```
/app
 ├── api
 │    └── auth
 │         ├── login
 │         ├── logout
 │         ├── refresh
 │         └── verify
 ├── admin
 │    └── dashboard
 ├── feedback
 ├── login
 ├── signup
 └── middleware / proxy

/models
/utils
/components
```

---

## ⚙️ Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## ▶️ Getting Started

```bash
# install dependencies
npm install

# run development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔄 Git Workflow Tip

If you want to revert to the previous pushed version:

```bash
git reset --hard HEAD
```

Or to go back to a specific commit:

```bash
git log
git reset --hard <commit-id>
```

---

## 🧪 Common Issues Solved

* ❌ Admin logged in but UI shows login/signup
* ❌ Infinite `/api/auth/refresh` loop
* ❌ Logout not clearing session properly
* ❌ Role mismatch between client & server

✔️ Fixed using centralized auth validation and role‑based rendering.

---

## 📌 Future Improvements

* Access & Refresh token rotation
* Audit logs for admin actions
* Pagination for feedback list
* Better error handling & loading states

---

## 👨‍💻 Author

**Abhinand SD**
MERN Stack Developer & Trainer

---

⭐ If you find this project useful, give it a star on GitHub!
