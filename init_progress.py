import sqlite3

conn = sqlite3.connect("instance/smartfit.db")
c = conn.cursor()

c.execute('''
    CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT,
        completed_exercises TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
''')

conn.commit()
conn.close()

print(" Progress table created (if it didn't exist).")
