from ortools_func import *
from functools import partial
import xml.etree.ElementTree as ET
import filepath_constants as fpc
import json
import xmltodict


def print_solution(data, manager, routing, assignment):
    print(f'Objective: {assignment.ObjectiveValue()}')
    total_distance = 0
    total_load = 0
    total_time = 0
    total_battery = 0
    capacity_dimension = routing.GetDimensionOrDie('Capacity')
    time_dimension = routing.GetDimensionOrDie('Time')
    battery_dimension = routing.GetDimensionOrDie('Battery')
    dropped = []
    for order in range(1, routing.nodes()):
        index = manager.NodeToIndex(order)
        if assignment.Value(routing.NextVar(index)) == index:
            dropped.append(order)
    print(f'Dropped orders: {dropped}')
    for reload in range(data['num_locations'] - 5, data['num_locations']):
        index = manager.NodeToIndex(reload)
        if assignment.Value(routing.NextVar(index)) == index:
            dropped.append(reload)
    print(f'Dropped reload stations: {dropped}')

    full_output_xml = '<Routes>\n'
    for vehicle_id in range(data['num_vehicles']):
        output_xml = '  <Route>\n'
        is_valid_route = False
        index = routing.Start(vehicle_id)
        plan_output = f'Route for vehicle {vehicle_id}:\n'
        distance = 0
        while not routing.IsEnd(index):
            has_delivery_point = False
            point_index = manager.IndexToNode(index)
            load_var = capacity_dimension.CumulVar(index)
            time_var = time_dimension.CumulVar(index)
            battery_var=battery_dimension.CumulVar(index)
            plan_output += (
                f' {manager.IndexToNode(index)} '
                f'Load({assignment.Value(load_var)}) '
                f'Time({assignment.Min(time_var)},{assignment.Max(time_var)}) '
                f'Battery({assignment.Value(battery_var)}) ->'
            )
            if point_index == 0:
                point_type = 'Depot'
            elif 'cs' in data['location_ids'][point_index]:
                point_type = 'Charging' 
            else:
                is_valid_route = True
                has_delivery_point = True
                point_type = 'Delivery'

            vehicle_current_capacity = data['vehicle_capacity'] - assignment.Value(load_var)
            load_cap = str(vehicle_current_capacity) + '/' + str(data['vehicle_capacity'])
            if has_delivery_point:
                point = ET.Element('Point', id=str(data['location_ids'][point_index][0]), PointType=point_type, Latitude= str(data['locations'][point_index][1]/83_645),Longitude=str(data['locations'][point_index][0]/111_319),EVtotalcapacity = load_cap, DeliveryWeight = str(data['demands'][point_index]), requestId = str(data['location_ids'][point_index][1]))
            else :
                point = ET.Element('Point', id=str(data['location_ids'][point_index]), PointType=point_type,Latitude= str(data['locations'][point_index][1]/83_645),Longitude=str(data['locations'][point_index][0]/111_319), EVtotalcapacity = load_cap, DeliveryWeight = str(data['demands'][point_index]))
            output_xml += '    ' + ET.tostring(point, encoding='unicode') + '\n'
            previous_index = index
            index = assignment.Value(routing.NextVar(index))
            distance += routing.GetArcCostForVehicle(previous_index, index,
                                                     vehicle_id)

        load_var = capacity_dimension.CumulVar(index)
        time_var = time_dimension.CumulVar(index)
        battery_var=battery_dimension.CumulVar(index)
        point_index = manager.IndexToNode(index)
        if point_index == 0:
            point_type = 'Depot'
        elif 'cs' in data['location_ids'][point_index]:
            point_type = 'Charging' 
        else:
            point_type = 'Delivery'
        vehicle_current_capacity = data['vehicle_capacity'] - assignment.Value(load_var)
        load_cap = str(vehicle_current_capacity) + '/' + str(data['vehicle_capacity'])
        point = ET.Element('Point', id=str(data['location_ids'][point_index]), PointType=point_type, Latitude= str(data['locations'][point_index][1]/83_645),Longitude=str(data['locations'][point_index][0]/111_319), EVtotalcapacity = load_cap, DeliveryWeight = str(data['demands'][point_index]))
        output_xml += '    ' + ET.tostring(point, encoding='unicode') + '\n'
        output_xml += '  </Route>\n'
        if is_valid_route:
            full_output_xml += output_xml
        plan_output += (
        f' {manager.IndexToNode(index)} '
        f'Load({assignment.Value(load_var)}) '
        f'Time({assignment.Min(time_var)},{assignment.Max(time_var)}) '
        f'Battery({assignment.Value(battery_var)})\n')
        plan_output += f'Distance of the route: {distance}m\n'
        plan_output += f'Load of the route: {assignment.Value(load_var)}\n'
        plan_output += f'Time of the route: {assignment.Value(time_var)}min\n'
        plan_output += f'Battery of route: {assignment.Value(battery_var)}\n'
        print(plan_output)
        total_distance += distance
        total_load += assignment.Value(load_var)
        total_time += assignment.Value(time_var)
        total_battery += assignment.Value(battery_var)
    full_output_xml += '<Cost>\n'
    full_output_xml += f'    <TotalDistance>{total_distance}</TotalDistance>\n'
    full_output_xml += f'    <TotalTime>{total_time}</TotalTime>\n'
    full_output_xml += f'    <TotalEnergy>{total_battery}</TotalEnergy>\n'
    full_output_xml += '</Cost>\n'
    full_output_xml += '<Algorithm>\n'
    full_output_xml += f'    <Algorithm>OR-Tools</Algorithm>\n'
    full_output_xml += '</Algorithm>\n'
    full_output_xml += '</Routes>'
    
    with open(fpc.CALCULATED_ROUTE_FILE_OR, 'w') as file:
        file.write(full_output_xml)
 
    print(f'Total Distance of all routes: {total_distance}m')
    print(f'Total Load of all routes: {total_load}')
    print(f'Total Time of all routes: {total_time}min')
    print(f'Total Battery of all routes: {total_battery}')

    # converting json to return it from api
    json_data = json.dumps(xmltodict.parse(full_output_xml))
    return json_data

