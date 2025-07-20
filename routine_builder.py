import random

def build_routine(plan, exercise_data, equipment_available):
    total_weeks = plan["estimated_weeks"]
    session_minutes = plan["session_minutes"]
    week_template = plan["plan_overview"]
    training_days = plan["training_days"]

    # Mapear días a números para control
    day_map = {
        "Monday": 1, "Tuesday": 2, "Wednesday": 3,
        "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7
    }

    full_routine = []

    for week_num in range(total_weeks):
        week = []

        for day_name in training_days:
            day_num = day_map.get(day_name, 1)  # por si falta
            day_plan = week_template.get(day_name, {
                "training_type": "Strength", "intensity": "Medium"
            })
            training_type = day_plan["training_type"]

            # Normalizar los equipos disponibles (puede venir con None)
            available_cleaned = [e.lower() for e in equipment_available if isinstance(e, str)]

            # Filtrar ejercicios que coincidan con tipo y equipo
            matching_exercises = [
                ex for ex in exercise_data
                if ex.get("category", "").lower() == training_type.lower()
                and (
                    str(ex.get("equipment", "body only")).lower() in available_cleaned
        						or str(ex.get("equipment", "body only")).lower() == "body only"
                )
            ]

            # Si no hay ejercicios, usamos un fallback seguro
            if not matching_exercises:
                print(f"⚠️ No matching exercises for {training_type} with equipment {equipment_available}")
                continue

            # Selecciona 4-6 ejercicios distintos
            selected = random.sample(matching_exercises, min(len(matching_exercises), 5))

            formatted = {
                "day": day_num,
                "type": training_type,
                "duration": session_minutes,
                "intensity": day_plan["intensity"],
                "exercises": [
                    {
                        "name": ex.get("name", "Unknown"),
                        "reps": "12",
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
