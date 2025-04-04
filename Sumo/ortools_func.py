from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2
import MySQLdb
import datetime
from utils import distanceBetweenTwoPoints

def create_data_model():
    try:
        db_connection = MySQLdb.connect(host = "127.0.0.1", user="root", password = "123456", database = "fleetmanagementdb")
    except:
        print("Can't connect to database")
        return 0
    
    cursor = db_connection.cursor()

    order_query ="""SELECT m.teslimat_adresi, s.ürün_sayısı, s.teslim_aralık_baş, s.teslim_aralık_son,
                n.enlem AS nokta_enlem, n.boylam AS nokta_boylam, u.ağırlık AS ürün_ağırlık, s.sipariş_id
                FROM sipariş s
                JOIN müşteri m ON s.müşteri_id = m.kullanıcı_id
                JOIN nokta n ON n.nokta_id = m.teslimat_adresi
                JOIN ürün u ON u.ürün_id = s.ürün_id
                WHERE s.durum = 0;"""
    cursor.execute(order_query)

    orders = cursor.fetchall()  
     
    """Stores the data for the problem"""
    data = {}
    _capacity = 200
    _battery_capacity = 9000

    #depot
    data['location_ids'] = ["cs5"]
    _locations = [(30.483409077029524, 39.752172063632734)]
    data['demands'] = [0] 
    data['time_windows'] = [(0,0)]
    data['batteries'] = [0]
    job_start = datetime.datetime.strptime('8:00:00', '%H:%M:%S').time()

    i = 1
    for order in orders:
        deliver_adress = order[0]
        product_quantity = order[1]
        time_window_start = order[2]
        time_window_end = order[3]
        latitude = order[4]
        longitude = order[5]
        product_weight = order[6]
        order_id = order[7]
        # add order's point to the location_ids
        data["location_ids"].append((str(deliver_adress), str(order_id)))
        # get point and added location to its latitude and longitude
        location = (float(latitude), float(longitude))
        _locations.append(location)
        # get product and set demands  
        total_demand_weight = product_weight * product_quantity
        data['demands'].append(int(total_demand_weight))
        # get time windows 
        time_window_start = datetime.datetime.strptime(str(time_window_start), '%H:%M:%S').time()
        time_window_start_min = datetime.datetime.combine(datetime.datetime.today(), time_window_start) - datetime.datetime.combine(datetime.datetime.today(), job_start)
        time_window_start_min = time_window_start_min.total_seconds() / 60
        time_window_end = datetime.datetime.strptime(str(time_window_end), '%H:%M:%S').time()
        time_window_end_min = datetime.datetime.combine(datetime.datetime.today(), time_window_end) - datetime.datetime.combine(datetime.datetime.today(), job_start)
        time_window_end_min = time_window_end_min.total_seconds() / 60
        time_window = (int(time_window_start_min), int(time_window_end_min))
        data['time_windows'].append(time_window)
        # battery constraint 
        dist = distanceBetweenTwoPoints(_locations[0][0], _locations[0][1], _locations[i][0], _locations[i][1])
        dist = int(dist / 1.5)
        data['batteries'].append(dist)
        i += 1

    

    data["location_ids"].extend(['cs1', 'cs2', 'cs3', 'cs4', 'cs6','cs7','cs8','cs9','cs10'])
    _locations.extend([(30.469245785506907 ,39.74409378336547), (30.477104070347714 ,39.74834946657972), (30.47476004031919, 39.74658904001786), (30.484520671769562, 39.75392997022956), (30.487696983750773 ,39.75121428626431), (30.489341531024138,39.752912728054795), (30.492754516229088,39.75085019506137), (30.474639057663563,39.75022898754287),(30.482464469369756,39.74961633910531)])
    data['demands'].extend([0,0,0,0,0,0,0,0,0])
    data['time_windows'].extend([(0,1000),(0,1000),(0,1000),(0,1000),(0,1000),(0,1000),(0,1000),(0,1000),(0,1000)])
    data['batteries'].extend([-_battery_capacity, -_battery_capacity, -_battery_capacity, -_battery_capacity, -_battery_capacity,-_battery_capacity,-_battery_capacity,-_battery_capacity,-_battery_capacity])
    data['time_per_demand_unit'] = 5  # 5 minutes/unit

          
    data['num_vehicles'] = 5
    data['vehicle_capacity'] = _capacity
    data['battery_capacity'] = _battery_capacity
    data['vehicle_max_distance'] = 1_000_000
    data['vehicle_max_time'] = 10_500
    data[
        'vehicle_speed'] = 5 * 60 / 3.6  # Travel speed: 5km/h to convert in m/min
    data['depot'] = 0
    # locations to km
    data['locations'] = [(l[0] * 111_319, l[1] * 83_645) for l in _locations]
    data['num_locations'] = len(data['locations']) 
    return data


#######################
# Problem Constraints #
#######################
def manhattan_distance(position_1, position_2):
    """Computes the Manhattan distance between two points (rounded to integers)"""
    x1, y1 = map(int, position_1)
    x2, y2 = map(int, position_2)
    return abs(x1 - x2) + abs(y1 - y2)


def create_distance_evaluator(data):
    """Creates callback to return distance between points."""
    _distances = {}
    # precompute distance between location to have distance callback in O(1)
    for from_node in range(data['num_locations']):
        _distances[from_node] = {}
        for to_node in range(data['num_locations']):
            if from_node == to_node:
                _distances[from_node][to_node] = 0
            # Forbid start/end/reload node to be consecutive.
            elif data['num_locations'] - 5 <= from_node < data['num_locations'] and data['num_locations'] - 5 <= to_node < data['num_locations']:
                _distances[from_node][to_node] = data['vehicle_max_distance']
            else:
                _distances[from_node][to_node] = (manhattan_distance(
                    data['locations'][from_node], data['locations'][to_node]))

    def distance_evaluator(manager, from_node, to_node):
        """Returns the manhattan distance between the two nodes"""
        return _distances[manager.IndexToNode(from_node)][manager.IndexToNode(
            to_node)]

    return distance_evaluator


