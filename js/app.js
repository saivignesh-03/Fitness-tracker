// ═══════════════════════════════════════════════════════════════
// APP.JS — main dashboard logic for logged-in users
// Tabs: Overview · Plan · Grocery · Tracker · Progress
// Data stored per-user in Firestore (dayLogs, groceryState)
// ═══════════════════════════════════════════════════════════════

import { auth, db } from './firebase-config.js';
import { initAuth, handleLogout, openAuthModal, closeAuthModal, switchAuthTab, handleLogin, handleSignupStep1, handleSignupStep2, backToStep1, showToast } from './auth.js';
import { doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { PLAN_DAYS, GROCERY_DATA } from './data.js';
import { calculateMacros, setHeightUnit, setWeightUnit } from './calculator.js';
import { generateMealPlan, generateProteinBreakdown, generateWeeklyPlan, analyzeProgress, chatWithGemini, clearChatHistory } from './gemini.js';

// Expose calculator functions to HTML onclick handlers
window.calculateMacros = calculateMacros;
window.setHeightUnit   = setHeightUnit;
window.setWeightUnit   = setWeightUnit;

let currentUser = null;
let userProfile = {};
let dayLogs     = {};
let groceryState = {};
let currentDay  = 0;

// ── SAI'S HARDCODED PROFILE (admin) ──
const SAI_EMAIL = 'chintalasaivignesh03@gmail.com';
const SAI_PROFILE = {
  name:        'Sai',
  email:       SAI_EMAIL,
  weight:      95,
  height:      183,
  age:         22,
  sex:         'male',
  goal:        'fat_loss',
  activity:    'moderate',
  startWeight: 95,
  startDate:   '2026-03-24',
  goalCals:    2100,
  tdee:        2600,
  protein:     175,
  carbs:       185,
  fats:        65,
  water:       '3.5'
};

function hideLoader() {
  const l = document.getElementById('loader-screen');
  if (l) l.classList.add('hidden');
}

// ── BOOT ──
initAuth(
  async (user, profile) => {
    currentUser = user;
    // If this is Sai's account, always use hardcoded profile
    if (user.email === SAI_EMAIL) {
      userProfile = SAI_PROFILE;
      // Seed Firestore with Sai's profile if it's empty
      if (!profile || !profile.name) {
        await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), SAI_PROFILE);
      }
    } else {
      userProfile = profile;
    }
    await loadUserData();
    hideLoader();
    showApp();
  },
  () => {
    currentUser = null;
    userProfile = {};
    hideLoader();
    showLanding();
  }
);

// ── SECTION SWITCHING ──
function showApp() {
  window._appVisible = true;
  document.getElementById('section-landing').classList.add('hide');
  document.getElementById('section-app').classList.add('show');

  document.getElementById('nav-login-btn').style.display  = 'none';
  document.getElementById('nav-signup-btn').style.display = 'none';
  document.getElementById('nav-user-badge').style.display = 'inline-block';
  document.getElementById('nav-user-badge').textContent   = userProfile.name || currentUser.email;
  document.getElementById('nav-logout-btn').style.display = 'inline-block';
  document.getElementById('app-nav-tabs').classList.add('show');

  renderAppHero();
  showAppTab('overview');
}

function showLanding() {
  window._appVisible = false;
  document.getElementById('section-landing').classList.remove('hide');
  document.getElementById('section-app').classList.remove('show');
  document.getElementById('nav-login-btn').style.display  = 'inline-block';
  document.getElementById('nav-signup-btn').style.display = 'inline-block';
  document.getElementById('nav-user-badge').style.display = 'none';
  document.getElementById('nav-logout-btn').style.display = 'none';
  document.getElementById('app-nav-tabs').classList.remove('show');
}

