# Deployment Guide for leads.workboosterai.com

This guide walks you through deploying the WorkBooster Leads application to a production server with the domain `leads.workboosterai.com`.

## Prerequisites

Your server should have:
- **Ubuntu 20.04 LTS or later** (or similar Linux distribution)
- **Node.js 18.x or later** and npm
- **Nginx** web server
- **PostgreSQL** database (already configured at 103.14.123.44:30018)
- **Root or sudo access**
- **Domain DNS** configured to point to your server's public IP

## Step 1: DNS Configuration

1. Log in to your domain registrar or DNS provider
2. Create an **A record** for `leads.workboosterai.com` pointing to your server's public IP address
3. Wait for DNS propagation (can take up to 48 hours, usually much faster)
4. Verify DNS resolution:
   ```bash
   nslookup leads.workboosterai.com
   ```

## Step 2: Server Setup

### Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager for Node.js)
sudo npm install -g pm2

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

### Verify Installations

```bash
node --version  # Should show v18.x or later
npm --version
nginx -v
pm2 --version
certbot --version
```

## Step 3: Deploy Application Files

### Option A: Using Git (Recommended)

```bash
# Navigate to web root
cd /var/www

# Clone your repository
sudo git clone https://github.com/jananimohan-04/workbooster-leads.git leads.workboosterai.com

# Set ownership
sudo chown -R $USER:$USER /var/www/leads.workboosterai.com

# Navigate to project
cd leads.workboosterai.com
```

### Option B: Manual Upload

1. Build the frontend on your local machine:
   ```bash
   cd c:\Users\abcom\Desktop\office\wb_lead
   npm run build
   ```

2. Upload files to server using SCP, SFTP, or FTP:
   ```bash
   # From your local machine
   scp -r dist/ user@your-server-ip:/var/www/leads.workboosterai.com/
   scp -r server/ user@your-server-ip:/var/www/leads.workboosterai.com/
   scp ecosystem.config.js user@your-server-ip:/var/www/leads.workboosterai.com/
   ```

## Step 4: Install Dependencies

```bash
cd /var/www/leads.workboosterai.com

# Install frontend dependencies and build
npm install
npm run build

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 5: Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd /var/www/leads.workboosterai.com/server
sudo nano .env
```

Add the following content:

```env
# Database Configuration
DB_HOST=103.14.123.44
DB_PORT=30018
DB_NAME=wb_lead
DB_USER=dhi_admin
DB_PASSWORD=dhi@123

# Server Configuration
PORT=3001
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 6: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp /var/www/leads.workboosterai.com/nginx.conf /etc/nginx/sites-available/leads.workboosterai.com

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/leads.workboosterai.com /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 7: Obtain SSL Certificate

```bash
# Create directory for Let's Encrypt challenges
sudo mkdir -p /var/www/certbot

# Obtain SSL certificate
sudo certbot --nginx -d leads.workboosterai.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain the SSL certificate
- Update the Nginx configuration
- Set up automatic renewal

### Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run
```

## Step 8: Start Backend with PM2

```bash
cd /var/www/leads.workboosterai.com

# Start the backend using PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command output instructions
```

### PM2 Useful Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs wb-leads-backend

# Restart backend
pm2 restart wb-leads-backend

# Stop backend
pm2 stop wb-leads-backend

# Monitor resources
pm2 monit
```

## Step 9: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 10: Verify Deployment

1. **Check Backend Status**:
   ```bash
   pm2 status
   curl http://localhost:3001/health
   ```

2. **Check Nginx Status**:
   ```bash
   sudo systemctl status nginx
   ```

3. **Access Application**:
   - Open browser and navigate to `https://leads.workboosterai.com`
   - You should see the WorkBooster Leads application
   - Try logging in with: `jananimohan44@gmail.com` / `janani04`

4. **Test API**:
   - Open browser DevTools (F12) → Network tab
   - Perform actions in the application (e.g., view leads)
   - Verify API calls go to `https://leads.workboosterai.com/api/*`

## Updating the Application

### Update Code

```bash
cd /var/www/leads.workboosterai.com

# Pull latest changes (if using Git)
git pull origin main

# Rebuild frontend
npm install
npm run build

# Update backend dependencies
cd server
npm install
cd ..

# Restart backend
pm2 restart wb-leads-backend
```

### Update Nginx Configuration

```bash
# Edit configuration
sudo nano /etc/nginx/sites-available/leads.workboosterai.com

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Application Not Loading

1. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/leads.workboosterai.com.error.log
   ```

2. **Check if Nginx is running**:
   ```bash
   sudo systemctl status nginx
   sudo systemctl restart nginx
   ```

### API Requests Failing

1. **Check backend logs**:
   ```bash
   pm2 logs wb-leads-backend
   ```

2. **Verify backend is running**:
   ```bash
   pm2 status
   curl http://localhost:3001/health
   ```

3. **Restart backend**:
   ```bash
   pm2 restart wb-leads-backend
   ```

### Database Connection Issues

1. **Test database connectivity**:
   ```bash
   cd /var/www/leads.workboosterai.com/server
   node -e "const {Pool} = require('pg'); const pool = new Pool({host: '103.14.123.44', port: 30018, database: 'wb_lead', user: 'dhi_admin', password: 'dhi@123'}); pool.query('SELECT NOW()', (err, res) => { if(err) console.error(err); else console.log('Connected:', res.rows[0]); pool.end(); });"
   ```

2. **Check firewall rules** on database server to allow connections from your web server IP

### SSL Certificate Issues

1. **Check certificate status**:
   ```bash
   sudo certbot certificates
   ```

2. **Renew certificate manually**:
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

### 502 Bad Gateway Error

This usually means Nginx can't connect to the backend:

1. **Verify backend is running**:
   ```bash
   pm2 status
   netstat -tlnp | grep 3001
   ```

2. **Check backend logs**:
   ```bash
   pm2 logs wb-leads-backend --lines 100
   ```

3. **Restart backend**:
   ```bash
   pm2 restart wb-leads-backend
   ```

## Monitoring and Maintenance

### View Application Logs

```bash
# Backend logs
pm2 logs wb-leads-backend

# Nginx access logs
sudo tail -f /var/log/nginx/leads.workboosterai.com.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/leads.workboosterai.com.error.log
```

### Monitor System Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database (run from any machine with pg_dump)
PGPASSWORD=dhi@123 pg_dump -h 103.14.123.44 -p 30018 -U dhi_admin -d wb_lead > ~/backups/wb_lead_$(date +%Y%m%d_%H%M%S).sql
```

## Security Recommendations

1. **Change default database credentials** if possible
2. **Set up regular backups** of the database
3. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Monitor logs** regularly for suspicious activity
5. **Use strong passwords** for all user accounts
6. **Consider setting up fail2ban** to prevent brute force attacks
7. **Regular security audits** of dependencies:
   ```bash
   npm audit
   ```

## Support

For issues or questions:
- Check application logs first
- Review this troubleshooting guide
- Contact: jananimohan44@gmail.com
