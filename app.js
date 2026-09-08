// Registration & Login Page Controller (Page 1)
// Handles user registration, user login via Firebase Auth, whitespace checks, and redirects to profile.html on success

import { firebaseAuth } from './firebase-config.js';

// DOM Elements - Tab & View Switching
const tabBtnRegister = document.getElementById('tab-btn-register');
const tabBtnLogin = document.getElementById('tab-btn-login');
const pageRegister = document.getElementById('page-register');
const pageLogin = document.getElementById('page-login');
const linkToLogin = document.getElementById('link-to-login');
const linkToRegister = document.getElementById('link-to-register');

// Registration Form Elements
const formRegister = document.getElementById('form-register');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');
const toggleRegPwd = document.getElementById('toggle-reg-pwd');
const btnQuickFill = document.getElementById('btn-quick-fill');
const btnRegister = document.getElementById('btn-register');

const errRegName = document.getElementById('error-reg-name');
const errRegEmail = document.getElementById('error-reg-email');
const errRegPassword = document.getElementById('error-reg-password');
const regAuthError = document.getElementById('reg-auth-error');

// Login Form Elements
const formLogin = document.getElementById('form-login');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const toggleLoginPwd = document.getElementById('toggle-login-pwd');
const btnQuickFillLogin = document.getElementById('btn-quick-fill-login');
const btnLogin = document.getElementById('btn-login');

const errLoginEmail = document.getElementById('error-login-email');
const errLoginPassword = document.getElementById('error-login-password');
const loginAuthError = document.getElementById('login-auth-error');

// ==========================================================================
// REGEX VALIDATION LOGIC
// ==========================================================================

// a) Name: Only characters, no numbers and special characters allowed
function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Name cannot be empty or contain only spaces.' };
  }
  if (/\d/.test(name)) {
    return { valid: false, message: 'Name cannot contain numbers.' };
  }
  if (/[^A-Za-z\s]/.test(name)) {
    return { valid: false, message: 'Name cannot contain special characters (letters only).' };
  }
  if (/^[A-Za-z\s]+$/.test(name.trim())) {
    return { valid: true };
  }
  return { valid: false, message: 'Only characters and spaces allowed.' };
}

// b) Password: at least one number and one alphabet is required
function validatePassword(password) {
  if (!password || password.trim().length === 0) {
    return { valid: false, message: 'Password cannot be empty or contain only spaces.' };
  }
  if (/\s/.test(password)) {
    return { valid: false, message: 'Password cannot contain spaces.' };
  }
  
  const hasAlpha = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasAlpha && !hasDigit) {
    return { valid: false, message: 'Password must contain at least one alphabet and one number.' };
  }
  if (!hasAlpha) {
    return { valid: false, message: 'Password is missing an alphabet (A-Z, a-z). Please add a letter.' };
  }
  if (!hasDigit) {
    return { valid: false, message: 'Password is missing a number (0-9). Please add a digit.' };
  }

  return { valid: true };
}

// e) Email: strict standard RFC format with valid domain and min 2-letter alphabetic TLD
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email cannot be empty or contain only spaces.' };
  }
  if (/\s/.test(email)) {
    return { valid: false, message: 'Email cannot contain spaces.' };
  }
  if (email.includes(',')) {
    return { valid: false, message: 'Email cannot contain commas.' };
  }
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, message: "Email must follow standard format: username@domain.com" };
  }
  // Strict RFC email regex: alphabetic TLD only (at least 2 letters, e.g. .com, .in, .org)
  const strictEmailRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address with a valid domain (e.g. name@gmail.com).' };
  }
  return { valid: true };
}

// ==========================================================================
// INITIALIZE
// ==========================================================================
function init() {
  // If user already has an active session, redirect them to profile page directly
  const currentSession = firebaseAuth.loadSession();
  if (currentSession && currentSession.email) {
    window.location.href = 'profile.html';
    return;
  }

  setupEventListeners();
}

