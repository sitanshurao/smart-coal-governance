# ai_engine/src/train_risk_model.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

print("Generating historical training data...")

# 1. Create Mock Historical Data (In reality, you'd load a CSV of past violations)
data = {
    'hazard_category': ['Electrical', 'Slope Stability', 'Ventilation', 'Fire', 'Machinery', 'Electrical', 'Slope Stability', 'Ventilation'],
    'location_zone': ['Pit A', 'Bench 3', 'Underground Shaft 1', 'Coal Seam 2', 'Workshop', 'Workshop', 'Bench 2', 'Underground Shaft 2'],
    'days_since_last_check': [15, 45, 10, 60, 5, 30, 50, 8],
    # Target variable we want to predict:
    'severity': ['Medium', 'Critical', 'Low', 'Critical', 'Low', 'High', 'Critical', 'Low'] 
}

df = pd.DataFrame(data)

# 2. Preprocess the data (Convert text into numbers for the ML model)
le_hazard = LabelEncoder()
le_zone = LabelEncoder()

df['hazard_encoded'] = le_hazard.fit_transform(df['hazard_category'])
df['zone_encoded'] = le_zone.fit_transform(df['location_zone'])

# Define our features (X) and target (y)
X = df[['hazard_encoded', 'zone_encoded', 'days_since_last_check']]
y = df['severity']

# 3. Train the Random Forest Model
print("Training Random Forest Classifier...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)

# 4. Save the Model and Encoders for the Backend to use later
os.makedirs('../saved_models', exist_ok=True)
joblib.dump(clf, '../saved_models/risk_model.pkl')
joblib.dump(le_hazard, '../saved_models/le_hazard.pkl')
joblib.dump(le_zone, '../saved_models/le_zone.pkl')

print("Model training complete! Saved to 'saved_models/' directory.")