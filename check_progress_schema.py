import sqlite3

DB = 'instance/smartfit.db'

conn = sqlite3.connect(DB)
cursor = conn.cursor()

# List all tables in the database
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("📦 Tables found:")
for t in tables:
    print("-", t[0])

# Check if 'progress' table exists
if ('progress',) in tables:
    print("\n📋 progress table schema:")
    cursor.execute("PRAGMA table_info(progress);")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
else:
    print("\n⚠️ 'progress' table does not exist.")

conn.close()
