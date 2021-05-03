FROM ubuntu:20.04

LABEL maintainer="QA Wolf Inc. <hello@qawolf.com>"

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y curl gnupg2 && \
  # use latest nginx
  curl http://nginx.org/keys/nginx_signing.key --output nginx_signing.key && apt-key add nginx_signing.key &&\
  # use node 14
  curl -sL https://deb.nodesource.com/setup_14.x | bash - &&\
  # chrome stable
  curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&\
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

COPY scripts/nginx.list /etc/apt/sources.list.d/nginx.list

RUN apt-get update && \ 
  # node
  apt-get install -y nodejs \
  # webkit \
  libwoff1 \
  libopus0 \
  libwebp6 \
  libwebpdemux2 \
  libenchant1c2a \
  libgudev-1.0-0 \
  libsecret-1-0 \
  libhyphen0 \
  libgdk-pixbuf2.0-0 \
  libegl1 \
  libnotify4 \
  libxslt1.1 \
  libevent-2.1-7 \
  libgles2 \
  libxcomposite1 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libepoxy0 \
  libgtk-3-0 \
  libharfbuzz-icu0 \
  # support video playback in WebKit
  libgstreamer-gl1.0-0 \
  libgstreamer-plugins-bad1.0-0 \
  gstreamer1.0-plugins-good \
  gstreamer1.0-libav \
  # chrome
  google-chrome-stable \
  # chromium
  libnss3 \
  libxss1 \
  libasound2 \
  fonts-noto-color-emoji \
  fonts-wqy-zenhei \
  libxtst6 \
  # firefox
  libdbus-glib-1-2 \
  libxt6 \
  # nginx
  gettext \
  nginx \
  # server
  supervisor \
  # vnc
  novnc \
  tigervnc-standalone-server \
  # ffmpeg
  ffmpeg \
  # ssl
  openssl && \
  apt-get clean && \
  apt-get autoclean

# upgrade npm to support lockfile v2
RUN npm i -g npm@7

WORKDIR /opt/runner

COPY package.json package-lock.json ./
RUN npm i

COPY tsconfig.json qawolf.recorder.js ./
COPY src/ src/

RUN npm run build:tsc

# under the user so it shows in the file shortcut
COPY files/ /root/files
COPY scripts/ scripts/

RUN chown -R node:node /opt/runner

# need to set DEBUG=pw:api to capture verbose logs
ENV DEBUG=pw:api*,qawolf* \
  HOME=/root \
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US.UTF-8 \
  LC_ALL=C.UTF-8 \
  QAWOLF_DISPLAY_WIDTH=1288 \
  QAWOLF_DISPLAY_HEIGHT=804

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["./scripts/entrypoint.sh"]

CMD ["supervisord", "-c", "./scripts/supervisord.conf"]
