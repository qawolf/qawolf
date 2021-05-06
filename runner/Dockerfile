FROM qawolf/runner-base:1.0.0

LABEL maintainer="QA Wolf Inc. <hello@qawolf.com>"

WORKDIR /opt/runner

COPY package.json package-lock.json ./
RUN npm i

COPY tsconfig.json ./
COPY qawolf.recorder.js ./
COPY src/ src/

RUN npm run build:tsc

# under the user so it shows in the file shortcut
COPY files/ /root/files
COPY scripts/ scripts/

RUN chown -R node:node /opt/runner

# need to set DEBUG=pw:api to capture verbose logs
ENV DEBUG=pw:api*,qawolf*
ENV HOME=/root
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=C.UTF-8
ENV QAWOLF_DISPLAY_WIDTH=1288
ENV QAWOLF_DISPLAY_HEIGHT=804

EXPOSE 4000
EXPOSE 5000

ENTRYPOINT ["./scripts/entrypoint.sh"]

CMD ["supervisord", "-c", "./scripts/supervisord.conf"]
