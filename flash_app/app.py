from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Burada
import joblib
import shap
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # ✅ Burada


# Model ve özellik listesi yükleniyor
model = joblib.load("best_model.pkl")
with open("features.json") as f:
    feature_names = json.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    try:
        # Feature'ları sırayla al ve numpy array'e çevir
        features = [data[feature] for feature in feature_names]
        input_array = np.array(features).reshape(1, -1)

        # Tahmin ve SHAP değerlerini hesapla
        prediction = model.predict(input_array)[0]
        
        # SHAP değerlerini hesapla
        explainer = shap.Explainer(model)
        shap_values = explainer(input_array)
        shap_contribs = shap_values.values[0]  # İlk veri için SHAP katkıları

        # Sonuçları döndür
        response = {
            "prediction": prediction,
            "shap_values": shap_contribs.tolist()  # SHAP katkılarını liste olarak döndür
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5002, debug=True)
