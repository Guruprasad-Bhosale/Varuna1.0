# Project VARUNA — Cloud Deployment Guide

This document outlines the standard operating procedure for deploying Project VARUNA to a production Linux Virtual Machine (AWS EC2, DigitalOcean Droplet, GCP Compute Engine).

## 1. Prerequisites
- A Linux VM (Ubuntu 22.04 LTS recommended) with at least 2GB RAM and 1 VCPU.
- A static IP address configured.
- Domain name mapped to the VM's IP address (e.g., `varuna.yourcity.gov`).
- Docker and Docker Compose V2 installed on the server.

## 2. Server Provisioning & Setup

SSH into your Linux machine and install Docker:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable docker
sudo systemctl start docker
```

## 3. Clone Repository
```bash
git clone https://github.com/your-org/varuna.git
cd varuna
```

## 4. Configure Production Environment

Copy the example environment template and configure your secure credentials:

```bash
cp .env.production.example .env
nano .env
```

**CRITICAL**: Ensure you set a highly secure `POSTGRES_PASSWORD`. Fill in your `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `MUNICIPAL_WEBHOOK_URL` to enable real-time asynchronous environmental alerts.

## 5. Build and Deploy Containers

Bring up the production multi-container stack. This will build the backend API, compile the React dashboard, and spin up PostgreSQL and the Nginx reverse proxy.

```bash
sudo docker compose -f docker-compose.prod.yml up --build -d
```

Verify services are running cleanly:
```bash
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f
```

## 6. Securing with SSL (Let's Encrypt / Certbot)

To secure the Nginx reverse proxy with HTTPS, install Certbot on your host machine:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Since Docker binds port 80 to Nginx, we will use Certbot's standalone mode or webroot. For simplicity, temporarily stop the Nginx container, grab the cert, and update the Nginx configuration to mount the certs.

*(Alternatively, use an automated sidecar like `nginx-proxy-manager` or `traefik` for seamless certificate renewal).*

## 7. Scaling (Optional)

If telemetry throughput increases (e.g., scaling from 1 node to 5,000 nodes), you can increase the number of Gunicorn Uvicorn workers in the `docker-compose.prod.yml` command:

```yaml
# From 4 workers to 8 workers
command: gunicorn -w 8 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
```
Then restart the backend:
```bash
sudo docker compose -f docker-compose.prod.yml up -d --build backend
```
