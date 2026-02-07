# Advertiser Portal - Docker Configuration

## Build

```bash
docker build -t advertiser-portal .
```

## Run

```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api:8080 advertiser-portal
```

## Docker Compose (Development)

```yaml
version: '3.8'
services:
  advertiser-portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8080
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=dev-secret
    volumes:
      - ./src:/app/src
      - ./public:/app/public
```