def add_distance_dimension(routing, manager, data, distance_evaluator_index):
    """Add Global Span constraint"""
    del manager
    distance = 'Distance'
    routing.AddDimension(
        distance_evaluator_index,
        0,  # null slack
        data['vehicle_max_distance'],  # maximum distance per vehicle
        True,  # start cumul to zero
        distance)
    distance_dimension = routing.GetDimensionOrDie(distance)
    # Try to minimize the max distance among vehicles.
    # /!\ It doesn't mean the standard deviation is minimized
    distance_dimension.SetGlobalSpanCostCoefficient(100)


def create_demand_evaluator(data):
    """Creates callback to get demands at each location."""
    _demands = data['demands']

    def demand_evaluator(manager, from_node):
        """Returns the demand of the current node"""
        return _demands[manager.IndexToNode(from_node)]

    return demand_evaluator


def add_capacity_constraints(routing, manager, data, demand_evaluator_index):
    """Adds capacity constraint"""
    vehicle_capacity = data['vehicle_capacity']
    capacity = 'Capacity'
    routing.AddDimension(
        demand_evaluator_index,
        vehicle_capacity,
        vehicle_capacity,
        True,  # start cumul to zero
        capacity)

    # Add Slack for reseting to zero unload depot nodes.
    # e.g. vehicle with load 10/15 arrives at node 1 (depot unload)
    # so we have CumulVar = 10(current load) + -15(unload) + 5(slack) = 0.
    capacity_dimension = routing.GetDimensionOrDie(capacity)
    # Allow to drop reloading nodes with zero cost.
    for node in range(data['num_locations'] - 5, data['num_locations']):
        node_index = manager.NodeToIndex(node)
        routing.AddDisjunction([node_index], 9_000_000_000)

    # Allow to drop regular node with a cost.
    for node in range(1, data['num_locations'] - 5):
        node_index = manager.NodeToIndex(node)
        capacity_dimension.SlackVar(node_index).SetValue(0)
        routing.AddDisjunction([node_index], 0)


def create_time_evaluator(data):
    """Creates callback to get total times between locations."""

    def service_time(data, node):
        """Gets the service time for the specified location."""
        return abs(data['demands'][node]) * data['time_per_demand_unit']

    def travel_time(data, from_node, to_node):
        """Gets the travel times between two locations."""
        if from_node == to_node:
            travel_time = 0
        else:
            travel_time = manhattan_distance(
                data['locations'][from_node],
                data['locations'][to_node]) / data['vehicle_speed']
        return travel_time

    _total_time = {}
    # precompute total time to have time callback in O(1)
    for from_node in range(data['num_locations']):
        _total_time[from_node] = {}
        for to_node in range(data['num_locations']):
            if from_node == to_node:
                _total_time[from_node][to_node] = 0
            else:
                _total_time[from_node][to_node] = int(
                    service_time(data, from_node) +
                    travel_time(data, from_node, to_node))

    def time_evaluator(manager, from_node, to_node):
        """Returns the total time between the two nodes"""
        return _total_time[manager.IndexToNode(from_node)][manager.IndexToNode(
            to_node)]

    return time_evaluator


def add_time_window_constraints(routing, manager, data, time_evaluator):
    """Add Time windows constraint"""
    time = 'Time'
    max_time = data['vehicle_max_time']
    routing.AddDimension(
        time_evaluator,
        max_time,  # allow waiting time
        max_time,  # maximum time per vehicle
        False,  # don't force start cumul to zero since we are giving TW to start nodes
        time)
    time_dimension = routing.GetDimensionOrDie(time)
    # Add time window constraints for each location except depot
    # and 'copy' the slack var in the solution object (aka Assignment) to print it
    for location_idx, time_window in enumerate(data['time_windows']):
        if location_idx == 0:
            continue
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])
        routing.AddToAssignment(time_dimension.SlackVar(index))
    # Add time window constraints for each vehicle start node
    # and 'copy' the slack var in the solution object (aka Assignment) to print it
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0],
                                                data['time_windows'][0][1])
        routing.AddToAssignment(time_dimension.SlackVar(index))
        # Warning: Slack var is not defined for vehicle's end node
        #routing.AddToAssignment(time_dimension.SlackVar(self.routing.End(vehicle_id)))

def create_battery_evaluator(data):
    """Creates callback to get battery level at each location."""
    _battery_capacity = data['batteries']

    def battery_evaluator(manager, from_node):
        """Returns the battery level of the current node"""
        return _battery_capacity[manager.IndexToNode(from_node)]

    return battery_evaluator

def add_battery_constraints(routing, manager, data, battery_evaluator_index):
    """Adds battery constraint"""
    battery_capacity = data['battery_capacity']
    battery = 'Battery'
    routing.AddDimension(
        battery_evaluator_index,
        battery_capacity,  # null slack
        battery_capacity,  # maximum battery capacity
        True,  # start cumul to zero
        battery
        )

    battery_dimension = routing.GetDimensionOrDie(battery)
    for node in range(data['num_locations'] - 5, data['num_locations']):
        node_index = manager.NodeToIndex(node)
        routing.AddDisjunction([node_index], 0)

    for node in range(1, data['num_locations'] - 5):
        node_index = manager.NodeToIndex(node)
        battery_dimension.SlackVar(node_index).SetValue(0)
        routing.AddDisjunction([node_index], 100_000_000)


