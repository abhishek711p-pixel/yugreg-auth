// Simple & Clean Registration and Form Validation Controller
// Uses Firebase User Management / Session Storage & Exact Regex Rules

import { firebaseAuth } from './firebase-config.js';

// DOM Elements
const pageRegister = document.getElementById('page-register');
const pageProfile = document.getElementById('page-profile');
const logoutBtn = document.getElementById('logout-btn');

// Registration Form Elements
const formRegister = document.getElementById('form-register');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');
const toggleRegPwd = document.getElementById('toggle-reg-pwd');
const btnQuickFill = document.getElementById('btn-quick-fill');

const errRegName = document.getElementById('error-reg-name');
const errRegEmail = document.getElementById('error-reg-email');
const errRegPassword = document.getElementById('error-reg-password');

// Validation Form Elements
const formValidate = document.getElementById('form-validate');
const valName = document.getElementById('val-name');
const valPassword = document.getElementById('val-password');
const valMobile = document.getElementById('val-mobile');
const valUsername = document.getElementById('val-username');
const valEmail = document.getElementById('val-email');
const toggleValPwd = document.getElementById('toggle-val-pwd');
const btnValidate = document.getElementById('btn-validate');
const validationResult = document.getElementById('validation-result');

const errValName = document.getElementById('error-val-name');
const errValPassword = document.getElementById('error-val-password');
const errValMobile = document.getElementById('error-val-mobile');
const errValUsername = document.getElementById('error-val-username');
const errValEmail = document.getElementById('error-val-email');

// ==========================================================================
// REGEX VALIDATION LOGIC & DYNAMIC FIELD CHECKERS
// ==========================================================================

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

// c) Mobile Number: Only numbers are allowed and should be of 10 digits
function validateMobile(mobile) {
  const trimmed = mobile.trim();
  if (!trimmed) return { valid: false, message: 'Mobile Number cannot be empty.' };
  if (/\D/.test(trimmed)) return { valid: false, message: 'Only numbers are allowed in Mobile Number.' };
  if (trimmed.length < 10) return { valid: false, message: `Mobile Number must be 10 digits (currently ${trimmed.length}/10).` };
  if (trimmed.length > 10) return { valid: false, message: `Mobile Number cannot exceed 10 digits (currently ${trimmed.length}).` };
  if (/^\d{10}$/.test(trimmed)) return { valid: true };
  return { valid: false, message: 'Must be exactly 10 digits.' };
}

