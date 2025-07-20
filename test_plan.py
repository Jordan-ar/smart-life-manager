from plan_utils import generate_plan

user_answers = {
    "goal": "lose_weight",
    "gender": "female",
    "age": 24,
    "height_unit": "imperial",  # 👈👈 clave
    "height_ft": 5,
    "height_in": 4,
    "weight_unit": "lbs",       # 👈👈 clave
    "current_weight": 154,
    "goal_weight": 132,
    "speed": "Balanced pace",
    "days_per_week": "3-4",
    "time_available": "30-40",
    "activity_level": "Occasionally active",
    "favorite_styles": ["Strength", "Stretching"],
    "equipment": ["Body only", "Dumbbell"]
}

plan = generate_plan(user_answers)

print("✨ Generated Plan:")
for k, v in plan.items():
    print(f"{k}: {v}")
