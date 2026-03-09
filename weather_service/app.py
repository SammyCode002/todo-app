"""
Weather Service Microservice
Returns current weather data for a given city using OpenWeatherMap API.
Runs on port 5001.
"""

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

API_KEY = "3ae3cb556a04364cb35aa98f36887ef0"
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


@app.get("/weather")
def get_weather():
    """Get current weather for a city."""
    city = request.args.get("city")

    if not city:
        return jsonify({
            "error_code": "MISSING_CITY",
            "message": "city parameter is required"
        }), 400

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "imperial"
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=5)

        if response.status_code == 404:
            return jsonify({
                "error_code": "CITY_NOT_FOUND",
                "message": f"City '{city}' not found"
            }), 404

        if response.status_code != 200:
            return jsonify({
                "error_code": "API_ERROR",
                "message": "Failed to fetch weather data"
            }), 502

        data = response.json()

        weather_data = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "conditions": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"]
        }

        return jsonify(weather_data), 200

    except requests.exceptions.Timeout:
        return jsonify({
            "error_code": "TIMEOUT",
            "message": "Weather API request timed out"
        }), 504


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)
