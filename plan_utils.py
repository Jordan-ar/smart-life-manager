import math
import random

def convert_to_metric(user_data):
    # Convert weight if in lbs
    if "weight_unit" in user_data and user_data["weight_unit"] == "lbs":
        user_data["current_weight"] = round(float(user_data["current_weight"]) * 0.453592, 1)
        user_data["goal_weight"] = round(float(user_data["goal_weight"]) * 0.453592, 1)
    else:
        user_data["current_weight"] = float(user_data["current_weight"])
        user_data["goal_weight"] = float(user_data["goal_weight"])

    # Convert height if in ft/in
    if "height_unit" in user_data and user_data["height_unit"] == "imperial":
        feet = int(user_data["height_ft"])
        inches = int(user_data["height_in"])
        total_inches = feet * 12 + inches
        user_data["height_cm"] = round(total_inches * 2.54, 1)
    else:
        user_data["height_cm"] = float(user_data["height_cm"])

    return user_data

def calculate_bmi(weight_kg, height_cm):
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)

def estimate_weeks_to_goal(current_kg, goal_kg, speed):
    diff = abs(current_kg - goal_kg)
    if speed == "Slow and steady":
        rate = 0.25
    elif speed == "Balanced pace":
        rate = 0.5
    else:  # Fast (but healthy)
        rate = 0.75
    return max(4, math.ceil(diff / rate))

def generate_weekdays(option):
    mapping = {
        "1-2": ["Monday", "Thursday"],
        "3-4": ["Monday", "Wednesday", "Friday"],
        "5-6": ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
        "7": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
    return mapping.get(option, ["Monday", "Wednesday", "Friday"])

def map_duration(option):
    mapping = {
        "10-20": 15,
        "30-40": 35,
        "50-60": 55,
        "90-120": 90
    }
    return mapping.get(option, 30)

def combine_styles(goal, preferences):
    goal_map = {
        "lose_weight": ["Cardio", "Plyometrics", "Strength"],
        "gain_muscle": ["Strength", "Powerlifting", "Strongman"],
        "get_healthy": ["Stretching", "Strength", "Plyometrics"],
        "improve_endurance": ["Plyometrics", "Cardio", "Stretching"]
    }

    from_goal = goal_map.get(goal, [])
    # Mezclamos duplicando las preferencias para darles más peso
    combined = preferences * 2 + from_goal
    return list(set(combined))  # Eliminar duplicados

def generate_plan(user_data):
    user_data = convert_to_metric(user_data)
    goal = user_data["goal"]
    gender = user_data["gender"]
    age = int(user_data["age"])
    height_cm = float(user_data["height_cm"])
    current_kg = float(user_data["current_weight"])
    goal_kg = float(user_data["goal_weight"])
    speed = user_data["speed"]
    days = user_data["days_per_week"]
    time = user_data["time_available"]
    activity = user_data["activity_level"]
    styles = user_data["favorite_styles"]  # list
    equipment = user_data["equipment"]  # list
    bmi = calculate_bmi(current_kg, height_cm)
    weeks = estimate_weeks_to_goal(current_kg, goal_kg, speed)
    weekdays = generate_weekdays(days)
    session_time = map_duration(time)

    beginner = activity in ["Sedentary", "Occasionally active"]
    default_styles = ["Strength", "Stretching", "Plyometrics", "Strongman", "Powerlifting"]
    possible_styles = combine_styles(goal, styles)

    weekly_plan = {}
    for i, day in enumerate(weekdays):
        style = random.choice(possible_styles)
        weekly_plan[day] = {
            "training_type": style,
            "duration": session_time,
            "intensity": "Low" if beginner else "High" if speed == "As fast as possible (healthy)" else "Medium"
        }

    return {
        "goal": goal,
    		"experience": activity,
        "bmi": bmi,
        "estimated_weeks": weeks,
        "session_minutes": session_time,
        "training_days": weekdays,
        "plan_overview": weekly_plan
    }
