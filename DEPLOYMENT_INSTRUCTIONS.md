# Deployment Instructions for leads.workboosterai.com

Follow these steps to configure your application on the Linux server.

## 1. Prerequisites
- Node.js (v18+)
- Nginx
- PM2 (`npm install -g pm2`)
- Certbot (`sudo apt install certbot python3-certbot-nginx`)

## 2. Prepare Project
1.  Navigate to your project folder (e.g., `/root/wb_lead`):
    ```bash
    cd /root/wb_lead
    ```

## 3. Build & Setup code

### Frontend
1.  Set the API URL for production build:
    ```bash
    # This creates/appends to .env
    echo "VITE_API_BASE_URL=/api" >> .env
    ```
2.  Install & Build:
    ```bash
    npm install
    npm run build
    ```
    *(This creates the `dist` folder at `/root/wb_lead/dist`)*

### Backend
1.  Navigate to server:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    # IMPORTANT: Ensure your production DB credentials are in /root/wb_lead/server/.env
    ```
3.  Go back and start PM2:
    ```bash
    cd ..
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup
    ```

## 4. Nginx Configuration

**Important**: Nginx (running as user `www-data`) needs permission to read files in `/root`.
If you see **403 Forbidden**, you may need to grant execute permission to the path (use with caution):
```bash
chmod o+x /root
chmod 755 /root/wb_lead
```

1.  Create config file:
    ```bash
    sudo nano /etc/nginx/sites-available/leads.workboosterai.com
    ```

2.  Paste this configuration (Updating the path if yours is different):

    ```nginx
    server {
        listen 80;
        server_name leads.workboosterai.com;

        # Point to the dist folder in your root directory
        root /root/wb_lead/dist;
        index index.html;

        # Frontend
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Backend Proxy
        location /api {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

3.  Enable site and restart:
    ```bash
    sudo ln -s /etc/nginx/sites-available/leads.workboosterai.com /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 5. SSL (HTTPS)
Run Certbot:
```bash
sudo certbot --nginx -d leads.workboosterai.com
```

Your app should now be live at `https://leads.workboosterai.com`.