// ── APP HERO ──
function renderAppHero() {
  const p = userProfile;
  document.getElementById('app-user-name').textContent = p.name || 'Athlete';

  const goalNames = { fat_loss:'Fat Loss', recomp:'Body Recomp', maintenance:'Maintenance', muscle_gain:'Muscle Gain' };
  document.getElementById('app-goal-tag').textContent = goalNames[p.goal] || 'Fitness';

  document.getElementById('app-stat-cals').textContent  = p.goalCals   || '—';
  document.getElementById('app-stat-protein').textContent = (p.protein ? p.protein + 'g' : '—');
  document.getElementById('app-stat-water').textContent   = (p.water   ? p.water + 'L' : '—');

  // Start weight & current weight
  document.getElementById('app-stat-start').textContent = p.startWeight ? p.startWeight + ' kg' : '—';
  const sorted = Object.keys(dayLogs).sort();
  const latest = sorted.length ? dayLogs[sorted[sorted.length - 1]] : null;
  document.getElementById('app-stat-current').textContent = (latest && latest.weight) ? latest.weight + ' kg' : (p.weight ? p.weight + ' kg' : '—');
}

// ── APP TABS ──
const PROTECTED_TABS = ['plan', 'grocery', 'tracker', 'progress', 'ai'];

window.showAppTab = function(tab) {
  // If user is not logged in and tries a protected tab — show auth gate
  if (!currentUser && PROTECTED_TABS.includes(tab)) {
    showAuthGate(tab);
    return;
  }

  // Update nav button active states
  document.querySelectorAll('.app-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.app-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.app-page').forEach(p => p.classList.toggle('active', p.id === 'app-' + tab));

  if (tab === 'overview')  renderOverview();
  if (tab === 'plan')      renderPlan();
  if (tab === 'grocery')   renderGroceryPage();
  if (tab === 'tracker')   initTracker();
  if (tab === 'progress')  renderProgress();
  if (tab === 'ai')        initAITab();
};

// ── AUTH GATE MODAL ──
function showAuthGate(tab) {
  const names = { plan:'Meal Plan', grocery:'Grocery List', tracker:'Daily Tracker', progress:'Progress', ai:'AI Coach' };
  const icons = { plan:'🗓', grocery:'🛒', tracker:'✅', progress:'📈', ai:'🤖' };

  let modal = document.getElementById('auth-gate-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-gate-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:420px;text-align:center">
        <button class="modal-close" onclick="document.getElementById('auth-gate-modal').classList.remove('open')">×</button>
        <div id="gate-icon" style="font-size:52px;margin-bottom:16px"></div>
        <div class="modal-title" id="gate-title"></div>
        <div class="modal-sub" id="gate-sub"></div>
        <div style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin:20px 0;text-align:left">
          <div style="font-size:11px;font-family:'DM Mono',monospace;letter-spacing:2px;color:var(--text-dim);margin-bottom:12px">WHAT YOU GET WITH A FREE ACCOUNT</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text-dim)">
            <div>🗓 &nbsp;Personalised 7-day meal plan</div>
            <div>🛒 &nbsp;Weekly grocery list — resets every Monday</div>
            <div>✅ &nbsp;Daily tracker — meals, water, workouts, sleep</div>
            <div>📈 &nbsp;Progress dashboard — weight chart + streak</div>
            <div>🤖 &nbsp;AI Coach powered by Gemini</div>
          </div>
        </div>
        <button class="auth-btn" style="margin-bottom:10px" onclick="document.getElementById('auth-gate-modal').classList.remove('open'); openAuthModal('signup')">CREATE FREE ACCOUNT →</button>
        <div style="font-size:13px;color:var(--text-dim)">Already have one? <a style="color:var(--accent);cursor:pointer" onclick="document.getElementById('auth-gate-modal').classList.remove('open'); openAuthModal('login')">Log in</a></div>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    document.body.appendChild(modal);
  }

  document.getElementById('gate-icon').textContent  = icons[tab] || '🔒';
  document.getElementById('gate-title').textContent = `Unlock ${names[tab] || tab}`;
  document.getElementById('gate-sub').textContent   = `Create a free account to access your personalised ${names[tab] || 'feature'} and start tracking today.`;
  modal.classList.add('open');
}

