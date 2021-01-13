# Run locally

```sh
npm run build:recorder-script
docker-compose up
```

# Deploy runner

```sh
npm run build:recorder-script
docker build -t qawolf/qawolf -t qawolf.azurecr.io/runner:x.x.x .
docker push qawolf.azurecr.io/runner:x.x.x
```

# Run tests

Start the sandbox app on `http://localhost:5000` and then run `npm test` in this directory.
