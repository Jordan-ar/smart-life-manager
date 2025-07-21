import sqlite3
import json
from flask import g

DB = 'instance/smartfit.db'

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB)
        g.db.row_factory = sqlite3.Row
    return g.db

def get_user_progress(user_id, start_date=None, end_date=None):
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if start_date and end_date:
        cursor.execute("""
            SELECT date, completed_exercises
            FROM progress
            WHERE user_id = ? AND date BETWEEN ? AND ?
        """, (user_id, start_date, end_date))
    else:
        cursor.execute("""
            SELECT date, completed_exercises
            FROM progress
            WHERE user_id = ?
        """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    progress = []
    for row in rows:
        completed = row['completed_exercises']
        try:
            completed_list = json.loads(completed) if completed else []
        except json.JSONDecodeError:
            completed_list = []

        progress.append({
            "date": row['date'],
            "completed_exercises": completed_list
        })

    return progress

