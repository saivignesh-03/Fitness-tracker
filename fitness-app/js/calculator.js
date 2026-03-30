// ═══════════════════════════════════════════════════════════════
// PUBLIC CALCULATOR — no login required
// Returns TDEE, goal calories, and macros
// ═══════════════════════════════════════════════════════════════

// Unit state
let calcUnits = { height: 'cm', weight: 'kg' };

export function setHeightUnit(unit) {
  calcUnits.height = unit;
  document.querySelectorAll('#calc-height-units .unit-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.unit === unit);
  });
  const input = document.getElementById('calc-height');
  const label = document.getElementById('calc-height-label');
  if (unit === 'cm') {
    input.placeholder = '175';
    label.textContent = 'Height (cm)';
  } else {
    input.placeholder = '5\'9"  →  enter as inches e.g. 69';
    label.textContent = 'Height (inches)';
  }
}

export function setWeightUnit(unit) {
  calcUnits.weight = unit;
  document.querySelectorAll('#calc-weight-units .unit-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.unit === unit);
  });
  const input = document.getElementById('calc-weight');
  input.placeholder = unit === 'kg' ? '75' : '165';
  document.getElementById('calc-weight-label').textContent = `Weight (${unit})`;
}

export function calculateMacros() {
  const age    = parseInt(document.getElementById('calc-age').value);
  const sex    = document.getElementById('calc-sex').value;
  const goal   = document.getElementById('calc-goal').value;
  const activity = document.getElementById('calc-activity').value;
  let   height = parseFloat(document.getElementById('calc-height').value);
  let   weight = parseFloat(document.getElementById('calc-weight').value);

  const errEl = document.getElementById('calc-error');

  if (!age || !height || !weight || !sex || !goal) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  // Convert to metric
  if (calcUnits.height === 'in') height = height * 2.54;
  if (calcUnits.weight === 'lbs') weight = weight * 0.453592;

  // Mifflin-St Jeor BMR
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const tdee = Math.round(bmr * (multipliers[activity] || 1.55));

  // Goal calories
  const goalAdjust = {
    fat_loss:    -500,
    recomp:      -200,
    maintenance:    0,
    muscle_gain:  300
  };
  const goalCals = tdee + (goalAdjust[goal] || 0);

  // Macros (protein first)
  // Ranges based on Healthline, Muscle & Fitness, TDEECalculator.net consensus
  let protein, proteinMin, proteinMax, carbs, fats;
  if (goal === 'fat_loss') {
    proteinMin = Math.round(weight * 1.6);    // 1.6g/kg minimum
    proteinMax = Math.round(weight * 2.2);    // 2.2g/kg upper ceiling
    protein    = proteinMax;                  // target: upper end to preserve muscle
    fats       = Math.round(goalCals * 0.28 / 9);
    carbs      = Math.round((goalCals - protein * 4 - fats * 9) / 4);
  } else if (goal === 'recomp') {
    proteinMin = Math.round(weight * 1.8);    // 1.8g/kg minimum
    proteinMax = Math.round(weight * 2.2);    // 2.2g/kg upper ceiling
    protein    = Math.round(weight * 2.0);    // target: mid-range
    fats       = Math.round(goalCals * 0.30 / 9);
    carbs      = Math.round((goalCals - protein * 4 - fats * 9) / 4);
  } else if (goal === 'muscle_gain') {
    proteinMin = Math.round(weight * 1.6);    // 1.6g/kg optimum (research consensus)
    proteinMax = Math.round(weight * 2.0);    // 2.0g/kg upper ceiling
    protein    = Math.round(weight * 1.8);    // target: mid-range
    fats       = Math.round(goalCals * 0.25 / 9);
    carbs      = Math.round((goalCals - protein * 4 - fats * 9) / 4);
  } else {
    proteinMin = Math.round(weight * 1.2);    // 1.2g/kg minimum
    proteinMax = Math.round(weight * 1.6);    // 1.6g/kg upper
    protein    = Math.round(weight * 1.4);    // target: mid-range
    fats       = Math.round(goalCals * 0.30 / 9);
    carbs      = Math.round((goalCals - protein * 4 - fats * 9) / 4);
  }
  carbs = Math.max(carbs, 80); // floor

  // BMI
  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  let bmiCategory, bmiColor;
  if (bmi < 18.5)      { bmiCategory = 'Underweight'; bmiColor = 'var(--blue)'; }
  else if (bmi < 25)   { bmiCategory = 'Healthy';     bmiColor = 'var(--accent)'; }
  else if (bmi < 30)   { bmiCategory = 'Overweight';  bmiColor = 'var(--accent2)'; }
  else                 { bmiCategory = 'Obese';        bmiColor = 'var(--red)'; }

  // BMI bar position (range 15–40)
  const bmiPct = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));

  // Goal labels
  const goalLabels = {
    fat_loss: { text: 'Fat Loss', color: 'rgba(248,113,113,.15)', textColor: 'var(--red)' },
    recomp:   { text: 'Body Recomp', color: 'rgba(92,242,122,.12)', textColor: 'var(--accent)' },
    maintenance: { text: 'Maintenance', color: 'rgba(92,184,242,.12)', textColor: 'var(--blue)' },
    muscle_gain: { text: 'Muscle Gain', color: 'rgba(192,132,252,.12)', textColor: 'var(--purple)' }
  };
  const gl = goalLabels[goal] || goalLabels.maintenance;

  const water = (weight * 0.033).toFixed(1);
  const activityLabels = {
    sedentary: 'Sedentary',
    light: 'Lightly Active',
    moderate: 'Moderately Active',
    active: 'Very Active',
    very_active: 'Athlete'
  };

  // Render results
  document.getElementById('res-goal-tag').textContent = gl.text;
  document.getElementById('res-goal-tag').style.background = gl.color;
  document.getElementById('res-goal-tag').style.color = gl.textColor;
  document.getElementById('res-goal-tag').style.border = `1px solid ${gl.textColor}`;

  document.getElementById('res-tdee').textContent = tdee;
  document.getElementById('res-calories').textContent = goalCals;
  document.getElementById('res-protein').textContent = protein + 'g';
  document.getElementById('res-protein-range').textContent = `Range: ${proteinMin}–${proteinMax}g`;
  document.getElementById('res-carbs').textContent = carbs + 'g';
  document.getElementById('res-fats').textContent = fats + 'g';
  document.getElementById('res-water').textContent = water + 'L';

  document.getElementById('res-bmi-num').textContent = bmi;
  document.getElementById('res-bmi-cat').textContent = bmiCategory;
  document.getElementById('res-bmi-cat').style.color = bmiColor;
  document.getElementById('res-bmi-marker').style.left = bmiPct + '%';

  // Store for signup pre-fill
  window._calcResult = { weight, height, age, sex, goal, activity, goalCals, protein, proteinMin, proteinMax, carbs, fats, water, bmi, tdee };

  const card = document.getElementById('calc-results');
  card.classList.add('show');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
