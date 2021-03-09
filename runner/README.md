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
