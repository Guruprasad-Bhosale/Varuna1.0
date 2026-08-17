#!/bin/bash
set -e

echo "================================================"
echo " 🌊 VARUNA CLOUD PROVISIONING & DEPLOYMENT SCRIPT"
echo "================================================"

# 1. Update and install prerequisites
echo "[1/5] Installing Docker and Dependencies..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git ufw

# Install Docker if not present
if ! command -v docker &> /dev/null
then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# 2. Configure Firewall (UFW)
echo "[2/5] Configuring UFW Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Setup Project Environment
echo "[3/5] Setting up VARUNA environment..."
if [ ! -f ".env" ]; then
    echo "Generating default .env file from template..."
    cp .env.production.example .env
    # Generate a random secure postgres password
    SECURE_PASS=$(openssl rand -hex 16)
    sed -i "s/super_secret_varuna_password_2026/$SECURE_PASS/g" .env
    echo "Generated secure DB password in .env."
fi

# 4. Deploy Docker Stack
echo "[4/5] Building and Deploying Docker Stack..."
sudo docker compose -f docker-compose.prod.yml up --build -d

# 5. Provide SSL Instructions
echo "[5/5] Deployment Complete!"
echo "------------------------------------------------"
echo "Project VARUNA is now running on ports 80 and 443."
echo "Check logs with: sudo docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To enable SSL, ensure your domain points to this server's IP, then run:"
echo "sudo apt install certbot"
echo "sudo certbot certonly --standalone -d yourdomain.com"
echo "Then map the generated certificates into the NGINX container in docker-compose.prod.yml."
echo "================================================"