function setupEventListeners() {
  // Mode Switch Tabs & Links
  tabBtnRegister.addEventListener('click', () => switchAuthMode('register'));
  tabBtnLogin.addEventListener('click', () => switchAuthMode('login'));
  if (linkToLogin) linkToLogin.addEventListener('click', () => switchAuthMode('login'));
  if (linkToRegister) linkToRegister.addEventListener('click', () => switchAuthMode('register'));

  // Registration Form Submission
  formRegister.addEventListener('submit', handleRegistration);

  // Login Form Submission
  if (formLogin) {
    formLogin.addEventListener('submit', handleLogin);
  }

  // Quick Demo Autofill - Register
  btnQuickFill.addEventListener('click', () => {
    regName.value = 'Alex Morgan';
    regEmail.value = 'alex.morgan@example.com';
    regPassword.value = 'Pass123';
    clearRegistrationErrors();
  });

  // Quick Demo Autofill - Login
  if (btnQuickFillLogin) {
    btnQuickFillLogin.addEventListener('click', () => {
      loginEmail.value = 'alex.morgan@example.com';
      loginPassword.value = 'Pass123';
      clearLoginErrors();
    });
  }

  // Password Visibility Toggles
  toggleRegPwd.addEventListener('click', () => togglePasswordVisibility(regPassword, toggleRegPwd));
  if (toggleLoginPwd) {
    toggleLoginPwd.addEventListener('click', () => togglePasswordVisibility(loginPassword, toggleLoginPwd));
  }

  // Live real-time validation on typing - Register
  regName.addEventListener('input', () => {
    const res = validateName(regName.value);
    updateFieldUI(regName, errRegName, res);
  });

  regEmail.addEventListener('input', () => {
    const res = validateEmail(regEmail.value);
    updateFieldUI(regEmail, errRegEmail, res);
  });

  regPassword.addEventListener('input', () => {
    const res = validatePassword(regPassword.value);
    updateFieldUI(regPassword, errRegPassword, res);
  });

  // Live clearing on typing - Login
  if (loginEmail) {
    loginEmail.addEventListener('input', () => {
      loginEmail.classList.remove('is-invalid');
      if (errLoginEmail) errLoginEmail.textContent = '';
      if (loginAuthError) loginAuthError.style.display = 'none';
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', () => {
      loginPassword.classList.remove('is-invalid');
      if (errLoginPassword) errLoginPassword.textContent = '';
      if (loginAuthError) loginAuthError.style.display = 'none';
    });
  }
}

function switchAuthMode(mode) {
  clearRegistrationErrors();
  clearLoginErrors();

  if (mode === 'register') {
    tabBtnRegister.classList.add('active');
    tabBtnRegister.setAttribute('aria-selected', 'true');
    tabBtnLogin.classList.remove('active');
    tabBtnLogin.setAttribute('aria-selected', 'false');
    pageRegister.style.display = 'block';
    pageLogin.style.display = 'none';
  } else {
    tabBtnLogin.classList.add('active');
    tabBtnLogin.setAttribute('aria-selected', 'true');
    tabBtnRegister.classList.remove('active');
    tabBtnRegister.setAttribute('aria-selected', 'false');
    pageRegister.style.display = 'none';
    pageLogin.style.display = 'block';
  }
}

function togglePasswordVisibility(inputEl, btnEl) {
  if (inputEl.type === 'password') {
    inputEl.type = 'text';
    btnEl.textContent = 'Hide';
  } else {
    inputEl.type = 'password';
    btnEl.textContent = 'Show';
  }
}

function updateFieldUI(inputEl, errorEl, result) {
  if (result.valid) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    if (errorEl) errorEl.textContent = '';
  } else {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
    if (errorEl) errorEl.textContent = result.message;
  }
}

// ==========================================================================
// 1. REGISTRATION HANDLER (createUserWithEmailAndPassword)
// ==========================================================================
async function handleRegistration(e) {
  e.preventDefault();
  clearRegistrationErrors();

  const name = regName.value;
  const email = regEmail.value;
  const password = regPassword.value;

  const nameCheck = validateName(name);
  const emailCheck = validateEmail(email);
  const pwdCheck = validatePassword(password);

  updateFieldUI(regName, errRegName, nameCheck);
  updateFieldUI(regEmail, errRegEmail, emailCheck);
  updateFieldUI(regPassword, errRegPassword, pwdCheck);

  if (!nameCheck.valid || !emailCheck.valid || !pwdCheck.valid) {
    return;
  }

  // Show loading state on button
  btnRegister.disabled = true;
  btnRegister.innerHTML = '<span>Creating Account...</span>';

  try {
    // Attempt registration with Firebase Authentication (createUserWithEmailAndPassword)
    await firebaseAuth.registerUser({ name: name.trim(), email: email.trim(), password });

    // ONLY on success, perform redirection
    window.location.href = 'profile.html';
  } catch (error) {
    // Reset button state
    btnRegister.disabled = false;
    btnRegister.innerHTML = '<span>Register</span>';

    // Map Firebase error codes to user-facing messages
    let userMessage = "Registration failed. Please try again.";

    switch (error.code) {
      case 'auth/email-already-in-use':
        userMessage = "This email is already registered. Try logging in instead.";
        regEmail.classList.add('is-invalid');
        regEmail.classList.remove('is-valid');
        if (errRegEmail) errRegEmail.textContent = userMessage;
        break;
      case 'auth/weak-password':
        userMessage = "Password is too weak.";
        regPassword.classList.add('is-invalid');
        regPassword.classList.remove('is-valid');
        if (errRegPassword) errRegPassword.textContent = userMessage;
        break;
      case 'auth/invalid-email':
        userMessage = "Please enter a valid email address.";
        regEmail.classList.add('is-invalid');
        regEmail.classList.remove('is-valid');
        if (errRegEmail) errRegEmail.textContent = userMessage;
        break;
      default:
        userMessage = error.message || "Registration failed. Please try again.";
        break;
    }

    if (regAuthError) {
      regAuthError.textContent = userMessage;
      regAuthError.style.display = 'block';
    }
  }
}

