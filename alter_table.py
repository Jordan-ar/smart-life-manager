import sqlite3

conn = sqlite3.connect("instance/smartfit.db")
c = conn.cursor()

try:
    c.execute("ALTER TABLE plans ADD COLUMN gender TEXT")
except sqlite3.OperationalError as e:
    print("gender column may already exist:", e)

try:
    c.execute("ALTER TABLE plans ADD COLUMN favorite_activities TEXT")
except sqlite3.OperationalError as e:
    print("favorite_activities column may already exist:", e)

try:
    c.execute("ALTER TABLE plans ADD COLUMN resources TEXT")
except sqlite3.OperationalError as e:
    print("resources column may already exist:", e)

conn.commit()
conn.close()

print("Table alteration complete.")