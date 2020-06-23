#!/bin/sh

# Launches an https server using http-server-ssl (https://www.npmjs.com/package/http-server-ssl)

ssl_flag="-S"
no_cache_flag="-c-1"

http-server-ssl $ssl_flag $no_cache_flag