#!/bin/sh

set -ex

# root user will be dropped to the 'node' user by default
if [[ "$1" == npm ]] && [ "$(id -u)" = '0' ]; then
  echo "Running process as 'node' user..."

  if [[ "$SKIP_MIGRATIONS" != "true" ]]; then
    su-exec node npm run migrate:run
  fi

	su-exec node "$@"
fi

echo "Running process as user: $(whoami)"

if [[ "$SKIP_MIGRATIONS" != "true" ]]; then
  su-exec node npm run migrate:run
fi

exec "$@"
