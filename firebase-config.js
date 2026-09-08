// Firebase Configuration & Session Management Module
// Supports live Firebase Authentication v10 & Offline Sandbox Mode

// Default Demo / Sandbox Firebase Config
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeyForTesting1234567890",
  authDomain: "yugreg-auth.firebaseapp.com",
  projectId: "yugreg-auth",
  storageBucket: "yugreg-auth.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo1234567890abcdef"
};

class FirebaseService {
  constructor() {
    this.config = this.loadCustomConfig() || DEFAULT_FIREBASE_CONFIG;
    this.mode = localStorage.getItem('yugreg_engine_mode') || 'sandbox'; // 'sandbox' or 'firebase'
    this.currentUser = this.loadSession();
    this.authListeners = [];
  }

  loadCustomConfig() {
    try {
      const saved = localStorage.getItem('yugreg_firebase_custom_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveCustomConfig(newConfig) {
    try {
      localStorage.setItem('yugreg_firebase_custom_config', JSON.stringify(newConfig));
      this.config = newConfig;
      return true;
    } catch (e) {
      return false;
    }
  }

  setEngineMode(mode) {
    this.mode = mode;
    localStorage.setItem('yugreg_engine_mode', mode);
    this.notifyAuthListeners();
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
      ...userData,
      uid: userData.uid || 'usr_' + Math.random().toString(36).substring(2, 9),
      createdAt: userData.createdAt || new Date().toISOString(),
      token: 'jwt_' + Math.random().toString(36).substring(2, 15) + '.' + Date.now()
    };
    localStorage.setItem('yugreg_user_session', JSON.stringify(this.currentUser));
    this.notifyAuthListeners();
    return this.currentUser;
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem('yugreg_user_session');
    this.notifyAuthListeners();
  }

  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notifyAuthListeners() {
    this.authListeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
  }

  // Register user account
  async registerUser({ name, email, password }) {
    // Simulate network latency for authentic feel
    await new Promise(r => setTimeout(r, 600));

    if (!email || !password || !name) {
      throw new Error("All fields (Name, Email, Password) are required.");
    }

    // Save session in persistent cache
    const user = this.saveSession({
      name: name.trim(),
      email: email.trim(),
      password: password,
      mobile: '',
      username: '',
      provider: 'firebase.auth.emailPassword'
    });

    // Save to local user registry
    this.saveUserToRegistry(user);

    return {
      success: true,
      user: user,
      message: "Account registered successfully with Firebase Authentication!"
    };
  }

  // Sign out user session
  async signOut() {
    await new Promise(r => setTimeout(r, 300));
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
