from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this in production

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

# ROUTES

@app.route('/')
def home():
    return render_template('dashboard.html') if 'user_id' in session else redirect(url_for('signin'))

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

        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_password))
            conn.commit()
        except sqlite3.IntegrityError:
            flash("Email already registered.")
            return redirect(url_for('signup'))
        finally:
            conn.close()

        flash('Account created! Please log in.')
        return redirect(url_for('signin'))
    
    return render_template('signup.html')

@app.route('/signin', methods=['GET', 'POST'])
def signin():  # FIXED typo from "singin"
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute("SELECT id, password FROM users WHERE email = ?", (email,))  
        user = c.fetchone()
        conn.close()

        if user and check_password_hash(user[1], password):
            session['user_id'] = user[0]
            return redirect(url_for('onboarding'))
        else:
            flash('Invalid credentials.')
            return redirect(url_for('signin'))

    return render_template('signin.html')

@app.route('/onboarding', methods=['GET', 'POST'])
def onboarding():
    if 'user_id' not in session:
        return redirect(url_for('signin'))

    if request.method == 'POST':
        goal = request.form['goal']
        experience = request.form['experience']
        days = int(request.form['days'])

        routine = generate_routine(goal, experience, days)

        conn = sqlite3.connect(DB)
        c = conn.cursor()
        c.execute('''
            INSERT INTO plans (user_id, goal, experience, days, routine)
            VALUES (?, ?, ?, ?, ?)
        ''', (session['user_id'], goal, experience, days, routine))
        conn.commit()
        conn.close()

        return render_template('results.html', routine=routine)

    return render_template('onboarding.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('signin'))

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