// ════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════
function renderOverview() {
  const p = userProfile;
  document.getElementById('ov-cals').textContent    = p.goalCals   || '—';
  document.getElementById('ov-protein').textContent = p.protein ? p.protein + 'g' : '—';
  document.getElementById('ov-carbs').textContent   = p.carbs   ? p.carbs   + 'g' : '—';
  document.getElementById('ov-fats').textContent    = p.fats    ? p.fats    + 'g' : '—';
  document.getElementById('ov-water').textContent   = p.water   ? p.water   + 'L' : '—';

  // Macro bar
  const total = (p.protein || 0) * 4 + (p.carbs || 0) * 4 + (p.fats || 0) * 9;
  if (total > 0) {
    document.querySelector('.seg-p').style.width = ((p.protein * 4 / total) * 100).toFixed(1) + '%';
    document.querySelector('.seg-c').style.width = ((p.carbs   * 4 / total) * 100).toFixed(1) + '%';
    document.querySelector('.seg-f').style.width = ((p.fats    * 9 / total) * 100).toFixed(1) + '%';
  }

  renderPhases(p.startDate);
}

function renderPhases(startDate) {
  const phases = [
    { weeks: 'Week 1–2', name: 'ADAPT',  start: 0,  end: 13,
      desc: 'Body adjusts to the deficit. 4 training days + 20 min cardio. Build the meal prep habit on Sundays.',
      target: '↓ 0.5–1 kg expected' },
    { weeks: 'Week 3–4', name: 'BURN',   start: 14, end: 27,
      desc: 'Supersets + drop sets. Cardio → 30 min. Cut dinner carbs. Add kefir. Reduce rest between sets.',
      target: '↓ 1.5–2 kg expected' },
    { weeks: 'Week 5–6', name: 'PEAK',   start: 28, end: 41,
      desc: 'HIIT 2×/week. Carb cycling starts. Fasted morning walks. 5 training days. Maximum fat burn.',
      target: '↓ 1.5–2 kg expected' },
    { weeks: 'Week 7–8', name: 'FINAL',  start: 42, end: 55,
      desc: 'HIIT 3×/week. Protein up by 10–15g. No carbs after 7:30 PM on rest days. Saturday refeed meal.',
      target: '↓ 1–1.5 kg expected' }
  ];

  // Calculate current day number from startDate
  let currentDayNum = -1;
  if (startDate) {
    const start = new Date(startDate);
    const today = new Date();
    currentDayNum = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  }

  const el = document.getElementById('ov-phases');
  if (!el) return;
  el.innerHTML = `<div class="phases-grid">${phases.map(ph => {
    const isCurrent = currentDayNum >= ph.start && currentDayNum <= ph.end;
    const isDone    = currentDayNum > ph.end;
    return `
      <div class="phase-card ${isCurrent ? 'current' : ''}">
        ${isCurrent ? '<div class="phase-badge">YOU ARE HERE</div>' : ''}
        <div class="phase-week">${ph.weeks}</div>
        <div class="phase-name" style="${isDone ? 'color:var(--text-dim)' : ''}">${ph.name}</div>
        <div class="phase-desc">${ph.desc}</div>
        <div class="phase-target">${ph.target}</div>
      </div>`;
  }).join('')}</div>`;
}

// ════════════════════════════════════════
// PLAN
// ════════════════════════════════════════
function renderPlan() {
  renderDayPlan(currentDay);
}

window.selectDay = function(idx, btn) {
  currentDay = idx;
  document.querySelectorAll('.day-tab').forEach((b, i) => b.classList.toggle('active', i === idx));
  renderDayPlan(idx);
};

