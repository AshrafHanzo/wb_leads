# Environment Configuration Guide

This project supports multiple environment configurations for different deployment scenarios.

## Environment Files

### `.env.development` (Local Development)
Used when running `npm run dev` locally. API calls go to `http://localhost:3001/api`.

### `.env.production` (Production Deployment)
Used when building for production with `npm run build`. API calls use relative path `/api` (proxied by Nginx).

### `.env.local` (Local Network Testing)
**Note**: This file is gitignored for security.

Create this file manually when you want to test the app from other devices on your local network:

```env
# .env.local
VITE_API_BASE_URL=http://192.168.0.28:3001/api
```

Replace `192.168.0.28` with your actual local network IP address.

## Finding Your Local IP Address

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### Linux/Mac
```bash
ifconfig
# or
ip addr show
```

## Usage Scenarios

### Scenario 1: Local Development (Same Machine)
- Use `.env.development`
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:8080`

### Scenario 2: Local Network Testing (Multiple Devices)
- Create `.env.local` with your network IP
- Backend: `http://192.168.x.x:3001`
- Frontend: `http://192.168.x.x:8080`
- Access from phone/tablet on same WiFi network

### Scenario 3: Production Deployment
- Use `.env.production`
- Backend and Frontend: `https://leads.workboosterai.com`
- Nginx handles routing

## Backend Server Configuration

The backend server (`server/index.js`) binds to `0.0.0.0:3001`, which means:
- ✅ Accessible via `localhost:3001`
- ✅ Accessible via local network IP (e.g., `192.168.0.28:3001`)
- ✅ Accessible via public IP (when deployed on server)

## Running with Different Environments

```bash
# Development (uses .env.development)
npm run dev

# Production build (uses .env.production)
npm run build

# Local network (create .env.local first, then run dev)
npm run dev
```

## Priority Order

Vite loads environment files in this order (later files override earlier ones):
1. `.env` (base configuration)
2. `.env.local` (local overrides, gitignored)
3. `.env.[mode]` (mode-specific: development or production)
4. `.env.[mode].local` (mode-specific local overrides, gitignored)
