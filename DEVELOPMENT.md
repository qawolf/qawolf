## Getting Started

QAWolf is organized as a mono-repo of packages using [lerna](https://github.com/lerna/lerna).

Run bootstrap to install, build and link the dependencies. You should re-run this everytime you change a package's dependencies.

```sh
npm run bootstrap
```

If you change `/src` code, run the the typescript watcher to keep the `/lib` folders up to date.

```sh
npm run watch
```

If you change `@qawolf/web` code used in the browser, rebundle the web library.

```sh
npm run bundle:web
```
