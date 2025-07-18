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
      - Gender: {user_data.get('gender', '')}
      - Favorite Activities: {user_data.get('favorite_activities', '')}
      - Available Resources: {user_data.get('resources', '')}

      Return JSON like this:
      [
        {{
          "day": "Monday",
          "type": "Fat Burn",
          "description": "Blasts calories and boosts endurance.",
          "exercises": [
            {{
              "name": "Push Ups",
              "reps": "12",
              "target": "Chest",
              "equipment": "Bodyweight",
              "description": "Lower and raise your body using your arms while keeping your back straight.",
              "image": "https://example.com/pushups.gif"
            }}
          ]
        }}
      ]

      ONLY return valid JSON. No commentary or formatting outside the JSON block.
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
