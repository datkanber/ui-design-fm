import asyncio
import socketio


class SocketIOClient:
    def __init__(self, url):
        self.sio = socketio.AsyncClient()
        self.url = url

        # Socket.io event handlers
        @self.sio.event
        def connect():
            print("Bağlandı!")

        @self.sio.event
        def disconnect():
            print("Bağlantı kesildi!")

        @self.sio.event
        async def message(data):
            print("Mesaj alındı:", data)

    async def connect(self):
        while True:
            try:
                await self.sio.connect(self.url)
                print("Bağlantı kuruldu!")
                break  # Bağlantı başarılıysa döngüden çık
            except Exception as e:
                print(f"Bağlantı hatası: {e}. 5 saniye sonra tekrar denenecek...")
                await asyncio.sleep(5)  # 5 saniye bekle ve tekrar dene

    async def disconnect(self):
        await self.sio.disconnect()

    async def send_message(self, channel, message):
        await self.sio.emit(channel, message)

    def listen_channel(self, channel, function):
        @self.sio.on(channel)
        async def handler(data):
            function(data)

        print(f"{channel} kanalını dinlemeye başladık.")
