FROM node:14.16.1-alpine as builder

LABEL maintainer="QA Wolf Inc. <hello@qawolf.com>"

RUN apk update && apk add --no-cache build-base python
RUN npm i -g node-gyp npm@7

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

ENV WEBPACK_IGNORE_KNEX_PLUGINS="1"
ENV NODE_OPTIONS="--max-old-space-size=8192" 

RUN npm run build


FROM node:14.16.1-alpine

RUN apk --no-cache upgrade && apk add --no-cache su-exec

WORKDIR /app

COPY --from=builder --chown=node /app .

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]

CMD ["npm", "start"]