function renderDayPlan(idx) {
  const day = PLAN_DAYS[idx];
  if (!day) return;

  const mealsHtml = day.meals.map(m => `
    <div class="meal-card">
      <div class="meal-label-row">
        <div class="meal-label">${m.label}</div>
        <div class="meal-time">${m.time}</div>
      </div>
      <ul class="meal-items">
        ${m.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
      ${m.note ? `<div class="meal-note">${m.note}</div>` : ''}
    </div>
  `).join('');

  const exHtml = `
    <div class="exercise-list">
      <div class="exercise-title">TODAY'S WORKOUT</div>
      <div class="exercise-grid">
        ${day.exercises.map(e => `
          <div class="exercise-item">
            <div class="ex-name">${e.name}</div>
            <div class="ex-detail">${e.detail}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('plan-day-type').textContent = day.typeLabel;
  document.getElementById('plan-content').innerHTML = mealsHtml + exHtml;
}

// ════════════════════════════════════════
// GROCERY
// ════════════════════════════════════════
function getWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

function renderGroceryPage() {
  const el = document.getElementById('app-grocery-list');
  el.innerHTML = GROCERY_DATA.map((cat, ci) => `
    <div class="grocery-section">
      <div class="grocery-cat-title">${cat.cat}</div>
      <div class="grocery-cat-sub">📍 ${cat.store}</div>
      <div class="grocery-grid">
        ${cat.items.map((item, ii) => {
          const key = `${ci}-${ii}`;
          const on = groceryState[key];
          const storeClass = item.store === 'walmart' ? 'gs-walmart' : item.store === 'indian' ? 'gs-indian' : 'gs-wegmans';
          const storeLabel = item.store === 'walmart' ? '🔵 Walmart' : item.store === 'indian' ? '🪔 Indian grocery' : '🟢 Wegmans';
          return `
            <div class="grocery-item ${on ? 'checked' : ''}" onclick="toggleGroceryItem('${key}', this)">
              <div class="grocery-check"></div>
              <div>
                <div class="grocery-name">${item.name}</div>
                <div class="grocery-qty">${item.qty}</div>
                <div class="grocery-store ${storeClass}">${storeLabel}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
  updateGroceryCount();
  renderGroceryWeekLabel();
}

window.toggleGroceryItem = async function(key, el) {
  groceryState[key] = !groceryState[key];
  el.classList.toggle('checked');
  updateGroceryCount();
  await saveGroceryState();
};

window.groceryCheckAll = async function() {
  GROCERY_DATA.forEach((cat, ci) => cat.items.forEach((_, ii) => { groceryState[`${ci}-${ii}`] = true; }));
  await saveGroceryState();
  renderGroceryPage();
};

window.groceryClearAll = async function() {
  groceryState = {};
  await saveGroceryState();
  renderGroceryPage();
};

window.groceryNewWeek = async function() {
  if (!confirm('Start a fresh grocery list for this week?')) return;
  groceryState = {};
  await saveGroceryState();
  renderGroceryPage();
  showToast('New week started! Grocery list cleared.', 'success');
};

function updateGroceryCount() {
  const total = GROCERY_DATA.reduce((a, c) => a + c.items.length, 0);
  const done  = Object.values(groceryState).filter(Boolean).length;
  const el = document.getElementById('app-grocery-count');
  if (el) el.textContent = `${done} / ${total} items collected`;
}

function renderGroceryWeekLabel() {
  const monday = new Date(getWeekKey());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const el = document.getElementById('app-grocery-week-label');
  if (el) el.textContent = `WEEK OF ${fmt(monday)} – ${fmt(sunday)}`;
}

// ════════════════════════════════════════
// TRACKER
// ════════════════════════════════════════
const MEAL_NAMES = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Pre-Workout Snack', 'Dinner', 'Night Drink'];
const MEAL_ICONS = ['🌅', '🍎', '☀️', '⚡', '🌙', '🍵'];
let saveTimer;

function initTracker() {
  const d = document.getElementById('t-date');
  if (!d.value) d.value = new Date().toISOString().split('T')[0];
  loadDay();
}

function loadDay() {
  const date = document.getElementById('t-date').value;
  const log  = dayLogs[date] || {};

  document.getElementById('t-weight').value = log.weight || '';
  document.getElementById('t-water').value  = log.water  || 0;
  document.getElementById('t-notes').value  = log.notes  || '';
  document.getElementById('t-sleep').value  = log.sleep  || 7;
  document.getElementById('sleep-v').textContent  = parseFloat(log.sleep  || 7).toFixed(1) + ' hrs';
  document.getElementById('t-energy').value = log.energy || 5;
  document.getElementById('energy-v').textContent = (log.energy || 5) + ' / 10';

  refreshWater();
  renderMealChecks(log);
  renderWorkoutBtns(log);
}

function renderMealChecks(log) {
  document.getElementById('meal-checks').innerHTML = MEAL_NAMES.map((name, i) => {
    const done = (log.meals || {})[name];
    return `
      <div class="meal-check-row">
        <div class="check-left">
          <div class="check-circle ${done ? 'done' : ''}" onclick="toggleMeal('${name}', this)"></div>
          <div>
            <div class="check-meal-name">${MEAL_ICONS[i]} ${name}</div>
            <div class="check-meal-sub">Tap to mark complete</div>
          </div>
        </div>
        <span style="font-size:18px">${done ? '✅' : '⬜'}</span>
      </div>`;
  }).join('');
}

function renderWorkoutBtns(log) {
  const workouts = log.workouts || [];
  ['weights', 'cardio', 'hiit', 'rest'].forEach(w => {
    const btn = document.getElementById('wb-' + w);
    if (!btn) return;
    const on = workouts.includes(w);
    btn.className = 'w-btn' + (on ? (w === 'rest' ? ' rest-on' : ' on') : '');
  });
}

window.toggleMeal = function(name, el) {
  const date = document.getElementById('t-date').value;
  if (!dayLogs[date]) dayLogs[date] = { meals: {}, workouts: [] };
  if (!dayLogs[date].meals) dayLogs[date].meals = {};
  dayLogs[date].meals[name] = !dayLogs[date].meals[name];
  el.classList.toggle('done');
  const row = el.closest('.meal-check-row');
  row.querySelector('span:last-child').textContent = dayLogs[date].meals[name] ? '✅' : '⬜';
  autoSave();
};

window.toggleWorkout = function(w) {
  const date = document.getElementById('t-date').value;
  if (!dayLogs[date]) dayLogs[date] = { meals: {}, workouts: [] };
  const ws = dayLogs[date].workouts || [];
  dayLogs[date].workouts = ws;
  const idx = ws.indexOf(w);
  if (idx > -1) ws.splice(idx, 1); else ws.push(w);
  renderWorkoutBtns(dayLogs[date]);
  autoSave();
};

window.refreshWater = function() {
  const v = parseInt(document.getElementById('t-water').value) || 0;
  const pct = Math.min(100, v / 14 * 100);
  document.getElementById('water-fill').style.width = pct + '%';
  document.getElementById('water-txt').textContent  = `${v} / 14 glasses`;
  document.getElementById('water-pct').textContent  = Math.round(pct) + '%';
};

function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDay, 900);
}