// d) Username: alphanumeric with one special character is allowed
function validateUsername(username) {
  const trimmed = username.trim();
  if (!trimmed) return { valid: false, message: 'Username cannot be empty.' };
  if (/\s/.test(trimmed)) return { valid: false, message: 'Username cannot contain spaces.' };

  const specialMatches = trimmed.match(/[^A-Za-z0-9]/g) || [];
  if (specialMatches.length === 0) {
    return { valid: false, message: 'Username requires exactly 1 special character (e.g. user_99 or alex@1).' };
  }
  if (specialMatches.length > 1) {
    return { valid: false, message: `Only 1 special character is allowed (found ${specialMatches.length}: ${specialMatches.join(' ')}).` };
  }

  // Check full regex: alphanumeric with 1 special character
  if (/^[A-Za-z0-9]*[^A-Za-z0-9\s][A-Za-z0-9]*$/.test(trimmed)) {
    return { valid: true };
  }
  return { valid: false, message: 'Username must be alphanumeric with 1 special character.' };
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

// ==========================================================================
// INITIALIZATION & SESSION CHECK
// ==========================================================================
function init() {
  const currentSession = firebaseAuth.loadSession();
  if (currentSession && currentSession.name && currentSession.email) {
    showProfilePage(currentSession);
  } else {
    showRegisterPage();
  }
  setupEventListeners();
}

function showRegisterPage() {
  pageRegister.classList.add('active');
  pageProfile.classList.remove('active');
  logoutBtn.style.display = 'none';
}

function showProfilePage(userData) {
  // Prefill data from registration
  valName.value = userData.name || '';
  valPassword.value = userData.password || '';
  valEmail.value = userData.email || '';
  valMobile.value = userData.mobile || '';
  valUsername.value = userData.username || '';

  // Clear previous validation results and errors
  clearValidationErrors();
  validationResult.style.display = 'none';

  pageRegister.classList.remove('active');
  pageProfile.classList.add('active');
  logoutBtn.style.display = 'inline-flex';
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
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

  // Password Visibility Toggles
  toggleRegPwd.addEventListener('click', () => togglePassword(regPassword, toggleRegPwd));
  toggleValPwd.addEventListener('click', () => togglePassword(valPassword, toggleValPwd));

  // Validate Button on Page 2
  btnValidate.addEventListener('click', handleValidation);

  // Logout Button
  logoutBtn.addEventListener('click', handleLogout);

  // Clear errors when user types in registration
  [regName, regEmail, regPassword].forEach(input => {
    input.addEventListener('input', () => clearRegistrationErrors());
  });

  // Live validation on Page 2 inputs as user types
  valName.addEventListener('input', () => {
    const res = validateName(valName.value);
    updateFieldUI(valName, errValName, res);
  });

  valPassword.addEventListener('input', () => {
    const res = validatePassword(valPassword.value);
    updateFieldUI(valPassword, errValPassword, res);
  });

  valMobile.addEventListener('input', () => {
    const res = validateMobile(valMobile.value);
    updateFieldUI(valMobile, errValMobile, res);
  });

  valUsername.addEventListener('input', () => {
    const res = validateUsername(valUsername.value);
    updateFieldUI(valUsername, errValUsername, res);
  });

  valEmail.addEventListener('input', () => {
    const res = validateEmail(valEmail.value);
    updateFieldUI(valEmail, errValEmail, res);
  });
}

function updateFieldUI(inputEl, errorEl, result) {
  validationResult.style.display = 'none';
  if (!inputEl.value.trim()) {
    inputEl.classList.remove('is-invalid', 'is-valid');
    if (errorEl) errorEl.textContent = '';
    return;
  }
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

function togglePassword(inputEl, btnEl) {
  if (inputEl.type === 'password') {
    inputEl.type = 'text';
    btnEl.textContent = 'Hide';
  } else {
    inputEl.type = 'password';
    btnEl.textContent = 'Show';
  }
}

// ==========================================================================
// STEP 1: HANDLE REGISTRATION
// ==========================================================================
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

  // Save to Firebase User Management
  const result = await firebaseAuth.registerUser({ name, email, password });
  
  // Navigate to Page 2 with prefilled data
  showProfilePage(result.user);
}

// ==========================================================================
// STEP 2: HANDLE FULL VALIDATION
// ==========================================================================
function handleValidation() {
  clearValidationErrors();

  const name = valName.value;
  const password = valPassword.value;
  const mobile = valMobile.value;
  const username = valUsername.value;
  const email = valEmail.value;

  const nameRes = validateName(name);
  const pwdRes = validatePassword(password);
  const mobRes = validateMobile(mobile);
  const userRes = validateUsername(username);
  const emailRes = validateEmail(email);

  updateFieldUI(valName, errValName, nameRes);
  updateFieldUI(valPassword, errValPassword, pwdRes);
  updateFieldUI(valMobile, errValMobile, mobRes);
  updateFieldUI(valUsername, errValUsername, userRes);
  updateFieldUI(valEmail, errValEmail, emailRes);

  const isValid = nameRes.valid && pwdRes.valid && mobRes.valid && userRes.valid && emailRes.valid;

  // Display Overall Status Result Box
  validationResult.style.display = 'block';
  if (isValid) {
    validationResult.className = 'result-box success';
    validationResult.innerHTML = `<strong>✓ All Information Validated Successfully!</strong><br>All 5 fields satisfy the exact required validation rules.`;
    
    // Save updated session
    firebaseAuth.saveSession({ name: name.trim(), email: email.trim(), password, mobile: mobile.trim(), username: username.trim() });
  } else {
    validationResult.className = 'result-box error';
    validationResult.innerHTML = `<strong>✕ Validation Failed</strong><br>Please correct the highlighted fields above.`;
  }
}

// ==========================================================================
// LOGOUT
// ==========================================================================
async function handleLogout() {
  await firebaseAuth.signOut();
  formRegister.reset();
  formValidate.reset();
  clearRegistrationErrors();
  clearValidationErrors();
  validationResult.style.display = 'none';
  showRegisterPage();
}

// Helper functions for UI feedback
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

function clearValidationErrors() {
  [valName, valPassword, valMobile, valUsername, valEmail].forEach(input => {
    input.classList.remove('is-invalid', 'is-valid');
  });
  [errValName, errValPassword, errValMobile, errValUsername, errValEmail].forEach(el => {
    if (el) el.textContent = '';
  });
}

// Smart Hide/Show Header on Scroll
let lastScrollY = window.scrollY;
const appHeader = document.querySelector('.app-header');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 40) {
    // Scrolling down -> hide header
    if (appHeader) appHeader.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    // Scrolling up -> show header
    if (appHeader) appHeader.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
}, { passive: true });

// Initialize on page load
window.addEventListener('DOMContentLoaded', init);
