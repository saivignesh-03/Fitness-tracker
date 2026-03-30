// ═══════════════════════════════════════════════════════════════
// AUTH — Login, Signup (2-step with profile), Logout
// ═══════════════════════════════════════════════════════════════

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Modal open/close ──
export function openAuthModal(tab = 'login') {
  document.getElementById('auth-modal').classList.add('open');
  switchAuthTab(tab);
}

export function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  clearAuthErrors();
}

export function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('login-form').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  clearAuthErrors();
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(el => el.classList.remove('show'));
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

// ── LOGIN ──
export async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');

  if (!email || !pass) { showError('login-error', 'Please fill in all fields.'); return; }

  btn.disabled = true; btn.textContent = 'Logging in...';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuthModal();
  } catch (e) {
    const msgs = {
      'auth/user-not-found':   'No account with that email.',
      'auth/wrong-password':   'Incorrect password.',
      'auth/invalid-email':    'Invalid email address.',
      'auth/too-many-requests':'Too many attempts. Try again later.',
      'auth/invalid-credential': 'Email or password is incorrect.'
    };
    showError('login-error', msgs[e.code] || 'Login failed. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'LOG IN';
  }
}

// ── SIGNUP (2-step) ──
// Step 1: email + password
// Step 2: name + body stats + goal (skipped for admin)
const ADMIN_EMAIL = 'chintalasaivignesh03@gmail.com';
let _signupEmail = '', _signupPass = '';

export async function handleSignupStep1() {
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-pass').value;
  const pass2 = document.getElementById('signup-pass2').value;

  if (!email || !pass) { showError('signup-error', 'Please fill in all fields.'); return; }
  if (pass.length < 6) { showError('signup-error', 'Password must be at least 6 characters.'); return; }
  if (pass !== pass2)  { showError('signup-error', 'Passwords do not match.'); return; }

  // Admin account — skip Step 2, create account instantly with hardcoded profile
  if (email.toLowerCase() === ADMIN_EMAIL) {
    const btn = document.querySelector('#signup-step1 .auth-btn');
    btn.disabled = true; btn.textContent = 'Setting up your account...';
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: 'Sai' });
      // Profile will be seeded by app.js SAI_PROFILE
      closeAuthModal();
      showToast('Welcome back Sai! Your plan is ready.', 'success');
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Account already exists — just log in instead.',
        'auth/weak-password':        'Password must be at least 6 characters.'
      };
      showError('signup-error', msgs[e.code] || e.message);
    } finally {
      btn.disabled = false; btn.textContent = 'CONTINUE →';
    }
    return;
  }

  _signupEmail = email;
  _signupPass  = pass;

  // Pre-fill from calculator if available
  if (window._calcResult) {
    const r = window._calcResult;
    const wEl = document.getElementById('signup-weight');
    const hEl = document.getElementById('signup-height');
    const aEl = document.getElementById('signup-age');
    const gEl = document.getElementById('signup-goal');
    const sEl = document.getElementById('signup-sex');
    if (wEl) wEl.value = Math.round(r.weight);
    if (hEl) hEl.value = Math.round(r.height);
    if (aEl) aEl.value = r.age;
    if (gEl) gEl.value = r.goal;
    if (sEl) sEl.value = r.sex;
  }

  document.getElementById('signup-step1').style.display = 'none';
  document.getElementById('signup-step2').style.display = 'block';
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.toggle('done', i <= 1);
  });
}

export function backToStep1() {
  document.getElementById('signup-step1').style.display = 'block';
  document.getElementById('signup-step2').style.display = 'none';
}

export async function handleSignupStep2() {
  const name     = document.getElementById('signup-name').value.trim();
  const weight   = parseFloat(document.getElementById('signup-weight').value);
  const height   = parseFloat(document.getElementById('signup-height').value);
  const age      = parseInt(document.getElementById('signup-age').value);
  const sex      = document.getElementById('signup-sex').value;
  const goal     = document.getElementById('signup-goal').value;
  const activity = document.getElementById('signup-activity').value;
  const btn      = document.getElementById('signup-btn');

  if (!name || !weight || !height || !age || !sex || !goal) {
    showError('signup-error2', 'Please fill in all fields.'); return;
  }

  btn.disabled = true; btn.textContent = 'Creating account...';
  try {
    const cred = await createUserWithEmailAndPassword(auth, _signupEmail, _signupPass);
    await updateProfile(cred.user, { displayName: name });

    // Calculate macros
    const macros = calcMacros(weight, height, age, sex, goal, activity);

    // Save profile to Firestore
    await setDoc(doc(db, 'users', cred.user.uid, 'profile', 'data'), {
      name, weight, height, age, sex, goal, activity,
      startWeight: weight,
      startDate: new Date().toISOString().split('T')[0],
      ...macros,
      createdAt: new Date().toISOString()
    });

    closeAuthModal();
    showToast('Account created! Welcome to FitTrack 🎉', 'success');
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/weak-password':        'Password is too weak.'
    };
    showError('signup-error2', msgs[e.code] || 'Signup failed. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'CREATE ACCOUNT';
  }
}

// ── LOGOUT ──
export async function handleLogout() {
  await signOut(auth);
  showToast('Logged out successfully.', 'success');
}

// ── AUTH STATE LISTENER ──
export function initAuth(onLogin, onLogout) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Load profile from Firestore
      const snap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
      const profile = snap.exists() ? snap.data() : {};
      onLogin(user, profile);
    } else {
      onLogout();
    }
  });
}

// ── HELPERS ──
function calcMacros(weight, height, age, sex, goal, activity) {
  const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
  let bmr = sex === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * (multipliers[activity] || 1.55));
  const adjust = { fat_loss:-500, recomp:-200, maintenance:0, muscle_gain:300 };
  const goalCals = tdee + (adjust[goal] || 0);
  const protein = Math.round(weight * (goal === 'fat_loss' ? 2.2 : 2.0));
  const fats    = Math.round(goalCals * (goal === 'muscle_gain' ? 0.25 : 0.28) / 9);
  const carbs   = Math.max(80, Math.round((goalCals - protein * 4 - fats * 9) / 4));
  const water   = (weight * 0.033).toFixed(1);
  return { tdee, goalCals, protein, carbs, fats, water };
}

// ── TOAST ──
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}
export { showToast };