// ==========================================================================
// 2. LOGIN HANDLER (signInWithEmailAndPassword)
// ==========================================================================
async function handleLogin(e) {
  e.preventDefault();
  clearLoginErrors();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  let hasError = false;

  if (!email) {
    loginEmail.classList.add('is-invalid');
    if (errLoginEmail) errLoginEmail.textContent = 'Email cannot be empty.';
    hasError = true;
  }

  if (!password) {
    loginPassword.classList.add('is-invalid');
    if (errLoginPassword) errLoginPassword.textContent = 'Password cannot be empty.';
    hasError = true;
  }

  if (hasError) return;

  // Show loading state on button
  btnLogin.disabled = true;
  btnLogin.innerHTML = '<span>Signing In...</span>';

  try {
    // Attempt sign-in with Firebase Authentication (signInWithEmailAndPassword)
    await firebaseAuth.signInUser({ email, password });

    // ONLY on success, redirect to profile.html
    window.location.href = 'profile.html';
  } catch (error) {
    // Reset button state
    btnLogin.disabled = false;
    btnLogin.innerHTML = '<span>Log In</span>';

    // Map Firebase login error codes to user-facing messages
    let userMessage = "Login failed. Please check your credentials.";

    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        userMessage = "Incorrect password. Please try again.";
        loginPassword.classList.add('is-invalid');
        if (errLoginPassword) errLoginPassword.textContent = userMessage;
        break;
      case 'auth/user-not-found':
        userMessage = "No account found with this email. Please register first.";
        loginEmail.classList.add('is-invalid');
        if (errLoginEmail) errLoginEmail.textContent = userMessage;
        break;
      case 'auth/invalid-email':
        userMessage = "Please enter a valid email address.";
        loginEmail.classList.add('is-invalid');
        if (errLoginEmail) errLoginEmail.textContent = userMessage;
        break;
      default:
        userMessage = error.message || "Login failed. Please check your credentials and try again.";
        break;
    }

    if (loginAuthError) {
      loginAuthError.textContent = userMessage;
      loginAuthError.style.display = 'block';
    }
  }
}

function clearRegistrationErrors() {
  [regName, regEmail, regPassword].forEach(input => {
    input.classList.remove('is-invalid', 'is-valid');
  });
  [errRegName, errRegEmail, errRegPassword].forEach(el => {
    if (el) el.textContent = '';
  });
  if (regAuthError) {
    regAuthError.style.display = 'none';
    regAuthError.textContent = '';
  }
}

function clearLoginErrors() {
  if (loginEmail) loginEmail.classList.remove('is-invalid', 'is-valid');
  if (loginPassword) loginPassword.classList.remove('is-invalid', 'is-valid');
  if (errLoginEmail) errLoginEmail.textContent = '';
  if (errLoginPassword) errLoginPassword.textContent = '';
  if (loginAuthError) {
    loginAuthError.style.display = 'none';
    loginAuthError.textContent = '';
  }
}

// Smart Hide/Show Header on Scroll
let lastScrollY = window.scrollY;
const appHeader = document.querySelector('.app-header');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 40) {
    if (appHeader) appHeader.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    if (appHeader) appHeader.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
}, { passive: true });

// Initialize
window.addEventListener('DOMContentLoaded', init);
