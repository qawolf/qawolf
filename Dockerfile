# node, debian stretch
FROM node:12.14.0-stretch

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn

RUN apt-get -qqy update && \
  # Install xvfb & chrome
  apt-get install -y wget xvfb && \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && apt-get -y install google-chrome-stable && \
  # Free up space
  apt-get clean

# disable "Chrome is being controlled by automated test software"
# https://github.com/jitsi/jibri/issues/208#issuecomment-518285349
# https://www.chromium.org/administrators/linux-quick-start
RUN mkdir -p /etc/opt/chrome/policies/managed && echo "{ \"CommandLineFlagSecurityWarningsEnabled\": false }" > /etc/opt/chrome/policies/managed/managed_policies.json