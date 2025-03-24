import asyncio
import os
from dotenv import load_dotenv
from modules.socket.SocketIOClient import SocketIOClient
from modules.sumo.sumo_route_generator import SumoRouteGenerator

# .env dosyasını yükle
load_dotenv()

def start_socket_listener():
    async def listen():
        try:
            # .env dosyasından yapılandırma verilerini al
            socketio_url = os.getenv("SOCKETIO_URL")
            socketio_listen_channel = os.getenv("SOCKETIO_LISTEN_CHANNEL")

            socket_client = SocketIOClient(url=socketio_url)
            print("SocketIOClient created")

            # Socket.IO bağlantısını başlat
            await socket_client.connect()

            sumo_net_file = os.getenv("SUMO_NET_FILE")
            sumo_cfg_file = os.getenv("SUMO_CFG_FILE")
            sumo_output_xml = os.getenv("SUMO_OUTPUT_XML")

            generator = SumoRouteGenerator(sumo_net_file, sumo_cfg_file)

            # Veri alındığında tetiklenecek fonksiyon
            def on_data_received(data):
                print(f"Data received: {data}")
                generator.create_routes(data, sumo_output_xml)

            # Dinleme kanalı
            socket_client.listen_channel(
                socketio_listen_channel,
                on_data_received,
            )

            # Ana döngü
            while True:
                await asyncio.sleep(1)

        except Exception as e:
            print(f"An error occurred: {e}")

    asyncio.run(listen())
