# YugReg | Mobile-First User Registration & Profile Validation App

A modern, responsive, mobile-first web application featuring account registration, automatic prefilling of user data, strict regex validation across all fields, and Google Firebase user management with session logout.

---

## ✨ Key Features

- **📱 Mobile-First & Fully Responsive**: Designed for smartphone viewports first, adapting gracefully to tablets and desktop screens.
- **🎨 Luxury Black & Warm White Theme**: Modern, high-contrast, clean minimalist aesthetic with animated hero brand badge.
- **🔒 Exact Regex Validation Engine**:
  - **a) Name**: Only characters and spaces allowed (`/^[A-Za-z\s]+$/`).
  - **b) Password**: At least one number and one alphabet required (`/^(?=.*[A-Za-z])(?=.*\d).+$/`).
  - **c) Mobile Number**: Exactly 10 numeric digits (`/^\d{10}$/`).
  - **d) Username**: Alphanumeric with exactly 1 special character (`/^[A-Za-z0-9]*[^A-Za-z0-9\s][A-Za-z0-9]*$/`).
  - **e) Email**: Standard RFC email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - **Non-Empty Check**: All fields are mandatory.
- **⚡ Smart Live Validation Feedback**: Field-specific, real-time error hints as you type (e.g. clearly indicates if a letter or number is missing in the password).
- **🔥 Firebase User Management**: Session persistence and logout flow (`signOut()`).
- **🛡️ Smart Scroll Navigation Header**: Header automatically hides on scroll down for maximum screen real estate and reveals on scroll up.

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/yugreg-auth.git
   cd yugreg-auth
   ```

2. **Run locally**:
   ```bash
   npx serve .
   ```
   Open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
yugreg-auth/
├── index.html          # Semantic HTML5 layout
├── style.css           # Black & Warm White responsive CSS system
├── app.js              # State router, live regex validator & form controller
├── firebase-config.js  # Firebase Auth client & session management
├── favicon.svg         # Geometric YugReg vector logo
└── README.md           # Project documentation
```

---

## 🌐 Deployment

### Deploy with Vercel:
```bash
npx vercel
```

### Deploy with Firebase Hosting:
```bash
npx firebase-tools login
npx firebase-tools init hosting
npx firebase-tools deploy
```
