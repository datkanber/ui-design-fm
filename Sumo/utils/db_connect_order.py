import MySQLdb
import datetime
from utils import distanceBetweenTwoPoints

def main():
    try:
        db_connection = MySQLdb.connect(host = "localhost", user="root", password = "123456", database = "fleetmanagementdb")
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
                WHERE s.sipariş_tarihi = '2024-01-05' AND s.durum = 0;"""
    cursor.execute(order_query)

    orders = cursor.fetchall()

    data = {}
    #depot 
    data['location_ids'] = ['19']
    locations = [(30.483409077029524, 39.752172063632734)] 
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
        locations.append(location)
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
        dist = distanceBetweenTwoPoints(locations[0][0], locations[0][1], locations[i][0], locations[i][1])
        dist = int(dist / 10)
        data['batteries'].append(dist)
        i += 1

         

    data["location_ids"].extend(['cs1', 'cs2', 'cs3', 'cs4', 'cs5'])
    locations.extend([(30.469245785506907 ,39.74409378336547), (30.477104070347714 ,39.74834946657972), (30.47476004031919, 39.74658904001786), (30.484520671769562, 39.75392997022956), (30.480416670013025 ,39.751670617892714)])
    data['demands'].extend([0,0,0,0,0])
    data['time_windows'].extend([(0,1000),(0,1000),(0,1000),(0,1000),(0,1000)])
    data['batteries'].extend([1,1,1,1,1])
    print(data['location_ids'])
    #print(locations)
    #print(data['demands'])
    #print(data['time_windows'])
    



if __name__ == '__main__':
    main()
    