def solve():
    data = create_data_model()

    # Create the routing index manager
    manager = pywrapcp.RoutingIndexManager(data['num_locations'],
                                           data['num_vehicles'], data['depot'])

    # Create Routing Model
    routing = pywrapcp.RoutingModel(manager)

    # Define weight of each edge
    distance_evaluator_index = routing.RegisterTransitCallback(
        partial(create_distance_evaluator(data), manager))
    routing.SetArcCostEvaluatorOfAllVehicles(distance_evaluator_index)

    # Add Distance constraint to minimize the longuest route
    add_distance_dimension(routing, manager, data, distance_evaluator_index)

    # Add Capacity constraint
    demand_evaluator_index = routing.RegisterUnaryTransitCallback(
        partial(create_demand_evaluator(data), manager))
    add_capacity_constraints(routing, manager, data, demand_evaluator_index)

    # Add Time Window constraint
    time_evaluator_index = routing.RegisterTransitCallback(
        partial(create_time_evaluator(data), manager))
    add_time_window_constraints(routing, manager, data, time_evaluator_index)
    
    # Add Battery constraint.
    battery_evaluator_index = routing.RegisterUnaryTransitCallback(
        partial(create_battery_evaluator(data),manager))
    add_battery_constraints(routing, manager, data, battery_evaluator_index)

    # Setting first solution heuristic (cheapest addition).
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)  # pylint: disable=no-member
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.TABU_SEARCH)
    search_parameters.time_limit.FromSeconds(3)

    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)
    if solution:
        return print_solution(data, manager, routing, solution)
    else: 
        print("No solution found.")
        return 