import csv
import sqlite3

conn = sqlite3.connect(r'backend\data\southpaw.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM grimorio_monstros")

with open('monsters.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)

    # header
    writer.writerow([desc[0] for desc in cursor.description])

    # dados
    writer.writerows(cursor.fetchall())

conn.close()
