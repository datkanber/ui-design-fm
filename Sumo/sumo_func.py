import traci
import datetime
import MySQLdb
import os
import sys
import time
import random

def sumo():
    # SUMO Configuration - Fix the path
    # The correct path appears to be in the Sumo directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    SUMOCFG_PATH = os.path.join(script_dir, 'ESOGU_SUMO', 'dennn.sumocfg')
    print(f"SUMO Config Path: {SUMOCFG_PATH}")
    print(f"Current working directory: {os.getcwd()}")  
    try:
        # Check if the file exists
        if not os.path.exists(SUMOCFG_PATH):
            print(f"Error: SUMO config file not found at {SUMOCFG_PATH}")
            print("Current working directory:", os.getcwd())
            print("Searching for .sumocfg files...")
            
            # Search for any .sumocfg files in the current directory and subdirectories
            sumocfg_files = []
            for root, dirs, files in os.walk(script_dir):
                for file in files:
                    if file.endswith('.sumocfg'):
                        sumocfg_files.append(os.path.join(root, file))
            
            if sumocfg_files:
                print("Found these .sumocfg files:")
                for cfg_file in sumocfg_files:
                    print(f" - {cfg_file}")
                
                # Use the first found file
                SUMOCFG_PATH = sumocfg_files[0]
                print(f"Using {SUMOCFG_PATH} instead")
            else:
                print("No .sumocfg files found.")
                return
        
        creation_time = os.path.getctime(SUMOCFG_PATH)
        creation_datetime = datetime.datetime.fromtimestamp(creation_time)
        today_date = creation_datetime.date()
        curr_datetime = datetime.datetime(year=today_date.year, month=today_date.month, day=today_date.day, hour=12, minute=0, second=0)
        
        print(f"Starting SUMO simulation with config: {SUMOCFG_PATH}")
        
        # Database Connection
        db_connection = MySQLdb.connect(host="127.0.0.1", user="root", password="123456", database="fleetmanagementdb")
        cursor = db_connection.cursor()
        
        # Start SUMO Simulation with GUI
        traci.start(["sumo-gui", "--start", "--quit-on-end", "--no-step-log", "--delay", "1000", "--step-length", "1", "-c", SUMOCFG_PATH])
        print("SUMO started successfully")
        
        # Main simulation loop
        while traci.simulation.getMinExpectedNumber() > 0:
            traci.simulationStep()
            current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            vehicle_ids = traci.vehicle.getIDList()
            
            for vehicle_id in vehicle_ids:
                try:
                    position = traci.vehicle.getPosition(vehicle_id)
                    speed = traci.vehicle.getSpeed(vehicle_id)
                    lon, lat = traci.simulation.convertGeo(position[0], position[1])
                    
                    # Get battery information - handle case where vehicle might not have battery
                    try:
                        max_battery = float(traci.vehicle.getParameter(vehicle_id, "device.battery.maximumBatteryCapacity"))
                        current_battery = float(traci.vehicle.getParameter(vehicle_id, "device.battery.actualBatteryCapacity"))
                        state_of_charge = (current_battery / max_battery) * 100 if max_battery > 0 else 80.0  # Default if no battery
                    except:
                        state_of_charge = 80.0  # Default value if battery info not available
                    
                    # Insert vehicle data into database
                    cursor.execute("""
                        INSERT INTO vehicle_tracking (
                            vehicle_id, latitude, longitude, speed, state_of_charge, last_updated
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE 
                            latitude = VALUES(latitude),
                            longitude = VALUES(longitude),
                            speed = VALUES(speed),
                            state_of_charge = VALUES(state_of_charge),
                            last_updated = VALUES(last_updated)
                    """, (vehicle_id, lat, lon, speed, state_of_charge, current_time))
                    db_connection.commit()

                    
                    
                    if traci.simulation.getCurrentTime() % 5000 == 0:  # Log every 5 seconds of simulation time
                        print(f"Vehiclee {vehicle_id}: Position=({lat}, {lon}), Speed={speed}, Battery={state_of_charge}%")
                        
                except Exception as e:
                    print(f"Error updating vehicle {vehicle_id}: {e}")
    
    except Exception as e:
        print(f"SUMO Simulation Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        try:
            if 'traci' in locals() and hasattr(traci, 'close'):
                traci.close()
            if 'cursor' in locals():
                cursor.close()
            if 'db_connection' in locals():
                db_connection.close()
            print("SUMO simulation ended. Resources cleaned up.")
        except Exception as cleanup_error:
            print(f"Error during cleanup: {cleanup_error}")

# Allow direct execution
if __name__ == "__main__":
    print("Starting SUMO directly from sumo_func.py")
    sumo()
