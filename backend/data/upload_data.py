import pymongo
import xmltodict
import json

# 📌 MongoDB'ye Bağlan
MONGO_URI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(MONGO_URI)
db = client["RouteManagementDB"]  # Veritabanı adı

# 📌 JSON Dosyasını MongoDB'ye Yükleme
def upload_json(file_path, collection_name):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
        if isinstance(data, list):  # Eğer JSON diziyse topluca ekle
            db[collection_name].insert_many(data)
        else:  # Eğer tek nesneyse, sadece bir tane ekle
            db[collection_name].insert_one(data)
    print(f"✅ {collection_name} koleksiyonuna JSON dosyası yüklendi.")

# 📌 XML Dosyasını JSON'a Çevirip MongoDB'ye Yükleme
def upload_xml(file_path, collection_name):
    with open(file_path, "r", encoding="utf-8") as file:
        data = xmltodict.parse(file.read())  # XML -> JSON formatına çevir
        root_key = list(data.keys())[0]  # Anahtar ismini al (root elemanı)
        collection_data = data[root_key]

        # Eğer içinde liste varsa, tümünü ekle
        if isinstance(collection_data, dict) and "Routes" in collection_data:
            routes = collection_data["Routes"]["Route"]
            if isinstance(routes, list):  # Eğer birden fazla rota varsa
                db[collection_name].insert_many(routes)
            else:  # Eğer sadece tek bir rota varsa
                db[collection_name].insert_one(routes)
        else:
            db[collection_name].insert_one(collection_data)

    print(f"✅ {collection_name} koleksiyonuna XML dosyası JSON formatında yüklendi.")

# 📌 Dosya Yolları
json_file_path = "C:/Users/rootr/Downloads/ui-design-fm/backend/data/C10_Route4Vehicle.json"
xml_file_path_sim = "C:/Users/rootr/Downloads/ui-design-fm/backend/data/C10_Route4Sim.xml"
xml_file_path_plan = "C:/Users/rootr/Downloads/ui-design-fm/backend/data/C10_Route4Plan.xml"

# 📌 MongoDB'ye Yükleme İşlemleri
upload_json(json_file_path, "Route4Vehicle")
upload_xml(xml_file_path_sim, "Route4Sim")
upload_xml(xml_file_path_plan, "Route4Plan")

# 📌 MongoDB'den Yüklenen Verileri Kontrol Etme
print("\n📌 MongoDB'deki Örnek Veriler:")
print("Route4Vehicle: ", db["Route4Vehicle"].find_one())
print("Route4Sim: ", db["Route4Sim"].find_one())
print("Route4Plan: ", db["Route4Plan"].find_one())

print("\n🚀 Tüm dosyalar başarıyla MongoDB'ye yüklendi!")
