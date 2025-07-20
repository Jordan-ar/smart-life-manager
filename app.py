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
from plan_utils import generate_plan
import json
from routine_builder import build_routine

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

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

        conn.close()
        session['user_id'] = user_id

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

            c.execute("SELECT id FROM plans WHERE user_id = ?", (user[0],))
            existing_plan = c.fetchone()
            conn.close()

            if existing_plan:
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

@app.route('/dashboard')
def dashboard():
    ensure_user_session()

    if 'user_id' not in session:
        return redirect(url_for('signin'))

    user_id = session['user_id']

    # Verificar si el usuario ya tiene plan
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT id FROM plans WHERE user_id = ?", (user_id,))
    existing_plan = c.fetchone()
    conn.close()

    # Si NO tiene plan, lo mandamos al onboarding
    if not existing_plan:
        return redirect(url_for('onboarding'))

    # Si SÍ tiene plan, mostrar dashboard normal
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('signin'))

@app.route('/reset-password')
def reset_password():
    return render_template('reset-password.html')

@app.route("/calendar")
def calendar():
    routine = session.get("routine", [])
    return render_template("calendar.html", routine=json.dumps(routine))

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
    plan = session.get("fitness_plan", {})
    goal_weight = float(session.get("goal_weight", 0))
    current_weight = float(session.get("current_weight", 0))
    weight_loss = round(current_weight - goal_weight, 1)

    return render_template("results.html",
    duration=plan.get("estimated_weeks", "?"),
    weight_goal=weight_loss,
    days=len(plan.get("training_days", [])),
    time=plan.get("session_minutes", "?"),
		weight_unit=session.get("weight_unit", "kg"))


@app.route('/save_onboarding', methods=['POST'])
def save_onboarding():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data received'}), 400

    try:
        plan = generate_plan(data)
        exercise_data = []  # luego puedes cargar tu JSON aquí
        routine = build_routine(plan, exercise_data, data.get("equipment", []))

        session['fitness_plan'] = plan
        session['routine'] = routine
        session['weight_unit'] = data.get('weight_unit', 'kg')
        session['goal_weight'] = float(data.get('goal_weight'))
        session['current_weight'] = float(data.get('current_weight'))
        session['days_per_week'] = data.get('days_per_week')
        session['time_available'] = data.get('time_available')

        # 💾 GUARDAR EL PLAN EN LA BASE DE DATOS
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("""
            INSERT INTO plans (user_id, goal, experience, days, routine)
            VALUES (?, ?, ?, ?, ?)
        """, (
            session['user_id'],
            plan.get('goal_type', 'Unknown'),
            plan.get('experience_level', 'Unknown'),
            len(plan.get('training_days', [])),
            json.dumps(routine)
        ))
        conn.commit()
        conn.close()

        return jsonify({'success': True})
    except Exception as e:
        print("Plan generation error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route("/generate", methods=["POST"])
def generate():
    user_data = request.get_json()  # o usa form si lo envías así
    plan = generate_plan(user_data)
    
    # Define exercise_data here or import from a module
    exercise_data = []  # TODO: Replace with actual exercise data or import from a file/module
    
    routine = build_routine(plan, exercise_data, user_data.get("resources", []))
    session["routine"] = routine  # 💾 Guardamos la rutina en la sesión

    return jsonify(success=True)
# LOGIC ENGINE

def generate_routine(goal, experience, days):
    base = {
        'Lose Weight': ['Cardio', 'HIIT', 'Core'],
        'Gain Muscle': ['Strength', 'Push/Pull', 'Leg Day'],
        'Tone': ['Pilates', 'Full Body Circuits', 'Yoga']
    }

    plan = []
    for i in range(days):
        day_plan = base.get(goal, ['Full Body'])[i % len(base[goal])]
        plan.append(f"{day_plan} ({experience})")

    return "\n".join(plan)

if __name__ == '__main__':
    app.run(debug=True)
