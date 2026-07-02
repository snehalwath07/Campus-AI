from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

import pandas as pd
import time

# -----------------------------
# Launch Browser
# -----------------------------

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.maximize_window()

wait = WebDriverWait(driver, 30)

# -----------------------------
# Open Website
# -----------------------------

driver.get("https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php#!/approved")

# -----------------------------
# Select Year
# -----------------------------

year = wait.until(
    EC.presence_of_element_located((By.ID, "year"))
)

Select(year).select_by_visible_text("2025-2026")

# -----------------------------
# Select State
# -----------------------------

state = wait.until(
    EC.presence_of_element_located((By.ID, "state"))
)

Select(state).select_by_visible_text("Maharashtra")

time.sleep(2)

# -----------------------------
# Click Submit
# -----------------------------

submit = wait.until(
    EC.element_to_be_clickable((By.ID, "load"))
)

driver.execute_script("arguments[0].click();", submit)

time.sleep(5)

# -----------------------------
# Show 50 Entries
# -----------------------------

show_dropdown = wait.until(
    EC.presence_of_element_located((By.NAME, "jsontable_length"))
)

Select(show_dropdown).select_by_visible_text("50")

time.sleep(5)

# -----------------------------
# Start Scraping
# -----------------------------

college_data = []

page = 1

while True:

    print(f"\n{'='*70}")
    print(f"PAGE {page}")
    print(f"{'='*70}")

    rows = wait.until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "#jsontable tbody tr")
        )
    )

    print(f"Rows Found : {len(rows)}")

    for row in rows:

        cols = row.find_elements(By.TAG_NAME, "td")

        if len(cols) < 6:
            continue

        college = cols[1].text.strip()
        address = cols[2].text.strip()
        district = cols[3].text.strip()
        college_type = cols[4].text.strip()

        print(college)

        college_data.append({
            "College Name": college,
            "Address": address,
            "District": district,
            "Type": college_type
        })

    print(f"Total Saved : {len(college_data)}")

    try:

        next_button = driver.find_element(By.LINK_TEXT, "Next")

        classes = next_button.get_attribute("class")

        if classes and "disabled" in classes.lower():
            print("\nReached Last Page.")
            break

        driver.execute_script("arguments[0].click();", next_button)

        page += 1

        time.sleep(5)

    except Exception as e:
        print("\nNo Next Button Found.")
        print(e)
        break

# -----------------------------
# Save CSV
# -----------------------------

df = pd.DataFrame(college_data)

df.to_csv(
    "maharashtra_all_colleges.csv",
    index=False,
    encoding="utf-8-sig"
)

print("\n================================")
print("SCRAPING COMPLETED")
print("================================")
print("Total Colleges :", len(df))

input("\nPress Enter to Close...")

driver.quit()