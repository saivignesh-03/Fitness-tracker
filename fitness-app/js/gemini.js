// ═══════════════════════════════════════════════════════════════
// GEMINI AI INTEGRATION
// Model: gemini-2.0-flash  (fast, free tier)
// Get your API key: https://aistudio.google.com/apikey
// ═══════════════════════════════════════════════════════════════

// ⚠️ REPLACE with your Gemini API key from aistudio.google.com
import { CONFIG } from './config.js';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.geminiApiKey}`;

// Chat history for the session
let chatHistory = [];

// ── Core fetch wrapper ──
async function askGemini(prompt, systemContext = '') {
  const contents = [];

  // Add system context as first user turn if provided
  if (systemContext) {
    contents.push({ role: 'user', parts: [{ text: systemContext }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I have your fitness profile and will give personalized advice.' }] });
  }

  // Add chat history
  chatHistory.forEach(m => contents.push(m));

  // Add new message
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gemini API error');
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

  // Save to history (keep last 10 turns to avoid token bloat)
  chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
  chatHistory.push({ role: 'model', parts: [{ text: reply }] });
  if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  return reply;
}

// ── Build system prompt from user profile ──
export function buildSystemPrompt(profile) {
  const goalNames = { fat_loss: 'Fat Loss', recomp: 'Body Recomposition', maintenance: 'Maintenance', muscle_gain: 'Muscle Gain' };
  const activityNames = { sedentary: 'Sedentary', light: 'Lightly Active', moderate: 'Moderately Active', active: 'Very Active', very_active: 'Athlete' };
  return `You are a personal fitness and nutrition coach AI integrated into a fitness tracking app.

USER PROFILE:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || '—'} years
- Sex: ${profile.sex || '—'}
- Weight: ${profile.weight || '—'} kg
- Height: ${profile.height || '—'} cm
- Goal: ${goalNames[profile.goal] || profile.goal}
- Activity Level: ${activityNames[profile.activity] || profile.activity}
- Daily Calorie Target: ${profile.goalCals || '—'} kcal
- Daily Protein Target: ${profile.protein || '—'}g
- Daily Carbs Target: ${profile.carbs || '—'}g
- Daily Fats Target: ${profile.fats || '—'}g
- Daily Water Target: ${profile.water || '—'}L
- Start Weight: ${profile.startWeight || '—'} kg
- Start Date: ${profile.startDate || '—'}

RULES:
- Always give advice specific to this user's numbers and goal
- Be concise, practical, and motivating — no fluff
- Format responses with line breaks for readability
- Use bullet points where appropriate
- Never recommend red meat (user preference)
- Prioritize budget-friendly foods (Walmart, Indian grocery store items)
- When suggesting meals, include approximate calories and protein
- When the user asks for a meal plan, structure it as: Breakfast · Snack · Lunch · Pre-Workout · Dinner · Night drink`;
}

// ── Quick action generators ──
export async function generateMealPlan(profile) {
  const system = buildSystemPrompt(profile);
  const prompt = `Generate a full 1-day meal plan for me today.
My goal is ${profile.goal?.replace('_', ' ')} with ${profile.goalCals} kcal and ${profile.protein}g protein daily.
Include: Breakfast, Mid-Morning Snack, Lunch, Pre-Workout Snack, Dinner, Night Drink.
For each meal show: foods, portion sizes, approx calories and protein.
Keep ingredients budget-friendly and practical. No red meat.`;
  return askGemini(prompt, system);
}

export async function generateProteinBreakdown(profile) {
  const system = buildSystemPrompt(profile);
  const prompt = `Break down my daily ${profile.protein}g protein target:
1. Explain why I need exactly this amount for my goal (${profile.goal?.replace('_', ' ')}) and weight (${profile.weight}kg)
2. List the top 8 protein sources I should eat with grams of protein per serving and cost estimate
3. Show how to distribute ${profile.protein}g across 5-6 meals
4. Give me 3 high-protein meal combos that hit 40g+ protein each`;
  return askGemini(prompt, system);
}

export async function generateWeeklyPlan(profile) {
  const system = buildSystemPrompt(profile);
  const prompt = `Generate a 7-day meal plan overview for my ${profile.goal?.replace('_', ' ')} goal.
For each day show: Day name, type (Non-veg/Veg/Rest), and 3 main meals with protein content.
Wednesday and Saturday should be vegetarian days.
Keep it concise — one line per meal. End with a weekly grocery summary.`;
  return askGemini(prompt, system);
}

export async function analyzeProgress(profile, dayLogs) {
  const system = buildSystemPrompt(profile);
  const logKeys = Object.keys(dayLogs).sort().slice(-7);
  const recent = logKeys.map(d => {
    const l = dayLogs[d];
    const meals = Object.values(l.meals || {}).filter(Boolean).length;
    return `${d}: weight=${l.weight || '?'}kg, water=${l.water || 0} glasses, meals=${meals}/6, workouts=${(l.workouts || []).join('+')||'none'}, sleep=${l.sleep || '?'}h, energy=${l.energy || '?'}/10`;
  }).join('\n');

  const prompt = `Analyze my last 7 days of tracking data and give me honest feedback:

${recent || 'No recent logs yet.'}

Start weight: ${profile.startWeight}kg, Current goal: ${profile.goal?.replace('_', ' ')}

Please tell me:
1. What I'm doing well
2. What needs improvement
3. One specific change to make this week
4. Projected weight by end of 8 weeks if I keep this pace`;
  return askGemini(prompt, system);
}

// ── Chat ──
export async function chatWithGemini(userMessage, profile) {
  const system = buildSystemPrompt(profile);
  return askGemini(userMessage, chatHistory.length === 0 ? system : '');
}

export function clearChatHistory() {
  chatHistory = [];
}