window.autoSave = autoSave;

window.saveDay = async function() {
  const date = document.getElementById('t-date').value;
  if (!date || !currentUser) return;
  if (!dayLogs[date]) dayLogs[date] = { meals: {}, workouts: [] };
  const log = dayLogs[date];
  log.weight  = parseFloat(document.getElementById('t-weight').value) || null;
  log.water   = parseInt(document.getElementById('t-water').value) || 0;
  log.notes   = document.getElementById('t-notes').value;
  log.sleep   = parseFloat(document.getElementById('t-sleep').value);
  log.energy  = parseInt(document.getElementById('t-energy').value);

  await setDoc(doc(db, 'users', currentUser.uid, 'logs', date), log);

  const fl = document.getElementById('saved-flash');
  if (fl) { fl.classList.add('show'); setTimeout(() => fl.classList.remove('show'), 2000); }
};

// ════════════════════════════════════════
// PROGRESS
// ════════════════════════════════════════
function renderProgress() {
  const p = userProfile;
  document.getElementById('ps-start').textContent = p.startWeight ? p.startWeight + ' kg' : '—';

  const sorted = Object.keys(dayLogs).sort();
  const latest = sorted.length ? dayLogs[sorted[sorted.length - 1]] : null;
  const currentW = (latest && latest.weight) ? latest.weight : null;
  document.getElementById('ps-current').textContent = currentW ? currentW + ' kg' : '—';

  if (currentW && p.startWeight) {
    const lost = (p.startWeight - currentW).toFixed(1);
    document.getElementById('ps-lost').textContent = (lost > 0 ? '-' : '+') + Math.abs(lost) + ' kg';
  } else {
    document.getElementById('ps-lost').textContent = '—';
  }

  // Streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (dayLogs[key] && (dayLogs[key].weight || Object.keys(dayLogs[key].meals || {}).length)) streak++;
    else if (i > 0) break;
  }
  document.getElementById('ps-streak').textContent = streak;

  // Meal adherence
  let totalMeals = 0, doneMeals = 0;
  Object.values(dayLogs).forEach(log => {
    if (!log.meals) return;
    totalMeals += MEAL_NAMES.length;
    doneMeals  += Object.values(log.meals).filter(Boolean).length;
  });
  const adh = totalMeals ? Math.round(doneMeals / totalMeals * 100) : 0;
  document.getElementById('ps-meals').textContent = adh + '%';

  // Weight chart (last 14 days)
  renderWeightChart(sorted);

  // Workout counts
  let wWeights = 0, wCardio = 0, wHiit = 0;
  Object.values(dayLogs).forEach(log => {
    (log.workouts || []).forEach(w => {
      if (w === 'weights') wWeights++;
      if (w === 'cardio')  wCardio++;
      if (w === 'hiit')    wHiit++;
    });
  });
  document.getElementById('ws-weights').textContent = wWeights;
  document.getElementById('ws-cardio').textContent  = wCardio;
  document.getElementById('ws-hiit').textContent    = wHiit;
}

