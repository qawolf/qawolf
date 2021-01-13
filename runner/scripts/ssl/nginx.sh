#!/bin/bash
echo "configure ssl nginx"

# Create a self signed certificate
if [[ ! -f /usr/share/nginx/certificates/fullchain.pem ]];then
    mkdir -p /usr/share/nginx/certificates
fi

if [[ ! -f /usr/share/nginx/certificates/fullchain.pem ]]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1\
        -keyout /usr/share/nginx/certificates/privkey.pem \
        -out /usr/share/nginx/certificates/fullchain.pem \
        -subj '/CN=localhost'
fi

cp /scripts/ssl/nginx.conf /etc/nginx/nginx.conf