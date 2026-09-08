// Profile Validation Controller (Page 2)
// Handles session prefilling, exact regex validation (a-e), whitespace handling, and user sign-out

import { firebaseAuth } from './firebase-config.js';

// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
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
// REGEX & WHITESPACE VALIDATION LOGIC
// ==========================================================================

// a) Name: Only characters and spaces allowed, no numbers and no special characters
export function validateName(name) {
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

// b) Password: at least one number and one alphabet is required, no spaces allowed
export function validatePassword(password) {
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

// c) Mobile Number: Only numbers are allowed and should be of 10 digits
export function validateMobile(mobile) {
  if (!mobile || mobile.trim().length === 0) {
    return { valid: false, message: 'Mobile Number cannot be empty or contain only spaces.' };
  }
  if (/\s/.test(mobile)) {
    return { valid: false, message: 'Mobile Number cannot contain spaces.' };
  }
  if (/\D/.test(mobile)) {
    return { valid: false, message: 'Only numbers (0-9) are allowed in Mobile Number.' };
  }
  if (mobile.length < 10) {
    return { valid: false, message: `Mobile Number must be 10 digits (currently ${mobile.length}/10).` };
  }
  if (mobile.length > 10) {
    return { valid: false, message: `Mobile Number cannot exceed 10 digits (currently ${mobile.length}).` };
  }
  if (/^\d{10}$/.test(mobile)) {
    return { valid: true };
  }
  return { valid: false, message: 'Must be exactly 10 digits.' };
}

// d) Username: alphanumeric with one special character is allowed, no spaces allowed
export function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return { valid: false, message: 'Username cannot be empty or contain only spaces.' };
  }
  if (/\s/.test(username)) {
    return { valid: false, message: 'Username cannot contain spaces.' };
  }

  const specialMatches = username.match(/[^A-Za-z0-9]/g) || [];
  if (specialMatches.length === 0) {
    return { valid: false, message: 'Username requires exactly 1 special character (e.g. user_99 or alex@1).' };
  }
  if (specialMatches.length > 1) {
    return { valid: false, message: `Only 1 special character is allowed (found ${specialMatches.length}: ${specialMatches.join(' ')}).` };
  }

  if (/^[A-Za-z0-9]*[^A-Za-z0-9\s][A-Za-z0-9]*$/.test(username)) {
    return { valid: true };
  }
  return { valid: false, message: 'Username must be alphanumeric with 1 special character.' };
}

// e) Email: basic format should follow, no spaces allowed
export function validateEmail(email) {
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

// ==========================================================================
// INITIALIZE PROFILE PAGE
// ==========================================================================
function initProfile() {
  const currentSession = firebaseAuth.loadSession();

  // If no user is logged in, redirect to registration page
  if (!currentSession || !currentSession.email) {
    window.location.href = 'index.html';
    return;
  }

  // Prefill registration details
  valName.value = currentSession.name || '';
  valPassword.value = currentSession.password || '';
  valEmail.value = currentSession.email || '';
  valMobile.value = currentSession.mobile || '';
  valUsername.value = currentSession.username || '';

  setupEventListeners();
}

function setupEventListeners() {
  // Password Visibility Toggle
  if (toggleValPwd) {
    toggleValPwd.addEventListener('click', () => {
      if (valPassword.type === 'password') {
        valPassword.type = 'text';
        toggleValPwd.textContent = 'Hide';
      } else {
        valPassword.type = 'password';
        toggleValPwd.textContent = 'Show';
      }
    });
  }

  // Validate Button
  if (btnValidate) {
    btnValidate.addEventListener('click', handleValidation);
  }

  // Logout Button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await firebaseAuth.signOut();
      window.location.href = 'index.html';
    });
  }

  // Real-time input validation listeners
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
  if (validationResult) validationResult.style.display = 'none';
  
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

  validationResult.style.display = 'block';
  if (isValid) {
    validationResult.className = 'result-box success';
    validationResult.innerHTML = `<strong>✓ All Information Validated Successfully!</strong><br>All 5 fields satisfy the exact required validation rules.`;
    
    // Save updated session
    firebaseAuth.saveSession({
      name: name.trim(),
      email: email.trim(),
      password,
      mobile: mobile.trim(),
      username: username.trim()
    });
  } else {
    validationResult.className = 'result-box error';
    validationResult.innerHTML = `<strong>✕ Validation Failed</strong><br>Please correct the highlighted fields above (cannot be empty or invalid).`;
  }
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
    if (appHeader) appHeader.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    if (appHeader) appHeader.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
}, { passive: true });

// Initialize
window.addEventListener('DOMContentLoaded', initProfile);
