import os
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, g
from passlib.hash import bcrypt
from flask_dance.contrib.google import make_google_blueprint, google
from dotenv import load_dotenv
import sqlite3
import base64
from datetime import datetime, timedelta
import glob
import json
from flask_session import Session

print(" You are running app.py from:", __file__)

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
Session(app)

# Google OAuth setup
app.secret_key = os.getenv("SECRET_KEY")
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ],
    redirect_to="google_login_redirect",
    reprompt_consent=True
)

app.register_blueprint(google_bp, url_prefix="/login")

DB = 'instance/smartfit.db'


def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    # Crear tabla de usuarios
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Crear tabla de planes
    c.execute('''
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            goal TEXT,
            experience TEXT,
            days INTEGER,
            routine TEXT,
            plan TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Crear tabla de progreso corregida
    c.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            exercise_name TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            UNIQUE(user_id, date, exercise_name),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
init_db()

def ensure_user_session():
    if google.authorized and 'user_id' not in session:
        resp = google.get("/oauth2/v1/userinfo")
        user_info = resp.json()
        email = user_info["email"]
        name = user_info.get("name", "Google User")

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = c.fetchone()

        if user:
            user_id = user[0]
        else:
            c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, ""))
            conn.commit()
            user_id = c.lastrowid

        session['user_id'] = user_id

        c.execute("SELECT routine, plan FROM plans WHERE user_id = ?", (user_id,))
        plan_data = c.fetchone()
        conn.close()

        if plan_data and plan_data[1]:
            try:
                session["routine"] = json.loads(plan_data[0]) if plan_data[0] else {}
                session["fitness_plan"] = json.loads(plan_data[1])
                session["needs_onboarding"] = False
            except:
                session["routine"] = []
                session["fitness_plan"] = {}
                session["needs_onboarding"] = True
        else:
            session["routine"] = []
            session["fitness_plan"] = {}
            session["needs_onboarding"] = True

# ROUTES

@app.route("/google-login-redirect")
def google_login_redirect():
    if not google.authorized:
        return redirect(url_for("start_google_login"))

    ensure_user_session()

    if session.get("needs_onboarding", False) or not session.get("fitness_plan"):
        flash("Welcome! Let's get started with your plan.")
        return redirect(url_for("onboarding"))
    else:
        return redirect(url_for("calendar"))

@app.route("/start-google-login")
def start_google_login():
    return redirect(url_for("google.login") + "?prompt=select_account")

@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('calendar'))
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if password != confirm_password:
            flash('Passwords do not match.')
            return redirect(url_for('signup'))

        hashed_password = bcrypt.hash(password)

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_password))
            conn.commit()
            user_id = c.lastrowid 
        except sqlite3.IntegrityError:
            conn.close()
            flash("Email already registered.")
            return redirect(url_for('signup'))  

        conn.close()
        session['user_id'] = user_id  
        session['needs_onboarding'] = True 
        flash('Account created successfully!')
        return redirect(url_for('onboarding'))

    return render_template('signup.html')

@app.route('/onboarding_success')
def onboarding_success():
    if 'user_id' not in session:
        return redirect(url_for('signin'))
    return render_template('onboarding_success.html')

@app.route('/signin', methods=['GET', 'POST'])
def signin():  
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("SELECT id, password FROM users WHERE email = ?", (email,))
        user = c.fetchone()

        if user and bcrypt.verify(password, user[1]):
            session['user_id'] = user[0]

            c.execute("SELECT routine, plan FROM plans WHERE user_id = ?", (user[0],))
            plan_data = c.fetchone()
            conn.close()

            if plan_data:
                try:
                    session["routine"] = json.loads(plan_data[0])
                    session["fitness_plan"] = json.loads(plan_data[1])
                except:
                    session["routine"] = []
                    session["fitness_plan"] = {}
                return redirect(url_for('calendar'))
            else:
                return redirect(url_for('onboarding'))  
        else:
            conn.close()
            flash('Invalid credentials.')
            return redirect(url_for('signin'))

    return render_template('signin.html')

@app.route('/onboarding')
def onboarding():
    if 'user_id' not in session:
        return redirect(url_for('signin'))

    edit_mode = request.args.get("edit", "false") == "true"

    if not session.get("needs_onboarding", True) and not edit_mode:
        return redirect(url_for('calendar'))
    
    existing_data = session.get("fitness_plan", {})

    return render_template('onboarding.html', data=existing_data, edit_mode=edit_mode)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('signin'))

@app.route('/reset-password')
def reset_password():
    return render_template('reset-password.html')

@app.route("/calendar")
def calendar():
    if "user_id" not in session:
        return redirect(url_for("signin"))

    plan = session.get("fitness_plan")
    if not plan:
        flash("Please complete the onboarding first.")
        return render_template("calendar.html", user_plan={}, progress={}, user_id=session["user_id"])


    days_map = { "1-2": 2, "3-4": 4, "5-6": 6 }
    raw_days = plan.get("days_per_week", "3-4")
    days_count = days_map.get(raw_days, 4)

    time_map = { "10-15": 15, "30-40": 30, "50-60": 60 }
    raw_time = plan.get("time_available", "30-40")
    time_minutes = time_map.get(raw_time, 30)

    user_plan = {
        "goal": plan.get("goal", "lose_weight"),
        "days_per_week": days_count,
        "time_available": time_minutes
    }

    user_id = session["user_id"]
    today = datetime.today()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT date, exercise_name, completed FROM progress
        WHERE user_id = ? AND date BETWEEN ? AND ?
    """, (user_id, start_of_week.strftime("%Y-%m-%d"), end_of_week.strftime("%Y-%m-%d")))
    rows = c.fetchall()
    conn.close()

    # Usamos clave compuesta para que calendar.html sepa qué ejercicio fue completado por día
    weekly_progress = {
        f"{row['date']}|{row['exercise_name']}": bool(row['completed']) for row in rows
    }

    return render_template("calendar.html", user_plan=user_plan, progress=weekly_progress, user_id=user_id)


@app.route('/profile')
def profile():
    ensure_user_session()
    if 'user_id' not in session:
        return redirect(url_for('signin'))

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT name, email FROM users WHERE id = ?", (session['user_id'],))
    user = c.fetchone()
    conn.close()

    user_id = session["user_id"]
    folder_path = os.path.join("static", "uploads")
    pattern = os.path.join(folder_path, f"user_{user_id}_*.png")
    files = glob.glob(pattern)

    profile_pic = "/static/assets/profile-picture.jpg"
    if files:
        latest_file = max(files, key=os.path.getctime)
        profile_pic = "/" + latest_file.replace("\\", "/")

    fitness_plan = session.get("fitness_plan", {}) 

    if user:
        return render_template(
            'profile.html',
            name=user[0],
            email=user[1],
            profile_pic=profile_pic,
            fitness_plan=fitness_plan 
        )
    else:
        return redirect(url_for('signin'))

@app.route('/upload-profile-photo', methods=['POST'])
def upload_profile_photo():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json()
    image_data = data.get('image')

    if not image_data or not image_data.startswith("data:image"):
        return jsonify({'success': False, 'error': 'Invalid image data'}), 400

    try:
        header, encoded = image_data.split(',', 1)
        binary_data = base64.b64decode(encoded)

        user_id = session['user_id']
        folder_path = os.path.join('static', 'uploads')
        os.makedirs(folder_path, exist_ok=True)

        filename = f"user_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        file_path = os.path.join(folder_path, filename)

        with open(file_path, 'wb') as f:
            f.write(binary_data)

        return jsonify({'success': True, 'path': f"/static/uploads/{filename}"})

    except Exception as e:
        print("Upload error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/results')
def results():
    data = session.get("fitness_plan", {})

    goal = data.get("goal", "get_healthy")
    speed = data.get("speed", "Balanced pace")
    current = float(data.get("current_weight", 0))
    target = float(data.get("goal_weight", 0))
    unit = session.get("weight_unit", "kg")
    days = data.get("days_per_week", "3-4")
    time = data.get("time_available", "30-40")

    weight_diff = abs(current - target)
    weight_goal = round(weight_diff, 1)

    if goal == "get_healthy":
        duration = 75
    else:
        if speed == "As fast as possible (healthy)":
            rate = 1.0 if unit == "kg" else 2.2
        elif speed == "Slow and steady":
            rate = 0.2 if unit == "kg" else 0.44
        else:
            rate = 0.5 if unit == "kg" else 1.1

        duration = round(weight_diff / rate)

    days_map = {"1-2": 2, "3-4": 4, "5-6": 6}
    days_count = days_map.get(days, 3)

    time_map = {"10-15": 15, "30-40": 30, "50-60": 60}
    time_minutes = time_map.get(time, 30)

    if goal == "get_healthy":
        goal_text = "Stay Healthy"
    elif goal == "lose_weight":
        goal_text = f"Lose {weight_goal} {unit}"
    else:
        goal_text = f"Gain {weight_goal} {unit}"

    return render_template("results.html",
        duration=duration,
        weight_goal=weight_goal,
        days=days_count,
        time=time_minutes,
        goal=goal_text)

@app.route('/save_onboarding', methods=['POST'])
def save_onboarding():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data received'}), 400

    try:
        session['fitness_plan'] = data
        session['weight_unit'] = data.get('weight_unit', 'kg')
        session['goal_weight'] = float(data.get('goal_weight', 0))
        session['current_weight'] = float(data.get('current_weight', 0))
        session['needs_onboarding'] = False

        conn = sqlite3.connect(DB)
        c = conn.cursor()

        plan_json = json.dumps(data)
        c.execute("SELECT id FROM plans WHERE user_id = ?", (session['user_id'],))
        existing = c.fetchone()

        if existing:
            c.execute("UPDATE plans SET plan = ? WHERE user_id = ?", (plan_json, session['user_id']))
        else:
            c.execute("INSERT INTO plans (user_id, plan) VALUES (?, ?)", (session['user_id'], plan_json))

        conn.commit()
        conn.close()

        return jsonify({'success': True})
    
    except Exception as e:
        print("Error saving onboarding data:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/save-routine', methods=['POST'])
def save_routine():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json()
    try:
        routine_json = json.dumps(data["routine"])
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("UPDATE plans SET routine = ? WHERE user_id = ?", (routine_json, session["user_id"]))
        conn.commit()
        conn.close()

        session["routine"] = data["routine"]

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/save-progress', methods=['POST'])
def save_progress():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    data = request.get_json()
    date = data.get("date")
    completed = data.get("completed")

    if not date or not isinstance(completed, list):
        return jsonify({'success': False, 'error': 'Invalid data format'}), 400

    try:
        conn = sqlite3.connect(DB)
        cursor = conn.cursor()

        completed_json = json.dumps(completed)

        cursor.execute("""
            INSERT INTO progress (user_id, date, completed_exercises)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET completed_exercises=excluded.completed_exercises
        """, (session['user_id'], date, completed_json))

        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Progress saved'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/progress-summary", methods=["GET"])
def progress_summary():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session['user_id']
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("SELECT date, completed_exercises FROM progress WHERE user_id = ?", (user_id,))
    rows = c.fetchall()
    conn.close()

    summary = []
    for date_str, completed in rows:
        try:
            exercises = json.loads(completed)
        except:
            exercises = []

        summary.append({
            "date": date_str,
            "completed_exercises": exercises
        })

    return jsonify({"success": True, "progress": summary})

@app.route("/get-progress")
def get_progress():
    if 'user_id' not in session:
        return jsonify({"completed": False})

    user_id = session["user_id"]
    date = request.args.get("date")
    exercise_name = request.args.get("exercise_name")

    if not date or not exercise_name:
        return jsonify({"completed": False})

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""
        SELECT completed FROM progress 
        WHERE user_id = ? AND date = ? AND exercise_name = ?
    """, (user_id, date, exercise_name))
    row = c.fetchone()
    conn.close()

    return jsonify({"completed": bool(row[0]) if row else False})

@app.route("/set-progress", methods=["POST"])
def set_progress():
    if 'user_id' not in session:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    data = request.get_json()
    date = data.get("date")
    exercise_name = data.get("exercise_name")
    completed = 1 if data.get("completed") else 0

    if not date or not exercise_name:
        return jsonify({"success": False, "error": "Missing data"}), 400

    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("""
            INSERT INTO progress (user_id, date, exercise_name, completed)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, date, exercise_name)
            DO UPDATE SET completed = excluded.completed
        """, (session['user_id'], date, exercise_name, completed))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
