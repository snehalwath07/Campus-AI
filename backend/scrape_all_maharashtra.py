from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

import pandas as pd
import time

# ------------------------------
# Launch Chrome
# ------------------------------

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.maximize_window()

wait = WebDriverWait(driver, 30)

# ------------------------------
# Open AICTE Website
# ------------------------------

driver.get("https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php#!/approved")

# ------------------------------
# Select Academic Year
# ------------------------------

year = wait.until(
    EC.presence_of_element_located((By.ID, "year"))
)

Select(year).select_by_visible_text("2025-2026")

# ------------------------------
# Select Maharashtra
# ------------------------------

state = wait.until(
    EC.presence_of_element_located((By.ID, "state"))
)

Select(state).select_by_visible_text("Maharashtra")

time.sleep(2)

# ------------------------------
# Click Submit
# ------------------------------

submit = wait.until(
    EC.element_to_be_clickable((By.ID, "load"))
)

driver.execute_script("arguments[0].click();", submit)

# ------------------------------
# Wait for Table
# ------------------------------

# Change Show entries from 10 to 50

show_entries = wait.until(
    EC.presence_of_element_located((By.NAME, "jsontable_length"))
)

Select(show_entries).select_by_visible_text("50")

time.sleep(5)

rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")

print(f"\nTotal Rows Found : {len(rows)}\n")

college_data = []

for index, row in enumerate(rows, start=1):

    cols = row.find_elements(By.TAG_NAME, "td")

    if len(cols) < 6:
        continue

    college = cols[1].text.strip()
    address = cols[2].text.strip()
    district = cols[3].text.strip()
    college_type = cols[4].text.strip()

    print("=" * 70)
    print(index)
    print("College :", college)
    print("Address :", address)
    print("District:", district)
    print("Type    :", college_type)

    college_data.append({
        "College Name": college,
        "Address": address,
        "District": district,
        "Type": college_type
    })

# ------------------------------
# Save CSV
# ------------------------------

df = pd.DataFrame(college_data)

df.to_csv(
    "maharashtra_page1.csv",
    index=False,
    encoding="utf-8-sig"
)

print("\n✅ CSV Saved Successfully!")
print(f"Total Colleges Saved : {len(df)}")

print("\nTrying to click Next page...")

next_button = driver.find_element(By.LINK_TEXT, "Next")

driver.execute_script("arguments[0].click();", next_button)

print("✅ Clicked Next Page!")

input("\nPress Enter to Close...")

driver.quit()