function renderWeightChart(sortedDates) {
  const last14 = sortedDates.slice(-14);
  if (!last14.length) { document.getElementById('w-chart').innerHTML = '<div style="color:var(--text-dim);font-size:13px;padding:20px 0">No weight data yet — log your weight daily.</div>'; return; }

  const weights = last14.map(d => dayLogs[d]?.weight).filter(Boolean);
  if (!weights.length) return;
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  document.getElementById('w-chart').innerHTML = last14.map(date => {
    const w = dayLogs[date]?.weight;
    const h = w ? Math.round(((w - minW) / range) * 80) + 10 : 4;
    const label = date.slice(5); // MM-DD
    return `
      <div class="w-bar-wrap">
        ${w ? `<div class="w-val">${w}</div>` : ''}
        <div class="w-bar" style="height:${h}px;${!w ? 'background:var(--card2)' : ''}"></div>
        <div class="w-date">${label}</div>
      </div>`;
  }).join('');
}

// ════════════════════════════════════════
// FIRESTORE — load & save
// ════════════════════════════════════════
async function loadUserData() {
  if (!currentUser) return;

  // Load day logs
  try {
    const logsSnap = await getDocs(collection(db, 'users', currentUser.uid, 'logs'));
    dayLogs = {};
    logsSnap.forEach(d => { dayLogs[d.id] = d.data(); });
  } catch (e) { console.error('Error loading logs', e); }

  // Load grocery state (week-keyed)
  try {
    const wk = getWeekKey();
    const gSnap = await getDoc(doc(db, 'users', currentUser.uid, 'grocery', wk));
    groceryState = gSnap.exists() ? (gSnap.data().state || {}) : {};
  } catch (e) { console.error('Error loading grocery', e); }
}

