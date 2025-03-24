import pandas as pd
import xml.etree.ElementTree as ET
import filepath_constants

def route_to_sumo(algorithm):
    routes_df = pd.read_csv(filepath_constants.PATHS_FILE, sep=';')
    rou_xml = ET.parse(filepath_constants.SUMO_ROU_FILE)
    rou_xml_root = rou_xml.getroot()

    # Delete all vehicles currently on the rou.xml
    for child in reversed(rou_xml_root):
        if child.tag == 'vehicle':
            rou_xml_root.remove(child)


    vehicle_id = 0
    # Read calculated routes xml
    if algorithm == "0":
        calculated_routes_xml = ET.parse(filepath_constants.CALCULATED_ROUTE_FILE_OR)
    elif algorithm == "1":
        calculated_routes_xml = ET.parse(filepath_constants.CALCULATED_ROUTE_FILE_SA)
    elif algorithm == "2":
        calculated_routes_xml = ET.parse(filepath_constants.CALCULATED_ROUTE_FILE_TS)
    routes_root = calculated_routes_xml.getroot()
    # For every calculated route in the xml file
    for route_element in routes_root:
        if not route_element.tag == 'Route':
            continue
        current_route_stop_ids = []
        #Get all stop ids on the calculated route
        for point_element in route_element:
            current_route_stop_ids.append(point_element.attrib['id'])
        # Find the sumo routes between all points step by step
        current_route_sumo_edges = (routes_df[(routes_df['startStop'] == current_route_stop_ids[0]) & (routes_df['endStop'] == current_route_stop_ids[1])]['edgeList'].values[0])
        for i in range(1,len(current_route_stop_ids)-1):
            current_route_sumo_edges += ' ' + ' '.join((routes_df[(routes_df['startStop'] == current_route_stop_ids[i]) & (routes_df['endStop'] == current_route_stop_ids[i+ 1])]['edgeList'].values[0]).split(' ')[1:])

        # Start generating vehicle with start and stop positions
        routeBeginPos = routes_df[(routes_df['startStop'] == current_route_stop_ids[0])]['routeBeginPos'].values[0]
        routeEndPos = routes_df[(routes_df['startStop'] == current_route_stop_ids[-1])]['routeEndPos'].values[0]
        # Set the attributes for the vehicle in xml file
        current_vehicle_root = ET.SubElement(rou_xml_root,"vehicle",
                                attrib={"id":"veh_"+str(vehicle_id),"type":"evehicle","depart":"0","color":"yellow","departPos":str(routeBeginPos),"arrivalPos":str(routeEndPos)})
        # Set battery capacity
        ET.SubElement(current_vehicle_root,"param",
                    attrib={"key":"actualBatteryCapacity","value":"9000"})
        # Set the calculated sumo edges from before
        ET.SubElement(current_vehicle_root,"route",
                    attrib={"edges":current_route_sumo_edges})
        
        product_names = []
        products_weights = []
        order_ids = []
        point_ids = []
        # Add stops and wait time for every stop, check if its a charging station or not
        for point_element in route_element:
            try:
               order_ids.append(point_element.attrib['requestId'])
            except:
                order_ids.append('-1')
            if point_element.attrib['id'] == current_route_stop_ids[0] or point_element.attrib['id'] == current_route_stop_ids[-1]: # For the first stop, which is warehouse don't add duration
                product_names.append('cs')
                products_weights.append('0')
                point_ids.append('cs5')
                ET.SubElement(current_vehicle_root,"stop",
                                attrib={"chargingStation":point_element.attrib['id'],"duration":"0"})
            else:
                if point_element.attrib['id'].startswith('cs'):
                    product_names.append('cs')
                    products_weights.append('0')
                    point_ids.append(point_element.attrib['id'])
                    ET.SubElement(current_vehicle_root,"stop",
                                    attrib={"chargingStation":point_element.attrib['id'],"duration":"300"})
                else:
                    product_names.append('dp')
                    products_weights.append(point_element.attrib['DeliveryWeight'])
                    point_ids.append(point_element.attrib['id'])
                    ET.SubElement(current_vehicle_root,"stop",
                                    attrib={"containerStop":point_element.attrib['id'],"duration":"120"})
        

        ET.SubElement(current_vehicle_root,"param",
              attrib={"key":"PointIDs","value":' '.join(point_ids)})
        ET.SubElement(current_vehicle_root,"param",
              attrib={"key":"PointType","value":' '.join(product_names)})
        ET.SubElement(current_vehicle_root,"param",
              attrib={"key":"Demands","value":' '.join(products_weights)})
        ET.SubElement(current_vehicle_root,"param",
              attrib={"key":"OrderIDs","value":' '.join(order_ids)})
        # Increment the vehicle ID for next iteration
        vehicle_id += 1

    xmlf = ET.ElementTree(rou_xml_root)
    xmlf.write(filepath_constants.SUMO_ROU_FILE, encoding="utf-8", xml_declaration=True)
    if algorithm == "0":
        xmlf.write(filepath_constants.SUMO_ROU_FILE_OR, encoding="utf-8", xml_declaration=True)
    elif algorithm == "1":
        xmlf.write(filepath_constants.SUMO_ROU_FILE_SA, encoding="utf-8", xml_declaration=True)
    elif algorithm == "2":
        xmlf.write(filepath_constants.SUMO_ROU_FILE_TS, encoding="utf-8", xml_declaration=True)