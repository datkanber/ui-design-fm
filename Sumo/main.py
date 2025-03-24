import solver_and_printer as sp
import route_to_sumo as rts
import database_create_routes as dcr
import sumo_func as sf

import mariadb
import traci  # SUMO for simulation control

from flask import Flask, request, jsonify  # Added jsonify import
from flask_cors import CORS  # For handling CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all endpoints


@app.route('/api/vehicles/locations', methods=['GET'])
def get_vehicle_locations():
    try:
        # Connect to the database
        db_connection = mariadb.connect(
            host="127.0.0.1",
            user="root",
            password="123456",
            database="fleetmanagementdb"
        )
        cursor = db_connection.cursor(dictionary=True)

        # Query latest vehicle data
        cursor.execute("SELECT vehicle_id, latitude, longitude, speed, state_of_charge FROM vehicle_tracking")
        vehicles = cursor.fetchall()
        
        cursor.close()
        db_connection.close()
        return jsonify(vehicles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/router', methods=['GET', 'POST'])
def calculate_route():
    """
    Solves routes based on database data.
    """
    try:
        return sp.solve()  # Call solve function and return the result
    except Exception as e:
        return {"error": f"Route calculation error: {str(e)}"}, 500


@app.route('/writeroutedetails', methods=['GET', 'POST'])
def route_to_sumo_all():
    """
    Generates SUMO routes for all algorithms.
    """
    try:
        for i in range(0, 3):  # Loop for 3 algorithms
            rts.route_to_sumo(algorithm=str(i))
        return "SUMO Files Created Successfully.", 200
    except Exception as e:
        return {"error": f"Error creating SUMO routes: {str(e)}"}, 500


@app.route('/writeroutedetails/<algorithm>', methods=['GET', 'POST'])
def route_to_sumo(algorithm):
    """
    Generates SUMO routes for a specific algorithm.
    """
    try:
        rts.route_to_sumo(algorithm=algorithm)
        dcr.create_routes_in_db()
        return f"Route created for algorithm {algorithm} in SUMO and database.", 200
    except Exception as e:
        return {"error": f"Error creating route for algorithm {algorithm}: {str(e)}"}, 500


@app.route('/sumo', methods=['GET', 'POST'])
def run_sumo():
    """
    Runs the SUMO simulation.
    """
    try:
        sf.sumo()  # Call the sumo function from sumo_func
        return "SUMO simulation running...", 200
    except Exception as e:
        return {"error": f"SUMO simulation error: {str(e)}"}, 500


if __name__ == '__main__':
    app.run(debug=True, port=8000)  # Run Flask app on port 8000


