# YugReg | Mobile-First User Registration & Profile Validation App

A modern, responsive, mobile-first web application featuring multi-page account registration with **genuine browser page redirection**, automatic prefilling of registered user data, strict regex validation across all fields, and Google Firebase user management with secure session logout.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabhishek711p-pixel%2Fyugreg-auth)

---

## 🔗 Repository Branches
- **`main` branch**: [https://github.com/abhishek711p-pixel/yugreg-auth/tree/main](https://github.com/abhishek711p-pixel/yugreg-auth/tree/main) (Production)
- **`dev` branch**: [https://github.com/abhishek711p-pixel/yugreg-auth/tree/dev](https://github.com/abhishek711p-pixel/yugreg-auth/tree/dev) (Development)

---

## ✨ Key Technical Architecture & Features

- **🌐 Genuine Multi-Page URL Redirection**: 
  - **Step 1 (`/` or `/index.html`)**: Account creation page. On submission success, it performs a real browser redirect (`window.location.href = 'profile.html'`), visibly changing the URL bar to `/profile` (or `profile.html`).
  - **Step 2 (`/profile` or `/profile.html`)**: User information page with auto-prefilled registration data and full regex validation.
  - **Log Out**: Securely clears session and genuinely redirects back to `/index.html`.
- **📱 Mobile-First & Fully Responsive**: Optimized for smartphone viewports first, adapting smoothly to tablets and desktop screens.
- **🎨 Luxury Black & Warm White Theme**: Modern, high-contrast `#080808` obsidian dark background with `#fdfbf7` warm white typography and interactive elements.
- **🔒 Exact Regex Validation Rules**:
  - **a) Name**: Only characters and spaces allowed (`/^[A-Za-z\s]+$/`).
  - **b) Password**: At least one number and one alphabet required (`/^(?=.*[A-Za-z])(?=.*\d).+$/`).
  - **c) Mobile Number**: Exactly 10 numeric digits (`/^\d{10}$/`).
  - **d) Username**: Alphanumeric with exactly 1 special character (`/^[A-Za-z0-9]*[^A-Za-z0-9\s][A-Za-z0-9]*$/`).
  - **e) Email**: Standard RFC email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - **Non-Empty Check**: All fields are mandatory.
- **⚡ Dynamic Live Validation Feedback**: Field-specific real-time hints as you type (e.g., dynamically alerts if missing a letter vs. missing a number).
- **🔥 Firebase User Management**: Auto-prefills session data on step transition and provides reliable `signOut()` logout flow.
- **🛡️ Smart Scroll Navigation Header**: Header automatically hides on scroll down to maximize screen estate and reveals on scroll up.

---

## 🚀 Deployment Guide (Vercel)

### Option 1: Deploy via Vercel Web Dashboard (Recommended)
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`yugreg-auth`** repository.
3. Choose the branch you want to deploy (`main` or `dev`).
4. Click **Deploy**. Vercel will automatically build and publish your site in seconds!

### Option 2: Deploy via Vercel CLI
```bash
npx vercel
```
Follow the prompt instructions in your terminal to complete the deployment.

---

## 💻 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abhishek711p-pixel/yugreg-auth.git
   cd yugreg-auth
   ```

2. **Serve the project**:
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 📁 Project Structure

```
yugreg-auth/
├── index.html          # Registration Page (Step 1)
├── profile.html        # User Info & Validation Page (Step 2 - Genuine Redirection Target)
├── style.css           # Black & Warm White responsive CSS system
├── app.js              # Step 1 Registration controller & redirect router
├── profile.js          # Step 2 Profile validator & logout controller
├── firebase-config.js  # Firebase Auth client & session management
├── favicon.svg         # Geometric YugReg vector brand badge
├── vercel.json         # Vercel clean URL & route configuration
└── README.md           # Project documentation & setup guide
```
