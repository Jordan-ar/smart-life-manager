import requests
import json
import re

def generate_routine(user_data):
    with open("static/data/exercises.json", "r") as f:
        available_exercises = json.load(f)

    prompt = f"""
Create a 7-day personalized workout routine using ONLY the exercises from the list below. Choose exercises that fit the user's goal, experience, time per day, and resources. Be realistic and beginner-friendly if needed.

--- USER INFO ---
Goal: {user_data.get("goal")}
Experience: {user_data.get("experience")}
Workout time per day: {user_data.get("workout_time")} mins
Activity level: {user_data.get("activity_level")}
Current weight: {user_data.get("current_weight")} kg
Goal weight: {user_data.get("goal_weight")} kg
Gender: {user_data.get("gender")}
Favorite Activities: {user_data.get("favorite_activities")}
Resources Available: {user_data.get("resources")}

--- EXERCISE DATABASE ---
{json.dumps(available_exercises[:50])}

Return ONLY valid JSON in this structure:
{{
  "weight_change": int,
  "duration": "Slow and steady" | "Balanced pace" | "As fast as possible (healthy)",
  "training_days": int,
  "time_per_day": int,
  "routine": {{
    "Monday": {{
      "type": "Fat Burn",
      "description": "Short description here",
      "exercises": [
        {{
          "name": "Exercise Name",
          "reps": "10",
          "target": "Legs",
          "equipment": "Bodyweight",
          "description": "Short explanation",
          "image": "https://..."
        }}
      ]
    }},
    ...
  }}
}}
"""

    try:
        response = requests.post(
            "http://localhost:1234/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json={
                "model": "mistralai/mistral-7b-instruct-v0.3",
                "messages": [
                    {"role": "system", "content": "You are a helpful AI fitness coach."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()

        return json.loads(content)

    except Exception as e:
        print("AI routine generation error:", e)
        return {
            "weight_change": user_data.get("goal_weight", 0) - user_data.get("current_weight", 0),
            "duration": user_data.get("experience", "Balanced pace"),
            "training_days": user_data.get("days", 3),
            "time_per_day": user_data.get("workout_time", 30),
            "routine": {}
        }
