// Registration Page Controller (Page 1)
// Handles user registration, Firebase session creation, whitespace checks, and redirects to profile.html on success

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

// e) Email: basic format should follow
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email cannot be empty or contain only spaces.' };
  }
  if (/\s/.test(email)) {
    return { valid: false, message: 'Email cannot contain spaces.' };
  }
  if (!email.includes('@')) {
    return { valid: false, message: "Email must include an '@' symbol." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // Live real-time validation on typing
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

// Handle Registration Submission with Genuine Page Redirection
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

  // Save to Firebase User Management
  await firebaseAuth.registerUser({ name: name.trim(), email: email.trim(), password });

  // Genuine Page Redirection to profile.html
  window.location.href = 'profile.html';
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
