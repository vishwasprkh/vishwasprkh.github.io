from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

application = Flask(__name__)
CORS(application)

APIKEY = "QakEu5yV6q22F0Wk860PPqnz10xkASUe"
URL = "https://api.tomorrow.io/v4/timelines"
FIELDS = {
    "day": [
        "temperatureMin",
        "temperatureMax",
        "windSpeed",
        "windDirection",
        "humidity",
        "weatherCode",
        "precipitationProbability",
        "precipitationType",
        "sunriseTime",
        "sunsetTime",
        "temperature",
        "pressureSeaLevel",
        "uvIndex",
        "visibility",
        "cloudCover"
    ],
    "hour": [
        "temperature",
        "windSpeed",
        "windDirection",
        "humidity",
        "pressureSeaLevel"
    ]
}

@application.route('/get_json', methods=["GET"])
def getDetails():
    longitude = request.args.get("longitude")
    latitude = request.args.get("latitude")
    requestType = request.args.get("type")

    reqeustSpecificFields = FIELDS.get(requestType)

    params = {
        "location": f"{latitude},{longitude}",
        "apikey": APIKEY,
        "fields": reqeustSpecificFields,
        "timezone": "America/Los_Angeles",
        "units": "imperial",
        "startTime": "now",
        "endTime": "nowPlus5d" 
    }

    if requestType=="day":
        params["timesteps"]="1d"
    else:
        params["timesteps"]="1h"

    response = requests.get(URL, params)

    print(response)

    if response.status_code==200:
        return jsonify(response.json())
    else:
        return jsonify({"Error": "No records have been found."}) , response.status_code

if __name__ == "__main__":
    application.run(debug=True)

