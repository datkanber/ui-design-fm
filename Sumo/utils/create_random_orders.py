import random
from datetime import datetime, timedelta, time
import MySQLdb


existing_customer_ids = set()
db_connection = MySQLdb.connect(host = "127.0.0.1", user="root", password = "123456", database = "fleetmanagementdb")
cursor = db_connection.cursor()
def generate_random_time():
    random_hour = random.randint(8, 17)
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)

    random_time = time(random_hour, random_minute, random_second)
    return random_time.strftime('%H:%M:%S')

def generate_unique_customer_id():

    while True:
        customer_id = random.choice([1,2,3,4,5,6,7,8,9,10])
        if customer_id not in existing_customer_ids:
            existing_customer_ids.add(customer_id)
            return customer_id

def generate_sql_inserts(num_inserts):
    sql_queries = []
    for i in range(1833, num_inserts + 1833):
        customer_id = generate_unique_customer_id()
        product_id = random.choice([1, 2])
        order_date = datetime.now().strftime('%Y-%m-%d')
        status = 0
        quantity = random.randint(1, 10)
        

        delivery_end = generate_random_time()
        delivery_start = generate_random_time()

        delivery_start = generate_random_time()
        while delivery_start < '08:00:00' or delivery_start >= '17:00:00':
            delivery_start = generate_random_time()

        delivery_end = generate_random_time()
        while delivery_end <= delivery_start or delivery_end > '17:00:00':
            delivery_end = generate_random_time()

        sql_query = f"INSERT INTO sipariş(sipariş_id, müşteri_id, ürün_id, sipariş_tarihi, durum, ürün_sayısı, teslim_aralık_baş, teslim_aralık_son) VALUES ({i}, {customer_id}, {product_id}, '{order_date}', {status}, {quantity}, '{delivery_start}', '{delivery_end}');"
        sql_queries.append(sql_query)
    return sql_queries

insert_queries = generate_sql_inserts(10)

for query in insert_queries:
    cursor.execute(query)


db_connection.commit()
db_connection.close()
