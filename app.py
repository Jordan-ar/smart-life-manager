import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from passlib.hash import bcrypt
from flask_dance.contrib.google import make_google_blueprint, google
from dotenv import load_dotenv
import sqlite3
import os
import base64
from flask import jsonify
from datetime import datetime
import glob
import json
from flask_session import Session

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
Session(app)


# Google OAuth setup
app.secret_key = os.getenv("SECRET_KEY")  # Load from .env

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Google OAuth setup with env vars
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ],
    redirect_to="dashboard",
    reprompt_consent=True 
)

app.register_blueprint(google_bp, url_prefix="/login")

DB = 'instance/smartfit.db'

def init_db():
    if not os.path.exists(DB):
        os.makedirs('instance', exist_ok=True)
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        c.execute('''
            CREATE TABLE plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                goal TEXT,
                experience TEXT,
                days INTEGER,
                routine TEXT,
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

        # 🧠 Guardar user_id
        session['user_id'] = user_id

        # 🧠 Cargar plan y rutina
        c.execute("SELECT routine, plan FROM plans WHERE user_id = ?", (user_id,))
        plan_data = c.fetchone()
        conn.close()

        if plan_data:
            try:
                session["routine"] = json.loads(plan_data[0])
                session["fitness_plan"] = json.loads(plan_data[1])
            except:
                session["routine"] = []
                session["fitness_plan"] = {}


# ROUTES

@app.route("/start-google-login")
def start_google_login():
    return redirect(url_for("google.login") + "?prompt=select_account")

@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
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
        session['needs_onboarding'] = True  # 🪄 Marca que aún no ha hecho onboarding
        flash('Account created successfully!')
        return redirect(url_for('onboarding'))


    return render_template('signup.html')  # fallback for GET request

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

            # 🚀 Carga plan y rutina desde DB
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
                return redirect(url_for('dashboard'))
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

	conn = sqlite3.connect(DB)
	c = conn.cursor()
	c.execute("SELECT * FROM plans WHERE user_id = ?", (session['user_id'],))
	existing_plan = c.fetchone()
	conn.close()

	if existing_plan:
		return redirect(url_for('dashboard'))

	return render_template('onboarding.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('signin'))

@app.route('/reset-password')
def reset_password():
    return render_template('reset-password.html')

@app.route("/calendar")
def calendar():
    # ⛑️ Verifica si hay plan en sesión
    plan = session.get("fitness_plan")
    if not plan:
        flash("Please complete the onboarding first.")
        return render_template("calendar.html", user_plan={})

    # Mapeo para days_per_week
    days_map = {
        "1-2": 2,
        "3-4": 4,
        "5-6": 6
    }
    raw_days = plan.get("days_per_week", "3-4")
    days_count = days_map.get(raw_days, 4)  # default a 4 si no coincide

    # Mapeo para time_available
    time_map = {
        "10-15": 15,
        "30-40": 30,
        "50-60": 60
    }
    raw_time = plan.get("time_available", "30-40")
    time_minutes = time_map.get(raw_time, 30)

    user_plan = {
        "goal": plan.get("goal", "lose_weight"),
        "days_per_week": days_count,
        "time_available": time_minutes
    }

    return render_template("calendar.html", user_plan=user_plan)


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


    profile_pic = "/static/assets/profile-picture.jpg"  # default

    if files:
        latest_file = max(files, key=os.path.getctime)
        profile_pic = "/" + latest_file.replace("\\", "/")  # Flask needs forward slashes

    if user:
        return render_template('profile.html', name=user[0], email=user[1], profile_pic=profile_pic)
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
        # Extract base64 content and decode
        header, encoded = image_data.split(',', 1)
        binary_data = base64.b64decode(encoded)

        # Create directory if it doesn't exist
        user_id = session['user_id']
        folder_path = os.path.join('static', 'uploads')
        os.makedirs(folder_path, exist_ok=True)

        # Create filename with user ID and timestamp to avoid caching
        filename = f"user_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        file_path = os.path.join(folder_path, filename)

        # Save image to disk
        with open(file_path, 'wb') as f:
            f.write(binary_data)

        # Return file path to update profile image on frontend
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

    # Calcular duración
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

    # Frecuencia de días
    days_map = {
        "1-2": 2,
        "3-4": 4,
        "5-6": 6
    }
    days_count = days_map.get(days, 3)

    # Tiempo diario
    time_map = {
        "10-15": 15,
        "30-40": 30,
        "50-60": 60
    }
    time_minutes = time_map.get(time, 30)

    # Texto objetivo
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
        # Guardar datos directamente en sesión
        session['fitness_plan'] = data
        session['weight_unit'] = data.get('weight_unit', 'kg')
        session['goal_weight'] = float(data.get('goal_weight'))
        session['current_weight'] = float(data.get('current_weight'))
        session['needs_onboarding'] = False  # ✅ para que no lo repita

        return jsonify({'success': True})
    except Exception as e:
        print("Error saving onboarding data:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/dashboard')
def dashboard():
    ensure_user_session()

    if 'user_id' not in session:
        return redirect(url_for('signin'))

    if session.get("needs_onboarding", False):
        return redirect(url_for('onboarding'))

    return render_template('dashboard.html')

# LOGIC ENGINE

if __name__ == '__main__':
    app.run(debug=True)
# LOGIC ENGINE

if __name__ == '__main__':
    app.run(debug=True)
