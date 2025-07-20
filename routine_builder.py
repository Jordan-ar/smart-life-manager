import random

def get_reps(level, session_time, category):
	if category.lower() == "cardio":
		return "30 sec"
	if level == "sedentary" or session_time < 30:
		return "8-10"
	elif level == "intermediate":
		return "10-12"
	else:
		return "12-15"

def build_routine(plan, exercise_data, equipment_available):
	total_weeks = plan["estimated_weeks"]
	session_minutes = plan["session_minutes"]
	week_template = plan["plan_overview"]
	training_days = plan["training_days"]
	user_level = plan.get("user_level", "intermediate")  # 🛟 Nivel por defecto si falta

	day_map = {
		"Monday": 1, "Tuesday": 2, "Wednesday": 3,
		"Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7
	}

	full_routine = []

	for week_num in range(total_weeks):
		week = []

		for day_name in training_days:
			day_num = day_map.get(day_name, 1)
			day_plan = week_template.get(day_name, {
				"training_type": "Strength", "intensity": "Medium"
			})
			training_type = day_plan["training_type"]

			# Normaliza equipos disponibles
			available_cleaned = [e.lower() for e in equipment_available if isinstance(e, str)]

			# Filtra ejercicios
			matching_exercises = [
				ex for ex in exercise_data
				if ex.get("category", "").lower() == training_type.lower()
				and (
					str(ex.get("equipment", "body only")).lower() in available_cleaned
					or str(ex.get("equipment", "body only")).lower() == "body only"
				)
			]

			if not matching_exercises:
				print(f"⚠️ No matching exercises for {training_type} with equipment {equipment_available}")
				continue

			selected = random.sample(matching_exercises, min(len(matching_exercises), 5))

			formatted = {
				"day": day_num,
				"type": training_type,
				"duration": session_minutes,
				"intensity": day_plan["intensity"],
				"exercises": [
					{
						"name": ex.get("name", "Unknown"),
						"reps": get_reps(user_level, session_minutes, ex.get("category", "Strength")),
						"equipment": ex.get("equipment", "Body only"),
						"target": ex.get("primaryMuscles", []),
						"description": " ".join(ex.get("instructions", [])),
						"image": ex.get("images", [None])[0]
					}
					for ex in selected
				]
			}

			week.append(formatted)

		full_routine.append(week)

	return full_routine
