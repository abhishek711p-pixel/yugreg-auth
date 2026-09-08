// Registration Page Controller (Page 1)
// Handles user registration, Firebase session creation, and redirects to profile.html on success

import { firebaseAuth } from './firebase-config.js';

// DOM Elements
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

// a) Name: Only characters, no numbers and special characters allowed
function validateName(name) {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, message: 'Name cannot be empty.' };
  if (/\d/.test(trimmed)) return { valid: false, message: 'Name cannot contain numbers.' };
  if (/[^A-Za-z\s]/.test(trimmed)) return { valid: false, message: 'Name cannot contain special characters (letters only).' };
  if (/^[A-Za-z\s]+$/.test(trimmed)) return { valid: true };
  return { valid: false, message: 'Only characters and spaces allowed.' };
}

// b) Password: at least one number and one alphabet is required
function validatePassword(password) {
  if (!password) return { valid: false, message: 'Password cannot be empty.' };
  
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

// e) Email: basic format should follow
function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, message: 'Email cannot be empty.' };
  if (!trimmed.includes('@')) return { valid: false, message: "Email must include an '@' symbol." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email format (e.g. name@example.com).' };
  }
  return { valid: true };
}

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
  // Registration Form Submission
  formRegister.addEventListener('submit', handleRegistration);

  // Quick Demo Autofill
  btnQuickFill.addEventListener('click', () => {
    regName.value = 'Alex Morgan';
    regEmail.value = 'alex.morgan@example.com';
    regPassword.value = 'Pass123';
    clearRegistrationErrors();
  });

  // Password Visibility Toggle
  toggleRegPwd.addEventListener('click', () => {
    if (regPassword.type === 'password') {
      regPassword.type = 'text';
      toggleRegPwd.textContent = 'Hide';
    } else {
      regPassword.type = 'password';
      toggleRegPwd.textContent = 'Show';
    }
  });

  // Clear errors when user types in registration
  [regName, regEmail, regPassword].forEach(input => {
    input.addEventListener('input', () => clearRegistrationErrors());
  });
}

// Handle Registration Submission with Genuine Page Redirection
async function handleRegistration(e) {
  e.preventDefault();
  clearRegistrationErrors();

  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value;

  let hasError = false;

  const nameCheck = validateName(name);
  if (!nameCheck.valid) {
    showError(regName, errRegName, nameCheck.message);
    hasError = true;
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    showError(regEmail, errRegEmail, emailCheck.message);
    hasError = true;
  }

  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    showError(regPassword, errRegPassword, pwdCheck.message);
    hasError = true;
  }

  if (hasError) return;

  // Show loading state on button
  btnRegister.disabled = true;
  btnRegister.innerHTML = '<span>Creating Account...</span>';

  // Save to Firebase User Management
  await firebaseAuth.registerUser({ name, email, password });

  // Genuine Page Redirection to profile.html
  window.location.href = 'profile.html';
}

function showError(inputEl, errorEl, message) {
  inputEl.classList.add('is-invalid');
  inputEl.classList.remove('is-valid');
  if (errorEl) errorEl.textContent = message;
}

function clearRegistrationErrors() {
  [regName, regEmail, regPassword].forEach(input => {
    input.classList.remove('is-invalid', 'is-valid');
  });
  [errRegName, errRegEmail, errRegPassword].forEach(el => {
    if (el) el.textContent = '';
  });
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
