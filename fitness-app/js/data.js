// ═══════════════════════════════════════════════════════════════
// GENERIC 7-DAY MEAL PLAN DATA
// Used for all logged-in users — meals adapt based on their goal
// ═══════════════════════════════════════════════════════════════

export const PLAN_DAYS = [
  {
    name: "Monday",
    typeLabel: "🍗 Non-Veg · Chest + Triceps",
    meals: [
      { label: "Breakfast", time: "7:00 AM",
        items: ["3 eggs scrambled + 1 cup spinach", "1 slice whole wheat bread", "½ avocado + black coffee or green tea"],
        note: "~420 kcal · 35g protein" },
      { label: "Mid-Morning Snack", time: "10:00 AM",
        items: ["1 cup plain Greek yogurt", "1 tbsp ground flaxseed + ½ cup mixed berries"],
        note: "~200 kcal · 17g protein" },
      { label: "Lunch", time: "1:00 PM",
        items: ["6 oz grilled chicken breast", "¾ cup brown rice", "2 cups mixed greens salad", "Olive oil + lemon dressing"],
        note: "~540 kcal · 45g protein" },
      { label: "Pre-Workout Snack", time: "4:30 PM",
        items: ["1 banana + 2 tbsp peanut butter"],
        note: "~200 kcal · fast energy" },
      { label: "Dinner", time: "7:30 PM",
        items: ["6 oz baked tilapia or chicken", "1 cup brown rice or 2 corn tortillas", "1 cup steamed broccoli", "½ cup black beans"],
        note: "~510 kcal · 40g protein" },
      { label: "Night Drink", time: "9:00 PM",
        items: ["Chamomile or ginger tea"],
        note: "Gut-soothing · aids sleep" }
    ],
    exercises: [
      { name: "Bench Press", detail: "4×8 reps" },
      { name: "Incline Dumbbell Press", detail: "3×10 reps" },
      { name: "Cable Flyes", detail: "3×12 reps" },
      { name: "Tricep Pushdowns", detail: "3×12 reps" },
      { name: "Overhead Tricep Extension", detail: "3×12 reps" },
      { name: "Steady-State Cardio", detail: "20 min walk/jog" }
    ]
  },
  {
    name: "Tuesday",
    typeLabel: "🍗 Non-Veg · Back + Biceps",
    meals: [
      { label: "Breakfast", time: "7:00 AM",
        items: ["½ cup rolled oats + 1 scoop whey protein", "1 tbsp chia seeds + cinnamon + 1 cup low-fat milk"],
        note: "~410 kcal · 33g protein" },
      { label: "Mid-Morning Snack", time: "10:00 AM",
        items: ["1 apple + 2 tbsp almond butter", "OR string cheese + a handful of almonds"],
        note: "~200 kcal · simple and filling" },
      { label: "Lunch", time: "1:00 PM",
        items: ["Grilled chicken wrap in whole wheat tortilla", "5 oz chicken + lettuce + tomato + onion", "2 tbsp hummus instead of mayo"],
        note: "~510 kcal · 42g protein" },
      { label: "Pre-Workout Snack", time: "4:30 PM",
        items: ["1 banana + 6–8 almonds"],
        note: "~160 kcal" },
      { label: "Dinner", time: "7:30 PM",
        items: ["6 oz baked chicken thighs with garlic + paprika", "1 medium baked sweet potato", "1 cup steamed green beans"],
        note: "~500 kcal · 38g protein" },
      { label: "Night Drink", time: "9:00 PM",
        items: ["Warm cumin water or peppermint tea"],
        note: "Reduces bloating" }
    ],
    exercises: [
      { name: "Pull-Ups / Lat Pulldown", detail: "4×8 reps" },
      { name: "Seated Cable Row", detail: "3×10 reps" },
      { name: "Single-Arm DB Row", detail: "3×10 reps" },
      { name: "Face Pulls", detail: "3×15 reps" },
      { name: "Barbell Curls", detail: "3×12 reps" },
      { name: "Hammer Curls", detail: "3×12 reps" },
      { name: "Cardio", detail: "20 min brisk walk" }
    ]
  },
  {
    name: "Wednesday",
    typeLabel: "🌿 Veg Day · Legs + Shoulders",
    meals: [
      { label: "Breakfast · VEG", time: "7:00 AM",
        items: ["3-egg veggie omelette: spinach + bell pepper + onion + mushrooms", "1 slice whole wheat toast + 1 orange"],
        note: "~390 kcal · 28g protein" },
      { label: "Mid-Morning Snack · VEG", time: "10:00 AM",
        items: ["Paneer cubes with lemon + black pepper", "OR ½ cup low-fat cottage cheese + cucumber"],
        note: "~150 kcal · high protein" },
      { label: "Lunch · VEG", time: "1:00 PM",
        items: ["Black bean + brown rice bowl", "Corn, tomato, shredded cheese, salsa", "½ avocado + lime juice"],
        note: "~530 kcal · 30g protein" },
      { label: "Pre-Workout · VEG", time: "4:30 PM",
        items: ["1 scoop whey in water + 1 banana"],
        note: "~200 kcal" },
      { label: "Dinner · VEG", time: "7:30 PM",
        items: ["Paneer tikka — low-fat paneer + light tomato sauce", "Greek yogurt in sauce instead of cream", "2 whole wheat tortillas + sautéed baby spinach"],
        note: "~510 kcal · 32g protein" },
      { label: "Night Drink · VEG", time: "9:00 PM",
        items: ["Turmeric golden milk: 1 cup low-fat milk + ½ tsp turmeric + pinch pepper"],
        note: "Anti-inflammatory · great sleep" }
    ],
    exercises: [
      { name: "Barbell Squats", detail: "4×8 reps" },
      { name: "Romanian Deadlift", detail: "3×10 reps" },
      { name: "Leg Press", detail: "3×12 reps" },
      { name: "Walking Lunges", detail: "3×12 each leg" },
      { name: "Shoulder Press (DB)", detail: "3×10 reps" },
      { name: "Lateral Raises", detail: "3×15 reps" },
      { name: "Cardio", detail: "20 min cycling or walk" }
    ]
  },
  {
    name: "Thursday",
    typeLabel: "😴 Active Recovery Day",
    meals: [
      { label: "Breakfast", time: "7:00 AM",
        items: ["Overnight oats: ½ cup oats + ½ cup Greek yogurt", "Chia seeds + almond milk + honey + berries"],
        note: "~380 kcal · 28g protein" },
      { label: "Snack", time: "10:00 AM",
        items: ["2 hard-boiled eggs + baby carrots"],
        note: "~180 kcal · perfect grab-and-go" },
      { label: "Lunch", time: "1:00 PM",
        items: ["Canned chicken + Greek yogurt + celery + Dijon on whole wheat bread", "Side: apple or banana"],
        note: "~460 kcal · 42g protein" },
      { label: "Dinner", time: "7:30 PM",
        items: ["6 oz baked chicken breast with garlic + smoked paprika", "Roasted carrots + sweet potato + broccoli"],
        note: "~490 kcal · 40g protein" },
      { label: "Night Drink", time: "9:00 PM",
        items: ["Ginger tea or warm lemon water"],
        note: "Gut motility + recovery" }
    ],
    exercises: [
      { name: "30-min walk outdoors", detail: "Easy comfortable pace" },
      { name: "Full body stretching / yoga", detail: "20 min" },
      { name: "Foam rolling", detail: "10 min" }
    ]
  },
  {
    name: "Friday",
    typeLabel: "🍗 Non-Veg · Full Body Strength",
    meals: [
      { label: "Breakfast", time: "7:00 AM",
        items: ["Protein pancakes: ½ cup oats + 2 eggs + 1 scoop whey", "Top with Greek yogurt + strawberries"],
        note: "~440 kcal · 38g protein" },
      { label: "Snack", time: "10:00 AM",
        items: ["1 cup Greek yogurt with cucumber + dill"],
        note: "~160 kcal · gut-friendly" },
      { label: "Lunch", time: "1:00 PM",
        items: ["Grilled tilapia over brown rice + black beans", "Corn salsa: canned corn + tomato + onion + lime + cilantro"],
        note: "~530 kcal · 42g protein" },
      { label: "Pre-Workout Snack", time: "4:30 PM",
        items: ["1 banana + 1 tbsp peanut butter"],
        note: "~170 kcal" },
      { label: "Dinner", time: "7:30 PM",
        items: ["Egg bhurji — 3 eggs scrambled with onion + tomato + cumin", "2 whole wheat tortillas", "Sautéed frozen mixed veggies"],
        note: "~470 kcal · 36g protein" },
      { label: "Night Drink", time: "9:00 PM",
        items: ["Ginger + honey tea or chamomile tea"],
        note: "Anti-inflammatory" }
    ],
    exercises: [
      { name: "Deadlifts", detail: "4×6 reps" },
      { name: "Goblet Squats", detail: "3×12 reps" },
      { name: "Push-Ups", detail: "3×15 reps" },
      { name: "Bent-Over Row", detail: "3×10 reps" },
      { name: "Plank", detail: "3×60 seconds" },
      { name: "Cardio", detail: "25 min jog or walk" }
    ]
  },
  {
    name: "Saturday",
    typeLabel: "🌿 Veg Day · Cardio + Core",
    meals: [
      { label: "Breakfast · VEG", time: "7:30 AM",
        items: ["Smoothie: 1 scoop whey + frozen banana + frozen spinach", "1 tbsp peanut butter + 1 cup almond milk + chia seeds"],
        note: "~430 kcal · 35g protein" },
      { label: "Snack · VEG", time: "10:30 AM",
        items: ["Paneer cubes grilled with cumin + lemon", "OR 2 hard-boiled eggs + baby carrots"],
        note: "~180 kcal" },
      { label: "Lunch · VEG", time: "1:00 PM",
        items: ["Veggie burrito bowl: brown rice + black beans + corn", "Bell pepper + onion + salsa + Greek yogurt", "Shredded cheese + lime juice"],
        note: "~530 kcal · 28g protein" },
      { label: "Pre-Workout · VEG", time: "4:30 PM",
        items: ["1 banana + 1 scoop whey in water"],
        note: "~180 kcal" },
      { label: "Dinner · VEG", time: "7:30 PM",
        items: ["Grilled paneer + bell pepper bowl", "Over brown rice + raita (yogurt + cucumber + dill)"],
        note: "~490 kcal · 30g protein" },
      { label: "Night Drink · VEG", time: "9:00 PM",
        items: ["Warm milk with turmeric + cinnamon"],
        note: "Anti-inflammatory · muscle recovery" }
    ],
    exercises: [
      { name: "Outdoor walk, jog or bike", detail: "45–60 min" },
      { name: "Crunches", detail: "3×20 reps" },
      { name: "Leg Raises", detail: "3×15 reps" },
      { name: "Russian Twists", detail: "3×20 reps" },
      { name: "Mountain Climbers", detail: "3×30 seconds" }
    ]
  },
  {
    name: "Sunday",
    typeLabel: "😴 Rest + Meal Prep Day",
    meals: [
      { label: "Breakfast (Relaxed)", time: "8:00 AM",
        items: ["3-egg veggie omelette: mushrooms + bell pepper + onion + cheddar", "2 slices whole wheat toast + fruit"],
        note: "~450 kcal · enjoy it!" },
      { label: "Lunch", time: "1:00 PM",
        items: ["Grilled chicken over large salad: romaine + cucumber + cherry tomatoes", "Red onion + corn + cheddar + olive oil + lemon dressing"],
        note: "~490 kcal · 42g protein" },
      { label: "Dinner", time: "7:30 PM",
        items: ["Baked chicken thighs + roasted sweet potato wedges", "Steamed broccoli + garlic butter"],
        note: "~480 kcal · 40g protein" },
      { label: "Night Drink", time: "9:00 PM",
        items: ["Chamomile tea or warm milk with cinnamon"],
        note: "Wind down · prep for the week" }
    ],
    exercises: [
      { name: "Meal prep for the week", detail: "Cook chicken, rice, boil eggs, roast veggies" },
      { name: "Light post-dinner walk", detail: "20 min" },
      { name: "Sleep 8+ hours", detail: "Non-negotiable" }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// GROCERY DATA
// ═══════════════════════════════════════════════════════════════

export const GROCERY_DATA = [
  {
    cat: "🥩 Proteins — Non-Veg", store: "Walmart / Wegmans",
    items: [
      { name: "Boneless skinless chicken breast", qty: "3–4 lbs/week", store: "walmart" },
      { name: "Chicken thighs (boneless)", qty: "2 lbs/week", store: "walmart" },
      { name: "Tilapia fillets (frozen)", qty: "1–2 bags/week", store: "walmart" },
      { name: "Whole eggs (18-pack)", qty: "1 pack/week", store: "walmart" },
      { name: "Canned chicken in water", qty: "2–3 cans/week", store: "walmart" },
      { name: "Whey protein powder", qty: "1 tub/month", store: "walmart" }
    ]
  },
  {
    cat: "🧀 Proteins — Veg", store: "Walmart + Indian grocery",
    items: [
      { name: "Plain Greek yogurt (Chobani/Fage)", qty: "2 large tubs/week", store: "walmart" },
      { name: "Low-fat paneer", qty: "1–2 packs/week", store: "indian" },
      { name: "Black beans (canned)", qty: "3–4 cans/week", store: "walmart" },
      { name: "Chickpeas (canned)", qty: "2–3 cans/week", store: "walmart" },
      { name: "Red kidney beans (canned)", qty: "1–2 cans/week", store: "walmart" },
      { name: "Lentils — green or red (dry)", qty: "1 bag/month", store: "walmart" }
    ]
  },
  {
    cat: "🌾 Carbs & Grains", store: "Walmart",
    items: [
      { name: "Brown rice (5 lb bag)", qty: "1 bag / 2–3 weeks", store: "walmart" },
      { name: "Rolled oats", qty: "1 canister/month", store: "walmart" },
      { name: "Whole wheat tortillas", qty: "1 pack/week", store: "walmart" },
      { name: "Whole wheat bread", qty: "1 loaf/week", store: "walmart" },
      { name: "Sweet potatoes", qty: "3–4 lbs/week", store: "walmart" },
      { name: "Chia seeds", qty: "1 bag/month", store: "walmart" }
    ]
  },
  {
    cat: "🥦 Vegetables", store: "Walmart produce + frozen aisle",
    items: [
      { name: "Baby spinach (5 oz bag)", qty: "2 bags/week", store: "walmart" },
      { name: "Broccoli florets (fresh or frozen)", qty: "2 bags/week", store: "walmart" },
      { name: "Mixed frozen veggies", qty: "2 bags/week", store: "walmart" },
      { name: "Bell peppers (red + green)", qty: "4–5/week", store: "walmart" },
      { name: "Tomatoes", qty: "1 lb/week", store: "walmart" },
      { name: "Onions (5 lb bag)", qty: "1 bag / 2–3 weeks", store: "walmart" },
      { name: "Garlic (whole or minced jar)", qty: "1 jar/month", store: "walmart" },
      { name: "Cucumber", qty: "3–4/week", store: "walmart" },
      { name: "Romaine lettuce / bagged salad", qty: "2 bags/week", store: "walmart" },
      { name: "Baby carrots (1 lb bag)", qty: "1 bag/week", store: "walmart" },
      { name: "Mushrooms (8 oz pack)", qty: "1–2 packs/week", store: "walmart" },
      { name: "Green beans (frozen)", qty: "1 bag/week", store: "walmart" }
    ]
  },
  {
    cat: "🍌 Fruits", store: "Walmart produce",
    items: [
      { name: "Bananas", qty: "1 bunch/week", store: "walmart" },
      { name: "Frozen mixed berries", qty: "1 bag/week", store: "walmart" },
      { name: "Apples", qty: "1 bag/week", store: "walmart" },
      { name: "Oranges", qty: "4–5/week", store: "walmart" },
      { name: "Avocados", qty: "3–4/week", store: "walmart" },
      { name: "Strawberries (fresh or frozen)", qty: "1 pack/week", store: "walmart" }
    ]
  },
  {
    cat: "🥛 Dairy", store: "Walmart",
    items: [
      { name: "Low-fat milk (gallon)", qty: "1 gallon/week", store: "walmart" },
      { name: "Unsweetened almond milk", qty: "1 carton/week", store: "walmart" },
      { name: "Shredded Mexican cheese blend", qty: "1 bag/week", store: "walmart" },
      { name: "String cheese", qty: "1 pack/week", store: "walmart" },
      { name: "Kefir (Week 3 onwards)", qty: "1 bottle/week", store: "wegmans" }
    ]
  },
  {
    cat: "🧂 Spices & Condiments", store: "Walmart + Indian grocery",
    items: [
      { name: "Turmeric powder", qty: "1 bag/month", store: "indian" },
      { name: "Cumin seeds", qty: "1 bag/month", store: "indian" },
      { name: "Ground cumin / coriander", qty: "1 jar/month", store: "walmart" },
      { name: "Smoked paprika", qty: "1 jar/month", store: "walmart" },
      { name: "Garlic powder", qty: "1 jar/month", store: "walmart" },
      { name: "Black pepper", qty: "1 jar/month", store: "walmart" },
      { name: "Chili powder", qty: "1 jar/month", store: "walmart" },
      { name: "Olive oil (2L jug)", qty: "1 jug/month", store: "walmart" },
      { name: "Dijon mustard", qty: "1 bottle/month", store: "walmart" },
      { name: "Salsa (jar)", qty: "1–2 jars/week", store: "walmart" },
      { name: "Low-sodium soy sauce", qty: "1 bottle/month", store: "walmart" }
    ]
  },
  {
    cat: "🥜 Healthy Fats & Snacks", store: "Walmart",
    items: [
      { name: "Peanut butter — natural (no sugar added)", qty: "1 large jar/month", store: "walmart" },
      { name: "Almond butter", qty: "1 jar/month", store: "walmart" },
      { name: "Almonds", qty: "1 bag/month", store: "walmart" },
      { name: "Walnuts", qty: "1 bag/month", store: "walmart" },
      { name: "Ground flaxseed", qty: "1 bag/month", store: "walmart" },
      { name: "Hummus (Sabra)", qty: "2 tubs/week", store: "walmart" }
    ]
  },
  {
    cat: "🍵 Drinks & Gut Health", store: "Walmart",
    items: [
      { name: "Chamomile tea (Bigelow)", qty: "1 box/month", store: "walmart" },
      { name: "Ginger tea", qty: "1 box/month", store: "walmart" },
      { name: "Green tea bags", qty: "1 box/month", store: "walmart" },
      { name: "Lemons", qty: "1 bag/week", store: "walmart" },
      { name: "Coconut water", qty: "3–4 cans/week", store: "walmart" },
      { name: "Cinnamon (ground)", qty: "1 jar/month", store: "walmart" }
    ]
  }
];
