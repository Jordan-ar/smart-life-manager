import requests
import json

def generate_routine(user_data):
    prompt = f"""
    Create a 7-day personalized workout routine for someone with:
    - Goal: {user_data.get("goal")}
    - Experience: {user_data.get("experience")}
    - Workout time: {user_data.get("workout_time")}
    - Activity level: {user_data.get("activity_level")}
    - Current weight: {user_data.get("current_weight")} kg
    - Goal weight: {user_data.get("goal_weight")} kg

    Format it as a JSON list with one entry per day like:
    [
      {{
        "day": "Monday",
        "type": "Push",
        "exercises": [
          {{ "name": "Push Ups", "reps": "12" }},
          {{ "name": "Pull Ups", "reps": "8" }}
        ]
      }},
      ...
    ]

    ONLY return valid JSON. No commentary.
    """

    try:
        response = requests.post(
            "http://localhost:1234/v1/chat/completions",
            headers={"Content-Type": "application/json"},
            json={
                "model": "mistral-7b-instruct-v0.1",
                "messages": [
                    {"role": "system", "content": "You are a helpful AI fitness coach."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        routine = json.loads(content)
        return routine

    except (requests.RequestException, json.JSONDecodeError) as e:
        print(" Error generating or parsing routine:", e)
        return []
