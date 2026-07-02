import requests
import pandas as pd

url = "https://facilities.aicte-india.org/dashboard/pages/php/approvedinstituteserver.php"

params = {
    "method": "fetchdata",
    "year": "2025-2026",
    "state": "Maharashtra"
}

print("Downloading colleges...")

response = requests.get(url, params=params)
response.raise_for_status()

print(response.headers.get("Content-Type"))

print("\nFirst 500 characters:\n")
print(response.text[:500])

exit()

columns = [
    "AICTE_ID",
    "College_Name",
    "Address",
    "City",
    "Institute_Type",
    "Women_Institute",
    "Minority_Institute",
    "Permanent_ID"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("maharashtra_colleges.csv", index=False, encoding="utf-8-sig")

print(df.head())
print("Done!")