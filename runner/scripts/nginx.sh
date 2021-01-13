#!/bin/bash

if [[ -v QAWOLF_RUNNER_ID ]]
then
    . /scripts/ssl/nginx.sh
else
  echo "configure local nginx"

  # Replace DNS_SERVER and set up config
  export DNS_SERVER=$(cat /etc/resolv.conf |grep -i '^nameserver'|head -n1|cut -d ' ' -f2)
  envsubst '${DNS_SERVER}' < /scripts/nginx.conf > /etc/nginx/nginx.conf
fi

# Start nginx with daemon off
nginx -g "daemon off;"