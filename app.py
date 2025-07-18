import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from passlib.hash import bcrypt
from flask_dance.contrib.google import make_google_blueprint, google
from dotenv import load_dotenv
import sqlite3 
import base64
from flask import jsonify
from datetime import datetime
from ai_utils import generate_routine
import glob

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
                gender TEXT,
                favorite_activities TEXT,
                resources TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        conn.commit()
        conn.close()
init_db()

def parse_training_days(days_str):
    mapping = {
        "1-2": 2,
        "3-4": 4,
        "5-6": 6,
        "7": 7
    }
    return mapping.get(days_str, 3)  # default to 3 if not matched

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


@app.route('/onboarding', methods=['GET', 'POST'])
def onboarding():
    if 'user_id' not in session:
        return redirect(url_for('signin'))

    if request.method == 'POST':
        gender = request.form.get('gender', '')
        favorite_activities = request.form.get('favorite_activities', '')
        resources = request.form.get('resources', '')
        goal = request.form['goal']
        experience = request.form['experience']
        days_raw = request.form.get('days', '').strip().lower().replace("–", "-").replace(" to ", "-")
        print("Received days_raw:", days_raw)

        days_map = {
            "1-2": 2,
            "3-4": 4,
            "5-6": 6,
            "7": 7
        }

        days = days_map.get(days_raw)
        if not days:
            return f"Invalid input for training days: {days_raw}", 400

        workout_time_raw = request.form.get('workout_time', '60')
        time_map = {
            "15-30": 22,
            "30-40": 35,
            "45-60": 52,
            "60-75": 67,
            "90-120": 105
        }
        workout_time = time_map.get(workout_time_raw)
        if not workout_time:
            return "Invalid input for workout time", 400
        activity_level = request.form.get('activity_level', 'Moderate')
        cw_raw = request.form.get('current_weight', '')
        if not cw_raw.isdigit():
            return "Invalid input for current weight", 400
        current_weight = int(cw_raw)
        gw_raw = request.form.get('goal_weight', '')
        if not gw_raw.isdigit():
            return "Invalid input for goal weight", 400
        goal_weight = int(gw_raw)

        user_data = {
            "goal": goal,
            "experience": experience,
            "days": days,
            "workout_time": workout_time,
            "activity_level": activity_level,
            "current_weight": current_weight,
            "goal_weight": goal_weight,
            "gender": gender,
            "favorite_activities": favorite_activities,
            "resources": resources
        }

        routine = generate_routine(user_data)

        #  BONUS: Validate AI routine
        if isinstance(routine, list) and len(routine) > 0 and isinstance(routine[0], dict) and "day" in routine[0] and "exercises" in routine[0]:
            session['onboarding_answers'] = user_data
            session['routine'] = routine

            import json
            routine_json = json.dumps(routine)

            conn = sqlite3.connect(DB)
            c = conn.cursor()
            c.execute('''
                INSERT INTO plans (user_id, goal, experience, days, routine, gender, favorite_activities, resources)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session['user_id'],
                goal,
                experience,
                days,
                routine_json,
                gender,
                favorite_activities,
                resources
            ))
            conn.commit()
            conn.close()

            return render_template('results.html', routine=routine)
        else:
            flash(" Failed to generate a valid plan. Try again.")
            return redirect(url_for('onboarding'))

    #  GET request handling
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
    if 'user_id' in session:
        return render_template('dashboard.html')

    # Handle Google login
    if google.authorized:
        resp = google.get("/oauth2/v1/userinfo")
        user_info = resp.json()
        email = user_info["email"]
        name = user_info.get("name", "Google User")

    # Add or get user in DB
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
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('signin'))

@app.route('/reset-password')
def reset_password():
    return render_template('reset-password.html')

@app.route('/calendar')
def calendar():
    if 'user_id' not in session:
        return redirect(url_for('signin'))

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT routine FROM plans WHERE user_id = ?", (session['user_id'],))
    row = c.fetchone()
    conn.close()

    import json
    routine = json.loads(row[0]) if row else []

    return render_template('calendar.html', routine=routine)



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

@app.route("/results")
def results():
    if 'onboarding_answers' not in session:
        return redirect(url_for('onboarding'))

    answers = session['onboarding_answers']

    current_weight = int(answers.get("Current Weight", 0))
    goal_weight = int(answers.get("Goal Weight", 0))
    weight_change = goal_weight - current_weight
    duration = answers.get("Goal Speed", "Balanced pace")
    time_per_day = answers.get("Daily Time", "30-40")
    training_days = answers.get("Training Days", "3-4")

    return render_template(
        "results.html",
        weight_change=weight_change,
        time_per_day=time_per_day,
        training_days=training_days,
        duration=duration
    )

@app.route('/save_onboarding', methods=['POST'])
def save_onboarding():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data received'}), 400

    user_id = session['user_id']

    #  Generate plan using your local AI model (returns Python list of dicts)
    routine_data = generate_routine(data)

    import json
    routine_json = json.dumps(routine_data)  # Convert list/dict to JSON string for DB

    #  Save plan and onboarding data to DB
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute('''
        INSERT INTO plans (user_id, goal, experience, days, routine)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        user_id,
        data.get("Motivation", "N/A"),
        data.get("Activity Level", "N/A"),
        parse_training_days(data.get("Training Days")),
        routine_json
    ))
    conn.commit()
    conn.close()

    # Save answers and routine to session for frontend use
    session['onboarding_answers'] = data
    session['routine'] = routine_data  # direct Python structure

    return jsonify({'success': True})


# LOGIC ENGINE

def generate_sample_routine(goal, experience, days):
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

