FROM ghcr.io/eclipse-sumo/sumo:nightly

# Çalışma dizinini ayarla
WORKDIR /router

# Gerekli bağımlılıkları yükle
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-venv \
    libmariadb-dev \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    libglu1-mesa \
    mesa-utils \
    mesa-utils-extra \
    libosmesa6 \
    libopengl0 \
    libglx-mesa0 \
    libglvnd0 \
    libglvnd-dev \
    libglx-dev \
    libxrender1 \
    libsm6 \
    libxext6 \
    libx11-6 \
    libxi6 \
    libxtst6 \
    libx11-dev \
    && apt-get clean

# Sanal ortam oluştur ve etkinleştir
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Python bağımlılıklarını yükle
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . .

# SUMO_HOME değişkenini ayarla
ENV SUMO_HOME=/usr/share/sumo

# Flask uygulaması için ortam değişkenlerini ayarla
ENV FLASK_APP=main.py
EXPOSE 8000

# SUMO GUI için sanal ekran kullanarak başlatma
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
