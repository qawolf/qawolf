FROM ubuntu:18.04

RUN apt-get update &&\
  # install Node.js
  # https://github.com/nodesource/distributions
  apt-get -y install curl \
  # native node add-ons
  gcc g++ make &&\
  curl -sL https://deb.nodesource.com/setup_12.x | bash - &&\
  apt-get -y install build-essential nodejs \
  # install xvfb
  xvfb \
  # chromium dependencies
  # https://github.com/microsoft/playwright/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-linuxwsl
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \ 
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget \
  libgbm1 \
  # webkit dependencies
  # https://github.com/microsoft/playwright/blob/fce3842011f9be13717bd259ca3b30cdb0b36960/.github/workflows/webkit-linux.yml#L29
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
  libgles2 \
  libevent-2.1-6 \
  libnotify4 \
  libvpx5 \
  libxslt1.1 && \
  # free up space
  apt-get clean

# disable "Chrome is being controlled by automated test software"
# https://github.com/jitsi/jibri/issues/208#issuecomment-518285349
# https://www.chromium.org/administrators/linux-quick-start
RUN mkdir -p /etc/opt/chrome/policies/managed && echo "{ \"CommandLineFlagSecurityWarningsEnabled\": false }" > /etc/opt/chrome/policies/managed/managed_policies.json
