# Contributing

## Develop "app" project only

Set up database and then...

In one terminal session, from project root directory:

```sh
nvm use 14
cd runner
npm install
npm start
```

The first time you run `npm start` it will build the Docker image, which take a long time (many minutes). This command starts a "runner" container, which some parts of the app need.

In a second terminal session, from project root directory:

```sh
nvm use 14
cd app
npm install
npm run migrate:run:dev
npm run dev
```

## Develop "app" and "runner" projects

If you will be changing code in the "runner" project, follow the same steps as for "app" only, but instead of `npm start` in the "runner" project, run:

```sh
npm run dev
```

If you install a new NPM package in the "runner" project, you will need to do `docker-compose down` followed by `docker-compose build`

```sh
# CTRL-C if running
docker-compose build
npm run dev
```

## Develop "app" and "recorder" projects

If you will be changing code in the "recorder" project, follow the same steps as for app+runner above, but also do this in another terminal window:

```sh
cd recorder
npm run build:watch
```
