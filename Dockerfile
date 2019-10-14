FROM node:12

RUN apt-get update && \
    apt-get -y install xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
    libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    # Install chrome
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get -y install google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Copy everything and install dependencies in a static location that is not WORKDIR
# WORKDIR will be replaced by github action volume
ENV QAWOLF_DIR "/root/qawolf"

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Copy and build qawolf
COPY . ${QAWOLF_DIR}/.

RUN cd ${QAWOLF_DIR} && npm run bootstrap

# Set default env variables
ENV CHROME_EXECUTABLE_PATH "google-chrome-stable"
ENV HEADLESS "true"

ENTRYPOINT ["/root/qawolf/entrypoint.sh"]
