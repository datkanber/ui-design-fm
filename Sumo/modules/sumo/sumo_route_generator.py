import time
import json
import xml.etree.ElementTree as ET
import traci
import sumolib
import argparse
import sumo_func as sf



class SumoRouteGenerator:
    """
    A class to generate SUMO routes from geographical route data.

    Attributes:
        net (sumolib.net.Net): The SUMO network object.
        sumo_cfg_file (str): The path to the SUMO configuration file.

    Methods:
        __init__(net_file, sumo_cfg_file):
            Initializes the SumoRouteGenerator with the given network file and SUMO configuration file.
        
        start_sumo(label="sim"):
            Starts the SUMO simulation with the given label.
        
        convert_geo_to_sumo(route_data):
            Converts geographical route data to SUMO coordinates.
        
        get_nearest_edges(points):
            Finds the nearest edges in the SUMO network for the given points.
        
        get_sumo_edges(route_data):
            Converts geographical route data to SUMO coordinates and finds the nearest edges.
        
        generate_sumo_routes(route_data, edges_list, output_xml):
            Generates a SUMO routes XML file from the given route data and edges list.
        
        create_routes(route_data, output_xml):
            Creates SUMO routes from the given route data and writes them to an XML file.
    """
    def __init__(self, net_file, sumo_cfg_file):
        self.net = sumolib.net.readNet(net_file)
        self.sumo_cfg_file = sumo_cfg_file

    def start_sumo(self, label="sim"):
        sumo_cmd = ["sumo", "-c", self.sumo_cfg_file, "--start", "--quit-on-end"]
        traci.start(sumo_cmd, label=label)

    def convert_geo_to_sumo(self, route_data):
        self.start_sumo(label="geo_conversion")
        converted_points = []
        start = route_data["start_point"]
        converted_points.append(start["location"])
        for wp in start.get("waypoints", []):
            converted_points.append(wp["location"])

        for delivery in route_data["delivery_points"]:
            converted_points.append(delivery["location"])
            for wp in delivery.get("waypoints", []):
                converted_points.append(wp["location"])

        converted_points.append(route_data["end_point"]["location"])

        converted_sumo_points = []
        for loc in converted_points:
            if "longitude" in loc and "latitude" in loc:
                lon, lat = loc["longitude"], loc["latitude"]
                x, y = traci.simulation.convertGeo(lon, lat, True)
                converted_sumo_points.append({"x": x, "y": y})
            else:
                print(f"Eksik koordinat bilgisi atlandı: {loc}")

        traci.close()
        return converted_sumo_points

    def get_nearest_edges(self, points):
        self.start_sumo(label="edge_detection")
        chosen_edges = []
        last_edge = None

        for point in points:
            radius = 0.1
            selected_edge = None
            while radius <= 10.0:
                neighboring_edges = self.net.getNeighboringEdges(
                    point["x"], point["y"], radius
                )
                found_edges = [edge[0].getID() for edge in neighboring_edges]
                if found_edges:
                    selected_edge = found_edges[0]
                    break
                radius += 0.5

            if selected_edge and selected_edge != last_edge:
                chosen_edges.append(selected_edge)
                last_edge = selected_edge

        traci.close()
        return chosen_edges

    def get_sumo_edges(self, route_data):
        converted_points = self.convert_geo_to_sumo(route_data)
        edges = self.get_nearest_edges(converted_points)
        return edges

    def generate_sumo_routes(self, route_data, edges_list, output_xml):
        root = ET.Element(
            "routes",
            {
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:noNamespaceSchemaLocation": "http://sumo.dlr.de/xsd/routes_file.xsd",
            },
        )

        vtype = ET.SubElement(
            root,
            "vType",
            {
                "id": "evehicle",
                "length": "2.88",
                "minGap": "2.50",
                "maxSpeed": "12.5",
                "vClass": "evehicle",
                "emissionClass": "Energy/default",
                "accel": "1.0",
                "decel": "1.0",
                "sigma": "0.0",
            },
        )

        vtype_params = {
            "airDragCoefficient": "0.48",
            "constantPowerIntake": "100",
            "device.battery.capacity": "3000",
            "device.battery.chargeLevel": "3000",
            "device.battery.stoppingThreshold": "0.1",
            "engine.efficiency": "0.8",
            "frontSurfaceArea": "2.55",
            "engine.power.max": "1000",
            "has.battery.device": "true",
            "mass": "700",
            "propulsionEfficiency": "0.9",
            "radialDragCoefficient": "0.5",
            "recuperationEfficiency": "0.9",
            "rollDragCoefficient": "0.01",
            "rotatingMass": "0.01",
        }
        for key, value in vtype_params.items():
            ET.SubElement(vtype, "param", {"key": key, "value": value})

        for i, route in enumerate(route_data["routes"]):
            vehicle = ET.SubElement(
                root,
                "vehicle",
                {"id": f"musoshi00{i + 5}", "type": "evehicle", "depart": "0", "color": "red"},
            )
            ET.SubElement(
                vehicle, "param", {"key": "device.battery.chargeLevel", "value": "3000"}
            )
            edges_str = " ".join(edges_list[i])
            ET.SubElement(vehicle, "route", {"edges": edges_str})

            stops = (
                [route["start_point"]]
                + route.get("delivery_points", [])
                + [route["end_point"]]
            )
            for stop in stops:
                stop_type = (
                    "chargingStation"
                    if stop["id"].startswith("cs")
                    else "containerStop"
                )
                ET.SubElement(
                    vehicle,
                    "stop",
                    {
                        stop_type: stop["id"],
                        "duration": "120" if stop_type == "containerStop" else "0",
                    },
                )

        tree = ET.ElementTree(root)
        tree.write(output_xml, encoding="utf-8", xml_declaration=True)
        print(f"XML dosyası '{output_xml}' olarak oluşturuldu.")


    def create_routes(self, route_data, output_xml):
        try:
            edges_list = []
            for route in route_data["routes"]:
                edges = self.get_sumo_edges(route)
                print("Seçilen SUMO Yolları:", edges)
                edges_list.append(edges)

            self.generate_sumo_routes(route_data, edges_list, output_xml)
            sf.sumo()
        except Exception as e:
            print(f"Hata oluştu: {e}")
            traci.close()


# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="SUMO rota dosyası oluşturucu")
#     parser.add_argument(
#         "--input_json",
#         default="R05_ute4Vehicle.json",
#         help="Input JSON dosyasının yolu",
#     )
#     args = parser.parse_args()

#     with open(args.input_json, "r") as f:
#         route_data = json.load(f)

#     NET_FILE = "osm.net.xml"
#     SUMO_CFG_FILE = "dennn.sumocfg"
#     OUTPUT_XML = "R05_Route4Vehicle.rou.xml"

#     generator = SumoRouteGenerator(NET_FILE, SUMO_CFG_FILE)
#     generator.create_routes(route_data, OUTPUT_XML)