async function saveGroceryState() {
  if (!currentUser) return;
  const wk = getWeekKey();
  await setDoc(doc(db, 'users', currentUser.uid, 'grocery', wk), { state: groceryState });
}

// ════════════════════════════════════════
// EXPOSE globals needed by HTML onclick
// ════════════════════════════════════════
// ════════════════════════════════════════
// AI COACH
// ════════════════════════════════════════
let aiReady = false;

function initAITab() {
  aiReady = true;
}

function addAIMessage(role, text) {
  const container = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ${role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;
  const avatar = role === 'user' ? '👤' : '🤖';
  div.innerHTML = `
    <div class="ai-msg-avatar">${avatar}</div>
    <div class="ai-msg-bubble">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const container = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-bot ai-typing';
  div.id = 'ai-typing';
  div.innerHTML = `
    <div class="ai-msg-avatar">🤖</div>
    <div class="ai-msg-bubble">
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('ai-typing')?.remove();
}

function setAILoading(loading) {
  const btn = document.getElementById('ai-send-btn');
  const input = document.getElementById('ai-input');
  if (btn) btn.disabled = loading;
  if (input) input.disabled = loading;
}

window.aiSendMessage = async function() {
  const input = document.getElementById('ai-input');
  const text = input?.value?.trim();
  if (!text || !currentUser) return;
  input.value = '';

  addAIMessage('user', text);
  addTypingIndicator();
  setAILoading(true);
  try {
    const reply = await chatWithGemini(text, userProfile);
    removeTypingIndicator();
    addAIMessage('bot', reply);
  } catch (e) {
    removeTypingIndicator();
    addAIMessage('bot', '⚠️ ' + (e.message.includes('API_KEY') || e.message.includes('key')
      ? 'Please add your Gemini API key in js/gemini.js to use AI features.'
      : 'Sorry, something went wrong. Try again in a moment.'));
  } finally {
    setAILoading(false);
  }
};

window.aiQuickAction = async function(type) {
  showAppTab('ai');
  const prompts = {
    meal:     'Generate my full meal plan for today',
    protein:  'Break down my daily protein target and how to hit it',
    weekly:   'Generate my 7-day meal plan overview',
    progress: 'Analyze my recent progress and give me feedback'
  };
  addAIMessage('user', prompts[type]);
  addTypingIndicator();
  setAILoading(true);
  try {
    let reply;
    if (type === 'meal')     reply = await generateMealPlan(userProfile);
    if (type === 'protein')  reply = await generateProteinBreakdown(userProfile);
    if (type === 'weekly')   reply = await generateWeeklyPlan(userProfile);
    if (type === 'progress') reply = await analyzeProgress(userProfile, dayLogs);
    removeTypingIndicator();
    addAIMessage('bot', reply);
  } catch (e) {
    removeTypingIndicator();
    addAIMessage('bot', '⚠️ ' + (e.message.includes('API_KEY') || e.message.includes('key')
      ? 'Please add your Gemini API key in js/gemini.js to use AI features.'
      : 'Sorry, something went wrong. Try again.'));
  } finally {
    setAILoading(false);
  }
};

window.aiClearChat = function() {
  clearChatHistory();
  const container = document.getElementById('ai-messages');
  if (container) container.innerHTML = `
    <div class="ai-msg ai-msg-bot">
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-bubble">Chat cleared! Ask me anything about your diet, macros, or training.</div>
    </div>`;
};

window.openAuthModal   = openAuthModal;
window.closeAuthModal  = closeAuthModal;
window.switchAuthTab   = switchAuthTab;
window.handleLogin     = handleLogin;
window.handleSignupStep1 = handleSignupStep1;
window.handleSignupStep2 = handleSignupStep2;
window.backToStep1     = backToStep1;
window.handleLogout    = handleLogout;
window.loadDay         = loadDay;
