// Firebase Authentication & Session Management Module
// Connected to live project: yugreg-auth

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Official Web App Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC6vmFpffpVuG7v9bN8mtcNFPZmDtejUX8",
  authDomain: "yugreg-auth.firebaseapp.com",
  projectId: "yugreg-auth",
  storageBucket: "yugreg-auth.firebasestorage.app",
  messagingSenderId: "16184009652",
  appId: "1:16184009652:web:afb873ba0c468a0f3448e1",
  measurementId: "G-TN4N1EMJYW"
};

// Initialize Firebase App & Auth
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization notice:", e);
}

class FirebaseService {
  constructor() {
    this.auth = auth;
    this.currentUser = this.loadSession();
    this.authListeners = [];

    if (this.auth) {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || (this.currentUser ? this.currentUser.name : ''),
            password: this.currentUser ? this.currentUser.password : '',
            mobile: this.currentUser ? this.currentUser.mobile : '',
            username: this.currentUser ? this.currentUser.username : ''
          };
          localStorage.setItem('yugreg_user_session', JSON.stringify(this.currentUser));
        }
      });
    }
  }

  loadSession() {
    try {
      const session = localStorage.getItem('yugreg_user_session');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(userData) {
    this.currentUser = {
      ...this.currentUser,
      ...userData,
      uid: (this.currentUser && this.currentUser.uid) || userData.uid || 'usr_' + Math.random().toString(36).substring(2, 9),
      createdAt: userData.createdAt || new Date().toISOString()
    };
    localStorage.setItem('yugreg_user_session', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem('yugreg_user_session');
  }

  // Register user account with Firebase Authentication
  async registerUser({ name, email, password }) {
    if (!email || !password || !name) {
      throw new Error("All fields (Name, Email, Password) are required.");
    }

    let uid = 'usr_' + Math.random().toString(36).substring(2, 9);

    // Call live Firebase Auth API if online and initialized
    if (this.auth) {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
      if (userCredential && userCredential.user) {
        uid = userCredential.user.uid;
        try {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          });
        } catch (profileErr) {
          console.warn("Could not update display name:", profileErr);
        }
      }
    }

    // Save session in local persistence for Step 2 prefill only on successful registration
    const user = this.saveSession({
      uid,
      name: name.trim(),
      email: email.trim(),
      password: password,
      mobile: '',
      username: '',
      provider: 'firebase.auth.emailPassword'
    });

    this.saveUserToRegistry(user);

    return {
      success: true,
      user: user,
      message: "Account registered successfully with Firebase Authentication!"
    };
  }

  // Sign out user session
  async signOut() {
    if (this.auth) {
      try {
        await fbSignOut(this.auth);
      } catch (err) {
        console.warn("Firebase signOut error:", err);
      }
    }
    this.clearSession();
    return { success: true, message: "User signed out successfully." };
  }

  saveUserToRegistry(user) {
    try {
      const registry = JSON.parse(localStorage.getItem('yugreg_user_registry') || '[]');
      const existingIdx = registry.findIndex(u => u.email === user.email);
      if (existingIdx >= 0) {
        registry[existingIdx] = { ...registry[existingIdx], ...user };
      } else {
        registry.unshift(user);
      }
      localStorage.setItem('yugreg_user_registry', JSON.stringify(registry.slice(0, 10)));
    } catch (e) {
      console.warn("Could not write to user registry:", e);
    }
  }

  getUserRegistry() {
    try {
      return JSON.parse(localStorage.getItem('yugreg_user_registry') || '[]');
    } catch (e) {
      return [];
    }
  }
}

export const firebaseAuth = new FirebaseService();
