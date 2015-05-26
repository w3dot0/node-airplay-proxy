# node-airplay-proxy

Work in progres...

## Purpose
Discover airplay devices on local network or register them manually and show images and videos on one or more of them.

## Installation

npm install

## Run
gulp

# Supported endpoints
```
# device list
curl http://localhost:7000/devices/
```

```
# device info
curl http://localhost:7000/devices/{mac}
```

```
# register device manually (port is defaulted to 7000)
curl \
  -X POST \
  -d '{ "host": "Family-Room-Apple-TV.local.", "port": 7000}' \
  -H "Content-Type: application/json" \
  http://localhost:7000/devices
```
