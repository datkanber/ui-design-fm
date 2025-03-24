from math import radians, sin, cos, sqrt, atan2

def distanceBetweenTwoPoints(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth's average radius (metre)

    # Latitude and longitude to radian 
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c

    return distance