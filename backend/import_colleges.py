import pandas as pd
from pymongo import MongoClient

# MongoDB Atlas URI
MONGO_URI = "mongodb+srv://snehalwath782_db_user:MaHi7781@cluster0.ulues6j.mongodb.net/campusai?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["campusai"]
collection = db["colleges"]

# Read CSV
df = pd.read_csv("maharashtra_all_colleges.csv")

print("CSV Rows:", len(df))

# Remove old data (optional)
collection.delete_many({})

# Convert DataFrame to dictionary
records = df.to_dict(orient="records")

# Insert into MongoDB
collection.insert_many(records)

print(f"✅ Successfully Imported {len(records)} Colleges")