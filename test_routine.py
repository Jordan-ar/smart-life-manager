from plan_utils import generate_plan
from routine_builder import build_routine
import json

# Simular respuestas de un usuario real
user_answers = {
    "goal": "lose_weight",
    "gender": "female",
    "age": 24,
    "height_unit": "imperial",
    "height_ft": 5,
    "height_in": 4,
    "weight_unit": "lbs",
    "current_weight": 154,
    "goal_weight": 132,
    "speed": "Balanced pace",
    "days_per_week": "3-4",
    "time_available": "30-40",
    "activity_level": "Occasionally active",
    "favorite_styles": ["Strength", "Stretching"],
    "equipment": ["Body only", "Dumbbell"]
}

# 1. Generar el plan con lógica personalizada
plan = generate_plan(user_answers)

# 2. Cargar el dataset de ejercicios
with open("static/data/exercises.json") as f:
    exercise_data = json.load(f)

# 3. Generar rutina completa con ejercicios reales
routine = build_routine(plan, exercise_data, user_answers["equipment"])

# 4. Mostrar una semanita como ejemplo 🫶
print("📅 SEMANA 1:")
for day in routine[0]:
    print(f"👉 Día {day['day']} ({day['type']} - {day['intensity']} - {day['duration']} min)")
    for ex in day["exercises"]:
        print(f"   - {ex['name']} ({ex['equipment']}) -> Target: {ex['target']}")
    print("------")
