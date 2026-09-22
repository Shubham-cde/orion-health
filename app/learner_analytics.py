import sqlite3

import matplotlib.pyplot as plt
import pandas as pd

DB_PATH = "../learner.db"

conn = sqlite3.connect(DB_PATH)
df = pd.read_sql("SELECT * FROM learning_feedback", conn)
conn.close()

if df.empty:
    print("No learning data yet.")
    exit()

print("Total learning samples:", len(df))

plt.figure()
plt.plot(df["id"], df["delta"])
plt.title("Doctor Correction (Delta) Over Time")
plt.xlabel("Sample Number")
plt.ylabel("Delta")
plt.show()

plt.figure()
plt.scatter(df["ai_score"], df["doctor_score"])
plt.plot([1, 10], [1, 10])
plt.title("AI Score vs Doctor Score")
plt.xlabel("AI Score")
plt.ylabel("Doctor Score")
plt.show()

plt.figure()
plt.hist(df["delta"], bins=20)
plt.title("Correction Distribution")
plt.xlabel("Delta")
plt.ylabel("Frequency")
plt.show()
